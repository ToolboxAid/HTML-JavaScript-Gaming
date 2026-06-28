import { expect, test } from "@playwright/test";
import {
  getToolById,
  getToolImageSource,
} from "../../../../www/toolbox/toolRegistry.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "tool-display-mode",
    surface: "Tool Display Mode single-line summary layout",
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

async function openRepoPage(page, pathName) {
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

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

async function expectNoDeprecatedToolDisplayMarkup(page) {
  await expect(page.locator(".tool-display-mode__body")).toHaveCount(0);
  await expect(page.locator(".tool-display-mode__identity-row")).toHaveCount(0);
  await expect(page.locator(".tool-display-mode__description")).toHaveCount(0);
  await expect(page.locator(".tool-display-mode__navigation-row")).toHaveCount(0);
  await expect(page.locator(".tool-display-mode__chevron")).toHaveCount(0);
  await expect(page.locator("[data-tool-display-mode-row]")).toHaveCount(0);
  await expect(page.locator("[data-tool-nav-previous]")).toHaveCount(0);
  await expect(page.locator("[data-tool-nav-next]")).toHaveCount(0);
}

async function expectSingleLineSummary(page, toolId) {
  const tool = getToolById(toolId);
  const displayMode = page.locator("#toolDisplayMode");
  const summary = displayMode.locator("summary");

  await expect(displayMode).toBeVisible();
  await expect(summary).toBeVisible();
  await expect(summary.locator(":scope > .tool-display-mode__badge")).toHaveAttribute(
    "src",
    getToolImageSource(tool, "badge"),
  );
  await expect(summary.locator(":scope > .tool-display-mode__badge")).toHaveAttribute(
    "alt",
    `${tool.displayName} badge`,
  );
  await expect(summary.locator(":scope > .tool-display-mode__tool-name")).toHaveText(tool.displayName);
  await expect(summary.locator(":scope > .tool-display-mode__character")).toHaveAttribute(
    "src",
    getToolImageSource(tool, "tool"),
  );
  await expect(summary.locator(":scope > .tool-display-mode__character")).toHaveAttribute(
    "alt",
    `${tool.displayName} character`,
  );
  await expect(summary.locator(":scope > .tool-display-mode__mode-icon")).toHaveAttribute(
    "data-theme-icon-file",
    "gfs-fullscreen.svg",
  );

  const layout = await summary.evaluate((summaryElement) => {
    const directChildren = Array.from(summaryElement.children);
    const badge = summaryElement.querySelector(".tool-display-mode__badge");
    const toolName = summaryElement.querySelector(".tool-display-mode__tool-name");
    const character = summaryElement.querySelector(".tool-display-mode__character");
    const modeIcon = summaryElement.querySelector(".tool-display-mode__mode-icon");
    const badgeBox = badge.getBoundingClientRect();
    const characterBox = character.getBoundingClientRect();
    const modeIconBox = modeIcon.getBoundingClientRect();
    return {
      badgeHeight: Math.round(badgeBox.height),
      badgeWidth: Math.round(badgeBox.width),
      characterHeight: Math.round(characterBox.height),
      characterWidth: Math.round(characterBox.width),
      directChildRoles: directChildren.map((child) => {
        if (child === badge) return "badge";
        if (child === toolName) return "toolName";
        if (child === character) return "character";
        if (child === modeIcon) return "modeIcon";
        return child.className || child.tagName.toLowerCase();
      }),
      display: getComputedStyle(summaryElement).display,
      iconColor: getComputedStyle(modeIcon).color,
      iconHeight: Math.round(modeIconBox.height),
      iconMarginLeft: getComputedStyle(modeIcon).marginLeft,
      iconWidth: Math.round(modeIconBox.width),
      modeIconIsFinalChild: directChildren.at(-1) === modeIcon,
      rootGold: getComputedStyle(document.documentElement).getPropertyValue("--gold").trim(),
      toolNameOverflow: getComputedStyle(toolName).overflow,
      toolNameTextAlign: getComputedStyle(toolName).textAlign,
      toolNameWhiteSpace: getComputedStyle(toolName).whiteSpace,
    };
  });

  expect(layout).toMatchObject({
    badgeHeight: 64,
    badgeWidth: 64,
    characterHeight: 127,
    characterWidth: 225,
    directChildRoles: ["badge", "toolName", "character", "modeIcon"],
    display: "flex",
    iconHeight: 42,
    iconWidth: 42,
    modeIconIsFinalChild: true,
    toolNameOverflow: "hidden",
    toolNameTextAlign: "center",
    toolNameWhiteSpace: "nowrap",
  });
  expect(layout.iconMarginLeft === "auto" || Number.parseFloat(layout.iconMarginLeft) >= 0).toBe(true);
  expect(layout.iconColor).not.toBe("");
  expect(layout.rootGold).not.toBe("");
  await expectNoDeprecatedToolDisplayMarkup(page);
}

test("Game Design renders badge, tool name, character image, and fullscreen icon as direct summary children", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html");

  try {
    await expectSingleLineSummary(page, "game-design");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("representative tools use registry-owned names and images in the single-line summary", async ({ page }) => {
  const toolCases = [
    { path: "/toolbox/game-hub/index.html", toolId: "game-hub" },
    { path: "/toolbox/game-configuration/index.html", toolId: "game-configuration" },
    { path: "/toolbox/build-game/index.html", toolId: "build-game" },
  ];
  const failures = await openRepoPage(page, toolCases[0].path);

  try {
    for (const toolCase of toolCases) {
      await page.goto(`${failures.server.baseUrl}${toolCase.path}`, { waitUntil: "networkidle" });
      await expectSingleLineSummary(page, toolCase.toolId);
    }
    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("fullscreen mode swaps to the exit icon without restoring old body or navigation markup", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html");

  try {
    const centerHeading = page.locator(".tool-center-panel > h2").first();
    await expect(centerHeading).toBeVisible();
    await page.locator("#toolDisplayMode summary").click();
    await expect(page.locator("body")).toHaveClass(/tool-focus-mode/);
    await expect(page.locator("#toolDisplayMode summary .tool-display-mode__mode-icon")).toHaveAttribute(
      "data-theme-icon-file",
      "gfs-exit-fullscreen.svg",
    );
    await expect(page.locator("#toolDisplayMode summary > .tool-display-mode__character")).toBeHidden();
    await expectNoDeprecatedToolDisplayMarkup(page);

    const fullscreenLayout = await page.locator("#toolDisplayMode summary").evaluate((summaryElement) => {
      const badge = summaryElement.querySelector(".tool-display-mode__badge");
      const toolName = summaryElement.querySelector(".tool-display-mode__tool-name");
      const modeIcon = summaryElement.querySelector(".tool-display-mode__mode-icon");
      const badgeBox = badge.getBoundingClientRect();
      const modeIconBox = modeIcon.getBoundingClientRect();
      return {
        badgeHeight: Math.round(badgeBox.height),
        badgeWidth: Math.round(badgeBox.width),
        modeIconIsFinalChild: Array.from(summaryElement.children).at(-1) === modeIcon,
        modeIconWidth: Math.round(modeIconBox.width),
        toolNameText: toolName.textContent.trim(),
      };
    });

    expect(fullscreenLayout).toEqual({
      badgeHeight: 64,
      badgeWidth: 64,
      modeIconIsFinalChild: true,
      modeIconWidth: 42,
      toolNameText: "Game Design",
    });

    await page.locator("#toolDisplayMode summary").click();
    await expect(page.locator("body")).not.toHaveClass(/tool-focus-mode/);
    await expect(centerHeading).toBeVisible();
    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
