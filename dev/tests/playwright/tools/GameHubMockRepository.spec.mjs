import { expect, test } from "@playwright/test";
import http from "node:http";
import process from "node:process";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
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

  if (pathName.includes("/toolbox/index.html")) {
    await page.route("**/api/game-journey/completion-metrics", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: { records: [] },
          ok: true,
          rule: "Browser -> Server API -> Data Source",
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
    await expect(page.locator("main").getByRole("link", { name: "Open Game Hub" })).toHaveAttribute("href", "toolbox/game-hub/index.html");

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
    await expect(page.getByRole("button", { name: "Add Game" })).toHaveClass(/\bbtn\b/);
    await expect(page.getByRole("button", { name: "Add Game" })).toHaveClass(/\bbtn--compact\b/);
    await expect(page.getByRole("button", { name: "Add Game" })).toBeEnabled();
    await expect(page.getByLabel("Game Name")).toHaveCount(0);
    await expect(page.getByLabel("Game Purpose")).toHaveCount(0);
    await expect(page.locator("input[aria-label='Game Status'], textarea[aria-label='Game Status'], select[aria-label='Game Status']")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Delete Open Game" })).toHaveClass("btn");
    await expect(page.getByRole("button", { name: "Delete Open Game" })).toBeEnabled();
    await expect(page.locator("summary").filter({ hasText: /^Game Setup$/ })).toHaveCount(0);
    await expect(page.locator("summary").filter({ hasText: /^Game Crew$/ })).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText("game-hub/Game Crew");
    await expect(page.getByLabel("Current User Role")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Open Game Journey" })).toHaveCount(0);
    await expect(page.locator(".tool-center-panel")).not.toContainText("Review games in the parent table");
    await expect(page.locator("[data-project-record-status]")).toHaveText("Game table loaded.");
    await expect(page.locator("[data-game-project-information]")).toHaveCount(0);
    await expect(page.locator("[data-project-records-table]")).toHaveCount(0);
    await expect(page.locator("[data-active-game-name]")).toHaveCount(0);
    await expect(page.locator("[data-current-user-role]")).toHaveCount(0);
    await expect(page.locator("[data-recommended-next-tool]")).toHaveCount(0);
    await expect(page.locator("[data-source-idea-section]")).toHaveCount(0);
    await expect(page.locator("[data-game-output-panels]")).toHaveCount(0);
    await expect(page.locator("[data-game-hub-foundation]")).toHaveCount(0);
    await expect(page.locator("aside [data-game-list]")).toHaveCount(0);
    await expect(page.locator(".tool-center-panel [data-game-list]")).toContainText("Demo Game");
    await expect(page.locator("[data-game-list]")).toContainText("Demo Game");
    await expect(page.locator("[data-game-list]")).toContainText("Gravity Demo");
    await expect(page.locator("[data-game-list]")).toContainText("Collision Demo");
    await expect(page.locator("[data-game-list]")).toContainText("Camera Follow Demo");
    await expect(page.locator("summary").filter({ hasText: /^Open Games$/ })).toHaveCount(0);
    await expect(page.locator("[data-game-parent-table='open-games']")).toHaveAttribute("aria-label", "Open Games");
    await expect(page.locator("[data-game-rows-table='true']")).toHaveAttribute("aria-label", "Open Games");
    await expect(page.locator("[data-game-rows-table='true'] caption")).toHaveText("Open Games");
    await expect(page.locator("[data-game-rows-table='true'] thead th")).toHaveText([
      "Game",
      "Purpose",
      "Status",
      "Actions",
    ]);
    await expect(page.locator("[data-game-rows-table='true'] thead")).not.toContainText(/Owner|Role|Next Tool/);
    const demoGameRow = page.locator("[data-game-row='demo-game']");
    await expect(demoGameRow.locator("td")).toHaveText(["Game", "Under Construction", "Edit"]);
    await expect(demoGameRow).not.toContainText("User 1");
    await expect(demoGameRow).not.toHaveAttribute("data-game-active", "true");
    await expect(demoGameRow).not.toHaveAttribute("aria-current", "true");
    await expect(demoGameRow.locator("th[data-game-active-cell='true']")).toHaveCount(0);
    await expect(page.locator("[data-game-row][data-game-active='true']")).toHaveCount(0);
    await expect(page.locator("[data-game-row][aria-current='true']")).toHaveCount(0);
    await expect(page.locator("[data-game-active-cell='true']")).toHaveCount(0);
    const rowVisuals = await page.locator("[data-game-row]").evaluateAll((rows) => rows.map((row) => {
      const cells = Array.from(row.children).slice(1);
      return cells.map((cell) => {
        const styles = getComputedStyle(cell);
        return {
          backgroundColor: styles.backgroundColor,
          boxShadow: styles.boxShadow,
        };
      });
    }));
    expect(rowVisuals[0]).toEqual(rowVisuals[1]);
    await expect(demoGameRow.locator("> .status")).toHaveCount(0);
    await expect(demoGameRow.locator("[data-game-toggle='demo-game']")).toHaveAttribute("aria-expanded", "false");
    await expect(demoGameRow.locator("[data-game-toggle='demo-game']")).toHaveClass(/\bprimary\b/);
    await expect(demoGameRow.locator("[data-game-toggle='demo-game']")).toHaveClass(/\bbtn--compact\b/);
    await expect(demoGameRow.locator("[data-game-toggle='demo-game']")).toHaveAttribute("data-game-active", "true");
    await expect(demoGameRow.locator("[data-game-toggle='demo-game']")).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-game-toggle][aria-current='true']")).toHaveCount(1);
    await expect(page.locator("[data-game-toggle][data-game-active='true']")).toHaveCount(1);
    const activeButtonStyle = await demoGameRow.locator("[data-game-toggle='demo-game']").evaluate((button) => {
      const styles = getComputedStyle(button);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        boxShadow: styles.boxShadow,
      };
    });
    const inactiveButtonStyle = await page.locator("[data-game-row='gravity-demo'] [data-game-toggle='gravity-demo']").evaluate((button) => {
      const styles = getComputedStyle(button);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        boxShadow: styles.boxShadow,
      };
    });
    expect(activeButtonStyle).not.toEqual(inactiveButtonStyle);
    await expect(demoGameRow.getByRole("button", { name: "Edit Demo Game" })).toHaveText("Edit");
    await expect(demoGameRow.getByRole("button", { name: "Edit Demo Game" })).not.toHaveClass(/primary/);
    await expect(demoGameRow.getByRole("button", { name: "Edit Demo Game" })).toHaveClass(/\bbtn--compact\b/);
    await expect(demoGameRow.getByRole("button", { name: "Edit Demo Game" })).not.toHaveAttribute("aria-current", "true");
    await demoGameRow.locator("[data-game-toggle='demo-game']").click();
    await expect(demoGameRow.locator("[data-game-toggle='demo-game']")).toHaveAttribute("aria-expanded", "true");
    const demoChildRows = page.locator("[data-game-expanded-row='demo-game']");
    await expect(demoChildRows).toHaveCount(2);
    await expect(demoChildRows.nth(0)).toHaveAttribute("data-game-child-row", "source-idea");
    await expect(demoChildRows.nth(1)).toHaveAttribute("data-game-child-row", "readiness-output");
    await expect(page.locator("[data-game-expanded-row='demo-game'] [data-game-child-table='summary']")).toHaveCount(0);
    await expect(page.locator("[data-game-expanded-row='demo-game'] [data-game-child-table]")).toHaveCount(2);
    const demoSourceIdeaTable = demoChildRows.nth(0).locator("[data-game-child-table='source-idea']");
    await expect(demoSourceIdeaTable.locator("caption")).toHaveText("Source Idea");
    await expect(demoSourceIdeaTable.locator("tbody tr")).toHaveText([
      "IdeaNo source idea yet",
      "PitchCreate a project from Idea Board to see source details.",
      "Note 1No source notes.",
    ]);
    const readinessOutputTable = demoChildRows.nth(1).locator("[data-game-child-table='readiness-output']");
    await expect(readinessOutputTable.locator("caption")).toHaveText("Readiness Output");
    await expect(readinessOutputTable.locator("thead th")).toHaveText(["Output", "Status"]);
    await expect(readinessOutputTable.locator("tbody tr")).toHaveText([
      "Game StatusUnder Construction",
      "Game ProgressDemo Game identity ready",
      "Launch ProgressPublish blocked until configuration and required assets are ready",
      "Current FocusComplete Game Configuration",
      "Recommended Next ToolGame Configuration",
      "Game identityComplete",
      "Game configurationUnder Construction",
      "Playable buildPlanned",
      "Publishing reviewPlanned",
    ]);
    await demoGameRow.locator("[data-game-toggle='demo-game']").click();
    await expect(page.locator("[data-game-expanded-row='demo-game']")).toHaveCount(0);

    await page.getByRole("button", { name: "Add Game" }).click();
    const addGameRow = page.locator("[data-game-add-row='input']");
    await expect(addGameRow.locator("[data-game-action]")).toHaveText(["Save", "Cancel"]);
    await expect(addGameRow.getByRole("button", { name: "Save" })).toHaveClass(/\bbtn--compact\b/);
    await expect(addGameRow.getByRole("button", { name: "Save" })).toHaveClass("btn btn--compact primary");
    await expect(demoGameRow.locator("[data-game-toggle='demo-game']")).toHaveClass("btn btn--compact primary");
    await expect(addGameRow.locator("td")).toHaveCount(3);
    const addGameNameInput = addGameRow.getByLabel("Game");
    await expect(addGameNameInput).toHaveAttribute("required", "");
    await addGameRow.getByRole("button", { name: "Save" }).click();
    await expect(addGameNameInput).toHaveAttribute("aria-invalid", "true");
    await expect(addGameNameInput).toBeFocused();
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Enter a game name before saving.");
    await expect(page.locator("[data-game-list]")).not.toContainText("Untitled Game");
    await addGameNameInput.fill("   ");
    await addGameRow.getByRole("button", { name: "Save" }).click();
    await expect(addGameNameInput).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Enter a game name before saving.");
    await expect(page.locator("[data-game-list]")).not.toContainText("Untitled Game");
    await addGameNameInput.fill("Launch Test Game");
    await addGameRow.getByLabel("Purpose").selectOption("Learning Game");
    await addGameRow.getByLabel("Status").selectOption("Ready for Testing");
    await addGameRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-game-list]")).toContainText("Launch Test Game");
    await expect(page.locator("[data-game-row='launch-test-game-1']")).not.toHaveAttribute("data-game-active", "true");
    await expect(page.locator("[data-game-row='launch-test-game-1']")).not.toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-game-toggle][aria-current='true']")).toHaveCount(1);
    await expect(page.locator("[data-game-row='launch-test-game-1'] [data-game-toggle='launch-test-game-1']")).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-game-row='launch-test-game-1'] [data-game-toggle='launch-test-game-1']")).toHaveClass("btn btn--compact primary");
    await expect(page.locator("[data-game-row='launch-test-game-1']").getByRole("button", { name: "Edit Launch Test Game" })).not.toHaveClass(/primary/);
    await expect(page.locator("[data-game-row='launch-test-game-1'] td").nth(0)).toHaveText("Learning Game");
    await expect(page.locator("[data-game-row='launch-test-game-1'] td").nth(1)).toHaveText("Ready for Testing");
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Created and opened Launch Test Game.");

    await page.getByRole("button", { name: "Edit Launch Test Game" }).click();
    const editGameRow = page.locator("[data-game-edit-row='launch-test-game-1']");
    await expect(editGameRow.locator("[data-game-action]")).toHaveText(["Save", "Cancel"]);
    await expect(editGameRow.getByRole("button", { name: "Save" })).toHaveClass(/\bbtn--compact\b/);
    await expect(editGameRow.getByLabel("Game")).toHaveValue("Launch Test Game");
    await expect(editGameRow.getByLabel("Game")).toHaveAttribute("readonly", "");
    await editGameRow.getByLabel("Purpose").selectOption("Capability Demo");
    await editGameRow.getByLabel("Status").selectOption("Ready for Publish");
    await editGameRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-game-row='launch-test-game-1'] td").nth(0)).toHaveText("Capability Demo");
    await expect(page.locator("[data-game-row='launch-test-game-1'] td").nth(1)).toHaveText("Ready for Publish");
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Saved Launch Test Game.");

    await page.getByRole("button", { name: "Add Game" }).click();
    const archiveAddRow = page.locator("[data-game-add-row='input']");
    await archiveAddRow.getByLabel("Game").fill("Archive Game");
    await archiveAddRow.getByRole("button", { name: "Cancel" }).click();
    await expect(page.locator("[data-game-list]")).not.toContainText("Archive Game");
    await page.getByRole("button", { name: "Add Game" }).click();
    await page.locator("[data-game-add-row='input']").getByLabel("Game").fill("Archive Game");
    await page.locator("[data-game-add-row='input']").getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-game-row='archive-game-2']")).not.toHaveAttribute("data-game-active", "true");
    await expect(page.locator("[data-game-row='archive-game-2'] [data-game-toggle='archive-game-2']")).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-game-row='archive-game-2'] [data-game-toggle='archive-game-2']")).toHaveClass("btn btn--compact primary");

    await page.locator("[data-game-row='launch-test-game-1'] [data-game-toggle='launch-test-game-1']").click();
    await expect(page.locator("[data-game-row='launch-test-game-1']")).not.toHaveAttribute("data-game-active", "true");
    await expect(page.locator("[data-game-row='launch-test-game-1'] [data-game-toggle='launch-test-game-1']")).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-game-row='archive-game-2'] [data-game-toggle='archive-game-2']")).not.toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-game-toggle][aria-current='true']")).toHaveCount(1);
    await expect(page.locator("[data-game-toggle][data-game-active='true']")).toHaveCount(1);
    const launchChildRows = page.locator("[data-game-expanded-row='launch-test-game-1']");
    await expect(launchChildRows).toHaveCount(2);
    await expect(launchChildRows.nth(0)).toHaveAttribute("data-game-child-row", "source-idea");
    await expect(launchChildRows.nth(1)).toHaveAttribute("data-game-child-row", "readiness-output");
    await expect(page.locator("[data-game-expanded-row='archive-game-2']")).toHaveCount(0);
    await expect(page.locator("[data-game-row='launch-test-game-1'] [data-game-toggle='launch-test-game-1']")).toHaveClass("btn btn--compact primary");
    await expect(page.locator("[data-game-row='launch-test-game-1']").getByRole("button", { name: "Edit Launch Test Game" })).not.toHaveClass(/primary/);
    await expect(page.locator("[data-game-hub-log]")).not.toHaveText("Selected Launch Test Game.");

    await page.getByRole("button", { name: "Delete Open Game" }).click();
    await expect(page.locator("[data-game-row='launch-test-game-1']")).toHaveCount(0);
    await expect(page.locator("[data-game-list]")).not.toContainText("Launch Test Game");
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Deleted Launch Test Game.");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub validates game parent rows and child tables", async ({ page }) => {
  const sourceLinkedGame = {
    id: "lantern-reef",
    ownerKey: MOCK_DB_KEYS.users.user1,
    name: "Lantern Reef",
    purpose: "Game",
    status: "Ready for Testing",
    ownerDisplayName: "User 1",
    members: [
      {
        displayName: "User 1",
        gameId: "lantern-reef",
        permission: "Owner",
        role: "Owner",
        userKey: MOCK_DB_KEYS.users.user1,
      },
    ],
    sourceIdea: {
      idea: "Lantern Reef",
      pitch: "Guide reef keepers through dusk storms.",
      notes: [
        "Keep traversal gentle.",
        "Use warm lantern art.",
      ],
    },
  };
  const journeyBuckets = [
    "Idea",
    "Design",
    "Graphics",
    "Audio",
    "Objects",
    "Worlds",
    "Interface",
    "Controls",
    "Rules",
    "Progression",
    "Play Test",
    "Publish",
    "Share",
  ];

  await page.route("**/api/toolbox/game-hub/repositories/*/methods/getActiveGame", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: { result: sourceLinkedGame },
        ok: true,
        rule: "Browser -> Server API -> Data Source",
      }),
      contentType: "application/json; charset=utf-8",
      status: 200,
    });
  });
  await page.route("**/api/toolbox/game-hub/repositories/*/methods/getGameProgress", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          result: {
            currentFocus: "Review source idea context",
            gameProgress: "Lantern Reef identity ready",
            gameStatus: "Ready for Testing",
            publishingProgress: "Launch review pending",
            recommendedNextTool: "Game Journey",
            progressChecklist: journeyBuckets.map((label) => ({ label, status: "Planned" })),
          },
        },
        ok: true,
        rule: "Browser -> Server API -> Data Source",
      }),
      contentType: "application/json; charset=utf-8",
      status: 200,
    });
  });
  await page.route("**/api/toolbox/game-hub/repositories/*/methods/listGames", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: { result: [sourceLinkedGame] },
        ok: true,
        rule: "Browser -> Server API -> Data Source",
      }),
      contentType: "application/json; charset=utf-8",
      status: 200,
    });
  });
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html", { session: creatorSession() });

  try {
    await expect(page.locator("summary").filter({ hasText: /^Open Games$/ })).toHaveCount(0);
    await expect(page.locator("[data-game-parent-table='open-games']")).toHaveAttribute("aria-label", "Open Games");
    await expect(page.locator("[data-game-rows-table='true']")).toHaveAttribute("aria-label", "Open Games");
    await expect(page.locator("[data-game-rows-table='true'] caption")).toHaveText("Open Games");
    const parentRows = page.locator("[data-game-rows-table='true'] tbody > [data-game-row]");
    await expect(parentRows).toHaveCount(1);
    const gameRow = page.locator("[data-game-row='lantern-reef']");
    await expect(gameRow).toContainText("Lantern Reef");
    await expect(gameRow.locator("[data-game-toggle='lantern-reef']")).toHaveAttribute("aria-expanded", "false");

    await gameRow.locator("[data-game-toggle='lantern-reef']").click();
    await expect(gameRow.locator("[data-game-toggle='lantern-reef']")).toHaveAttribute("aria-expanded", "true");
    const expandedRows = page.locator("[data-game-expanded-row='lantern-reef']");
    await expect(expandedRows).toHaveCount(3);
    await expect(expandedRows.nth(0)).toHaveAttribute("data-game-child-row", "summary");
    await expect(expandedRows.nth(1)).toHaveAttribute("data-game-child-row", "source-idea");
    await expect(expandedRows.nth(2)).toHaveAttribute("data-game-child-row", "readiness-output");
    await expect(expandedRows.locator("[data-game-child-table]")).toHaveCount(3);
    const summaryTable = expandedRows.nth(0).locator("[data-game-child-table='summary']");
    await expect(summaryTable.locator("caption")).toHaveText("Game Summary");
    await expect(summaryTable.locator("tbody tr")).toHaveText([
      "ProjectLantern Reef",
      "PurposeGame",
      "StatusPlanning",
    ]);

    const sourceIdeaTable = expandedRows.nth(1).locator("[data-game-child-table='source-idea']");
    await expect(sourceIdeaTable.locator("caption")).toHaveText("Source Idea");
    await expect(sourceIdeaTable.locator("tbody tr")).toHaveText([
      "IdeaLantern Reef",
      "PitchGuide reef keepers through dusk storms.",
      "Note 1Keep traversal gentle.",
      "Note 2Use warm lantern art.",
    ]);
    await expect(sourceIdeaTable.locator("button, input, textarea, select, [contenteditable='true'], [role='button']")).toHaveCount(0);
    await expect(sourceIdeaTable).not.toContainText(/Edit|Delete|Current Focus|Recommended Next Tool/);

    const readinessOutputTable = expandedRows.nth(2).locator("[data-game-child-table='readiness-output']");
    await expect(readinessOutputTable.locator("caption")).toHaveText("Readiness Output");
    await expect(readinessOutputTable.locator("thead th")).toHaveText(["Output", "Status"]);
    await expect(readinessOutputTable).not.toContainText(/Guide reef keepers|Keep traversal gentle|Use warm lantern art/);
    await expect(readinessOutputTable.locator("[data-readiness-checklist-row] th")).toHaveText(journeyBuckets);

    await expect(page.locator("[data-game-list] [data-game-list-status='empty']")).toHaveCount(0);
    await expect(page.locator("[data-game-list] [data-game-list-status='unavailable']")).toHaveCount(0);
    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub preserves guest browsing and blocks guest saves", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html");

  try {
    await expect(page.locator("[data-game-row='demo-game'] [data-game-toggle='demo-game']")).toHaveClass("btn btn--compact primary");
    await expect(page.locator("[data-game-row='demo-game']").getByRole("button", { name: "Edit Demo Game" })).not.toHaveClass(/primary/);
    await expect(page.locator("[data-game-row='demo-game']").getByRole("button", { name: "Edit Demo Game" })).toBeEnabled();
    await expect(page.locator("[data-game-list]")).toContainText("Gravity Demo");
    await expect(page.locator("[data-project-record-status]")).toHaveText("Game table loaded. Sign in to save changes.");
    await expect(page.locator("[data-project-records-table]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add Game" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Delete Open Game" })).toBeDisabled();
    await expect(page.getByLabel("Game Name")).toHaveCount(0);
    await expect(page.getByLabel("Game Purpose")).toHaveCount(0);
    await expect(page.locator("input[aria-label='Game Status'], textarea[aria-label='Game Status'], select[aria-label='Game Status']")).toHaveCount(0);
    await expect(page.getByLabel("Current User Role")).toHaveCount(0);

    await page.locator("[data-game-row='gravity-demo'] [data-game-toggle='gravity-demo']").click();
    await expect(page.locator("[data-game-row='gravity-demo'] [data-game-toggle='gravity-demo']")).toHaveClass("btn btn--compact primary");
    await expect(page.locator("[data-game-row='demo-game'] [data-game-toggle='demo-game']")).not.toHaveClass(/primary/);
    await expect(page.locator("[data-game-row='gravity-demo']").getByRole("button", { name: "Edit Gravity Demo" })).toBeEnabled();
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Sign in to create or update Game Hub projects.");

    await page.locator("[data-game-row='demo-game']").getByRole("button", { name: "Edit Demo Game" }).click();
    await page.locator("[data-game-edit-row='demo-game']").getByRole("button", { name: "Save" }).click();
    await page.waitForURL(/\/account\/sign-in\.html$/);

    await page.goto(`${failures.server.baseUrl}/toolbox/game-hub/index.html`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Add Game" }).click();
    await page.locator("[data-game-add-row='input']").getByRole("button", { name: "Save" }).click();
    await page.waitForURL(/\/account\/sign-in\.html$/);

    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors.filter((message) => !/Failed to fetch|gamefoundry-partials\.js/.test(message))).toEqual([]);
    expect(failures.failedRequests.filter((request) => /^\d/.test(request) && !request.includes("/account/sign-in.html"))).toEqual([]);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub shows a creator-safe empty state when no projects exist", async ({ page }) => {
  await page.route("**/api/toolbox/game-hub/repositories/*/methods/getActiveGame", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: { result: null },
        ok: true,
        rule: "Browser -> Server API -> Data Source",
      }),
      contentType: "application/json; charset=utf-8",
      status: 200,
    });
  });
  await page.route("**/api/toolbox/game-hub/repositories/*/methods/getGameProgress", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          result: {
            gameStatus: "No Game",
            gameProgress: "No active game",
            publishingProgress: "Not started",
            currentFocus: "Create a game",
            recommendedNextTool: "Game Hub",
            progressChecklist: [],
          },
        },
        ok: true,
        rule: "Browser -> Server API -> Data Source",
      }),
      contentType: "application/json; charset=utf-8",
      status: 200,
    });
  });
  await page.route("**/api/toolbox/game-hub/repositories/*/methods/listGames", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        data: { result: [] },
        ok: true,
        rule: "Browser -> Server API -> Data Source",
      }),
      contentType: "application/json; charset=utf-8",
      status: 200,
    });
  });
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html", { session: creatorSession() });

  try {
    await expect(page.locator("[data-active-game-name]")).toHaveCount(0);
    await expect(page.locator("[data-game-list] [data-game-list-status='empty']")).toHaveText("No Game Hub projects yet. Add a game to start building.");
    await expect(page.locator("[data-game-parent-table='open-games']")).toHaveAttribute("aria-label", "Open Games");
    await expect(page.locator("[data-game-rows-table='true'] thead th")).toHaveText([
      "Game",
      "Purpose",
      "Status",
      "Actions",
    ]);
    await expect(page.locator("[data-game-list] [data-game-row]")).toHaveCount(0);
    await expect(page.locator("[data-game-list] [data-game-add-row='button']")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Add Game" })).toBeEnabled();
    await expect(page.locator("[data-game-hub-log]")).not.toContainText(/server|API|repository|database|stack|error/i);
    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub shows a creator-safe unavailable state when project list API fails", async ({ page }) => {
  await page.route("**/api/toolbox/game-hub/repositories/*/methods/listGames", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        error: "postgres://service-role-secret@internal.example:5432/gamefoundry failed with stack trace",
        ok: false,
        rule: "Browser -> Server API -> Data Source",
      }),
      contentType: "application/json; charset=utf-8",
      status: 503,
    });
  });
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html", { session: creatorSession() });

  try {
    expect(failures.failedRequests.some((request) => request.includes("503") && request.includes("/methods/listGames"))).toBe(true);
    await expect(page.locator("[data-game-list] [data-game-list-status='unavailable']")).toHaveText("Game Hub projects are temporarily unavailable. Refresh the page or try again shortly.");
    await expect(page.locator("[data-game-list] [data-game-row]")).toHaveCount(0);
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Game Hub projects are temporarily unavailable. Refresh the page or try again shortly.");
    await expect(page.locator("main")).not.toContainText(/postgres|service-role-secret|internal\.example|stack trace|repository|database/i);
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors.filter((message) => !message.includes("status of 503"))).toEqual([]);
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
    await expect(page.locator("[data-active-game-name]")).toHaveCount(0);
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
    await expect(page.locator("[data-active-game-name]")).toHaveCount(0);
    await expect(page.locator("[data-current-user-role]")).toHaveCount(0);
    await expect(page.locator("[data-game-hub-log]")).toContainText("Active game is temporarily unavailable.");
    await expect(page.getByRole("button", { name: "Add Game" })).toBeEnabled();

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub displays and edits game purpose", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html", { session: creatorSession() });

  try {
    await expect(page.getByLabel("Current User Role")).toHaveCount(0);

    await page.getByRole("button", { name: "Edit Demo Game" }).click();
    const editRow = page.locator("[data-game-edit-row='demo-game']");
    await expect(editRow.locator("[data-game-action]")).toHaveText(["Save", "Cancel"]);
    await expect(editRow.getByLabel("Purpose").locator("option")).toHaveText([
      "Game",
      "Capability Demo",
      "Learning Game",
      "Template Game"
    ]);
    await expect(editRow.getByLabel("Status").locator("option")).toHaveText([
      "Planning",
      "Under Construction",
      "Ready for Testing",
      "Ready for Publish"
    ]);
    await expect(editRow.getByLabel("Purpose")).toHaveValue("Game");
    await expect(editRow.getByLabel("Status")).toHaveValue("Under Construction");
    await editRow.getByLabel("Purpose").selectOption("Learning Game");
    await editRow.getByLabel("Status").selectOption("Ready for Testing");
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-game-row='demo-game'] td").nth(0)).toHaveText("Learning Game");
    await expect(page.locator("[data-game-row='demo-game'] td").nth(1)).toHaveText("Ready for Testing");
    await expect(page.locator("[data-game-hub-log]")).toHaveText("Saved Demo Game.");

    await page.getByRole("button", { name: "Add Game" }).click();
    const addRow = page.locator("[data-game-add-row='input']");
    await addRow.getByLabel("Game").fill("Purpose Review Game");
    await addRow.getByLabel("Purpose").selectOption("Capability Demo");
    await addRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-game-row='purpose-review-game-1'] [data-game-toggle='purpose-review-game-1']")).toHaveClass("btn btn--compact primary");
    await expect(page.locator("[data-game-row='purpose-review-game-1']").getByRole("button", { name: "Edit Purpose Review Game" })).not.toHaveClass(/primary/);
    await expect(page.locator("[data-game-row='purpose-review-game-1'] td").nth(0)).toHaveText("Capability Demo");
    await expect(page.locator("[data-game-list]")).toContainText("Purpose Review Game");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub readiness child rows update from mock game state", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html", { session: creatorSession() });

  try {
    await expect(page.locator("[data-recommended-next-tool]")).toHaveCount(0);
    await expect(page.locator("[data-source-idea-section]")).toHaveCount(0);
    await expect(page.locator("[data-game-output-panels]")).toHaveCount(0);
    await expect(page.locator("[data-game-hub-foundation]")).toHaveCount(0);

    const demoGameRow = page.locator("[data-game-row='demo-game']");
    await demoGameRow.locator("[data-game-toggle='demo-game']").click();
    let readinessOutputTable = page.locator("[data-game-expanded-row='demo-game'][data-game-child-row='readiness-output'] [data-game-child-table='readiness-output']");
    await expect(readinessOutputTable.locator("tbody tr")).toHaveText([
      "Game StatusUnder Construction",
      "Game ProgressDemo Game identity ready",
      "Launch ProgressPublish blocked until configuration and required assets are ready",
      "Current FocusComplete Game Configuration",
      "Recommended Next ToolGame Configuration",
      "Game identityComplete",
      "Game configurationUnder Construction",
      "Playable buildPlanned",
      "Publishing reviewPlanned",
    ]);

    await page.getByRole("button", { name: "Add Game" }).click();
    await page.locator("[data-game-add-row='input']").getByLabel("Game").fill("Progress Review Game");
    await page.locator("[data-game-add-row='input']").getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-game-project-information]")).toHaveCount(0);
    await expect(page.locator("[data-game-list]")).toContainText("Progress Review Game");
    const progressReviewRow = page.locator("[data-game-row='progress-review-game-1']");
    await progressReviewRow.locator("[data-game-toggle='progress-review-game-1']").click();
    readinessOutputTable = page.locator("[data-game-expanded-row='progress-review-game-1'][data-game-child-row='readiness-output'] [data-game-child-table='readiness-output']");
    await expect(readinessOutputTable).toContainText("Progress Review Game identity ready");

    await page.getByRole("button", { name: "Delete Open Game" }).click();
    await expect(page.locator("[data-game-row='demo-game'] [data-game-toggle='demo-game']")).toHaveClass("btn btn--compact primary");
    await expect(page.locator("[data-game-row='demo-game']").getByRole("button", { name: "Edit Demo Game" })).not.toHaveClass(/primary/);
    await demoGameRow.locator("[data-game-toggle='demo-game']").click();
    readinessOutputTable = page.locator("[data-game-expanded-row='demo-game'][data-game-child-row='readiness-output'] [data-game-child-table='readiness-output']");
    await expect(readinessOutputTable).toContainText("Demo Game identity ready");

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
