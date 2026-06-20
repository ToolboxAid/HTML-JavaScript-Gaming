import { expect, test } from "@playwright/test";
import http from "node:http";
import process from "node:process";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import {
  TOOL_RELEASE_CHANNEL_HELP_TEXT,
  TOOL_RELEASE_CHANNEL_LABELS,
  TOOL_RELEASE_CHANNELS,
  TOOL_STATUS_MODEL,
  getActiveToolRegistry,
  getToolProgressReadiness,
  getToolRegistry,
  getToolReleaseChannel,
} from "../../../toolbox/toolRegistry.js";
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

const TOOLBOX_DEFAULT_RELEASE_CHANNELS = Object.freeze(["wireframe", "beta", "complete"]);
const BUILD_PATH_DEFAULT_RELEASE_CHANNELS = Object.freeze(["complete"]);
const TOOLBOX_RELEASE_CHANNEL_SWATCHES = Object.freeze({
  beta: "swatch-gold",
  complete: "swatch-green",
  deprecated: "swatch-purple",
  planned: "swatch-gray",
  wireframe: "swatch-blue",
});
const TOOLBOX_ROLE_FOCUS_TOOLS = Object.freeze({
  "Audio Creator": Object.freeze(["Audio", "Music", "Voices", "MIDI", "Audio Effects", "Voice Capture", "Text To Speech", "Assets"]),
  Artist: Object.freeze(["Assets", "Colors", "Tags", "Fonts", "Sprites", "Characters", "Objects", "Animations"]),
  Designer: Object.freeze(["Game Hub", "Game Journey", "Game Design", "Game Configuration", "Objects", "Worlds", "Characters", "Colors", "Assets", "Tags"]),
  Owner: null,
  Publisher: Object.freeze(["Publish", "Marketplace", "Community", "Cloud", "Languages"]),
  Tester: Object.freeze(["Game Testing", "Controls", "Hitboxes", "Debug", "Performance", "Events"]),
  Translator: Object.freeze(["Languages", "Voices", "Voice Capture", "Text To Speech"]),
  Viewer: Object.freeze(["Game Hub", "Game Journey", "Game Design", "Game Configuration", "Objects", "Worlds", "Assets", "Colors", "Tags", "Audio", "Publish", "Marketplace", "Community", "Languages", "Achievements", "Ratings"]),
  "World Builder": Object.freeze(["Worlds", "Objects", "Assets", "Colors", "Tags", "Animations"]),
});

function orderedUniqueValues(rows, accessor) {
  return [...new Set(rows.map(accessor).filter(Boolean))];
}

function localToolboxContract(activeTools) {
  return {
    defaultReleaseChannels: {
      buildPath: [...BUILD_PATH_DEFAULT_RELEASE_CHANNELS],
      toolbox: [...TOOLBOX_DEFAULT_RELEASE_CHANNELS],
    },
    groupSwatches: {},
    groups: orderedUniqueValues(activeTools, (tool) => tool.category || tool.group),
    releaseChannelByStatus: Object.fromEntries(TOOL_STATUS_MODEL.map((status) => [
      status,
      getToolReleaseChannel({ status }),
    ])),
    releaseChannelHelpText: { ...TOOL_RELEASE_CHANNEL_HELP_TEXT },
    releaseChannelLabels: { ...TOOL_RELEASE_CHANNEL_LABELS },
    releaseChannelSwatches: { ...TOOLBOX_RELEASE_CHANNEL_SWATCHES },
    releaseChannels: [...TOOL_RELEASE_CHANNELS],
    roleFocusTools: { ...TOOLBOX_ROLE_FOCUS_TOOLS },
    toolboxGroupOrder: orderedUniqueValues(activeTools, (tool) => tool.toolboxGroup),
  };
}

