import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "tool-runtime",
    surface: "Palette Manager V2"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openPaletteManager(page) {
  const server = await startRepoServer();
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/toolbox/palette-manager-v2/index.html`, { waitUntil: "networkidle" });
  return server;
}

test("loads Palette Manager V2 so coverage includes Palette Manager V2 runtime files", async ({ page }) => {
  const server = await openPaletteManager(page);
  const pageErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  try {
    await expect(page.locator(".palette-manager-v2.app-shell")).toBeVisible();
    await expect(page.locator("h1", { hasText: "Palette Manager V2" })).toBeVisible();
    await expect(page.locator('nav[aria-label="menuSample"]')).toBeVisible();
    await expect(page.locator("#sourcePaletteSelect")).toBeVisible();
    await expect(page.locator("#sourceSwatchList .palette-manager-v2__source-tile").first()).toBeVisible();
    await expect(page.locator("#importPaletteButton")).toBeVisible();
    await expect(page.locator("#copyPaletteButton")).toBeVisible();
    await expect(page.locator("#exportPaletteButton")).toBeVisible();
    await expect(page.locator("#paletteStatus")).toContainText("Ready.");
    await page.waitForFunction(() => Boolean(globalThis.paletteManagerV2App?.getPaletteValue));

    expect(pageErrors).toEqual([]);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
