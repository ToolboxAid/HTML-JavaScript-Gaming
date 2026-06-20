import { expect, test } from "@playwright/test";
import http from "node:http";
import process from "node:process";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const SUPABASE_ENV_KEYS = Object.freeze([
  "GAMEFOUNDRY_SUPABASE_ANON_KEY",
  "GAMEFOUNDRY_DATABASE_URL",
  "GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY",
  "GAMEFOUNDRY_SUPABASE_URL",
]);
let fakeSupabaseServer;
let previousSupabaseEnv;

function restoreEnvValue(key, value) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

function startFakeSupabaseServer() {
  const tables = {
    roles: [],
    user_roles: [],
    users: [],
  };
  const server = http.createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString("utf8");
    const body = rawBody ? JSON.parse(rawBody) : {};
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");

    if (requestUrl.pathname === "/auth/v1/health") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (requestUrl.pathname.startsWith("/rest/v1/")) {
      const tableName = decodeURIComponent(requestUrl.pathname.split("/").pop() || "");
      tables[tableName] = tables[tableName] || [];
      if (request.method === "POST") {
        const rows = Array.isArray(body) ? body : [body];
        rows.forEach((row) => {
          const index = tables[tableName].findIndex((existing) => existing.key === row.key);
          if (index >= 0) {
            tables[tableName][index] = {
              ...tables[tableName][index],
              ...row,
            };
          } else {
            tables[tableName].push(row);
          }
        });
        response.statusCode = 200;
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(JSON.stringify(rows));
        return;
      }
      response.statusCode = 200;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(tables[tableName]));
      return;
    }

    response.statusCode = 404;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ message: "Unknown fake Supabase route." }));
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to start fake Supabase server."));
        return;
      }
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((closeResolve) => {
          server.closeAllConnections?.();
          server.close(closeResolve);
        }),
      });
    });
  });
}

test.beforeAll(async () => {
  previousSupabaseEnv = Object.fromEntries(SUPABASE_ENV_KEYS.map((key) => [key, process.env[key]]));
  fakeSupabaseServer = await startFakeSupabaseServer();
  process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY = "game-hub-anon-key";
  delete process.env.GAMEFOUNDRY_DATABASE_URL;
  process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY = "game-hub-service-role-key";
  process.env.GAMEFOUNDRY_SUPABASE_URL = fakeSupabaseServer.baseUrl;
});

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "game-hub",
    surface: "game workspace mock repository"
  });
});

test.afterEach(async ({ page }) => {
  await workspaceV2CoverageReporter.stop(page);
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
  await fakeSupabaseServer?.close();
  SUPABASE_ENV_KEYS.forEach((key) => {
    if (previousSupabaseEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = previousSupabaseEnv[key];
    }
  });
});

async function openRepoPage(page, pathName, options = {}) {
  const server = await startRepoServer();
  const previousApiUrl = process.env.GAMEFOUNDRY_API_URL;
  const previousSiteUrl = process.env.GAMEFOUNDRY_SITE_URL;
  process.env.GAMEFOUNDRY_API_URL = `${server.baseUrl}/api`;
  process.env.GAMEFOUNDRY_SITE_URL = server.baseUrl;
  const closeServer = server.close.bind(server);
  server.close = async () => {
    restoreEnvValue("GAMEFOUNDRY_API_URL", previousApiUrl);
    restoreEnvValue("GAMEFOUNDRY_SITE_URL", previousSiteUrl);
    await closeServer();
  };
  const failedRequests = [];
  const pageErrors = [];
  const consoleErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`FAILED ${request.url()}`);
  });

  if (options.session) {
    const userKey = options.session.userKey || MOCK_DB_KEYS.users.user1;
    await page.route("**/api/session/current", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            authenticated: true,
            displayName: options.session.displayName || "User 1",
            roleSlugs: options.session.roleSlugs || ["creator"],
            userKey,
          },
          ok: true,
        }),
      });
    });
    await page.request.post(`${server.baseUrl}/api/session/user`, {
      data: { userKey },
    });
  }

  if (pathName.includes("/toolbox/game-hub/") || pathName.includes("/toolbox/project-workspace/")) {
    await page.route("**/api/platform-settings/banner", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: { banner: { active: false, message: "", tone: "info" } },
          ok: true,
        }),
      });
    });
    await page.route("**/api/toolbox/registry/snapshot", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            activeTools: [],
            readinessByStatus: {},
            tools: [],
            toolboxContract: {},
          },
          ok: true,
        }),
      });
    });
  }

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { failedRequests, pageErrors, consoleErrors, server };
}

