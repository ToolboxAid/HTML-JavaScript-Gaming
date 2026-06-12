import { expect, test } from "@playwright/test";
import {
  ASSET_ROLE_DEFINITIONS,
  ASSET_TOOL_TABLES,
  ASSET_USAGE_BY_ROLE,
  createAssetToolMockRepository
} from "../../../src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const forbiddenEmbeddedDataField = ["image", "Data", "Url"].join("");
const DEMO_ASSET_PROJECT_ID = "01K8M3K0EX7V5A3W9Q2Y6R4T1B";
const ulidPattern = /^[0-9A-HJKMNP-TV-Z]{26}$/;

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "asset-tool",
    surface: "Asset Tool role library, user-owned records, and import preview"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function setServerSession(server, userKey = MOCK_DB_KEYS.users.user1) {
  await fetch(`${server.baseUrl}/api/session/user`, {
    body: JSON.stringify({ userKey }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
}

async function openRepoPage(page, pathName, options = {}) {
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

  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-mem" }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  await setServerSession(server, options.sessionUserKey || MOCK_DB_KEYS.users.user1);
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
  await page.locator("[data-asset-tool-submit]").click();
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
  expect(result.asset.storedPath).toBe(`projects/${DEMO_ASSET_PROJECT_ID}/image/sprite/hero.png`);
  expect(result.asset.ownerUserId).toBe(MOCK_DB_KEYS.users.user1);
  expect(result.message).toBe("Added Hero Sprite to your asset library.");
  expect(repository.previewStoragePath({
    assetRole: "image",
    fileName: "hero.png",
    usage: "sprite"
  })).toBe(`projects/${DEMO_ASSET_PROJECT_ID}/image/sprite/hero.png`);
  expect(result.asset.ownerProjectId).toBe(DEMO_ASSET_PROJECT_ID);
  expect(result.asset.ownerProjectId).toMatch(ulidPattern);
  expect(result.asset.originalName).toBe("hero.png");
  expect(result.asset.checksum).toMatch(/^mock-sha256-/);
  expect(JSON.stringify(repository.getTables())).not.toContain(forbiddenEmbeddedDataField);

  const resetResult = repository.resetAssetLibrary();
  expect(resetResult.reset).toBe(true);
  expect(resetResult.projectId).toBe(DEMO_ASSET_PROJECT_ID);
  expect(resetResult.deletedFiles).toBe(2);
  expect(resetResult.deletedFolders).toBe(2);
  expect(resetResult.message).toBe(`Reset Asset Library deleted 2 files and 2 folders under projects/${DEMO_ASSET_PROJECT_ID}/.`);
  expect(repository.listAssets()).toEqual([]);
  expect(repository.getTables().asset_library_items).toHaveLength(0);
  expect(repository.getTables().asset_storage_objects).toHaveLength(0);
  expect(repository.getTables().asset_import_events).toHaveLength(0);

  repository.makeMissingGameConfiguration();
  const blockedReset = repository.resetAssetLibrary();
  expect(blockedReset.reset).toBe(false);
  expect(blockedReset.deletedFiles).toBe(0);
  expect(blockedReset.deletedFolders).toBe(0);
  expect(blockedReset.message).toBe("Reset Asset Library blocked: no active projectId.");
});

test("Assets page lists all asset roles and starts from active project context", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html");

  try {
    await expect(page.getByRole("heading", { name: "Assets" }).first()).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator(".tool-column")).toHaveCount(2);
    await expect(page.locator(".tool-center-panel")).toBeVisible();
    await expect(page.locator(".accordion-stack")).toHaveCount(2);
    const importAccordion = page.locator("details.vertical-accordion", { hasText: "Import Asset" }).first();
    await expect(importAccordion).toHaveAttribute("open", "");
    await importAccordion.locator("summary").click();
    await expect(importAccordion).not.toHaveAttribute("open", "");
    await importAccordion.locator("summary").click();
    await expect(importAccordion).toHaveAttribute("open", "");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    const runtimeReferences = await page.locator("script[src], link[href]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("src") || node.getAttribute("href") || ""),
    );
    expect(runtimeReferences.join("\n")).not.toContain("archive/v1-v2");
    await expect(page.locator("[data-asset-tool-handoff-context]")).toHaveText("Demo Game - Game - Game Configuration ready");
    await expect(page.locator("[data-asset-tool-handoff-overlay]")).toBeHidden();
    await expect(page.locator("[data-asset-tool-form]")).toBeVisible();
    await expect(page.locator("[data-asset-tool-library-status]")).toHaveText("Needs Input");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");
    await expect(page.locator("[data-asset-tool-library]")).toContainText("No user assets added yet.");
    const libraryRecordsHeading = await page.getByRole("heading", { name: "Library Records" }).boundingBox();
    const assetRolesHeading = await page.getByRole("heading", { name: "Asset Roles" }).boundingBox();
    expect(libraryRecordsHeading?.y || 0).toBeLessThan(assetRolesHeading?.y || 0);
    await expect(page.locator("label[for='assetToolAssetRole']")).toContainText("AssetRole");
    await expect(page.getByRole("heading", { name: "Asset Roles" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-path-format]")).toHaveText("Storage Path format: projects/<projectId>/<assetRole>/<usage>/<filename>.");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText(`projects/${DEMO_ASSET_PROJECT_ID}/image/sprite/player.png`);
    await expect(page.locator("[data-asset-tool-picker-mode]")).toHaveText("file");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Audio");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Color");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Data");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Font");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Image");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Localization");
    await expect(page.locator("[data-asset-tool-role-library]")).not.toContainText("Shader");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Video");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Upload ready");
    await expect(page.locator("[data-asset-tool-role-library]")).toContainText("Planned");
    await expect(page.locator("[data-asset-tool-asset-role] option[value='shader']")).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-role-diagnostics]")).toContainText("Role metadata ready.");
    await expect(page.locator("[data-asset-tool-preview-title]")).toHaveText("Selected Asset Preview");
    await expect(page.locator("[data-asset-tool-preview]")).toHaveText("Choose or upload an asset to preview its project storage metadata.");
    await expect(page.locator("[data-asset-tool-output] pre, [data-asset-tool-output] code")).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-output]")).not.toContainText("{");
    await expect(page.locator("body")).not.toContainText(/import json|export json/i);
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("No selected asset metadata.");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText(";");
    await expect(page.locator("[data-asset-tool-library] [data-asset-tool-view]")).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-library] [data-asset-tool-edit]")).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-library] [data-asset-tool-delete]")).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-table-counts]")).toContainText("asset_role_definitions");
    await expect(page.locator("[data-asset-tool-table-counts]")).toContainText("asset_storage_objects");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Asset Role changes update picker mode, usage options, and import form layout", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html");

  try {
    for (const roleDefinition of ASSET_ROLE_DEFINITIONS.filter((definition) => definition.inputMode !== "advanced")) {
      const role = roleDefinition.id;
      const expectedUsages = ASSET_USAGE_BY_ROLE[role];
      await page.locator("[data-asset-tool-asset-role]").selectOption(role);
      await expect(page.locator("[data-asset-tool-usage] option")).toHaveText(expectedUsages);
      await expect(page.locator("[data-asset-tool-picker-mode]")).toHaveText(roleDefinition.inputMode);

      if (roleDefinition.inputMode === "file") {
        await expect(page.locator("[data-asset-tool-file-row]")).toBeVisible();
        await expect(page.locator("[data-asset-tool-file-name-row]")).toBeVisible();
        await expect(page.locator("[data-asset-tool-palette-row]")).toBeHidden();
        await expect(page.locator("[data-asset-tool-file]")).toBeEnabled();
        await expect(page.locator("[data-asset-tool-import-diagnostic]")).toHaveText(`${roleDefinition.label} file upload ready.`);
        await expect(page.locator("[data-asset-tool-file]")).toHaveAttribute("accept", roleDefinition.extensions.join(","));
      } else if (roleDefinition.inputMode === "palette") {
        await expect(page.locator("[data-asset-tool-file-row]")).toBeHidden();
        await expect(page.locator("[data-asset-tool-file-name-row]")).toBeHidden();
        await expect(page.locator("[data-asset-tool-palette-row]")).toBeVisible();
        await expect(page.locator("[data-asset-tool-palette-detail-row]")).toBeVisible();
        await expect(page.locator("[data-asset-tool-palette-color]")).toBeDisabled();
        await expect(page.locator("[data-asset-tool-import-diagnostic]")).toHaveText("Palette Tool required / no swatches available.");
        await expect(page.locator("[data-asset-tool-palette-selection]")).toContainText("Palette Tool required / no swatches available.");
        await expect(page.locator("[data-asset-tool-palette-link]")).toHaveAttribute("href", "toolbox/colors/index.html");
        await expect(page.locator("[data-asset-tool-file]")).toHaveAttribute("accept", "");
      } else {
        await expect(page.locator("[data-asset-tool-file-row]")).toBeHidden();
        await expect(page.locator("[data-asset-tool-file-name-row]")).toBeHidden();
        await expect(page.locator("[data-asset-tool-palette-row]")).toBeHidden();
        await expect(page.locator("[data-asset-tool-palette-detail-row]")).toBeHidden();
        await expect(page.locator("[data-asset-tool-file]")).toBeDisabled();
        await expect(page.locator("[data-asset-tool-file]")).toHaveAttribute("accept", "");
        await expect(page.locator("[data-asset-tool-import-diagnostic]")).toHaveText(
          role === "data" ? "Data/Table Tool required." : "Localization Tool required."
        );
      }
    }

    await expect(page.locator("[data-asset-tool-asset-role] option[value='shader']")).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-usage]")).toBeVisible();

    await page.locator("[data-asset-tool-asset-role]").selectOption("image");
    const roleLabelHtml = await page.locator("label[for='assetToolAssetRole']").innerHTML();
    const storageLabelHtml = await page.locator("label[for='assetToolPath']").innerHTML();
    expect(roleLabelHtml).toContain("<br>");
    expect(storageLabelHtml).toContain("<br>");

    await expect(page.locator("[data-asset-tool-upload-help-cell]")).toHaveAttribute("colspan", "2");
    await expect(page.locator("[data-asset-tool-upload-help-cell]")).toContainText("File-based roles use user-owned asset records");
    await expect(page.locator("[data-asset-tool-file-name]")).toHaveText("No file selected.");
    await expect(page.locator("[data-asset-tool-path]")).toHaveAttribute("readonly", "");
    await expect(page.locator("[data-asset-tool-path-format]")).toHaveAttribute("colspan", "2");

    const roleSelectBox = await page.locator("[data-asset-tool-asset-role]").boundingBox();
    const usageSelectBox = await page.locator("[data-asset-tool-usage]").boundingBox();
    const fileInputBox = await page.locator("[data-asset-tool-file]").boundingBox();
    const helpBox = await page.locator("[data-asset-tool-upload-help-cell]").boundingBox();
    const fileRowBox = await page.locator("[data-asset-tool-file]").locator("xpath=ancestor::tr").boundingBox();
    const fileNameRowBox = await page.locator("[data-asset-tool-file-name]").locator("xpath=ancestor::tr").boundingBox();
    const importTableDoesNotScroll = await page.locator("[data-asset-tool-form-table]").locator("xpath=ancestor::div[contains(@class,'table-wrapper')]").evaluate((node) => node.scrollWidth <= node.clientWidth + 1);
    const labelCellPadding = await page.locator("label[for='assetToolAssetRole']").locator("xpath=ancestor::th").evaluate((node) => getComputedStyle(node).paddingTop);
    const valueCellPadding = await page.locator("[data-asset-tool-asset-role]").locator("xpath=ancestor::td").evaluate((node) => getComputedStyle(node).paddingTop);

    expect(roleSelectBox?.width || 0).toBeGreaterThan(90);
    expect(usageSelectBox?.width || 0).toBeGreaterThan(90);
    expect(fileInputBox?.width || 0).toBeGreaterThan(100);
    expect(Number.parseFloat(labelCellPadding)).toBeLessThanOrEqual(7);
    expect(Number.parseFloat(valueCellPadding)).toBeLessThanOrEqual(7);
    expect(importTableDoesNotScroll).toBe(true);
    expect((fileNameRowBox?.y || 0)).toBeGreaterThan((fileRowBox?.y || 0));
    expect((helpBox?.y || 0)).toBeGreaterThan((fileRowBox?.y || 0));

    await page.goto(`${failures.server.baseUrl}/toolbox/assets/index.html?advanced=true`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-asset-role] option[value='shader']")).toHaveCount(1);
    await page.locator("[data-asset-tool-asset-role]").selectOption("shader");
    await expect(page.locator("[data-asset-tool-picker-mode]")).toHaveText("advanced");
    await expect(page.locator("[data-asset-tool-file-row]")).toBeHidden();
    await expect(page.locator("[data-asset-tool-palette-row]")).toBeHidden();
    await expect(page.locator("[data-asset-tool-import-diagnostic]")).toHaveText("Advanced/Admin mode required.");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Image, video, and audio uploads create user-owned metadata and previews", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html");

  try {
    await uploadAsset(page, {
      assetRole: "image",
      fileName: "hero.png",
      mimeType: "image/png",
      name: "Hero Sprite",
      usage: "sprite"
    });

    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Added Hero Sprite to your asset library.");
    await expect(page.locator("[data-asset-tool-preview-title]")).toHaveText("Hero Sprite Preview");
    await expect(page.locator("[data-asset-tool-preview]")).toHaveText(`Image preview: projects/${DEMO_ASSET_PROJECT_ID}/image/sprite/hero.png from hero.png.`);
    await expect(page.locator("[data-asset-tool-file-name]")).toHaveText("hero.png");
    await expect(page.locator("[data-asset-tool-path]")).toHaveValue(`projects/${DEMO_ASSET_PROJECT_ID}/image/sprite/hero.png`);
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("hero.png image/png");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText(`Owner project: ${DEMO_ASSET_PROJECT_ID}`);
    await expect(page.locator("[data-asset-tool-library] [data-asset-tool-row][data-asset-tool-selected-row='true']")).toContainText("Hero Sprite");
    await expect(page.locator("[data-asset-tool-library] [data-asset-tool-view]")).toHaveCount(1);
    await expect(page.locator("[data-asset-tool-library] [data-asset-tool-edit]")).toHaveCount(1);
    await expect(page.locator("[data-asset-tool-library] [data-asset-tool-delete]")).toHaveCount(1);
    await expect(page.locator("[data-asset-tool-library]")).toContainText(`projects/${DEMO_ASSET_PROJECT_ID}/image/sprite/hero.png`);
    await expect(page.locator("[data-asset-tool-library] td").nth(4)).not.toContainText(";");

    await uploadAsset(page, {
      assetRole: "video",
      fileName: "intro.mp4",
      mimeType: "video/mp4",
      name: "Intro Cutscene",
      usage: "cutscene"
    });

    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Added Intro Cutscene to your asset library.");
    await expect(page.locator("[data-asset-tool-preview]")).toHaveText(`Video preview: projects/${DEMO_ASSET_PROJECT_ID}/video/cutscene/intro.mp4 from intro.mp4.`);
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("intro.mp4 video/mp4");

    await uploadAsset(page, {
      assetRole: "audio",
      fileName: "theme.mp3",
      mimeType: "audio/mpeg",
      name: "Theme Music",
      usage: "music"
    });

    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Added Theme Music to your asset library.");
    await expect(page.locator("[data-asset-tool-preview]")).toHaveText(`Audio preview: projects/${DEMO_ASSET_PROJECT_ID}/audio/music/theme.mp3 from theme.mp3.`);

    await expect(page.locator("[data-asset-tool-output-summary]")).toHaveText("3 user assets ready.");
    await expect(page.locator("[data-asset-tool-output-validation]")).toHaveText("Ready");
    await expect(page.locator("[data-asset-tool-output-missing]")).toHaveText("None");
    await expect(page.locator("[data-asset-tool-output-next-step]")).toHaveText("Build Game");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText("assets/theme-v2");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText("assets/images/hero.png");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText("assets/projects");
    await expect(page.locator("[data-asset-tool-library] [data-asset-tool-row][data-asset-tool-selected-row='true']")).toContainText("Theme Music");

    await page.locator("[data-asset-tool-row]").filter({ hasText: "Hero Sprite" }).locator("[data-asset-tool-view]").click();
    await expect(page.locator("[data-asset-tool-library] [data-asset-tool-row][data-asset-tool-selected-row='true']")).toContainText("Hero Sprite");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("hero.png image/png");
    await expect(page.locator("[data-asset-tool-metadata]")).not.toContainText(";");

    await page.getByRole("button", { name: "Reset Asset Library" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText(`Reset Asset Library deleted 3 files and 6 folders under projects/${DEMO_ASSET_PROJECT_ID}/.`);
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");
    await expect(page.locator("[data-asset-tool-library]")).toContainText("No user assets added yet.");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("No selected asset metadata.");
    await expect(page.locator("[data-asset-tool-table-counts]")).toContainText("asset_library_items");
    await expect(page.locator("[data-asset-tool-table-counts]")).toContainText("0");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText(`projects/${DEMO_ASSET_PROJECT_ID}/`);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets add, view, edit, and delete behavior is scoped to the owning user", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await uploadAsset(page, {
      assetRole: "image",
      fileName: "hero.png",
      mimeType: "image/png",
      name: "Hero Sprite",
      usage: "sprite"
    });

    const userOneHeroRow = page.locator("[data-asset-tool-row]").filter({ hasText: "Hero Sprite" });
    await expect(userOneHeroRow).toBeVisible();
    await userOneHeroRow.locator("[data-asset-tool-view]").click();
    await expect(page.locator("[data-asset-tool-preview-title]")).toHaveText("Hero Sprite Preview");
    await userOneHeroRow.locator("[data-asset-tool-edit]").click();
    await expect(page.locator("[data-asset-tool-submit]")).toHaveText("Save Asset");
    await expect(page.locator("[data-asset-tool-cancel-edit]")).toBeVisible();
    await expect(page.locator("[data-asset-tool-picker-mode]")).toHaveText("edit");
    await expect(page.locator("[data-asset-tool-file-row]")).toBeHidden();
    await page.getByLabel("Name").fill("Hero Sprite XL");
    await page.locator("[data-asset-tool-submit]").click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Updated Hero Sprite XL in your asset library.");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "Hero Sprite XL" })).toBeVisible();

    await setServerSession(failures.server, MOCK_DB_KEYS.users.user2);
    await page.goto(`${failures.server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText("Hero Sprite XL");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");
    await uploadAsset(page, {
      assetRole: "image",
      fileName: "user-two.png",
      mimeType: "image/png",
      name: "User Two Sprite",
      usage: "sprite"
    });
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "User Two Sprite" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("1");

    await setServerSession(failures.server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${failures.server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-library]")).toContainText("Hero Sprite XL");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText("User Two Sprite");
    await page.locator("[data-asset-tool-row]").filter({ hasText: "Hero Sprite XL" }).locator("[data-asset-tool-delete]").click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Deleted Hero Sprite XL from your asset library.");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText("Hero Sprite XL");
    await expect(page.locator("[data-asset-tool-library]")).toContainText("No user assets added yet.");

    await setServerSession(failures.server, MOCK_DB_KEYS.users.user2);
    await page.goto(`${failures.server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-library]")).toContainText("User Two Sprite");
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText("Hero Sprite XL");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Color assets consume the active Game Workspace palette", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html?palette=seed");

  try {
    await page.locator("[data-asset-tool-asset-role]").selectOption("color");
    await expect(page.locator("[data-asset-tool-picker-mode]")).toHaveText("palette");
    await expect(page.locator("[data-asset-tool-file-row]")).toBeHidden();
    await expect(page.locator("[data-asset-tool-file-name-row]")).toBeHidden();
    await expect(page.locator("[data-asset-tool-palette-row]")).toBeVisible();
    await expect(page.locator("[data-asset-tool-palette-detail-row]")).toBeVisible();
    await expect(page.locator("[data-asset-tool-palette-color]")).toBeEnabled();
    await expect(page.locator("[data-asset-tool-import-diagnostic]")).toHaveText("Palette swatch picker ready.");

    await page.locator("[data-asset-tool-palette-color]").selectOption("hero-blue");
    await expect(page.locator("[data-asset-tool-palette-selection]")).toHaveText("Key: hero-blue Hex: #1F75FE Name: Hero Blue Tags: hero, ui");
    await expect(page.getByLabel("Name")).toHaveValue("Hero Blue");
    await expect(page.locator("[data-asset-tool-path]")).toHaveValue(`projects/${DEMO_ASSET_PROJECT_ID}/color/hud/hero-blue-hero-blue.color`);

    await page.locator("[data-asset-tool-submit]").click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Added Hero Blue to your asset library.");
    await expect(page.locator("[data-asset-tool-library]")).toContainText("Hero Blue");
    await expect(page.locator("[data-asset-tool-library]")).toContainText("Color");
    await expect(page.locator("[data-asset-tool-library]")).toContainText(`projects/${DEMO_ASSET_PROJECT_ID}/color/hud/hero-blue-hero-blue.color`);
    await expect(page.locator("[data-asset-tool-library]")).toContainText("hero-blue #1F75FE");
    await expect(page.locator("[data-asset-tool-library]")).toContainText("Tags: hero, ui");
    await expect(page.locator("[data-asset-tool-preview-title]")).toHaveText("Hero Blue Preview");
    await expect(page.locator("[data-asset-tool-preview]")).toHaveText("Swatch metadata preview: hero-blue #1F75FE Hero Blue. Tags: hero, ui");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("Swatch key: hero-blue");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("Swatch hex: #1F75FE");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("Swatch name: Hero Blue");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("Swatch tags: hero, ui");
    await expect(page.locator("[data-asset-tool-output-validation]")).toHaveText("Ready");

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
    await page.locator("[data-asset-tool-submit]").click();

    await expect(page.locator("[data-asset-tool-log]")).toContainText("Asset upload blocked by");
    await expect(page.locator("[data-asset-tool-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-asset-tool-validation-list]")).toContainText("File Extension");
    await expect(page.locator("[data-asset-tool-validation-list]")).toContainText("MIME Type");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");
    await expect(page.locator("[data-asset-tool-output-validation]")).toHaveText("Needs Input");

    await page.locator("[data-asset-tool-asset-role]").selectOption("color");
    await expect(page.locator("[data-asset-tool-picker-mode]")).toHaveText("palette");
    await expect(page.locator("[data-asset-tool-file-row]")).toBeHidden();
    await expect(page.locator("[data-asset-tool-palette-row]")).toBeVisible();
    await expect(page.locator("[data-asset-tool-palette-color]")).toBeDisabled();
    await expect(page.locator("[data-asset-tool-import-diagnostic]")).toHaveText("Palette Tool required / no swatches available.");
    await page.getByLabel("Name").fill("Palette Color");
    await page.locator("[data-asset-tool-submit]").click();

    await expect(page.locator("[data-asset-tool-validation-list]")).toContainText("Palette Tool required / no swatches available.");

    await page.locator("[data-asset-tool-asset-role]").selectOption("data");
    await expect(page.locator("[data-asset-tool-picker-mode]")).toHaveText("managed-tool");
    await expect(page.locator("[data-asset-tool-file-row]")).toBeHidden();
    await expect(page.locator("[data-asset-tool-import-diagnostic]")).toHaveText("Data/Table Tool required.");
    await page.locator("[data-asset-tool-submit]").click();
    await expect(page.locator("[data-asset-tool-validation-list]")).toContainText("Data/Table Tool required.");

    await page.locator("[data-asset-tool-asset-role]").selectOption("localization");
    await expect(page.locator("[data-asset-tool-picker-mode]")).toHaveText("managed-tool");
    await expect(page.locator("[data-asset-tool-file-row]")).toBeHidden();
    await expect(page.locator("[data-asset-tool-import-diagnostic]")).toHaveText("Localization Tool required.");
    await page.locator("[data-asset-tool-submit]").click();
    await expect(page.locator("[data-asset-tool-validation-list]")).toContainText("Localization Tool required.");

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
    await expect(page.locator("[data-asset-tool-library]")).not.toContainText("projects/");

    await page.getByRole("button", { name: "Reset Asset Library" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Reset Asset Library blocked: no active projectId.");
    await expect(page.locator("[data-asset-tool-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-asset-tool-validation-list]")).toContainText("Active Project");

    expectNoPageFailures(missingFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await missingFailures.server.close();
  }
});
