import { expect, test } from "@playwright/test";
import process from "node:process";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "toolbox-selected-game-status-bar",
    surface: "shared toolbox selected game status bar",
  });
});

test.afterEach(async ({ page }) => {
  await workspaceV2CoverageReporter.stop(page);
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

  if (options.noSelectedGame) {
    await page.route("**/api/toolbox/game-hub/repositories/*/methods/getActiveGame", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          data: { result: null },
          ok: true,
        }),
      });
    });
  }
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

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

function creatorSession() {
  return {
    displayName: "User 1",
    roleSlugs: ["creator"],
    userKey: MOCK_DB_KEYS.users.user1,
  };
}

async function statusBarSnapshot(page) {
  return page.locator("[data-toolbox-status-bar]").evaluate((bar) => {
    const footer = document.querySelector("footer.footer");
    const position = getComputedStyle(bar).position;
    const barBox = bar.getBoundingClientRect();
    const footerBox = footer?.getBoundingClientRect();
    return {
      bottomGap: Math.round(window.innerHeight - barBox.bottom),
      dataset: { ...bar.dataset },
      filter: document.body.dataset.toolboxSelectedGameFilter || "",
      footerFollowsBar: footer ? Boolean(bar.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING) : false,
      gameId: document.body.dataset.toolboxSelectedGameId || "",
      gameText: bar.querySelector("[data-toolbox-selected-game]")?.textContent.replace(/\s+/g, " ").trim() || "",
      messageText: bar.querySelector("[data-toolbox-status-center]")?.textContent.replace(/\s+/g, " ").trim() || "",
      position,
      topBeforeFooter: footerBox ? barBox.bottom <= footerBox.top + 1 : false,
    };
  });
}

