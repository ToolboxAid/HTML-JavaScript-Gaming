import { expect, test } from "@playwright/test";
import { startRepoServer } from "../helpers/playwrightRepoServer.mjs";

test.describe("Preview Generator V2 baseline", () => {
  test("launches the tool shell and toggles a working accordion", async ({ page }) => {
    const server = await startRepoServer();
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html`, { waitUntil: "domcontentloaded" });

      await expect(page.locator(".preview-generator-v2.app-shell")).toBeVisible();
      await expect(page.locator("h1", { hasText: "Preview Generator V2" })).toBeVisible();
      await expect(page.locator('nav[aria-label="menuSample"]')).toBeVisible();

      await expect(page.locator("#executeBtn")).toBeVisible();
      await expect(page.locator("#executeBtn")).toBeDisabled();
      await expect(page.locator("#stopBtn")).toBeVisible();
      await expect(page.locator("#stopBtn")).toBeDisabled();

      await expect(page.locator("#targetTypeGames")).toBeChecked();
      await expect(page.locator("#sampleList")).toBeVisible();
      await expect(page.locator("#statusAccordion")).toBeVisible();

      const repoHeader = page.locator('.accordion-v2__header[aria-controls="repoDestinationContent"]');
      const repoContent = page.locator("#repoDestinationContent");
      await expect(repoHeader).toBeVisible();
      await expect(repoContent).toBeVisible();

      await repoHeader.click();
      await expect(repoContent).toBeHidden();
      await expect(repoHeader).toHaveAttribute("aria-expanded", "false");

      await repoHeader.click();
      await expect(repoContent).toBeVisible();
      await expect(repoHeader).toHaveAttribute("aria-expanded", "true");

      expect(pageErrors).toEqual([]);
    } finally {
      await server.close();
    }
  });
});
