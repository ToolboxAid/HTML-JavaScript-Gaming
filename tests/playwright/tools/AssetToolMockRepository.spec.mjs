import { expect, test } from "@playwright/test";
import {
  ASSET_TOOL_TABLES,
  createAssetToolMockRepository
} from "../../../toolbox/assets/assets-mock-repository.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "asset-tool",
    surface: "Asset Tool mock repository and import preview"
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

test("Asset Tool repository exposes SQL-shaped table ownership without embedded image data", async () => {
  const repository = createAssetToolMockRepository();
  const tables = repository.getTables();

  expect(Object.keys(tables).sort()).toEqual([...ASSET_TOOL_TABLES].sort());
  expect(tables.asset_library_items).toHaveLength(1);
  expect(tables.asset_import_events).toHaveLength(1);
  expect(tables.asset_validation_items).toHaveLength(0);
  expect(JSON.stringify(tables)).not.toContain("imageDataUrl");

  const result = repository.importAsset({
    fileName: "hero.png",
    mimeType: "image/png",
    name: "Hero Sprite",
    path: "assets/images/hero.png",
    role: "Sprite",
    size: 4096,
    type: "Image"
  });

  expect(result.imported).toBe(true);
  expect(repository.listAssets().map((asset) => asset.name)).toEqual([
    "Demo Player Sprite",
    "Hero Sprite"
  ]);
  expect(JSON.stringify(repository.getTables())).not.toContain("imageDataUrl");
});

test("Assets page loads with ready Game Configuration handoff and seeded library", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html");

  try {
    await expect(page.getByRole("heading", { name: "Assets" }).first()).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-handoff-context]")).toHaveText("Demo Project - Game Project - Game Configuration ready");
    await expect(page.locator("[data-asset-tool-handoff-overlay]")).toBeHidden();
    await expect(page.locator("[data-asset-tool-form]")).toBeVisible();
    await expect(page.locator("[data-asset-tool-library-status]")).toHaveText("Ready");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("1");
    await expect(page.locator("[data-asset-tool-library]")).toContainText("Demo Player Sprite");
    await expect(page.locator("[data-asset-tool-preview-title]")).toHaveText("Demo Player Sprite Preview");
    await expect(page.locator("[data-asset-tool-preview]")).toHaveText("Image preview: assets/images/player.png from player.png.");
    await expect(page.locator("[data-asset-tool-output] pre, [data-asset-tool-output] code")).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-output]")).not.toContainText("{");
    await expect(page.locator("[data-asset-tool-table-counts]")).toContainText("asset_library_items");
    await expect(page.locator("[data-asset-tool-table-counts]")).toContainText("asset_import_events");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Asset import creates a library record and updates preview/output text", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html");

  try {
    await page.getByLabel("File").setInputFiles({
      buffer: Buffer.from("fake image bytes"),
      mimeType: "image/png",
      name: "hero.png"
    });
    await page.getByLabel("Name").fill("Hero Sprite");
    await page.getByLabel("Role").selectOption("Sprite");
    await page.getByLabel("Path").fill("assets/images/hero.png");
    await page.getByRole("button", { name: "Import Asset" }).click();

    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Imported Hero Sprite into the asset library.");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("2");
    await expect(page.locator("[data-asset-tool-library]")).toContainText("Hero Sprite");
    await expect(page.locator("[data-asset-tool-preview-title]")).toHaveText("Hero Sprite Preview");
    await expect(page.locator("[data-asset-tool-preview]")).toHaveText("Image preview: assets/images/hero.png from hero.png.");
    await expect(page.locator("[data-asset-tool-output-summary]")).toHaveText("2 assets ready.");
    await expect(page.locator("[data-asset-tool-output-validation]")).toHaveText("Ready");
    await expect(page.locator("[data-asset-tool-output-missing]")).toHaveText("None");
    await expect(page.locator("[data-asset-tool-output-next-step]")).toHaveText("Build Game");

    await page.getByRole("button", { name: "Demo Player Sprite" }).click();
    await expect(page.locator("[data-asset-tool-preview-title]")).toHaveText("Demo Player Sprite Preview");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Asset Tool shows visible import and handoff failures", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html");

  try {
    await page.getByLabel("Name").fill("Broken Asset");
    await page.getByLabel("Path").fill("bad/path.png");
    await page.getByRole("button", { name: "Import Asset" }).click();

    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Asset import blocked by 1 missing item.");
    await expect(page.locator("[data-asset-tool-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-asset-tool-validation-list]")).toContainText("Asset paths must begin with assets/.");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("1");
    await expect(page.locator("[data-asset-tool-output-validation]")).toHaveText("Needs Input");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }

  const missingFailures = await openRepoPage(page, "/toolbox/assets/index.html?handoff=missing");

  try {
    await expect(page.locator("[data-asset-tool-handoff-context]")).toHaveText("No ready Game Configuration handoff");
    await expect(page.locator("[data-asset-tool-handoff-overlay]")).toBeVisible();
    await expect(page.locator("[data-asset-tool-form]")).toHaveAttribute("hidden", "");
    await expect(page.locator("[data-asset-tool-form]")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("[data-asset-tool-library-status]")).toHaveText("Blocked");
    await expect(page.locator("[data-asset-tool-output-next-step]")).toHaveText("Game Configuration");

    expectNoPageFailures(missingFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await missingFailures.server.close();
  }
});
