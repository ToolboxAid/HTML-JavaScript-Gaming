import { expect, test } from "@playwright/test";
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
  await page.locator("#toolDisplayMode summary").click();
  await expect(page.locator("body")).toHaveClass(/tool-focus-mode/);
  const badgeSize = await page.locator(".tool-display-mode__badge").evaluate((badge) => {
    const box = badge.getBoundingClientRect();
    return {
      height: Math.round(box.height),
      width: Math.round(box.width)
    };
  });
  expect(badgeSize).toEqual({ height: 32, width: 32 });
}

test("Game Design renders identity and navigation rows with registry anchor links", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html?role=user");

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
    await expect(previous).toHaveText("Previous: Project Workspace");
    await expect(previous).toHaveAttribute("href", "toolbox/project-workspace/index.html?role=user");
    await expect(next).toHaveText("Next: Game Configuration");
    await expect(next).toHaveAttribute("href", "toolbox/game-configuration/index.html?role=user");
    await expectPlainNavigationLinks(page);
    await expectToolDisplayModeVisualLayout(page);
    await expectToolDisplayModeFullscreenBadge(page);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Project Workspace and Game Configuration use registry order without page hardcoding", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-workspace/index.html?role=user");

  try {
    await expect(page.locator("[data-tool-display-mode-row='identity']")).toContainText("Project Workspace");
    await expect(page.locator("[data-tool-nav-previous]")).toHaveText("Previous: AI Assistant");
    await expect(page.locator("[data-tool-nav-previous]")).toHaveAttribute("href", "toolbox/ai-assistant/index.html?role=user");
    await expect(page.locator("[data-tool-nav-next]")).toHaveText("Next: Game Design");
    await expect(page.locator("[data-tool-nav-next]")).toHaveAttribute("href", "toolbox/game-design/index.html?role=user");

    await page.goto(`${failures.server.baseUrl}/toolbox/game-configuration/index.html?role=admin`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tool-display-mode-row='identity']")).toContainText("Game Configuration");
    await expect(page.locator("[data-tool-nav-previous]")).toHaveText("Previous: Game Design");
    await expect(page.locator("[data-tool-nav-previous]")).toHaveAttribute("href", "toolbox/game-design/index.html?role=admin");
    await expect(page.locator("[data-tool-nav-next]")).toHaveText("Next: Design Tools");
    await expect(page.locator("[data-tool-nav-next]")).toHaveAttribute("href", "toolbox/index.html?view=group&group=design&role=admin");
    await expect(page.locator("[data-tool-nav-next]")).toHaveAttribute("data-tool-nav-group", "design");
    await expectPlainNavigationLinks(page);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("missing previous target renders disabled text instead of a broken link", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/ai-assistant/index.html?role=user");

  try {
    const previous = page.locator("[data-tool-nav-previous]");
    await expect(previous).toHaveText("Previous: No previous tool");
    await expect(previous).not.toHaveAttribute("href");
    await expect(previous).not.toHaveJSProperty("tagName", "A");
    await expect(page.locator("[data-tool-display-mode-row='navigation'] a")).toHaveCount(1);
    await expect(page.locator("[data-tool-nav-next]")).toHaveText("Next: Project Workspace");
    await expect(page.locator("[data-tool-nav-next]")).toHaveAttribute("href", "toolbox/project-workspace/index.html?role=user");
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Build Game renders plain previous and next links in the second row", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/build-game/index.html?role=user");

  try {
    const rows = await toolDisplayRows(page);
    expect(rows.map((row) => row.row)).toEqual(["identity", "navigation"]);
    expect(rows[0].childTags).toEqual(["img", "span"]);
    expect(rows[0].text).toBe("Build Game");
    expect(rows[1].childTags).toEqual(["a", "a"]);

    const previous = page.locator("[data-tool-nav-previous]");
    const next = page.locator("[data-tool-nav-next]");
    await expect(previous).toHaveText("Previous: Videos");
    await expect(previous).toHaveAttribute("href", "toolbox/videos/index.html?role=user");
    await expect(next).toHaveText("Next: Game Testing");
    await expect(next).toHaveAttribute("href", "toolbox/game-testing/index.html?role=user");
    await expectPlainNavigationLinks(page);
    await expectToolDisplayModeVisualLayout(page);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("multi-path fallback opens Toolbox Group view with only the target group expanded", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-configuration/index.html?role=admin");

  try {
    const next = page.locator("[data-tool-nav-next]");
    await expect(next).toHaveAttribute("href", "toolbox/index.html?view=group&group=design&role=admin");
    await next.click();
    await page.waitForURL(/\/toolbox\/index\.html\?view=group&group=design&role=admin$/);
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
