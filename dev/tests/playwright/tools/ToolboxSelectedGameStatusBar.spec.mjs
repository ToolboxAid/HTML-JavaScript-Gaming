import { expect, test } from "@playwright/test";
import process from "node:process";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
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
  await page.route("**/api/game-journey/completion-metrics", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: options.completionMetrics || completionMetricsFixture(),
        ok: true,
      }),
    });
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

function completionMetric(bucketKey, bucketName, completedCount, plannedCount) {
  return {
    active: true,
    bucketKey,
    bucketName,
    completedCount,
    percentComplete: plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0,
    plannedCount,
  };
}

function completionMetricsFixture() {
  return {
    api: "Local API",
    completedCount: 12,
    databaseEngine: "Postgres",
    percentComplete: 10,
    plannedCount: 125,
    records: [
      completionMetric("001-idea", "Idea", 1, 4),
      completionMetric("002-create", "Create", 3, 5),
      completionMetric("003-design", "Design", 2, 5),
      completionMetric("004-graphics", "Graphics", 5, 10),
      completionMetric("005-audio", "Audio", 0, 4),
      completionMetric("006-objects", "Objects", 12, 25),
      completionMetric("007-worlds", "Worlds", 0, 5),
      completionMetric("008-interface", "Interface", 1, 5),
      completionMetric("009-controls", "Controls", 1, 4),
      completionMetric("010-rules", "Rules", 4, 5),
      completionMetric("011-progression", "Progression", 0, 4),
      completionMetric("012-play-test", "Play Test", 0, 5),
      completionMetric("013-publish", "Publish", 0, 5),
      completionMetric("014-share", "Share", 0, 5),
    ],
    serviceContract: "Web UI -> Local API/Service Contract -> Postgres",
  };
}

const REMOVED_STATUS_BAR_LABELS = [
  "Selected Game Name",
  "Selected Game Purpose",
  "Save State",
  "Tool Action",
  "Warning",
  "Error",
];

async function expectRemovedStatusBarLabelsHidden(statusBar) {
  for (const label of REMOVED_STATUS_BAR_LABELS) {
    await expect(statusBar).not.toContainText(label);
  }
}

async function statusBarSnapshot(page) {
  return page.locator("[data-toolbox-status-bar]").evaluate((bar) => {
    const boxSnapshot = (element) => {
      const box = element?.getBoundingClientRect();
      if (!box) {
        return null;
      }
      return {
        bottom: box.bottom,
        height: box.height,
        left: box.left,
        right: box.right,
        top: box.top,
      };
    };
    const footer = document.querySelector("footer.footer");
    const footerStyle = footer ? getComputedStyle(footer) : null;
    const centerPanel = document.querySelector(".tool-center-panel");
    const gameName = bar.querySelector("[data-toolbox-selected-game-name]");
    const message = bar.querySelector("[data-toolbox-status-message]");
    const messageIcon = message?.querySelector("[data-theme-icon]");
    const progress = bar.querySelector("[data-toolbox-status-progress]");
    const position = getComputedStyle(bar).position;
    const barBox = bar.getBoundingClientRect();
    const footerBox = footer?.getBoundingClientRect();
    return {
      bottomGap: Math.round(window.innerHeight - barBox.bottom),
      barBox: boxSnapshot(bar),
      centerPanelBox: boxSnapshot(centerPanel),
      dataset: { ...bar.dataset },
      filter: document.body.dataset.toolboxSelectedGameFilter || "",
      footerFollowsBar: footer ? Boolean(bar.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING) : false,
      footerPaddingTop: footerStyle ? parseFloat(footerStyle.paddingTop) || 0 : null,
      gameId: document.body.dataset.toolboxSelectedGameId || "",
      gameBox: boxSnapshot(gameName),
      gameText: gameName?.textContent.replace(/\s+/g, " ").trim() || "",
      messageBox: boxSnapshot(message),
      messageIconFile: messageIcon?.dataset.themeIconFile || "",
      messageIconName: messageIcon?.dataset.themeIcon || "",
      messageText: message?.textContent.replace(/\s+/g, " ").trim() || "",
      position,
      progressBox: boxSnapshot(progress),
      progressState: bar.dataset.toolboxProgressState || "",
      progressText: progress?.textContent.replace(/\s+/g, " ").trim() || "",
      topBeforeFooter: footerBox ? barBox.bottom <= footerBox.top + 1 : false,
    };
  });
}

