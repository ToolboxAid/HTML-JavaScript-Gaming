import { expect, test } from "@playwright/test";
import {
  getActiveToolRegistry,
  getToolNavigationTargets,
  getToolRoute,
} from "../../../toolbox/toolRegistry.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "tool-display-mode",
    surface: "Tool Display Mode navigation layout and registry links"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openRepoPage(page, pathName) {
  const server = await startRepoServer();
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

async function expectNavigationTarget(locator, prefix, target) {
  await expect(locator).toHaveText(`${prefix}: ${target.label}`);
  if (target.disabled) {
    await expect(locator).not.toHaveAttribute("href");
    return;
  }
  await expect(locator).toHaveAttribute("href", target.href);
  if (target.kind === "group") {
    await expect(locator).toHaveAttribute("data-tool-nav-group", target.group);
  }
}

async function expectPlainNavigationLinks(page) {
  await expect(page.locator("[data-tool-display-mode-row='navigation'] button")).toHaveCount(0);
  const navigationLinks = await page.locator("[data-tool-display-mode-row='navigation'] a").evaluateAll((links) => (
    links.map((link) => ({
      className: link.className,
      tagName: link.tagName.toLowerCase()
    }))
  ));
  navigationLinks.forEach((link) => {
    expect(link.tagName).toBe("a");
    expect(link.className.split(/\s+/).filter(Boolean)).not.toContain("btn");
    expect(link.className.split(/\s+/).filter(Boolean)).not.toContain("btn-secondary");
  });
}

async function toolDisplayRows(page) {
  return page.locator("[data-tool-display-mode-row]").evaluateAll((rows) => (
    rows.map((row) => ({
      childClasses: Array.from(row.children).map((child) => child.className),
      childTags: Array.from(row.children).map((child) => child.tagName.toLowerCase()),
      row: row.dataset.toolDisplayModeRow,
      text: row.textContent.trim()
    }))
  ));
}

async function expectToolDisplayModeVisualLayout(page) {
  const layout = await page.locator("#toolDisplayMode").evaluate((displayMode) => {
    const badge = displayMode.querySelector(".tool-display-mode__badge");
    const character = displayMode.querySelector(".tool-display-mode__character");
    const description = displayMode.querySelector(".tool-display-mode__description");
    const navigation = displayMode.querySelector(".tool-display-mode__navigation-row");
    const badgeBox = badge.getBoundingClientRect();
    const characterBox = character.getBoundingClientRect();
    const descriptionBox = description.getBoundingClientRect();
    const navigationBox = navigation.getBoundingClientRect();

    return {
      badgeBorderRadius: getComputedStyle(badge).borderRadius,
      badgeBorderWidth: getComputedStyle(badge).borderTopWidth,
      badgeHeight: Math.round(badgeBox.height),
      badgeObjectFit: getComputedStyle(badge).objectFit,
      badgeWidth: Math.round(badgeBox.width),
      characterHeight: Math.round(characterBox.height),
      characterWidth: Math.round(characterBox.width),
      descriptionRightOfCharacter: descriptionBox.left >= characterBox.right,
      navigationAlignedWithDescription: Math.abs(navigationBox.left - descriptionBox.left) <= 2,
      navigationBelowDescription: navigationBox.top >= descriptionBox.bottom,
      navigationRightOfCharacter: navigationBox.left >= characterBox.right
    };
  });

  expect(layout).toEqual({
    badgeBorderRadius: "0px",
    badgeBorderWidth: "0px",
    badgeHeight: 64,
    badgeObjectFit: "contain",
    badgeWidth: 64,
    characterHeight: 127,
    characterWidth: 225,
    descriptionRightOfCharacter: true,
    navigationAlignedWithDescription: true,
    navigationBelowDescription: true,
    navigationRightOfCharacter: true
  });
}

async function expectToolDisplayModeFullscreenBadge(page) {
  const centerHeading = page.locator(".tool-center-panel > h2").first();
  const centerDescription = page.locator(".tool-center-panel > h2 + p").first();
  await expect(centerHeading).toBeVisible();
  if (await centerDescription.count()) {
    await expect(centerDescription).toBeVisible();
  }

  await page.locator("#toolDisplayMode summary").click();
  await expect(page.locator("body")).toHaveClass(/tool-focus-mode/);
  await expect(centerHeading).toBeHidden();
  if (await centerDescription.count()) {
    await expect(centerDescription).toBeHidden();
  }
  const fullscreenLayout = await page.locator(".tool-workspace").evaluate((workspace) => {
    const left = workspace.querySelector(".tool-column:first-of-type");
    const center = workspace.querySelector(".tool-center-panel");
    const right = workspace.querySelector(".tool-column:last-of-type");
    const boxes = [left, center, right].map((node) => {
      const box = node.getBoundingClientRect();
      return {
        bottom: Math.round(box.bottom),
        top: Math.round(box.top)
      };
    });
    return {
      bodyOverflowY: getComputedStyle(document.body).overflowY,
      centerOverflowY: center ? getComputedStyle(center).overflowY : "",
      columns: boxes,
      documentOverflow: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight,
      leftOverflowY: left ? getComputedStyle(left).overflowY : "",
      rightOverflowY: right ? getComputedStyle(right).overflowY : "",
      viewportHeight: Math.round(window.innerHeight)
    };
  });
  expect(fullscreenLayout.bodyOverflowY).toBe("hidden");
  expect(fullscreenLayout.leftOverflowY).toBe("auto");
  expect(fullscreenLayout.centerOverflowY).toBe("auto");
  expect(fullscreenLayout.rightOverflowY).toBe("auto");
  expect(fullscreenLayout.documentOverflow).toBeLessThanOrEqual(2);
  fullscreenLayout.columns.forEach((box) => {
    expect(box.top).toBeGreaterThanOrEqual(0);
    expect(box.bottom).toBeLessThanOrEqual(fullscreenLayout.viewportHeight + 1);
  });
  const badgeSize = await page.locator(".tool-display-mode__badge").evaluate((badge) => {
    const box = badge.getBoundingClientRect();
    return {
      height: Math.round(box.height),
      width: Math.round(box.width)
    };
  });
  expect(badgeSize).toEqual({ height: 32, width: 32 });

  await page.locator("#toolDisplayMode summary").click();
  await expect(page.locator("body")).not.toHaveClass(/tool-focus-mode/);
  await expect(centerHeading).toBeVisible();
  if (await centerDescription.count()) {
    await expect(centerDescription).toBeVisible();
  }
}

test("Game Design renders identity and navigation rows with registry anchor links", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html");
  const navigation = getToolNavigationTargets("game-design");

  try {
    const rows = await toolDisplayRows(page);
    expect(rows.map((row) => row.row)).toEqual(["identity", "navigation"]);
    expect(rows[0].childTags).toEqual(["img", "span"]);
    expect(rows[0].childClasses).toContain("tool-display-mode__character");
    expect(rows[0].childClasses).toContain("tool-display-mode__description");
    expect(rows[0].text).toBe("Game Design");
    expect(rows[1].childTags).toEqual(["a", "a"]);

    const previous = page.locator("[data-tool-nav-previous]");
    const next = page.locator("[data-tool-nav-next]");
    await expectNavigationTarget(previous, "Previous", navigation.previous);
    await expectNavigationTarget(next, "Next", navigation.next);
    await expectPlainNavigationLinks(page);
    await expectToolDisplayModeVisualLayout(page);
    await expectToolDisplayModeFullscreenBadge(page);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Game Workspace and Game Configuration use registry order without page hardcoding", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-workspace/index.html");
  const gameWorkspaceNavigation = getToolNavigationTargets("game-workspace");
  const gameConfigurationNavigation = getToolNavigationTargets("game-configuration");

  try {
    await expect(page.locator("[data-tool-display-mode-row='identity']")).toContainText("Game Workspace");
    await expectNavigationTarget(page.locator("[data-tool-nav-previous]"), "Previous", gameWorkspaceNavigation.previous);
    await expectNavigationTarget(page.locator("[data-tool-nav-next]"), "Next", gameWorkspaceNavigation.next);

    await page.goto(`${failures.server.baseUrl}/toolbox/game-configuration/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tool-display-mode-row='identity']")).toContainText("Game Configuration");
    await expectNavigationTarget(page.locator("[data-tool-nav-previous]"), "Previous", gameConfigurationNavigation.previous);
    await expectNavigationTarget(page.locator("[data-tool-nav-next]"), "Next", gameConfigurationNavigation.next);
    await expectPlainNavigationLinks(page);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("first registry tool renders disabled previous text instead of a broken link", async ({ page }) => {
  const firstTool = getActiveToolRegistry()[0];
  const navigation = getToolNavigationTargets(firstTool.id);
  const failures = await openRepoPage(page, `/${getToolRoute(firstTool)}`);

  try {
    const previous = page.locator("[data-tool-nav-previous]");
    await expectNavigationTarget(previous, "Previous", navigation.previous);
    await expect(previous).not.toHaveJSProperty("tagName", "A");
    await expect(page.locator("[data-tool-display-mode-row='navigation'] a")).toHaveCount(navigation.next.disabled ? 0 : 1);
    await expectNavigationTarget(page.locator("[data-tool-nav-next]"), "Next", navigation.next);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Build Game renders plain previous and next links in the second row", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/build-game/index.html");
  const navigation = getToolNavigationTargets("build-game");

  try {
    const rows = await toolDisplayRows(page);
    expect(rows.map((row) => row.row)).toEqual(["identity", "navigation"]);
    expect(rows[0].childTags).toEqual(["img", "span"]);
    expect(rows[0].text).toBe("Build Game");
    expect(rows[1].childTags).toEqual(["a", "a"]);

    const previous = page.locator("[data-tool-nav-previous]");
    const next = page.locator("[data-tool-nav-next]");
    await expectNavigationTarget(previous, "Previous", navigation.previous);
    await expectNavigationTarget(next, "Next", navigation.next);
    await expectPlainNavigationLinks(page);
    await expectToolDisplayModeVisualLayout(page);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("multi-path fallback opens Toolbox Group view with only the target group expanded", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-configuration/index.html");
  const navigation = getToolNavigationTargets("game-configuration");

  try {
    const next = page.locator("[data-tool-nav-next]");
    expect(navigation.next.kind).toBe("group");
    await expectNavigationTarget(next, "Next", navigation.next);
    await next.click();
    await page.waitForURL(new RegExp(`${navigation.next.href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "Group" })).toHaveAttribute("aria-pressed", "true");

    const openGroups = await page.locator("[data-tools-accordion]").evaluateAll((groups) => (
      groups.filter((group) => group.open).map((group) => group.dataset.toolsAccordion)
    ));
    expect(openGroups).toEqual(["Design"]);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
