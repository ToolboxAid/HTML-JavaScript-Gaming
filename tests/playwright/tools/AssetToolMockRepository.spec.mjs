import { expect, test } from "@playwright/test";
import {
  ASSET_ROLE_DEFINITIONS,
  ASSET_TOOL_TABLES,
  ASSET_USAGE_BY_ROLE,
  createAssetToolMockRepository
} from "../../../toolbox/assets/assets-mock-repository.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const forbiddenEmbeddedDataField = ["image", "Data", "Url"].join("");

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "asset-tool",
    surface: "Asset Tool role library, project-owned upload storage, and import preview"
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

async function uploadAsset(page, { assetRole, fileName, mimeType, name, usage }) {
  await page.locator("[data-asset-tool-asset-role]").selectOption(assetRole);
  await page.getByLabel("File").setInputFiles({
    buffer: Buffer.from(`${name} bytes`),
    mimeType,
    name: fileName
  });
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Usage").selectOption(usage);
  await page.getByRole("button", { name: "Upload Asset" }).click();
}

test("Asset Tool repository exposes SQL-shaped role, storage, and metadata ownership", async () => {
  const repository = createAssetToolMockRepository();
  const tables = repository.getTables();

  expect(Object.keys(tables).sort()).toEqual([...ASSET_TOOL_TABLES].sort());
  expect(tables.asset_role_definitions).toHaveLength(8);
  expect(tables.asset_library_items).toHaveLength(1);
  expect(tables.asset_storage_objects).toHaveLength(1);
  expect(tables.asset_import_events).toHaveLength(1);
  expect(tables.asset_validation_items).toHaveLength(0);
  expect(JSON.stringify(tables)).not.toContain(forbiddenEmbeddedDataField);

  expect(ASSET_ROLE_DEFINITIONS.map((role) => role.label)).toEqual([
    "Audio",
    "Color",
    "Data",
    "Font",
    "Image",
    "Localization",
    "Shader",
    "Video"
  ]);

  const result = repository.importAsset({
    assetRole: "image",
    fileName: "hero.png",
    mimeType: "image/png",
    name: "Hero Sprite",
    size: 4096,
    usage: "sprite"
  });

  expect(result.imported).toBe(true);
  expect(repository.listAssets().map((asset) => asset.name)).toEqual([
    "Demo Player Sprite",
    "Hero Sprite"
  ]);
  expect(result.asset.storedPath).toBe("assets/projects/demo-project/image/hero.png");
  expect(result.asset.ownerProjectId).toBe("demo-project");
  expect(result.asset.originalName).toBe("hero.png");
  expect(result.asset.checksum).toMatch(/^mock-sha256-/);
  expect(JSON.stringify(repository.getTables())).not.toContain(forbiddenEmbeddedDataField);
});

