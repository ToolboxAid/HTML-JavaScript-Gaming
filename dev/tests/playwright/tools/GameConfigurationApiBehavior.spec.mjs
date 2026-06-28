import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createPostgresConnectionClient } from "../../../../api/persistence/postgres-connection-client.mjs";
import { SEED_DB_KEYS } from "../../../../api/seed/seed-db-keys.mjs";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "game-configuration",
    surface: "game configuration API behavior"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

function restoreEnvValue(key, value) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

let gameConfigurationSchemaReadyPromise = null;

async function ensureGameConfigurationDatabaseSchema() {
  if (!gameConfigurationSchemaReadyPromise) {
    gameConfigurationSchemaReadyPromise = (async () => {
      const client = createPostgresConnectionClient();
      const ddlFiles = [
        "dev/build/database/ddl/account.sql",
        "dev/build/database/ddl/game-workspace.sql",
        "dev/build/database/ddl/game-design.sql",
        "dev/build/database/ddl/game-configuration.sql"
      ];
      for (const ddlFile of ddlFiles) {
        const ddl = await readFile(path.resolve(ddlFile), "utf8");
        await client.query(ddl);
      }
    })();
  }
  try {
    await gameConfigurationSchemaReadyPromise;
  } catch (error) {
    gameConfigurationSchemaReadyPromise = null;
    throw error;
  }
}

async function readProductRows(tableName, query = "select=*") {
  const client = createPostgresConnectionClient();
  return client.requestTable(tableName, { query });
}

async function setServerSession(server, userKey) {
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
}

