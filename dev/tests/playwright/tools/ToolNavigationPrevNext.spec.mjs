import { expect, test } from "@playwright/test";
import {
  TOOL_REGISTRY,
  getToolRoute,
} from "../../../../www/toolbox/toolRegistry.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const registryToolsByDisplayName = new Map(TOOL_REGISTRY.map((tool) => [tool.displayName, tool]));

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "tool-navigation",
    surface: "Toolbox route links and group fallback routing",
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
      has: page.getByRole("heading", { exact: true, name: "Game Design" }),
    }).first();
    await expect(gameDesignCard.locator(".card-media-link")).toHaveAttribute("href", "../toolbox/game-design/index.html");
    await expect(gameDesignCard.locator("[data-toolbox-tile-action-row] a.btn")).toHaveAttribute("href", "../toolbox/game-design/index.html");
    await gameDesignCard.locator("h3 > a[data-toolbox-tool-name-link]").click();
    await page.waitForURL(/\/toolbox\/game-design\/index\.html$/);
    await expect(page.locator(".page-title h1")).toHaveText("Game Design");
    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Tool Display Mode no longer renders deprecated previous and next controls", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html");

  try {
    const displayMode = page.locator("#toolDisplayMode");
    await expect(displayMode).toBeVisible();
    await expect(displayMode.locator("[data-tool-nav-previous]")).toHaveCount(0);
    await expect(displayMode.locator("[data-tool-nav-next]")).toHaveCount(0);
    await expect(displayMode.locator(".tool-display-mode__navigation-row")).toHaveCount(0);
    await expect(displayMode.locator("summary > .tool-display-mode__tool-name")).toHaveText("Game Design");
    expectNoPageFailures(failures);
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
        open: group.open,
      }))
    ));
    expect(groups.filter((group) => group.open).map((group) => group.name)).toEqual(["Design"]);
    expect(groups.filter((group) => group.name !== "Design").every((group) => group.open === false)).toBe(true);
    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
