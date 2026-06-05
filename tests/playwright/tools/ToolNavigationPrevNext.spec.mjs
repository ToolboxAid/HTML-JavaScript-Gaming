import { expect, test } from "@playwright/test";
import { TOOL_REGISTRY, getToolRoute } from "../../../toolbox/toolRegistry.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const expectedTools = [...TOOL_REGISTRY]
  .filter((tool) => tool.active === true)
  .sort((left, right) => left.order - right.order);
const registryToolsByDisplayName = new Map(TOOL_REGISTRY.map((tool) => [tool.displayName, tool]));

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "tool-navigation",
    surface: "Admin Tools Progress links and Tool Display Mode navigation"
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

test("Admin Tools Progress links routed tools and marks route-less tools as planned", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/tools-progress.html");

  try {
    for (const tool of expectedTools) {
      const row = page.locator(`[data-tools-progress-tool='${tool.displayName}']`);
      const route = getToolRoute(tool);
      const link = row.locator("[data-tools-progress-route]");

      if (route) {
        await expect(link).toHaveText(tool.displayName);
        await expect(link).toHaveAttribute("href", route);
      } else {
        await expect(link).toHaveCount(0);
        await expect(row).toContainText("Route pending");
      }
    }

    const routeLessTool = await page.evaluate(async () => {
      const module = await import("/admin/tools-progress.js");
      const node = module.createToolNameNode({
        displayName: "Route Pending Tool",
        entryPoint: "",
        status: "Planned"
      });
      return {
        linkCount: node.querySelectorAll("a").length,
        text: node.textContent
      };
    });
    expect(routeLessTool.linkCount).toBe(0);
    expect(routeLessTool.text).toContain("Route Pending Tool");
    expect(routeLessTool.text).toContain("Planned - Route pending");
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Toolbox card names link to registered tool routes without duplicating launch actions", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/index.html?role=admin");

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
      await expect(card.locator(".card-body > a.btn")).toHaveCount(1);
    }

    const gameDesignCard = cards.filter({
      has: page.getByRole("heading", { exact: true, name: "Game Design" })
    }).first();
    await expect(gameDesignCard.locator(".card-media-link")).toHaveAttribute("href", "../toolbox/game-design/index.html");
    await expect(gameDesignCard.locator(".card-body > a.btn")).toHaveAttribute("href", "../toolbox/game-design/index.html");
    await gameDesignCard.locator("h3 > a[data-toolbox-tool-name-link]").click();
    await page.waitForURL(/\/toolbox\/game-design\/index\.html$/);
    await expect(page.locator(".page-title h1")).toHaveText("Game Design");
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Tool Display Mode renders build-order previous and next controls", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-design/index.html?role=user");

  try {
    await expect(page.locator("[data-tool-nav-previous]")).toHaveText("Previous: Project Workspace");
    await expect(page.locator("[data-tool-nav-previous]")).toHaveAttribute("href", "toolbox/project-workspace/index.html?role=user");
    await expect(page.locator("[data-tool-nav-next]")).toHaveText("Next: Game Configuration");
    await expect(page.locator("[data-tool-nav-next]")).toHaveAttribute("href", "toolbox/game-configuration/index.html?role=user");
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Project Workspace Tool Display Mode follows registry build order", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/project-workspace/index.html?role=user");

  try {
    await expect(page.locator("[data-tool-nav-previous]")).toHaveText("Previous: AI Assistant");
    await expect(page.locator("[data-tool-nav-previous]")).toHaveAttribute("href", "toolbox/ai-assistant/index.html?role=user");
    await expect(page.locator("[data-tool-nav-next]")).toHaveText("Next: Game Design");
    await expect(page.locator("[data-tool-nav-next]")).toHaveAttribute("href", "toolbox/game-design/index.html?role=user");
    await expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("multi-path next control routes to Toolbox Group view and preserves role", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/game-configuration/index.html?role=admin");

  try {
    const nextControl = page.locator("[data-tool-nav-next]");
    await expect(nextControl).toHaveText("Next: Design Tools");
    await expect(nextControl).toHaveAttribute("data-tool-nav-group", "design");
    await expect(nextControl).toHaveAttribute("href", "toolbox/index.html?view=group&group=design&role=admin");

    await nextControl.click();
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