async function openRepoPage(page, pathName, options = {}) {
  const server = await startRepoServer();
  await ensureGameConfigurationDatabaseSchema();
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

  await workspaceV2CoverageReporter.start(page);
  if (options.sessionUserKey !== null) {
    await setServerSession(server, options.sessionUserKey || SEED_DB_KEYS.users.user1);
  }
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

async function createRepositoryApiClient(server, toolId) {
  const repositoryResponse = await fetch(`${server.baseUrl}/api/toolbox/${encodeURIComponent(toolId)}/repositories`, {
    body: JSON.stringify({ options: {} }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  const repositoryPayload = await repositoryResponse.json();
  expect(repositoryResponse.status).toBe(200);
  expect(repositoryPayload.ok).toBe(true);
  const repositoryId = repositoryPayload.data.repositoryId;
  expect(repositoryId).toBeTruthy();

  return {
    repositoryId,
    async call(methodName, args = []) {
      const response = await fetch(
        `${server.baseUrl}/api/toolbox/${encodeURIComponent(toolId)}/repositories/${encodeURIComponent(repositoryId)}/methods/${encodeURIComponent(methodName)}`,
        {
          body: JSON.stringify({ args }),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        }
      );
      const payload = await response.json().catch(() => ({}));
      return { payload, response };
    }
  };
}

async function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function fillReadyConfiguration(page, summary = "A playable puzzle configuration with one clear starting room.") {
  await page.getByLabel("Game Details").fill("A friendly puzzle game prepared for sharing and discovery.");
  await page.getByLabel("Version").fill("0.1.0");
  await page.getByLabel("Resolution").selectOption("1280x720");
  await page.getByLabel("Platforms").fill("Web");
  await page.getByLabel("Visibility").selectOption("Private");
  await page.getByLabel("Startup Settings").fill("Open on the title screen and start in the first room.");
  await page.getByLabel("Game Basics").fill(summary);
  await page.getByLabel("Game Rules").fill("Collect every key, avoid hazards, and reach the exit.");
  await page.getByLabel("Player Setup").fill("One player starts near the first key with keyboard controls.");
  await page.getByLabel("World Setup").fill("One compact room with a locked exit and visible goal path.");
  await page.getByLabel("Object Setup").fill("Keys, doors, hazards, exit marker, and tutorial prompt.");
  await page.getByLabel("Audio Setup").fill("Simple pickup, hazard, and completion sounds.");
  await page.getByLabel("Test Readiness").fill("Confirm start, collect, fail, retry, and win paths before Build Game.");
}

test("Game Configuration requires a valid Game Design handoff before editable configuration", async ({ page }) => {
  const missingFailures = await openRepoPage(page, "/toolbox/game-configuration/index.html?handoff=missing");

  try {
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-game-configuration-handoff-context]")).toHaveText("No valid Game Design handoff");
    await expect(page.locator("[data-game-configuration-handoff-overlay]")).toBeVisible();
    await expect(page.locator("[data-game-configuration-form-card]")).toBeHidden();
    await expect(page.locator(".tool-center-panel [data-game-configuration-form]")).toBeHidden();
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Game Design");
    await expect(page.locator("[data-game-configuration-output-readiness]")).toHaveText("Blocked");
    await expect(page.locator("[data-game-configuration-output-next-step]")).toHaveText("Game Design");
    await expect(page.locator("[data-game-configuration-output]")).not.toContainText("{");
    await expect(page.locator("[data-game-configuration-output]")).not.toContainText('"gameBasics"');

    await expectNoPageFailures(missingFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await missingFailures.server.close();
  }

  const invalidFailures = await openRepoPage(page, "/toolbox/game-configuration/index.html?handoff=invalid");

  try {
    await expect(page.locator("[data-game-configuration-handoff-overlay]")).toBeVisible();
    await expect(page.locator("[data-game-configuration-form-card]")).toBeHidden();
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Game Design");
    await expect(page.locator("[data-game-configuration-output-readiness]")).toHaveText("Blocked");

    await expectNoPageFailures(invalidFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await invalidFailures.server.close();
  }
});

test("Game Configuration saves and updates creator-facing sections with readable output", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-configuration/index.html");

  try {
    await expect(page.locator("[data-toolbox-selected-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-game-configuration-handoff-context]")).toHaveText("Demo Game - Game - Puzzle / Adventure / Single Player / 1 Player");
    await expect(page.locator("[data-game-configuration-handoff-overlay]")).toBeHidden();
    await expect(page.locator("[data-game-configuration-form-card]")).toBeVisible();
    await expect(page.locator(".tool-center-panel [data-game-configuration-form]")).toBeVisible();
    const formCardSpacing = await page.locator("[data-game-configuration-form-card] > .card-body.content-stack").evaluate((body) => {
      const computed = getComputedStyle(body);
      const firstChild = body.firstElementChild;
      return {
        firstChildTopGap: Math.round(firstChild.getBoundingClientRect().top - body.getBoundingClientRect().top),
        marginBottom: computed.marginBottom,
        marginLeft: computed.marginLeft,
        marginRight: computed.marginRight,
        marginTop: computed.marginTop,
        paddingTop: computed.paddingTop
      };
    });
    expect(formCardSpacing).toMatchObject({
      marginBottom: "8px",
      marginLeft: "8px",
      marginRight: "8px",
      marginTop: "8px"
    });
    expect(Number.parseInt(formCardSpacing.paddingTop, 10)).toBeGreaterThanOrEqual(8);
    expect(formCardSpacing.firstChildTopGap).toBeGreaterThanOrEqual(8);
    await expect(page.locator("[data-game-configuration-playable-setup-table]")).toBeVisible();
    await expect(page.locator("[data-game-configuration-playable-setup-table] th")).toHaveText([
      "Game Name",
      "Game Type",
      "Game Details",
      "Version",
      "Resolution",
      "Platforms",
      "Visibility",
      "Startup Settings",
      "Game Basics",
      "Game Rules",
      "Player Setup",
      "World Setup",
      "Object Setup",
      "Audio Setup",
      "Test Readiness"
    ]);
    await expect(page.locator("input[data-game-configuration-game-name]")).toHaveCount(0);
    await expect(page.locator("input[data-game-configuration-game-type]")).toHaveCount(0);
    await expect(page.locator("[data-game-configuration-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-game-configuration-game-type]")).toHaveText("Puzzle");
    await expect(page.getByLabel("Game Details")).not.toHaveValue("");
    await expect(page.getByLabel("Game Basics")).not.toHaveValue("");
    await expect(page.getByLabel("Game Rules")).not.toHaveValue("");
    await expect(page.locator("[data-game-configuration-status]")).toHaveText("Ready");
    await expect(page.locator("[data-game-configuration-output-summary]")).not.toHaveText("No configuration summary saved yet.");
    await expect(page.locator("[data-game-configuration-player-mode]")).toHaveCount(0);
    await expect(page.locator("[data-game-configuration-playable-setup-table] textarea")).toHaveCount(9);
    await expect(page.locator("[data-game-configuration-playable-setup-table] input")).toHaveCount(2);
    await expect(page.locator("[data-game-configuration-playable-setup-table] select")).toHaveCount(2);
    expect(await page.locator("[data-game-configuration-playable-setup-table] textarea").evaluateAll((textareas) => (
      textareas.every((textarea) => textarea.getAttribute("rows") === "4")
    ))).toBe(true);
    await expect(page.locator("[data-game-configuration-output] pre, [data-game-configuration-output] code")).toHaveCount(0);
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Configuration Summary");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Game Name");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Game Type");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Version");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Resolution");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Platforms");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Visibility");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Startup Settings");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Player Mode");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Readiness Status");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Missing Items");
    await expect(page.locator("[data-game-configuration-output]")).toContainText("Next Step");
    await expect(page.locator("[data-game-configuration-output]")).not.toContainText("{");
    await expect(page.locator("[data-game-configuration-output]")).not.toContainText('"gameBasics"');

    await fillReadyConfiguration(page);
    await page.getByRole("button", { name: "Save Game Configuration" }).click();

    await expect(page.locator("[data-game-configuration-log]")).toHaveText("Saved Game Configuration as ready. Assets is the recommended next tool.");
    await expect(page.locator("[data-game-configuration-status]")).toHaveText("Ready");
    await expect(page.locator("[data-game-configuration-output-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-game-configuration-output-game-type]")).toHaveText("Puzzle");
    await expect(page.locator("[data-game-configuration-output-details]")).toHaveText("A friendly puzzle game prepared for sharing and discovery.");
    await expect(page.locator("[data-game-configuration-output-version]")).toHaveText("0.1.0");
    await expect(page.locator("[data-game-configuration-output-resolution]")).toHaveText("1280x720");
    await expect(page.locator("[data-game-configuration-output-platforms]")).toHaveText("Web");
    await expect(page.locator("[data-game-configuration-output-visibility]")).toHaveText("Private");
    await expect(page.locator("[data-game-configuration-output-startup]")).toHaveText("Open on the title screen and start in the first room.");
    await expect(page.locator("[data-game-configuration-output-player-mode]")).toHaveText("1 Player");
    await expect(page.locator("[data-game-configuration-output-readiness]")).toHaveText("Ready");
    await expect(page.locator("[data-game-configuration-output-next-step]")).toHaveText("Assets");
    await expect(page.locator("[data-game-configuration-output-missing]")).toHaveText("None");
    await expect(page.locator("[data-game-configuration-game-progress]")).toContainText("Game Configuration ready");
    await expect(page.locator("[data-game-configuration-current-focus]")).toHaveText("Prepare Assets");
    await expect(page.locator("[data-game-configuration-recommended-tool]").first()).toHaveText("Assets");
    await expect.poll(async () => {
      const rows = await readProductRows("game_configuration_records");
      return rows.find((row) => row.gameBasics === "A playable puzzle configuration with one clear starting room.") || null;
    }, { timeout: 10_000 }).toMatchObject({
      gameDetails: "A friendly puzzle game prepared for sharing and discovery.",
      gameBasics: "A playable puzzle configuration with one clear starting room.",
      gameRules: "Collect every key, avoid hazards, and reach the exit.",
      resolution: "1280x720",
      platforms: "Web",
      visibility: "Private",
      status: "Ready"
    });

    await page.getByLabel("Game Basics").fill("Updated playable puzzle setup ready for Assets.");
    await page.getByRole("button", { name: "Save Game Configuration" }).click();
    await expect(page.locator("[data-game-configuration-output-summary]")).toHaveText("Updated playable puzzle setup ready for Assets.");
    await expect(page.locator("[data-game-configuration-output]")).not.toContainText('"updatedAt"');
    await expect.poll(async () => {
      const rows = await readProductRows("game_configuration_records");
      return rows.find((row) => row.gameBasics === "Updated playable puzzle setup ready for Assets.") || null;
    }, { timeout: 10_000 }).toMatchObject({
      gameBasics: "Updated playable puzzle setup ready for Assets.",
      status: "Ready"
    });
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("[data-toolbox-selected-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-game-configuration-game-name]")).toHaveText("Demo Game");
    await expect(page.locator("[data-game-configuration-game-type]")).toHaveText("Puzzle");
    await expect(page.getByLabel("Game Details")).toHaveValue("A friendly puzzle game prepared for sharing and discovery.");
    await expect(page.getByLabel("Game Basics")).toHaveValue("Updated playable puzzle setup ready for Assets.");
    await expect(page.locator("[data-game-configuration-output-summary]")).toHaveText("Updated playable puzzle setup ready for Assets.");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Game Configuration validation lists missing required sections and blocks Build Game readiness", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-configuration/index.html");

  try {
    await page.getByLabel("Game Details").fill("");
    await page.getByLabel("Platforms").fill("");
    await page.getByLabel("Startup Settings").fill("");
    await page.getByLabel("Game Basics").fill("A playable setup summary without enough supporting detail.");
    await page.getByLabel("Game Rules").fill("");
    await page.getByLabel("Player Setup").fill("");
    await page.getByLabel("World Setup").fill("");
    await page.getByLabel("Object Setup").fill("");
    await page.getByLabel("Audio Setup").fill("");
    await page.getByLabel("Test Readiness").fill("");
    await page.getByRole("button", { name: "Save Game Configuration" }).click();

    await expect(page.locator("[data-game-configuration-log]")).toHaveText("Saved Game Configuration with 9 missing items.");
    await expect(page.locator("[data-game-configuration-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Game Details");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Platforms");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Startup Settings");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Game Rules");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Player Setup");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("World Setup");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Object Setup");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Audio Setup");
    await expect(page.locator("[data-game-configuration-validation-list]")).toContainText("Test Readiness");
    await expect(page.locator("[data-game-configuration-output-readiness]")).toHaveText("Needs Input");
    await expect(page.locator("[data-game-configuration-output-next-step]")).toHaveText("Game Configuration");
    await expect(page.locator("[data-game-configuration-publishing-progress]")).toHaveText("Build Game blocked until configuration is ready");

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Game Configuration guest save redirects to sign in", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-configuration/index.html", { sessionUserKey: null });

  try {
    await page.getByLabel("Game Basics").fill("Guest configuration attempt.");
    await page.getByRole("button", { name: "Save Game Configuration" }).click();
    await page.waitForURL(/\/account\/sign-in\.html$/);
  } finally {
    await workspaceV2CoverageReporter.stop(page).catch(() => {});
    await failures.server.close();
  }
});

test("Game Configuration API rejects guest saves", async () => {
  const server = await startRepoServer();
  await ensureGameConfigurationDatabaseSchema();

  try {
    const api = await createRepositoryApiClient(server, "game-configuration");
    const { payload, response } = await api.call("updateConfiguration", [
      "demo-game",
      {
        gameBasics: "Guest direct API attempt"
      }
    ]);

    expect(response.status).toBe(401);
    expect(payload.ok).toBe(false);
    expect(payload.error).toContain("Sign in required to save Game Configuration through the API.");
  } finally {
    await server.close();
  }
});

test("Toolbox Build Path view shows Game Configuration handoff state", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html");

  try {
    await expect(page.getByRole("button", { name: "Progress" })).toHaveCount(0);

    await page.getByRole("button", { name: "Build Path" }).click();
    await expect(page.locator("[data-build-path-table='workflow']")).toBeVisible();
    await expect(page.getByText("What should I do next? Game Configuration")).toBeVisible();

    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