test("shared toolbox status bar shows selected Game Hub game above the footer", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html");

  try {
    const statusBar = page.locator("[data-toolbox-status-bar]");
    await expect(statusBar).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(statusBar).not.toContainText("Environment");
    await expect(statusBar.locator("[data-toolbox-selected-game-name-label]")).toHaveText("Selected Game Name");
    await expect(statusBar.locator("[data-toolbox-selected-game-name]")).toHaveText("Demo Game");
    await expect(statusBar.locator("[data-toolbox-selected-game-purpose-label]")).toHaveText("Selected Game Purpose");
    await expect(statusBar.locator("[data-toolbox-selected-game-purpose]")).toHaveText("Game");
    await expect(statusBar.locator("[data-toolbox-selected-game]")).not.toContainText("Under Construction");
    await expect(statusBar.locator("[data-toolbox-status-context-type]")).toHaveText("Tool Action");
    await expect(statusBar.locator("[data-toolbox-status-message]")).toContainText("Game Design mock repository ready.");
    await expect(page.locator("body")).toHaveAttribute("data-toolbox-selected-game-id", "demo-game");
    await expect(page.locator("body")).toHaveAttribute("data-toolbox-selected-game-filter", "active");

    const snapshot = await statusBarSnapshot(page);
    expect(snapshot.footerFollowsBar).toBe(true);
    expect(snapshot.topBeforeFooter).toBe(true);
    expect(snapshot.position).not.toBe("fixed");
    expect(snapshot.dataset.selectedGameState).toBe("active");
    expect(snapshot.dataset.selectedGameRequired).toBe("true");

    expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("shared toolbox status bar center reports save state after Game Hub saves", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html", { session: creatorSession() });

  try {
    await page.getByRole("button", { name: "Add Game" }).click();
    const addGameRow = page.locator("[data-game-add-row='input']");
    await addGameRow.getByLabel("Game").fill("Status Bar Save");
    await addGameRow.getByLabel("Purpose").selectOption("Learning Game");
    await addGameRow.getByLabel("Status").selectOption("Ready for Testing");
    await addGameRow.getByRole("button", { name: "Save" }).click();

    await expect(page.locator("[data-toolbox-status-context-type]")).toHaveText("Save State");
    await expect(page.locator("[data-toolbox-status-message]")).toHaveText("Created and opened Status Bar Save.");
    await expect(page.locator("[data-toolbox-selected-game-name]")).toHaveText("Status Bar Save");
    await expect(page.locator("[data-toolbox-selected-game-purpose]")).toHaveText("Learning Game");
    await expect(page.locator("[data-toolbox-status-bar]")).not.toContainText("Environment");

    expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("shared toolbox status bar anchors to the bottom in tool display mode", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html");

  try {
    await expect(page.locator("[data-toolbox-status-bar]")).toBeVisible();
    await page.locator("#toolDisplayMode summary").click();
    await expect(page.locator("body")).toHaveClass(/tool-focus-mode/);

    const snapshot = await statusBarSnapshot(page);
    expect(snapshot.position).toBe("fixed");
    expect(Math.abs(snapshot.bottomGap)).toBeLessThanOrEqual(2);
    expect(snapshot.gameText).toContain("Demo Game");

    expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Game Hub owner selection updates the global toolbox status bar", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html");

  try {
    await expect(page.locator("[data-toolbox-selected-game-name]")).toHaveText("Demo Game");
    await page.locator("[data-game-toggle='gravity-demo']").click();
    await expect(page.locator("[data-toolbox-selected-game-name]")).toHaveText("Gravity Demo");
    await expect(page.locator("[data-toolbox-selected-game-purpose]")).toHaveText("Capability Demo");
    await expect(page.locator("[data-toolbox-selected-game]")).not.toContainText("Wireframe");
    await expect(page.locator("body")).toHaveAttribute("data-toolbox-selected-game-id", "gravity-demo");
    await expect(page.locator("body")).toHaveAttribute("data-toolbox-selected-game-filter", "active");
    await expect(page.locator("[data-toolbox-status-context-type]")).toHaveText("Warning");
    await expect(page.locator("[data-toolbox-status-message]")).toContainText("Sign in to create or update Game Hub projects.");

    expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("non-Idea Board toolbox pages show a creator-safe prompt when no Game Hub game is selected", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html", { noSelectedGame: true });

  try {
    const statusBar = page.locator("[data-toolbox-status-bar]");
    await expect(statusBar.locator("[data-toolbox-selected-game-name]")).toHaveText("No game selected");
    await expect(statusBar.locator("[data-toolbox-selected-game-purpose]")).toHaveText("Game Hub owns game selection");
    await expect(statusBar.locator("[data-toolbox-status-context-type]")).toHaveText("Tool Action");
    await expect(statusBar.locator("[data-toolbox-status-message]")).toHaveText("Select or create a game in Game Hub before using this toolbox page.");
    await expect(statusBar.locator("[data-toolbox-status-action]")).toHaveText("Select or Create in Game Hub");
    await expect(statusBar.locator("[data-toolbox-status-action]")).toHaveAttribute("href", /toolbox\/game-hub\/index\.html$/);
    await expect(page.locator("body")).toHaveAttribute("data-toolbox-selected-game-filter", "missing");
    await expect(page.locator("body")).not.toHaveAttribute("data-toolbox-selected-game-id", /.+/);

    const snapshot = await statusBarSnapshot(page);
    expect(snapshot.dataset.selectedGameRequired).toBe("true");
    expect(snapshot.dataset.selectedGameState).toBe("missing");

    expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("Idea Board is excluded from selected-game filtering and does not show the missing-game prompt", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/idea-board/index.html", { noSelectedGame: true });

  try {
    const statusBar = page.locator("[data-toolbox-status-bar]");
    await expect(statusBar).toBeVisible();
    await expect(statusBar.locator("[data-toolbox-selected-game-name]")).toHaveText("No game selected");
    await expect(statusBar.locator("[data-toolbox-selected-game-purpose]")).toHaveText("Idea Board optional");
    await expect(statusBar.locator("[data-toolbox-status-context-type]")).toHaveText("Tool Action");
    await expect(statusBar.locator("[data-toolbox-status-message]")).toContainText("Ready to shape ideas and notes.");
    await expect(statusBar.locator("[data-toolbox-status-message]")).not.toContainText("Select or create a game");
    await expect(page.locator("body")).toHaveAttribute("data-toolbox-selected-game-filter", "optional");
    await expect(page.locator("body")).not.toHaveClass(/toolbox-selected-game-missing/);

    const snapshot = await statusBarSnapshot(page);
    expect(snapshot.dataset.selectedGameRequired).toBe("false");
    expect(snapshot.dataset.selectedGameState).toBe("missing");

    expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});
