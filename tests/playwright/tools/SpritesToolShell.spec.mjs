import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openSpritesPage(page, routeHandler) {
  const server = await startRepoServer();
  await routeHandler(page);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/toolbox/sprites/index.html`, { waitUntil: "networkidle" });
  return server;
}

test("Sprites shell loads API-backed empty state without inline page code", async ({ page }) => {
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records", async (route) => {
      await route.fulfill({
        body: JSON.stringify({ data: { sprites: [] }, ok: true }),
        contentType: "application/json",
        status: 200,
      });
    });
  });

  try {
    await expect(page.getByRole("heading", { level: 1, name: "Sprites" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Sprite Library" })).toBeVisible();
    await expect(page.locator("[data-sprites-api-status]")).toHaveText("Ready");
    await expect(page.locator("[data-sprites-library-status]")).toHaveText("Empty");
    await expect(page.locator("[data-sprites-empty-state]")).toContainText("No Sprites records returned by the API.");
    await expect(page.locator("[data-sprites-palette-status]")).toContainText("No Palette/Colors references");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell renders records and Palette/Colors key references from API response", async ({ page }) => {
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          data: {
            sprites: [
              {
                category: "Characters",
                key: "sprite_01HZZZZZZZZZZZZZZZZZZZZZZZ",
                mimeType: "image/png",
                name: "Hero Idle",
                paletteColorKeys: ["palette_color_01"],
                sizeBytes: 2048,
                sourceName: "hero-idle.png",
                status: "active",
                updatedAt: "2026-06-26T12:00:00.000Z",
                usageCount: 1,
                width: 32,
                height: 32,
              },
            ],
          },
          ok: true,
        }),
        contentType: "application/json",
        status: 200,
      });
    });
  });

  try {
    await expect(page.locator("[data-sprites-library-status]")).toHaveText("Ready");
    await expect(page.locator("[data-sprites-count]")).toHaveText("1");
    await expect(page.locator("[data-sprites-table-body]")).toContainText("Hero Idle");
    await expect(page.locator("[data-sprites-table-body]")).toContainText("palette_color_01");
    await expect(page.locator("[data-sprites-palette-status]")).toContainText("1 Palette/Colors key reference");
    await page.locator("[data-sprites-table-body] tr").first().click();
    await expect(page.locator("[data-sprites-metadata]")).toContainText("Hero Idle");
    await expect(page.locator("[data-sprites-metadata]")).toContainText("image/png");
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell shows unavailable state when API contract is missing", async ({ page }) => {
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records", async (route) => {
      await route.fulfill({
        body: JSON.stringify({ error: { message: "Sprites API route is not configured." }, ok: false }),
        contentType: "application/json",
        status: 404,
      });
    });
  });

  try {
    await expect(page.locator("[data-sprites-api-status]")).toHaveText("Unavailable");
    await expect(page.locator("[data-sprites-error-state]")).toContainText("Sprites API route is not configured.");
    await expect(page.locator("[data-sprites-palette-status]")).toContainText("unavailable until Sprites records load");
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
