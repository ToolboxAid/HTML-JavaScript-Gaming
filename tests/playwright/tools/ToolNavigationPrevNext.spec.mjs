import { expect, test } from "@playwright/test";
import {
  TOOL_REGISTRY,
  getToolNavigationTargets,
  getToolRoute,
} from "../../../toolbox/toolRegistry.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const registryToolsByDisplayName = new Map(TOOL_REGISTRY.map((tool) => [tool.displayName, tool]));

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "tool-navigation",
    surface: "Toolbox card links and Tool Display Mode navigation"
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

test("Toolbox card names link to registered tool routes without duplicating launch actions", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html");

  try {
    const cards = page.locator("main [data-tools-accordion-list] article.control-card");
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    for (let index = 0; index < cardCount; index += 1) {
      const card = cards.nth(index);
      const toolName = (await card.locator("h3").innerText()).trim();
      const registryTool = registryToolsByDisplayName.get(toolName);
      expect(registryTool, `Registry entry missing for ${toolName}`).toBeTruthy();
      const route = getToolRoute(registryTool);
      const nameLink = card.locator("h3 > a[data-toolbox-tool-name-link]");

      await expect(nameLink).toHaveCount(1);
      await expect(nameLink).toHaveText(toolName);
      await expect(nameLink).toHaveAttribute("data-registered-tool-route", route);
      await expect(nameLink).toHaveAttribute("href", "/" + route);
      await expect(card.locator(".card-media-link")).toHaveCount(1);
      await expect(card.locator("[data-toolbox-tile-action-row] a.btn")).toHaveCount(1);
    }

    const gameDesignCard = cards.filter({
      has: page.getByRole("heading", { exact: true, name: "Game Design" })
    }).first();
    await expect(gameDesignCard.locator(".card-media-link")).toHaveAttribute("href", "../toolbox/game-design/index.html");
    await expect(gameDesignCard.locator("[data-toolbox-tile-action-row] a.btn")).toHaveAttribute("href", "../toolbox/game-design/index.html");
    await gameDesignCard.locator("h3 > a[data-toolbox-tool-name-link]").click();
    await page.waitForURL(/\/toolbox\/game-design\/index\.html$/);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".page-title h1")).toHaveText("Game Design");

    await page.goto(`${failures.server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
    const spritesCard = page.locator("[data-toolbox-tool-card='Sprites']");
    await expect(spritesCard).toBeVisible();
    await expect(spritesCard).toHaveAttribute("data-toolbox-release-channel", "wireframe");
    await expect(spritesCard.locator("[data-toolbox-readiness]")).toHaveText("Wireframe");
    await expect(spritesCard.locator("[data-toolbox-tile-action-row='Sprites'] a.btn")).toHaveText("Open Tool");
    await expect(spritesCard.locator("[data-toolbox-tile-action-row='Sprites'] a.btn")).toHaveAttribute("href", "../toolbox/sprites/index.html");
    await spritesCard.locator("h3 > a[data-toolbox-tool-name-link]").click();
    await page.waitForURL(/\/toolbox\/sprites\/index\.html$/);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".page-title h1")).toHaveText("Sprites");
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Tool Display Mode renders build-order previous and next controls", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html");
  const navigation = getToolNavigationTargets("game-design");

  try {
    await expectNavigationTarget(page.locator("[data-tool-nav-previous]"), "Previous", navigation.previous);
    await expectNavigationTarget(page.locator("[data-tool-nav-next]"), "Next", navigation.next);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Game Hub Tool Display Mode follows registry route targets", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-hub/index.html");
  const navigation = getToolNavigationTargets("game-hub");

  try {
    await expectNavigationTarget(page.locator("[data-tool-nav-previous]"), "Previous", navigation.previous);
    await expectNavigationTarget(page.locator("[data-tool-nav-next]"), "Next", navigation.next);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("multi-path next control routes to Toolbox Group view and preserves role", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-configuration/index.html");
  const navigation = getToolNavigationTargets("game-configuration");

  try {
    const nextControl = page.locator("[data-tool-nav-next]");
    expect(navigation.next.kind).toBe("group");
    await expectNavigationTarget(nextControl, "Next", navigation.next);

    await nextControl.click();
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

test("Toolbox Group view can be selected directly with only the requested group expanded", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html?view=group&group=design");

  try {
    await expect(page.getByRole("button", { name: "Group" })).toHaveAttribute("aria-pressed", "true");
    const groups = await page.locator("[data-tools-accordion]").evaluateAll((accordionGroups) => (
      accordionGroups.map((group) => ({
        name: group.dataset.toolsAccordion,
        open: group.open
      }))
    ));
    expect(groups.filter((group) => group.open).map((group) => group.name)).toEqual(["Design"]);
    expect(groups.filter((group) => group.name !== "Design").every((group) => group.open === false)).toBe(true);
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