function localRegistrySnapshot() {
  const activeTools = getActiveToolRegistry();
  return {
    activeTools,
    readinessByStatus: Object.fromEntries(TOOL_STATUS_MODEL.map((status) => [
      status,
      getToolProgressReadiness(status),
    ])),
    toolboxContract: localToolboxContract(activeTools),
    tools: getToolRegistry(),
  };
}

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
  process.env.GAMEFOUNDRY_SUPABASE_ANON_KEY = "game-workspace-anon-key";
  process.env.GAMEFOUNDRY_DATABASE_URL = "postgres://game-workspace:test@127.0.0.1:5432/game_workspace";
  process.env.GAMEFOUNDRY_SUPABASE_SERVICE_ROLE_KEY = "game-workspace-service-role-key";
  process.env.GAMEFOUNDRY_SUPABASE_URL = fakeSupabaseServer.baseUrl;
});

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "game-workspace",
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
        data: localRegistrySnapshot(),
        ok: true,
      }),
    });
  });
  await page.route("**/api/toolbox/votes/snapshot", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: { rows: [] },
        ok: true,
      }),
    });
  });

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
    await expect(page.getByRole("link", { name: "Open Game Hub" })).toHaveAttribute("href", "toolbox/game-workspace/index.html");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub renders a table-first project accordion", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html", { session: creatorSession() });

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-project-record-status]")).toHaveText("Projects loaded.");
    await expect(page.getByRole("table", { name: "Projects" })).toBeVisible();
    await expect(page.getByRole("columnheader")).toHaveText([
      "Project",
      "Description",
      "Status",
      "Updated",
      "Journey",
      "Actions"
    ]);
    await expect(page.locator("[data-game-project-information]")).toHaveCount(0);
    await expect(page.locator("[data-project-records-table]")).toHaveCount(0);
    await expect(page.locator("[data-game-workspace-foundation]")).toHaveCount(0);
    await expect(page.locator("[data-game-output-panels]")).toHaveCount(0);
    await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-active-game-purpose]")).toHaveText("Game project");
    await expect(page.locator("[data-active-game-status]")).toHaveText("Under Construction");
    await expect(page.locator("[data-current-user-role]")).toHaveText("Owner");
    await expect(page.locator("[data-game-projects-table]")).toContainText("Demo Game");
    await expect(page.locator("[data-game-projects-table]")).toContainText("Gravity Demo");
    await expect(page.locator("[data-game-projects-table]")).toContainText("Collision Demo");
    await expect(page.locator("[data-game-projects-table]")).toContainText("Camera Follow Demo");
    await expect(page.locator("[data-game-project-expanded-row]")).toHaveCount(0);

    const demoGameRow = page.locator("[data-game-row='demo-game']");
    await expect(demoGameRow.locator(".table-parent-chevron--down")).toHaveCount(1);
    await expect(demoGameRow.locator("td").nth(4)).toHaveText("0 Items");
    await expect(demoGameRow.getByRole("button", { name: "Open Demo Game" })).toHaveClass(/primary/);
    await expect(demoGameRow.getByRole("button", { name: "Open Demo Game" })).toHaveAttribute("aria-current", "true");

    await page.getByRole("button", { name: "Demo Game", exact: true }).click();
    await expect(page.locator("[data-game-project-expanded-row='demo-game']")).toBeVisible();
    await expect(demoGameRow.locator(".table-parent-chevron--up")).toHaveCount(1);
    await expect(page.locator("[data-game-project-child-surface] [data-source-idea-section]")).toContainText("No source idea yet");

    await demoGameRow.getByText("0 Items").click();
    await expect(page.locator("[data-game-project-expanded-row='demo-game']")).toBeVisible();

    await page.getByRole("button", { name: "Gravity Demo", exact: true }).click();
    await expect(page.locator("[data-game-project-expanded-row]")).toHaveCount(1);
    await expect(page.locator("[data-game-project-expanded-row='gravity-demo']")).toBeVisible();
    await expect(page.locator("[data-game-project-expanded-row='demo-game']")).toHaveCount(0);

    await page.getByRole("button", { name: "Gravity Demo", exact: true }).click();
    await expect(page.locator("[data-game-project-expanded-row]")).toHaveCount(0);

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub creates, opens, and deletes projects from table actions", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html", { session: creatorSession() });

  try {
    await expect(page.getByRole("button", { name: "Create Project" })).toHaveClass("btn");
    await expect(page.getByRole("button", { name: "Create Project" })).toBeEnabled();

    await page.getByLabel("Project Name").fill("Launch Test Game");
    await page.getByRole("button", { name: "Create Project" }).click();
    await expect(page.locator("[data-active-game-name]")).toHaveText("Launch Test Game");
    await expect(page.locator("[data-game-projects-table]")).toContainText("Launch Test Game");
    await expect(page.locator("[data-game-project-expanded-row='launch-test-game-1']")).toBeVisible();
    await expect(page.locator("[data-game-row='launch-test-game-1']").getByRole("button", { name: "Open Launch Test Game" })).toHaveClass(/primary/);
    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Created and opened Launch Test Game.");

    await page.getByLabel("Project Name").fill("Archive Game");
    await page.getByRole("button", { name: "Create Project" }).click();
    await expect(page.locator("[data-active-game-name]")).toHaveText("Archive Game");

    await page.locator("[data-game-row='launch-test-game-1']").getByRole("button", { name: "Open Launch Test Game" }).click();
    await expect(page.locator("[data-active-game-name]")).toHaveText("Launch Test Game");
    await expect(page.locator("[data-game-row='launch-test-game-1']").getByRole("button", { name: "Open Launch Test Game" })).toHaveAttribute("data-game-active", "true");
    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Opened Launch Test Game.");

    await page.locator("[data-game-row='launch-test-game-1']").getByRole("button", { name: "Delete Launch Test Game" }).click();
    await expect(page.locator("[data-active-game-name]")).not.toHaveText("Launch Test Game");
    await expect(page.locator("[data-game-projects-table]")).not.toContainText("Launch Test Game");
    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Deleted Launch Test Game.");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub preserves guest browsing and blocks guest saves", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html");

  try {
    await expect(page.locator("[data-active-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-game-projects-table]")).toContainText("Gravity Demo");
    await expect(page.locator("[data-project-record-status]")).toHaveText("Projects loaded. Sign in to create or update projects.");
    await expect(page.getByRole("button", { name: "Create Project" })).toBeDisabled();
    await expect(page.locator("[data-game-row='demo-game']").getByRole("button", { name: "Delete Demo Game" })).toBeDisabled();
    await expect(page.getByLabel("Project Name")).toBeDisabled();
    await expect(page.getByLabel("Project Type")).toBeDisabled();
    await expect(page.getByLabel("Project Status")).toBeDisabled();
    await expect(page.getByLabel("Change Role")).toBeDisabled();

    await page.locator("[data-game-row='gravity-demo']").getByRole("button", { name: "Open Gravity Demo" }).click();
    await expect(page.locator("[data-active-game-name]")).toHaveText("Gravity Demo");
    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Sign in to create or update Game Hub projects.");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub shows active-game errors without throwing", async ({ page }) => {
  await page.route("**/api/toolbox/game-workspace/repositories/*/methods/getActiveGame", async (route) => {
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
  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html");

  try {
    expect(failures.failedRequests.some((request) => request.includes("502") && request.includes("/methods/getActiveGame"))).toBe(true);
    await expect(page.locator("[data-active-game-name]")).toHaveCount(0);
    await expect(page.locator("[data-game-projects-table]")).toContainText("Demo Game");
    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active project is temporarily unavailable.");
    expect(failures.pageErrors).toEqual([]);
    expect(failures.consoleErrors.filter((message) => !message.includes("status of 502"))).toEqual([]);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub reports malformed active-game payloads without throwing", async ({ page }) => {
  await page.route("**/api/toolbox/game-workspace/repositories/*/methods/getActiveGame", async (route) => {
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
  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html");

  try {
    await expect(page.locator("[data-active-game-name]")).toHaveCount(0);
    await expect(page.locator("[data-current-user-role]")).toHaveText("Viewer");
    await expect(page.locator("[data-game-workspace-log]")).toContainText("Active project is temporarily unavailable.");
    await expect(page.getByLabel("Project Type")).toBeDisabled();

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub keeps project setup and role controls creator-facing", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html", { session: creatorSession() });

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
    await expect(page.getByLabel("Project Type")).toHaveValue("Game");
    await expect(page.getByLabel("Project Status")).toHaveValue("Under Construction");
    await expect(page.getByLabel("Change Role")).toHaveValue("Owner");

    await page.getByLabel("Change Role").selectOption("Designer");
    await expect(page.locator("[data-current-user-role]")).toHaveText("Designer");
    await expect(page.locator("[data-game-workspace-log]")).toHaveText("Updated current role to Designer.");

    await page.getByLabel("Project Type").selectOption("Capability Demo");
    await page.getByLabel("Project Status").selectOption("Ready for Testing");
    await page.getByLabel("Project Name").fill("Purpose Review Game");
    await page.getByRole("button", { name: "Create Project" }).click();
    await expect(page.locator("[data-active-game-name]")).toHaveText("Purpose Review Game");
    await expect(page.locator("[data-active-game-purpose]")).toHaveText("Capability Demo project");
    await expect(page.locator("[data-active-game-status]")).toHaveText("Ready for Testing");
    await expect(page.locator("[data-current-user-role]")).toHaveText("Owner");
    await expect(page.locator("[data-game-projects-table]")).toContainText("Purpose Review Game");

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub opens handoff projects with Source Idea and Journey child rows", async ({ page }) => {
  const handoffGame = {
    id: "sky-orchard-1",
    members: [
      {
        displayName: "User 1",
        gameId: "sky-orchard-1",
        permission: "Owner",
        role: "Owner",
        userKey: MOCK_DB_KEYS.users.user1,
      },
    ],
    name: "Sky Orchard",
    ownerDisplayName: "User 1",
    ownerKey: MOCK_DB_KEYS.users.user1,
    purpose: "Game",
    sourceIdea: {
      idea: "Sky Orchard",
      notes: [
        "Floating islands need a wind map.",
        "Harvest routes should change with weather.",
      ],
      pitch: "Grow floating islands into a shared orchard.",
    },
    status: "Under Construction",
  };

  await page.route("**/api/toolbox/game-workspace/repositories/*/methods/getActiveGame", async (route) => {
    await route.fulfill({
      body: JSON.stringify({ data: { result: handoffGame }, ok: true }),
      contentType: "application/json; charset=utf-8",
    });
  });
  await page.route("**/api/toolbox/game-workspace/repositories/*/methods/openGame", async (route) => {
    await route.fulfill({
      body: JSON.stringify({ data: { result: handoffGame }, ok: true }),
      contentType: "application/json; charset=utf-8",
    });
  });
  await page.route("**/api/toolbox/game-workspace/repositories/*/methods/listGames", async (route) => {
    await route.fulfill({
      body: JSON.stringify({ data: { result: [handoffGame] }, ok: true }),
      contentType: "application/json; charset=utf-8",
    });
  });

  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html", { session: creatorSession() });

  try {
    await page.goto(`${failures.server.baseUrl}/toolbox/game-workspace/index.html?game=sky-orchard-1`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-active-game-name]")).toHaveText("Sky Orchard");
    await expect(page.locator("[data-active-game-purpose]")).toHaveText("Grow floating islands into a shared orchard.");
    await expect(page.locator("[data-game-row='sky-orchard-1'] td").nth(4)).toHaveText("2 Items");
    await expect(page.locator("[data-game-project-expanded-row='sky-orchard-1']")).toBeVisible();
    await expect(page.locator("[data-source-idea-display]")).toHaveText("Sky Orchard");
    await expect(page.locator("[data-source-idea-pitch]")).toHaveText("Grow floating islands into a shared orchard.");
    await expect(page.locator("[data-source-idea-notes]")).toContainText("Floating islands need a wind map.");
    await expect(page.getByRole("table", { name: "Game Journey Items for Sky Orchard" })).toContainText("Harvest routes should change with weather.");
    await expect(page.getByRole("table", { name: "Game Journey Items for Sky Orchard" })).toContainText("Planned");
    await expect(page.locator("[data-game-project-child-surface]")).toBeVisible();

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub uses the wide Theme V2 tool layout at desktop widths", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html");

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
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 14/42");
    await expect(page.locator("[data-toolbox-role-focus]")).toHaveCount(0);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Hub$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Journey$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Configuration$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Assets$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Testing$/ }) })).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?memberRole=Designer`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-focus='Designer']")).toBeVisible();
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 8/42");
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
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 1/42");
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Assets$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Audio$/ }) })).toHaveCount(0);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^MIDI$/ }) })).toHaveCount(0);
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toHaveCount(0);

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html?memberRole=Viewer`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-role-focus='Viewer']")).toBeVisible();
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 10/42");
    await expect(page.getByText("Viewer focus shows preview-safe read-only tiles only.")).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Hub$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Journey$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Design$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Game Configuration$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Assets$/ }) })).toBeVisible();
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Debug$/ }) })).toHaveCount(0);
    await page.goto(`${failures.server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tools-count]")).toHaveText("Tool Count: 14/42");
    await expect(page.locator("main .control-card").filter({ has: page.locator("h3", { hasText: /^Cloud$/ }) })).toHaveCount(0);

    await expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});