function creatorSession() {
  return {
    displayName: "User 1",
    roleSlugs: ["creator"],
    userKey: MOCK_DB_KEYS.users.user1,
  };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

test("Deprecated project workspace route points creators to Game Hub", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-workspace/index.html");

  try {
    await expect(page.getByRole("heading", { name: "Game Hub" })).toBeVisible();
    await expect(page.locator("main")).toContainText("This route is kept for older links.");
    await expect(page.locator("main")).not.toContainText("Project Workspace");
    await expect(page.getByRole("link", { name: "Open Game Hub" })).toHaveAttribute("href", "toolbox/game-hub/index.html");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub creates, opens, and deletes mock games", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html", { session: creatorSession() });

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Create Game" })).toHaveClass("btn");
    await expect(page.getByRole("button", { name: "Create Game" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Delete Open Game" })).toHaveClass("btn");
    await expect(page.getByRole("button", { name: "Delete Open Game" })).toBeEnabled();
    await expect(page.locator("[data-project-record-status]")).toHaveText("Project Information loaded.");
    await expect(page.locator("[data-game-project-information]")).toContainText("Project Information");
    await expect(page.locator("[data-project-records-table]")).toContainText("Demo Game");
    await expect(page.locator("[data-source-idea-section]")).toContainText("No source idea yet");
    await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-active-game-purpose]")).toHaveText("Game");
    await expect(page.locator("[data-current-user-role]")).toHaveText("Owner");
    await expect(page.locator("[data-game-list]")).toContainText("Demo Game");
    await expect(page.locator("[data-game-list]")).toContainText("Gravity Demo");
    await expect(page.locator("[data-game-list]")).toContainText("Collision Demo");
    await expect(page.locator("[data-game-list]")).toContainText("Camera Follow Demo");
    const demoGameRow = page.locator("[data-game-row='demo-game']");
    await expect(demoGameRow.locator("> .status")).toHaveCount(0);
    await expect(demoGameRow.getByRole("button", { name: "Open Demo Game (Active)" })).toHaveClass(/primary/);
    await expect(demoGameRow.getByRole("button", { name: "Open Demo Game (Active)" })).toHaveAttribute("aria-current", "true");

    await page.getByLabel("Game Name").fill("Launch Test Game");
    await page.getByRole("button", { name: "Create Game" }).click();
    await expect(page.locator("[data-active-game-name]")).toHaveText("Launch Test Game");
    await expect(page.locator("[data-game-list]")).toContainText("Launch Test Game");
    await expect(page.locator("[data-game-project-information]")).toContainText("Launch Test Game");
    await expect(page.locator("[data-game-row='launch-test-game-1']").getByRole("button", { name: "Open Launch Test Game (Active)" })).toHaveClass(/primary/);
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Created and opened Launch Test Game.");

    await page.getByLabel("Game Name").fill("Archive Game");
    await page.getByRole("button", { name: "Create Game" }).click();
    await expect(page.locator("[data-active-game-name]")).toHaveText("Archive Game");

    await page.getByRole("button", { name: "Open Launch Test Game" }).click();
    await expect(page.locator("[data-active-game-name]")).toHaveText("Launch Test Game");
    await expect(page.locator("[data-game-row='launch-test-game-1']").getByRole("button", { name: "Open Launch Test Game (Active)" })).toHaveAttribute("data-game-active", "true");
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Opened Launch Test Game.");

    await page.getByRole("button", { name: "Delete Open Game" }).click();
    await expect(page.locator("[data-active-game-name]")).not.toHaveText("Launch Test Game");
    await expect(page.locator("[data-game-list]")).not.toContainText("Launch Test Game");
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Deleted Launch Test Game.");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub preserves guest browsing and blocks guest saves", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html");

  try {
    await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-game-list]")).toContainText("Gravity Demo");
    await expect(page.locator("[data-project-record-status]")).toHaveText("Project Information loaded. Sign in to save changes.");
    await expect(page.locator("[data-project-records-table]")).toContainText("Demo Game");
    await expect(page.getByRole("button", { name: "Create Game" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Delete Open Game" })).toBeDisabled();
    await expect(page.getByLabel("Game Name")).toBeDisabled();
    await expect(page.getByLabel("Game Purpose")).toBeDisabled();
    await expect(page.getByLabel("Game Status")).toBeDisabled();
    await expect(page.getByLabel("Current User Role")).toBeDisabled();

    await page.getByRole("button", { name: "Open Gravity Demo" }).click();
    await expect(page.locator("[data-active-game-name]")).toHaveText("Gravity Demo");
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Sign in to create or update Game Hub projects.");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub shows active-game errors without throwing", async ({ page }) => {
  await page.route("**/api/toolbox/game-hub/repositories/*/methods/getActiveGame", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        error: "Active game unavailable for validation.",
        ok: false,
        rule: "Browser -> Server API -> Data Source",
      }),
      contentType: "application/json; charset=utf-8",
      status: 502,
    });
  });
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html");

  try {
    expect(failures.failedRequests.some((request) => request.includes("502") && request.includes("/methods/getActiveGame"))).toBe(true);
    await expect(page.locator("[data-active-game-name]")).toHaveText("No game open");
    await expect(page.locator("[data-game-hub-log]")).toContainText("Active game is temporarily unavailable.");
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors.filter((message) => !message.includes("status of 502"))).toEqual([]);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub reports malformed active-game payloads without throwing", async ({ page }) => {
  await page.route("**/api/toolbox/game-hub/repositories/*/methods/getActiveGame", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          result: {
            id: "malformed-active-game",
            name: "Malformed Active Game",
          },
        },
        ok: true,
        rule: "Browser -> Server API -> Data Source",
      }),
      contentType: "application/json; charset=utf-8",
      status: 200,
    });
  });
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html");

  try {
    await expect(page.locator("[data-active-game-name]")).toHaveText("No game open");
    await expect(page.locator("[data-current-user-role]")).toHaveText("Viewer");
    await expect(page.locator("[data-game-hub-log]")).toContainText("Active game is temporarily unavailable.");
    await expect(page.getByLabel("Game Purpose")).toBeDisabled();

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub displays and edits game purpose and member role", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html", { session: creatorSession() });

  try {
    await expect(page.locator("#gamePurposeInput option")).toHaveText([
      "Game",
      "Capability Demo",
      "Learning Game",
      "Template Game"
    ]);
    await expect(page.locator("#gameStatusInput option")).toHaveText([
      "Planning",
      "Under Construction",
      "Ready for Testing",
      "Ready for Publish"
    ]);
    await expect(page.locator("#currentUserRoleInput option")).toHaveText([
      "Owner",
      "Designer",
      "World Builder",
      "Artist",
      "Audio Creator",
      "Translator",
      "Tester",
      "Publisher",
      "Viewer"
    ]);
    await expect(page.getByLabel("Game Purpose")).toHaveValue("Game");
    await expect(page.getByLabel("Game Status")).toHaveValue("Under Construction");
    await expect(page.getByLabel("Current User Role")).toHaveValue("Owner");

    await page.getByLabel("Game Purpose").selectOption("Learning Game");
    await expect(page.locator("[data-active-game-purpose]")).toHaveText("Learning Game");
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Updated Demo Game purpose to Learning Game.");

    await page.getByLabel("Game Status").selectOption("Ready for Testing");
    await expect(page.locator("[data-active-game-status]")).toHaveText("Ready for Testing");
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Updated Demo Game status to Ready for Testing.");

    await page.getByLabel("Current User Role").selectOption("Designer");
    await expect(page.locator("[data-current-user-role]")).toHaveText("Designer");
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Updated current user role to Designer.");

    await page.getByLabel("Game Purpose").selectOption("Capability Demo");
    await page.getByLabel("Game Name").fill("Purpose Review Game");
    await page.getByRole("button", { name: "Create Game" }).click();
    await expect(page.locator("[data-active-game-name]")).toHaveText("Purpose Review Game");
    await expect(page.locator("[data-active-game-purpose]")).toHaveText("Capability Demo");
    await expect(page.locator("[data-current-user-role]")).toHaveText("Owner");
    await expect(page.locator("[data-game-list]")).toContainText("Purpose Review Game");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub progress panels update from mock game state", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html", { session: creatorSession() });

  try {
    await expect(page.locator("[data-game-status]")).toHaveText("Under Construction");
    await expect(page.locator("[data-game-progress]")).toHaveText("Demo Game identity ready");
    await expect(page.locator("[data-publishing-progress]")).toHaveText("Publish blocked until configuration and required assets are ready");
    await expect(page.locator("[data-current-focus]")).toHaveText("Complete Game Configuration");
    await expect(page.locator("[data-recommended-next-tool]").first()).toHaveText("Game Configuration");
    await expect(page.locator("[data-game-progress-checklist]")).toContainText("Game identity: Complete");
    await expect(page.locator("[data-game-output-panels] summary")).toHaveText([
      "Readiness Output"
    ]);
    await expect(page.locator("aside.tool-column").last().getByText("Readiness Output")).toHaveCount(0);
    const panelOrderIsCorrect = await page.locator(".tool-center-panel").evaluate((panel) => {
      const projectInformation = panel.querySelector("[data-game-project-information]");
      const sourceIdea = panel.querySelector("[data-source-idea-section]");
      const staticOverlay = panel.querySelector("[data-game-hub-foundation]");
      const outputPanels = panel.querySelector("[data-game-output-panels]");
      return Boolean(
        projectInformation &&
        sourceIdea &&
        staticOverlay &&
        outputPanels &&
        (projectInformation.compareDocumentPosition(sourceIdea) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (sourceIdea.compareDocumentPosition(staticOverlay) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (staticOverlay.compareDocumentPosition(outputPanels) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    });
    expect(panelOrderIsCorrect).toBe(true);

    await page.getByLabel("Game Name").fill("Progress Review Game");
    await page.getByRole("button", { name: "Create Game" }).click();
    await expect(page.locator("[data-game-status]")).toHaveText("Under Construction");
    await expect(page.locator("[data-game-progress]")).toHaveText("Progress Review Game identity ready");
    await expect(page.locator("[data-game-project-information]")).toContainText("Progress Review Game");

    await page.getByRole("button", { name: "Delete Open Game" }).click();
    await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-game-progress]")).toHaveText("Demo Game identity ready");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub uses the wide Theme V2 tool layout at desktop widths", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html");

  try {
    await expect(page.locator(".container--tool-wide")).toBeVisible();
    await expect(page.locator(".tool-workspace--wide")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    const desktopLayout = await page.locator(".tool-workspace--wide").evaluate((workspace) => {
      const container = workspace.closest(".container--tool-wide");
      const columns = getComputedStyle(workspace).gridTemplateColumns
        .split(" ")
        .map((value) => Number.parseFloat(value));
      const [left, center, right] = columns;
      return {
        center,
        containerWidth: container.getBoundingClientRect().width,
        left,
        right,
        viewportWidth: window.innerWidth
      };
    });
    expect(desktopLayout.containerWidth).toBeGreaterThan(1300);
    expect(desktopLayout.containerWidth / desktopLayout.viewportWidth).toBeGreaterThan(0.95);
    expect(Math.abs(desktopLayout.left - desktopLayout.right)).toBeLessThan(2);
    expect(desktopLayout.center).toBeGreaterThan(desktopLayout.left);

    await page.setViewportSize({ width: 1920, height: 1100 });
    await page.reload({ waitUntil: "networkidle" });
    const idealLayout = await page.locator(".tool-workspace--wide").evaluate((workspace) => {
      const container = workspace.closest(".container--tool-wide");
      const columns = getComputedStyle(workspace).gridTemplateColumns
        .split(" ")
        .map((value) => Number.parseFloat(value));
      const [left, center, right] = columns;
      return {
        center,
        containerWidth: container.getBoundingClientRect().width,
        left,
        right,
        viewportWidth: window.innerWidth
      };
    });
    expect(idealLayout.containerWidth).toBeGreaterThan(1800);
    expect(idealLayout.containerWidth / idealLayout.viewportWidth).toBeGreaterThan(0.95);
    expect(Math.abs(idealLayout.left - idealLayout.right)).toBeLessThan(2);
    expect(idealLayout.center).toBeGreaterThan(idealLayout.left);

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("representative Toolbox tool pages use the wide Theme V2 layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  const failures = await openRepoPage(page, "/toolbox/objects/index.html");
  const representativeToolPages = [
    { group: "Create", path: "/toolbox/objects/index.html" },
    { group: "Build", path: "/toolbox/game-design/index.html" },
    { group: "Content", path: "/toolbox/assets/index.html" },
    { group: "Media", path: "/toolbox/audio/index.html" },
    { group: "Test", path: "/toolbox/controls/index.html" },
    { group: "Share", path: "/toolbox/publish/index.html" },
    { group: "Account", path: "/toolbox/saved-data/index.html" }
  ];

  try {
    for (const toolPage of representativeToolPages) {
      await page.goto(`${failures.server.baseUrl}${toolPage.path}`, { waitUntil: "networkidle" });
      await expect(page.locator(".container--tool-wide")).toBeVisible();
      await expect(page.locator(".tool-workspace--wide")).toBeVisible();
      await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
      const layout = await page.locator(".tool-workspace--wide").evaluate((workspace) => {
        const container = workspace.closest(".container--tool-wide");
        const columns = getComputedStyle(workspace).gridTemplateColumns
          .split(" ")
          .map((value) => Number.parseFloat(value));
        const [left, center, right] = columns;
        return {
          center,
          containerWidth: container.getBoundingClientRect().width,
          left,
          right,
          viewportWidth: window.innerWidth
        };
      });
      expect(layout.containerWidth, `${toolPage.group} page uses wide container`).toBeGreaterThan(1300);
      expect(layout.containerWidth / layout.viewportWidth, `${toolPage.group} page reduces side margins`).toBeGreaterThan(0.95);
      expect(Math.abs(layout.left - layout.right), `${toolPage.group} side panels are balanced`).toBeLessThan(2);
      expect(layout.center, `${toolPage.group} center panel is dominant`).toBeGreaterThan(layout.left);
    }

    expect(failures.failedRequests.filter((request) => !request.includes("forge-bot-single.png"))).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors.filter((message) => !message.includes("404 (Not Found)"))).toEqual([]);
  } finally {
    await failures.server.close();
  }
});

test("Learn Getting Started documents screen and layout guidance", async ({ page }) => {
  const failures = await openRepoPage(page, "/learn/index.html");

  try {
    await expect(page.getByRole("heading", { name: "Getting Started" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Getting Started" })).toHaveAttribute("href", "getting-started/index.html");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/learn/getting-started/index.html`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Getting Started" })).toBeVisible();
    await expect(page.getByText("Tools are built for 1440px and larger desktop workspaces.")).toBeVisible();
    await expect(page.getByText("1440px is the minimum comfortable desktop width")).toBeVisible();
    await expect(page.getByText("1920px is the ideal desktop width")).toBeVisible();
    await expect(page.getByText("Smaller screens may use stacked or collapsed panels later.")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Toolbox member-role filters focus tools without exposing admin-only controls", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html");

  try {
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 15/43");
    await expect(page.locator("[data-toolbox-role-focus]")).toHaveCount(0);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Hub$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Journey$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Configuration$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Assets$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Testing$/ }) })).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?memberRole=Designer`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-focus='Designer']")).toBeVisible();
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 8/43");
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Hub$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Journey$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Configuration$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Assets$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Objects$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Audio$/ }) })).toHaveCount(0);
    await expect(page.getByText("Unavailable tools are hidden by role focus, not by security enforcement.")).toBeVisible();

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?memberRole=Audio%20Creator`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-focus='Audio Creator']")).toBeVisible();
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 2/43");
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Assets$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Text To Speech$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Audio$/ }) })).toHaveCount(0);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^MIDI$/ }) })).toHaveCount(0);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?memberRole=Viewer`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-focus='Viewer']")).toBeVisible();
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 10/43");
    await expect(page.getByText("Viewer focus shows preview-safe read-only tiles only.")).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Hub$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Journey$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Configuration$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Assets$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Debug$/ }) })).toHaveCount(0);
    await page.goto(`${failures.server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 15/43");
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Cloud$/ }) })).toHaveCount(0);

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});