test("shared toolbox status bar shows selected Game Hub game above the footer", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html");

  try {
    const statusBar = page.locator("[data-toolbox-status-bar]");
    await expect(statusBar).toBeVisible();
    const displayMode = page.locator("#toolDisplayMode");
    await expect(displayMode.locator("summary [data-theme-icon='fullscreen']")).toHaveAttribute("data-theme-icon-file", "gfs-fullscreen.svg");
    await expect(displayMode.locator("[data-tool-nav-previous]")).toHaveCount(0);
    await expect(displayMode.locator("[data-tool-nav-next]")).toHaveCount(0);
    await expect(page.locator(".horizontal-accordion-toggle").first().locator("[data-theme-icon]")).toHaveAttribute("data-theme-icon-file", /gfs-chevron-(left|right)\.svg/);
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(statusBar).not.toContainText("Environment");
    await expectRemovedStatusBarLabelsHidden(statusBar);
    await expect(statusBar.locator("[data-toolbox-selected-game-name]")).toHaveText("Demo Game");
    await expect(statusBar.locator("[data-toolbox-selected-game-purpose]")).toHaveCount(0);
    await expect(statusBar.locator("[data-toolbox-status-context-type]")).toHaveCount(0);
    await expect(statusBar.locator("[data-toolbox-status-action]")).toHaveCount(0);
    await expect(statusBar.locator("[data-toolbox-selected-game]")).not.toContainText("Under Construction");
    await expect(statusBar.locator("[data-toolbox-status-message]")).toContainText("Game Design API ready.");
    await expect(statusBar.locator("[data-toolbox-status-progress]")).toHaveText("Game Design 2/5 (40%) | Journey 12/125 (10%)");
    await expect(page.locator("body")).toHaveAttribute("data-toolbox-selected-game-id", "demo-game");
    await expect(page.locator("body")).toHaveAttribute("data-toolbox-selected-game-filter", "active");

    const snapshot = await statusBarSnapshot(page);
    expect(snapshot.footerFollowsBar).toBe(true);
    expect(snapshot.topBeforeFooter).toBe(true);
    expect(snapshot.footerPaddingTop).toBe(0);
    expect(snapshot.position).not.toBe("fixed");
    expect(snapshot.dataset.selectedGameState).toBe("active");
    expect(snapshot.dataset.selectedGameRequired).toBe("true");
    expect(snapshot.dataset.toolboxStatusContextKind).toBe("info");
    expect(snapshot.gameText).toBe("Demo Game");
    expect(snapshot.messageIconFile).toBe("gfs-info.svg");
    expect(snapshot.messageIconName).toBe("info");
    expect(snapshot.messageText).toContain("Game Design API ready.");
    expect(snapshot.progressState).toBe("active");
    expect(snapshot.progressText).toBe("Game Design 2/5 (40%) | Journey 12/125 (10%)");
    expect(Math.max(snapshot.gameBox.top, snapshot.messageBox.top)).toBeLessThanOrEqual(
      Math.min(snapshot.gameBox.bottom, snapshot.messageBox.bottom),
    );
    expect(Math.max(snapshot.gameBox.top, snapshot.messageBox.top, snapshot.progressBox.top)).toBeLessThanOrEqual(
      Math.min(snapshot.gameBox.bottom, snapshot.messageBox.bottom, snapshot.progressBox.bottom),
    );
    expect(snapshot.progressBox.right).toBeGreaterThan(snapshot.messageBox.right);

    expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("shared toolbox status bar shows right-anchored current tool and journey progress", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/objects/index.html");

  try {
    const statusBar = page.locator("[data-toolbox-status-bar]");
    await expect(statusBar).toBeVisible();
    await expect(statusBar.locator("[data-toolbox-selected-game-name]")).toHaveText("Demo Game");
    await expect(statusBar.locator("[data-toolbox-status-progress]")).toHaveText("Objects 12/25 (48%) | Journey 12/125 (10%)");

    const snapshot = await statusBarSnapshot(page);
    expect(snapshot.progressState).toBe("active");
    expect(snapshot.progressText).toBe("Objects 12/25 (48%) | Journey 12/125 (10%)");
    expect(snapshot.progressBox.right).toBeGreaterThan(snapshot.messageBox.right);

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

    const statusBar = page.locator("[data-toolbox-status-bar]");
    await expectRemovedStatusBarLabelsHidden(statusBar);
    await expect(statusBar.locator("[data-toolbox-status-context-type]")).toHaveCount(0);
    await expect(statusBar.locator("[data-toolbox-status-message]")).toHaveText("Created and opened Status Bar Save.");
    await expect(statusBar.locator("[data-toolbox-status-message] [data-theme-icon='save']")).toHaveAttribute("data-theme-icon-file", "gfs-success.svg");
    await expect(statusBar.locator("[data-toolbox-selected-game-name]")).toHaveText("Status Bar Save");
    await expect(statusBar.locator("[data-toolbox-status-progress]")).toHaveText("Game Hub 3/5 (60%) | Journey 12/125 (10%)");
    await expect(statusBar.locator("[data-toolbox-selected-game-purpose]")).toHaveCount(0);
    await expect(statusBar).not.toContainText("Learning Game");
    await expect(statusBar).not.toContainText("Environment");

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
    await expect(page.locator("#toolDisplayMode summary [data-theme-icon='exit-fullscreen']")).toHaveAttribute("data-theme-icon-file", "gfs-exit-fullscreen.svg");

    const snapshot = await statusBarSnapshot(page);
    expect(snapshot.position).toBe("fixed");
    expect(Math.abs(snapshot.bottomGap)).toBeLessThanOrEqual(2);
    expect(snapshot.gameText).toBe("Demo Game");
    expect(snapshot.messageText).toContain("Game Design API ready.");
    expect(snapshot.progressText).toBe("Game Design 2/5 (40%) | Journey 12/125 (10%)");
    expect(snapshot.centerPanelBox.bottom).toBeLessThanOrEqual(snapshot.barBox.top + 1);

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
    const statusBar = page.locator("[data-toolbox-status-bar]");
    await expectRemovedStatusBarLabelsHidden(statusBar);
    await expect(statusBar.locator("[data-toolbox-selected-game-purpose]")).toHaveCount(0);
    await expect(statusBar.locator("[data-toolbox-selected-game]")).not.toContainText("Capability Demo");
    await expect(statusBar.locator("[data-toolbox-selected-game]")).not.toContainText("Wireframe");
    await expect(page.locator("body")).toHaveAttribute("data-toolbox-selected-game-id", "gravity-demo");
    await expect(page.locator("body")).toHaveAttribute("data-toolbox-selected-game-filter", "active");
    await expect(statusBar.locator("[data-toolbox-status-context-type]")).toHaveCount(0);
    await expect(statusBar.locator("[data-toolbox-status-message]")).toContainText("Sign in to create or update Game Hub projects.");
    await expect(statusBar.locator("[data-toolbox-status-message] [data-theme-icon='warning']")).toHaveAttribute("data-theme-icon-file", "gfs-warning.svg");
    await expect(statusBar.locator("[data-toolbox-status-progress]")).toHaveText("Game Hub 3/5 (60%) | Journey 12/125 (10%)");

    expectNoPageFailures(failures);
  } finally {
    await failures.server.close();
  }
});

test("non-Idea Board toolbox pages show a creator-safe prompt when no Game Hub game is selected", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html", { noSelectedGame: true });

  try {
    const statusBar = page.locator("[data-toolbox-status-bar]");
    await expectRemovedStatusBarLabelsHidden(statusBar);
    await expect(statusBar.locator("[data-toolbox-selected-game-name]")).toHaveText("No game selected");
    await expect(statusBar.locator("[data-toolbox-selected-game-purpose]")).toHaveCount(0);
    await expect(statusBar.locator("[data-toolbox-status-context-type]")).toHaveCount(0);
    await expect(statusBar.locator("[data-toolbox-status-message]")).toHaveText("Select or create a game in Game Hub before using this toolbox page.");
    await expect(statusBar.locator("[data-toolbox-status-message] [data-theme-icon='add']")).toHaveAttribute("data-theme-icon-file", "gfs-add.svg");
    await expect(statusBar.locator("[data-toolbox-status-progress]")).toHaveText("Game Design 2/5 (40%) | Journey 12/125 (10%)");
    await expect(statusBar.locator("[data-toolbox-status-action]")).toHaveCount(0);
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
    await expectRemovedStatusBarLabelsHidden(statusBar);
    await expect(statusBar.locator("[data-toolbox-selected-game-name]")).toHaveText("No game selected");
    await expect(statusBar.locator("[data-toolbox-selected-game-purpose]")).toHaveCount(0);
    await expect(statusBar.locator("[data-toolbox-status-context-type]")).toHaveCount(0);
    await expect(statusBar.locator("[data-toolbox-status-message]")).toContainText("Ready to shape ideas and notes.");
    await expect(statusBar.locator("[data-toolbox-status-message]")).not.toContainText("Select or create a game");
    await expect(statusBar.locator("[data-toolbox-status-progress]")).toHaveText("Idea Board 1/4 (25%) | Journey 12/125 (10%)");
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