test("Assets page lists all asset roles and starts from active project context", async ({ page }) => {
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
    await expect(page.locator("[data-asset-tool-library]")).toContainText("assets/projects/demo-project/image/player.png");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Audio");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Color");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Data");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Font");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Image");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Localization");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Shader");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Video");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Upload ready");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Planned");
    await expect(page.locator("[data-asset-tool-role-diagnostics]")).toContainText("Role metadata ready.");
    await expect(page.locator("[data-asset-tool-preview-title]")).toHaveText("Demo Player Sprite Preview");
    await expect(page.locator("[data-asset-tool-preview]")).toHaveText("Image preview: assets/projects/demo-project/image/player.png from player.png.");
    await expect(page.locator("[data-asset-tool-output] pre, [data-asset-tool-output] code")).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-output]")).not.toContainText("{");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("player.png image/png");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("2048 bytes");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("mock-sha256-");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText(";");
    await expect(page.locator("[data-asset-tool-library] tr.is-selected")).toHaveCount(1);
    await expect(page.locator("[data-asset-tool-table-counts]")).toContainText("asset_role_definitions");
    await expect(page.locator("[data-asset-tool-table-counts]")).toContainText("asset_storage_objects");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Asset Role changes update Usage options and import form layout stays usable", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html");

  try {
    for (const [role, expectedUsages] of Object.entries(ASSET_USAGE_BY_ROLE)) {
      await page.locator("[data-asset-tool-asset-role]").selectOption(role);
      await expect(page.locator("[data-asset-tool-usage] option")).toHaveText(expectedUsages);
    }

    const roleLabelHtml = await page.locator("label[for='assetToolAssetRole']").innerHTML();
    const storageLabelHtml = await page.locator("label[for='assetToolPath']").innerHTML();
    expect(roleLabelHtml).toContain("<br>");
    expect(storageLabelHtml).toContain("<br>");

    await expect(page.locator("[data-asset-tool-upload-help-cell]")).toHaveAttribute("colspan", "2");
    await expect(page.locator("[data-asset-tool-upload-help-cell]")).toContainText("Image, Video, and Audio upload first.");
    await expect(page.locator("[data-asset-tool-file-name]")).toHaveText("No file selected.");
    await expect(page.locator("[data-asset-tool-path]")).toHaveAttribute("readonly", "");

    const roleSelectBox = await page.locator("[data-asset-tool-asset-role]").boundingBox();
    const usageSelectBox = await page.locator("[data-asset-tool-usage]").boundingBox();
    const fileInputBox = await page.locator("[data-asset-tool-file]").boundingBox();
    const helpBox = await page.locator("[data-asset-tool-upload-help-cell]").boundingBox();
    const fileRowBox = await page.locator("[data-asset-tool-file]").locator("xpath=ancestor::tr").boundingBox();
    const fileNameRowBox = await page.locator("[data-asset-tool-file-name]").locator("xpath=ancestor::tr").boundingBox();
    const labelCellPadding = await page.locator("label[for='assetToolAssetRole']").locator("xpath=ancestor::th").evaluate((node) => getComputedStyle(node).paddingTop);
    const valueCellPadding = await page.locator("[data-asset-tool-asset-role]").locator("xpath=ancestor::td").evaluate((node) => getComputedStyle(node).paddingTop);

    expect(roleSelectBox?.width || 0).toBeGreaterThan(90);
    expect(usageSelectBox?.width || 0).toBeGreaterThan(90);
    expect(fileInputBox?.width || 0).toBeGreaterThan(100);
    expect(Number.parseFloat(labelCellPadding)).toBeLessThanOrEqual(7);
    expect(Number.parseFloat(valueCellPadding)).toBeLessThanOrEqual(7);
    expect((fileNameRowBox?.y || 0)).toBeGreaterThan((fileRowBox?.y || 0));
    expect((helpBox?.y || 0)).toBeGreaterThan((fileRowBox?.y || 0));

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Image, video, and audio uploads create project-owned metadata and previews", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html");

  try {
    await uploadAsset(page, {
      assetRole: "image",
      fileName: "hero.png",
      mimeType: "image/png",
      name: "Hero Sprite",
      usage: "sprite"
    });

    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Uploaded Hero Sprite to project asset storage.");
    await expect(page.locator("[data-asset-tool-preview-title]")).toHaveText("Hero Sprite Preview");
    await expect(page.locator("[data-asset-tool-preview]")).toHaveText("Image preview: assets/projects/demo-project/image/hero.png from hero.png.");
    await expect(page.locator("[data-asset-tool-file-name]")).toHaveText("hero.png");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("hero.png image/png");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("Owner project: demo-project");
    await expect(page.locator("[data-asset-tool-library] tr.is-selected")).toHaveCount(1);
    await expect(page.locator("[data-asset-tool-library] tr.is-selected")).toContainText("Hero Sprite");
    await expect(page.locator("[data-asset-tool-library] tr.is-selected td").nth(4)).not.toContainText(";");

    await uploadAsset(page, {
      assetRole: "video",
      fileName: "intro.mp4",
      mimeType: "video/mp4",
      name: "Intro Cutscene",
      usage: "cutscene"
    });

    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Uploaded Intro Cutscene to project asset storage.");
    await expect(page.locator("[data-asset-tool-preview]")).toHaveText("Video preview: assets/projects/demo-project/video/intro.mp4 from intro.mp4.");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("intro.mp4 video/mp4");

    await uploadAsset(page, {
      assetRole: "audio",
      fileName: "theme.mp3",
      mimeType: "audio/mpeg",
      name: "Theme Music",
      usage: "music"
    });

    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Uploaded Theme Music to project asset storage.");
    await expect(page.locator("[data-asset-tool-preview]")).toHaveText("Audio preview: assets/projects/demo-project/audio/theme.mp3 from theme.mp3.");
    await expect(page.locator("[data-asset-tool-output-summary]")).toHaveText("4 project assets ready.");
    await expect(page.locator("[data-asset-tool-output-validation]")).toHaveText("Ready");
    await expect(page.locator("[data-asset-tool-output-missing]")).toHaveText("None");
    await expect(page.locator("[data-asset-tool-output-next-step]")).toHaveText("Build Game");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText("assets/theme-v2");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText("assets/images/hero.png");
    await expect(page.locator("[data-asset-tool-library] tr.is-selected")).toHaveCount(1);
    await expect(page.locator("[data-asset-tool-library] tr.is-selected")).toContainText("Theme Music");

    await page.getByRole("button", { name: "Hero Sprite" }).click();
    await expect(page.locator("[data-asset-tool-library] tr.is-selected")).toHaveCount(1);
    await expect(page.locator("[data-asset-tool-library] tr.is-selected")).toContainText("Hero Sprite");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("hero.png image/png");
    await expect(page.locator("[data-asset-tool-metadata]")).not.toContainText(";");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Asset upload failures are visible and project context is required", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html");

  try {
    await page.locator("[data-asset-tool-asset-role]").selectOption("image");
    await page.getByLabel("File").setInputFiles({
      buffer: Buffer.from("plain text"),
      mimeType: "text/plain",
      name: "notes.txt"
    });
    await page.getByLabel("Name").fill("Broken Image");
    await page.getByRole("button", { name: "Upload Asset" }).click();

    await expect(page.locator("[data-asset-tool-log]")).toContainText("Asset upload blocked by");
    await expect(page.locator("[data-asset-tool-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-asset-tool-validation-list]")).toContainText("File Extension");
    await expect(page.locator("[data-asset-tool-validation-list]")).toContainText("MIME Type");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("1");
    await expect(page.locator("[data-asset-tool-output-validation]")).toHaveText("Needs Input");

    await page.locator("[data-asset-tool-asset-role]").selectOption("color");
    await page.getByLabel("File").setInputFiles({
      buffer: Buffer.from("{\"hex\":\"#ffffff\"}"),
      mimeType: "application/json",
      name: "palette.json"
    });
    await page.getByLabel("Name").fill("Palette Color");
    await page.getByRole("button", { name: "Upload Asset" }).click();

    await expect(page.locator("[data-asset-tool-validation-list]")).toContainText("Color is represented in the role library, but upload is implemented first for Image, Video, and Audio only.");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }

  const missingFailures = await openRepoPage(page, "/toolbox/assets/index.html?handoff=missing");

  try {
    await expect(page.locator("[data-asset-tool-handoff-context]")).toHaveText("No active project with ready Game Configuration handoff");
    await expect(page.locator("[data-asset-tool-handoff-overlay]")).toBeVisible();
    await expect(page.locator("[data-asset-tool-form]")).toHaveAttribute("hidden", "");
    await expect(page.locator("[data-asset-tool-form]")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("[data-asset-tool-library-status]")).toHaveText("Blocked");
    await expect(page.locator("[data-asset-tool-output-next-step]")).toHaveText("Game Configuration");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText("assets/projects/");

    expectNoPageFailures(missingFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await missingFailures.server.close();
  }
});
