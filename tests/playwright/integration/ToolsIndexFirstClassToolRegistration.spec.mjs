import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "integration",
    surface: "Tools index first-class tool registration"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openToolsIndex(page) {
  const server = await startRepoServer();
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/toolbox/index.html`, { waitUntil: "networkidle" });
  return server;
}

test("renders Asset Manager V2 as a first-class tool in the tools index", async ({ page }) => {
  const server = await openToolsIndex(page);
  const pageErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  try {
    const assetManagerLink = page.locator(".tools-platform-card h3 a", { hasText: "Asset Manager V2" });
    const assetManagerCard = page.locator(".tools-platform-card").filter({
      has: page.locator("h3 a", { hasText: "Asset Manager V2" })
    });
    const collisionInspectorLink = page.locator(".tools-platform-card h3 a", { hasText: "Collision Inspector V2" });
    const collisionInspectorCard = page.locator(".tools-platform-card").filter({
      has: page.locator("h3 a", { hasText: "Collision Inspector V2" })
    });
    await expect(assetManagerLink).toBeVisible();
    await expect(assetManagerLink).toHaveAttribute("href", "/toolbox/asset-manager-v2/index.html");
    await expect(assetManagerCard).toContainText("Schema Validated");
    await expect(collisionInspectorLink).toBeVisible();
    await expect(collisionInspectorLink).toHaveAttribute("href", "/toolbox/collision-inspector-v2/index.html");
    await expect(collisionInspectorCard).toContainText("Manifest Driven");
    await expect(collisionInspectorCard).toContainText("Engine-aligned collision visualization");
    const plannedToolNames = await page.locator("[data-planned-tools-grid] h3").allTextContents();
    expect(plannedToolNames).toContain("Animation / Flipbook Editor");
    expect(plannedToolNames).not.toContain("Asset Manager V2");
    expect(plannedToolNames).not.toContain("Collision / Hitbox Editor");
    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
