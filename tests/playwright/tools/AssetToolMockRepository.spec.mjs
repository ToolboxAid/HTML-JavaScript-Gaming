import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ASSET_CATALOG_TYPES,
  ASSET_ROLE_DEFINITIONS,
  ASSET_TOOL_TABLES,
  ASSET_USAGE_OPTIONS,
  createAssetToolMockRepository
} from "../../../src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js";
import { createTagsToolMockRepository } from "../../../src/dev-runtime/persistence/tool-repositories/tags-mock-repository.js";
import { MOCK_DB_KEYS } from "../../../src/dev-runtime/persistence/mock-db-store.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const USAGE_VALUES = [
  "Background",
  "Character",
  "Enemy",
  "Environment",
  "Font",
  "Icon",
  "Interface",
  "Music",
  "Sound Effect",
  "Sprite",
  "Theme",
  "Tile",
  "Voice"
];
const UPLOAD_COLUMNS = ["Source", "File", "Usage", "Tags", "Preview", "Actions"];
const REFERENCE_COLUMNS = ["Source", "Reference", "Usage", "Tags", "Preview", "Actions"];
const REFERENCE_ASSET_TYPES = new Set(["Sprites", "Vectors", "Palette References"]);
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DEMO_ASSET_PROJECT_ID = "01K8M3K0EX7V5A3W9Q2Y6R4T1B";
const SMALL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR42mP8z8AABQMBgMZ0X4AAAAAASUVORK5CYII=",
  "base64"
);

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "asset-tool-catalog",
    surface: "Assets catalog accordions and shared Tags references"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function setServerSession(server, userKey = MOCK_DB_KEYS.users.user1) {
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId: "local-mem" }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });
  await setServerUser(server, userKey);
}

async function setServerUser(server, userKey) {
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

function projectAssetPath(assetFolder, fileName = "") {
  return resolve(REPO_ROOT, "projects", DEMO_ASSET_PROJECT_ID, assetFolder, fileName);
}

function resetProjectAssetFolder(assetFolder) {
  const folder = projectAssetPath(assetFolder);
  const allowedRoot = resolve(REPO_ROOT, "projects", DEMO_ASSET_PROJECT_ID);
  if (!folder.startsWith(allowedRoot)) {
    throw new Error(`Refusing to remove unexpected test asset folder: ${folder}`);
  }
  rmSync(folder, { force: true, recursive: true });
}

async function addSharedTag(page, tagName = "Hero") {
  await page.goto(`${page.url().split("/toolbox/")[0]}/toolbox/tags/index.html`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add Tag" }).click();
  const row = page.locator("[data-tags-editing-row='__new__']");
  await row.getByLabel("Tag Name").fill(tagName);
  await row.getByLabel("Description").fill(`${tagName} assets`);
  await row.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("[data-tags-row]").filter({ hasText: tagName })).toBeVisible();
}

function uploadFile(name, mimeType, contents = `mock ${name}`) {
  return {
    buffer: Buffer.isBuffer(contents) ? contents : Buffer.from(contents),
    mimeType,
    name
  };
}

function zeroByteUploadFile(name, mimeType) {
  return {
    buffer: Buffer.alloc(0),
    mimeType,
    name
  };
}

async function addUploadBatch(page, assetType, files, usage = "Interface") {
  await page.getByRole("button", { name: `Add ${assetType}` }).click();
  const editRow = page.locator(`[data-asset-tool-editing-row='__new__:${assetType}']`);
  await expect(editRow.getByLabel("Source")).toHaveValue("Upload");
  await expect(editRow.getByLabel("Upload File")).toHaveJSProperty("multiple", true);
  await editRow.getByLabel("Upload File").setInputFiles(files);
  await expect(editRow.locator("[data-asset-tool-selected-file]")).toContainText(files[0].name);
  await editRow.getByLabel("Usage").selectOption(usage);
  await editRow.getByRole("button", { name: "Save" }).click();
  return editRow;
}

test("Asset repository exposes catalog tables, usage values, and shared tag references", () => {
  let assetRepository;
  const tagsRepository = createTagsToolMockRepository({
    persist: false,
    usageProvider: () => assetRepository?.listAssets() || []
  });
  assetRepository = createAssetToolMockRepository({
    persist: false,
    tagsRepository
  });
  assetRepository.resetAssetLibrary();

  expect(Object.keys(assetRepository.getTables()).sort()).toEqual([...ASSET_TOOL_TABLES].sort());
  expect(ASSET_CATALOG_TYPES).toEqual(["Images", "Audio", "Fonts", "Sprites", "Vectors", "Palette References", "Data"]);
  expect(ASSET_USAGE_OPTIONS).toEqual(USAGE_VALUES);
  expect(ASSET_USAGE_OPTIONS).not.toContain("Projectile");
  expect(ASSET_ROLE_DEFINITIONS.map((role) => role.label).sort()).toEqual(["Audio", "Data", "Font", "Image"]);
  for (const legacyRole of ["Color", "Localization", "Shader", "Video"]) {
    expect(ASSET_CATALOG_TYPES).not.toContain(legacyRole);
    expect(ASSET_ROLE_DEFINITIONS.map((role) => role.label)).not.toContain(legacyRole);
  }

  const tagResult = tagsRepository.addTag({
    description: "Hero vocabulary",
    name: "Hero"
  });
  const assetResult = assetRepository.addAssetRecord({
    assetType: "Images",
    fileContentBase64: Buffer.from("repository image").toString("base64"),
    fileName: "hero-portrait.png",
    hasFileBytes: true,
    mimeType: "image/png",
    name: "Hero Portrait",
    size: 16,
    source: "Upload",
    tagKeys: [tagResult.tag.id],
    usage: "Character"
  });

  expect(assetResult.added).toBe(true);
  expect(assetResult.asset).toEqual(expect.objectContaining({
    createdBy: MOCK_DB_KEYS.users.user1,
    key: assetResult.asset.id,
    source: "Upload",
    updatedBy: MOCK_DB_KEYS.users.user1
  }));
  expect(assetResult.asset.createdAt).toEqual(expect.any(String));
  expect(assetResult.asset.updatedAt).toEqual(expect.any(String));
  expect(assetResult.asset.ownerUserId).toBe(MOCK_DB_KEYS.users.user1);
  expect(assetResult.asset.assetType).toBe("Images");
  expect(assetResult.asset.fileName).toBe("hero-portrait.png");
  expect(assetResult.asset.storedPath).toBe(`projects/${DEMO_ASSET_PROJECT_ID}/image/hero-portrait.png`);
  expect(assetResult.asset.viewPath).toBe(`projects/${DEMO_ASSET_PROJECT_ID}/image/hero-portrait.png`);
  expect(assetResult.asset.writeResult).toBe("Written");
  expect(assetResult.asset.usage).toBe("Character");
  expect(assetResult.asset.tagKeys).toEqual([tagResult.tag.id]);
  const populatedAssetTables = Object.entries(assetRepository.getTables())
    .filter(([, rows]) => rows.length > 0);
  expect(populatedAssetTables.length).toBeGreaterThan(0);
  for (const [, rows] of populatedAssetTables) {
    for (const row of rows) {
      expect(row).toEqual(expect.objectContaining({
        createdAt: expect.any(String),
        createdBy: expect.any(String),
        key: expect.any(String),
        updatedAt: expect.any(String),
        updatedBy: expect.any(String)
      }));
    }
  }
  expect(tagsRepository.findTag(tagResult.tag.id).usage).toEqual([
    expect.objectContaining({
      itemName: "hero-portrait.png",
      tool: "Assets"
    })
  ]);
});

test("Assets source controls require real upload filenames and valid references", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await page.getByRole("button", { name: "Reset Asset Library" }).click();
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await page.getByRole("button", { name: "Add Images" }).click();
    let editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await expect(editRow.getByLabel("Source")).toHaveValue("Upload");
    await expect(editRow.getByLabel("Upload File")).toBeVisible();
    await expect(editRow.getByLabel("Source").locator("option")).toHaveText(["Upload"]);
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Choose an upload file before saving.");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await editRow.getByLabel("Upload File").setInputFiles({
      buffer: Buffer.from("mock image"),
      mimeType: "image/png",
      name: "source-image.png"
    });
    await expect(editRow.locator("[data-asset-tool-selected-file]")).toHaveText("source-image.png");
    await editRow.getByLabel("Usage").selectOption("Character");
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "source-image.png" })).toBeVisible();

    await page.getByRole("button", { name: "Add Images" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await expect(editRow.getByLabel("Source").locator("option")).toHaveText(["Upload", "Reference"]);
    await editRow.getByLabel("Source").selectOption("Reference");
    await expect(editRow.getByLabel("Reference")).toBeVisible();
    await expect(editRow.getByLabel("Upload File")).toHaveCount(0);
    await editRow.getByLabel("Reference").selectOption({ label: "source-image.png" });
    await editRow.getByLabel("Usage").selectOption("Background");
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "Reference" })).toBeVisible();

    await page.getByRole("button", { name: "Add Data" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Data']");
    await expect(editRow.getByLabel("Source").locator("option")).toHaveText(["Upload", "Reference"]);
    await expect(editRow.locator("[data-asset-tool-source-help]")).toContainText(".json, .csv, or .txt");
    await expect(editRow.getByLabel("Upload File")).toBeVisible();
    await expect(editRow.getByLabel("Upload File")).toHaveAttribute("accept", /\.json/);
    await expect(editRow.getByLabel("Upload File")).toHaveAttribute("accept", /\.csv/);
    await expect(editRow.getByLabel("Upload File")).toHaveAttribute("accept", /\.txt/);
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Choose an upload file before saving.");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("2");
    for (const fileName of ["source-data.json", "source-data.csv", "source-data.txt"]) {
      await editRow.getByLabel("Upload File").setInputFiles({
        buffer: Buffer.from("mock data"),
        mimeType: "text/plain",
        name: fileName
      });
      await expect(editRow.locator("[data-asset-tool-selected-file]")).toHaveText(fileName);
    }
    await editRow.getByLabel("Usage").selectOption("Theme");
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "source-data.txt" })).toBeVisible();

    await page.getByRole("button", { name: "Add Data" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Data']");
    await editRow.getByLabel("Source").selectOption("Reference");
    await expect(editRow.getByLabel("Reference")).toBeVisible();
    await expect(editRow.getByLabel("Upload File")).toHaveCount(0);
    await editRow.getByLabel("Reference").selectOption({ label: "source-data.txt" });
    await editRow.getByLabel("Usage").selectOption("Interface");
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "Reference" }).filter({ hasText: "Interface" })).toBeVisible();

    await page.getByRole("button", { name: "Add Audio" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Audio']");
    await expect(editRow.getByLabel("Source")).toHaveValue("Upload");
    await expect(editRow.getByLabel("Upload File")).toBeVisible();
    await editRow.getByLabel("Upload File").setInputFiles({
      buffer: Buffer.from("mock audio"),
      mimeType: "audio/wav",
      name: "source-audio.wav"
    });
    await expect(editRow.locator("[data-asset-tool-selected-file]")).toHaveText("source-audio.wav");
    await editRow.getByRole("button", { name: "Cancel" }).click();

    await page.getByRole("button", { name: "Add Fonts" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Fonts']");
    await expect(editRow.getByLabel("Source")).toHaveValue("Upload");
    await expect(editRow.getByLabel("Source").locator("option")).toHaveText(["Upload"]);
    await editRow.getByLabel("Upload File").setInputFiles({
      buffer: Buffer.from("mock font"),
      mimeType: "font/woff2",
      name: "source-font.woff2"
    });
    await expect(editRow.locator("[data-asset-tool-selected-file]")).toHaveText("source-font.woff2");
    await editRow.getByRole("button", { name: "Cancel" }).click();

    await page.getByRole("button", { name: "Add Sprites" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Sprites']");
    await expect(editRow.getByLabel("Source")).toHaveValue("Reference");
    await expect(editRow.getByLabel("Source").locator("option")).toHaveText(["Reference"]);
    await expect(editRow.getByLabel("Reference")).toBeVisible();
    await expect(editRow.getByLabel("Upload File")).toHaveCount(0);
    await expect(editRow.locator("[data-asset-tool-source-help]")).toContainText("Reference-only");
    await editRow.getByRole("button", { name: "Cancel" }).click();

    await page.getByRole("button", { name: "Add Vectors" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Vectors']");
    await expect(editRow.getByLabel("Source")).toHaveValue("Reference");
    await expect(editRow.getByLabel("Source").locator("option")).toHaveText(["Reference"]);
    await expect(editRow.getByLabel("Reference")).toBeVisible();
    await expect(editRow.getByLabel("Upload File")).toHaveCount(0);
    await expect(editRow.locator("[data-asset-tool-source-help]")).toContainText("Reference-only");
    await editRow.getByRole("button", { name: "Cancel" }).click();

    await page.getByRole("button", { name: "Add Palette References" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Palette References']");
    await expect(editRow.getByLabel("Source")).toHaveValue("Reference");
    await expect(editRow.getByLabel("Source").locator("option")).toHaveText(["Reference"]);
    await expect(editRow.getByLabel("Reference")).toBeVisible();
    await expect(editRow.getByLabel("Upload File")).toHaveCount(0);
    await expect(editRow).toContainText("No valid reference source exists.");
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Choose a reference source before saving.");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets upload writes to the project folder before creating a record and Image View renders the file", async ({ page }) => {
  resetProjectAssetFolder("image");
  expect(existsSync(projectAssetPath("image"))).toBe(false);

  const failures = await openRepoPage(page, "/toolbox/assets/index.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await page.getByRole("button", { name: "Reset Asset Library" }).click();
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await page.getByRole("button", { name: "Add Images" }).click();
    const newRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await newRow.getByLabel("Upload File").setInputFiles(uploadFile("write-view-image.png", "image/png", SMALL_PNG));
    await newRow.getByLabel("Usage").selectOption("Character");
    await newRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "write-view-image.png" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("1");

    const writtenFile = projectAssetPath("image", "write-view-image.png");
    expect(existsSync(projectAssetPath("image"))).toBe(true);
    expect(existsSync(writtenFile)).toBe(true);
    expect(readFileSync(writtenFile)).toEqual(SMALL_PNG);

    await page.locator("[data-asset-tool-row]").filter({ hasText: "write-view-image.png" }).getByRole("button", { name: "View" }).click();
    const metadata = page.locator("[data-asset-tool-metadata]");
    await expect(metadata).toContainText(`Project ID: ${DEMO_ASSET_PROJECT_ID}`);
    await expect(metadata).toContainText(`Target folder: projects/${DEMO_ASSET_PROJECT_ID}/image`);
    await expect(metadata).toContainText(`Target file path: projects/${DEMO_ASSET_PROJECT_ID}/image/write-view-image.png`);
    await expect(metadata).toContainText("Write result: Written");
    await expect(metadata).toContainText(`View path: projects/${DEMO_ASSET_PROJECT_ID}/image/write-view-image.png`);
    const preview = page.locator("[data-asset-tool-view-preview]");
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("src", new RegExp(`projects/${DEMO_ASSET_PROJECT_ID}/image/write-view-image\\.png$`));
    await expect.poll(() => preview.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets multi-file uploads create one catalog row per valid selected file with project paths and batch statuses", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await page.getByRole("button", { name: "Reset Asset Library" }).click();
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await page.getByRole("button", { name: "Add Images" }).click();
    const firstImageRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await firstImageRow.getByLabel("Upload File").setInputFiles([
      uploadFile("batch-image-a.png", "image/png", "image a"),
      uploadFile("batch-image-b.png", "image/png", "image b")
    ]);
    await firstImageRow.getByLabel("Usage").selectOption("Character");
    await firstImageRow.getByRole("button", { name: "Save" }).click();
    const uploadDialog = page.locator("[data-asset-tool-upload-dialog]");
    await expect(uploadDialog).toBeVisible();
    await expect(uploadDialog.locator("[data-asset-tool-upload-phase]")).toHaveText("Uploading");
    await expect(uploadDialog.locator("[data-asset-tool-upload-current-file]")).toContainText(/batch-image-[ab]\.png/);
    await expect(uploadDialog.locator("[data-asset-tool-upload-file-progress]")).toContainText("/ 2");
    await expect(uploadDialog.locator("[data-asset-tool-upload-total-bytes]")).not.toHaveText("0 B");
    await expect(uploadDialog.locator("[data-asset-tool-upload-bytes-uploaded]")).not.toHaveText("0 B");
    await expect(uploadDialog.locator("[data-asset-tool-upload-bps]")).not.toHaveText("0");
    await expect(uploadDialog.locator("[data-asset-tool-upload-speed]")).toContainText("/s");
    await expect(uploadDialog.locator("[data-asset-tool-upload-eta]")).toContainText("s");
    await expect(uploadDialog.locator("[data-asset-tool-upload-elapsed]")).toContainText("s");
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 2 written, 0 failed, 0 skipped, 0 warnings.");
    await expect(uploadDialog.locator("[data-asset-tool-upload-phase]")).toHaveText("Complete");
    await expect(uploadDialog.locator("[data-asset-tool-upload-progress]")).toHaveJSProperty("value", 100);
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-written]")).toHaveText("2");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-failed]")).toHaveText("0");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-skipped]")).toHaveText("0");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-warnings]")).toHaveText("0");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-image-a.png" })).toHaveCount(1);
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-image-b.png" })).toBeVisible();

    await page.locator("[data-asset-tool-row]").filter({ hasText: "batch-image-a.png" }).getByRole("button", { name: "View" }).click();
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText(/Stored path: projects\/[0-9A-HJKMNP-TV-Z]{26}\/image\/batch-image-a\.png/);
    await expect(page.locator("[data-asset-tool-batch-status='OK']").filter({ hasText: "batch-image-a.png" })).toContainText(/projects\/[0-9A-HJKMNP-TV-Z]{26}\/image\/batch-image-a\.png/);

    await addUploadBatch(page, "Images", [
      uploadFile("batch-status-ok.png", "image/png", "image ok"),
      zeroByteUploadFile("batch-status-warning.png", "image/png"),
      uploadFile("batch-status-bad.exe", "application/octet-stream", "bad image"),
      uploadFile("batch-status-ok.png", "image/png", "duplicate image ok"),
      uploadFile("batch-status-late.png", "image/png", "image late")
    ], "Icon");
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 3 written, 1 failed, 1 skipped, 1 warnings.");
    await expect(page.locator("[data-asset-tool-batch-summary]")).toContainText("2 OK, 1 WARN, 1 FAIL, 1 SKIP");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-written]")).toHaveText("3");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-failed]")).toHaveText("1");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-skipped]")).toHaveText("1");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-warnings]")).toHaveText("1");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='OK']").filter({ hasText: "batch-status-ok.png" })).toBeVisible();
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='WARN']").filter({ hasText: "batch-status-warning.png" })).toBeVisible();
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']").filter({ hasText: "batch-status-bad.exe" })).toBeVisible();
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='SKIP']").filter({ hasText: "batch-status-ok.png" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-batch-status='OK']").filter({ hasText: "batch-status-ok.png" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-batch-status='WARN']").filter({ hasText: "batch-status-warning.png" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-batch-status='FAIL']").filter({ hasText: "batch-status-bad.exe" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-batch-status='SKIP']").filter({ hasText: "batch-status-ok.png" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-status-ok.png" })).toHaveCount(1);
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-status-warning.png" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-status-late.png" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-status-bad.exe" })).toHaveCount(0);

    await addUploadBatch(page, "Audio", [
      uploadFile("batch-audio-a.wav", "audio/wav", "audio a"),
      uploadFile("batch-audio-b.mp3", "audio/mpeg", "audio b")
    ], "Music");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-audio-a.wav" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-audio-b.mp3" })).toBeVisible();
    await page.locator("[data-asset-tool-row]").filter({ hasText: "batch-audio-a.wav" }).getByRole("button", { name: "View" }).click();
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText(/Stored path: projects\/[0-9A-HJKMNP-TV-Z]{26}\/audio\/batch-audio-a\.wav/);
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText(/View path: projects\/[0-9A-HJKMNP-TV-Z]{26}\/audio\/batch-audio-a\.wav/);
    await expect(page.locator("[data-asset-tool-view-preview]")).toHaveAttribute("src", /projects\/[0-9A-HJKMNP-TV-Z]{26}\/audio\/batch-audio-a\.wav$/);

    await addUploadBatch(page, "Fonts", [
      uploadFile("batch-font-a.woff2", "font/woff2", "font a"),
      uploadFile("batch-font-b.ttf", "font/ttf", "font b")
    ], "Font");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-font-a.woff2" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-font-b.ttf" })).toBeVisible();
    await page.locator("[data-asset-tool-row]").filter({ hasText: "batch-font-a.woff2" }).getByRole("button", { name: "View" }).click();
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText(/Stored path: projects\/[0-9A-HJKMNP-TV-Z]{26}\/font\/batch-font-a\.woff2/);
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText(/View path: projects\/[0-9A-HJKMNP-TV-Z]{26}\/font\/batch-font-a\.woff2/);
    await expect(page.locator("[data-asset-tool-view-preview]")).toHaveAttribute("href", /projects\/[0-9A-HJKMNP-TV-Z]{26}\/font\/batch-font-a\.woff2$/);

    await addUploadBatch(page, "Data", [
      uploadFile("batch-data-a.json", "application/json", "{\"ok\":true}"),
      uploadFile("batch-data-b.csv", "text/csv", "name,value")
    ], "Theme");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-data-a.json" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-data-b.csv" })).toBeVisible();
    await page.locator("[data-asset-tool-row]").filter({ hasText: "batch-data-a.json" }).getByRole("button", { name: "View" }).click();
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText(/Stored path: projects\/[0-9A-HJKMNP-TV-Z]{26}\/data\/batch-data-a\.json/);
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText(/View path: projects\/[0-9A-HJKMNP-TV-Z]{26}\/data\/batch-data-a\.json/);
    await expect(page.locator("[data-asset-tool-view-preview]")).toHaveAttribute("href", /projects\/[0-9A-HJKMNP-TV-Z]{26}\/data\/batch-data-a\.json$/);
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("11");

    for (const assetType of ["Sprites", "Vectors", "Palette References"]) {
      await page.getByRole("button", { name: `Add ${assetType}` }).click();
      const editRow = page.locator(`[data-asset-tool-editing-row='__new__:${assetType}']`);
      await expect(editRow.getByLabel("Source")).toHaveValue("Reference");
      await expect(editRow.getByLabel("Upload File")).toHaveCount(0);
      await editRow.getByRole("button", { name: "Cancel" }).click();
    }

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets multi-file upload fails visibly when no current project id is available", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html?handoff=missing", {
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await page.getByRole("button", { name: "Add Images" }).click();
    const editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await expect(editRow.getByLabel("Upload File")).toHaveJSProperty("multiple", true);
    await editRow.getByLabel("Upload File").setInputFiles([
      uploadFile("missing-project-a.png", "image/png", "image a"),
      uploadFile("missing-project-b.png", "image/png", "image b")
    ]);
    await editRow.getByLabel("Usage").selectOption("Character");
    await editRow.getByRole("button", { name: "Save" }).click();
    const uploadDialog = page.locator("[data-asset-tool-upload-dialog]");
    await expect(uploadDialog).toBeVisible();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 0 written, 1 failed, 1 skipped, 0 warnings.");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-written]")).toHaveText("0");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-failed]")).toHaveText("1");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-skipped]")).toHaveText("1");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-warnings]")).toHaveText("0");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']")).toContainText("Asset add blocked: open an active game first.");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='SKIP']")).toContainText("Skipped because the project upload target is unavailable.");
    await expect(page.locator("[data-asset-tool-batch-status='FAIL']")).toContainText("Asset add blocked: open an active game first.");
    await expect(page.locator("[data-asset-tool-batch-status='SKIP']")).toContainText("Skipped because the project upload target is unavailable.");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets upload write failure is visible and creates no asset record", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html?uploadWrite=unsupported", {
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await page.getByRole("button", { name: "Reset Asset Library" }).click();
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await page.getByRole("button", { name: "Add Images" }).click();
    const editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await editRow.getByLabel("Upload File").setInputFiles([
      uploadFile("unsupported-write-a.png", "image/png", SMALL_PNG),
      uploadFile("unsupported-write-b.png", "image/png", SMALL_PNG)
    ]);
    await editRow.getByLabel("Usage").selectOption("Character");
    await editRow.getByRole("button", { name: "Save" }).click();

    const uploadDialog = page.locator("[data-asset-tool-upload-dialog]");
    await expect(uploadDialog).toBeVisible();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 0 written, 1 failed, 1 skipped, 0 warnings.");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']")).toContainText("browser file writes are not supported");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']")).toContainText(`projects/${DEMO_ASSET_PROJECT_ID}/image/unsupported-write-a.png`);
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='SKIP']")).toContainText("Skipped because the project upload target is unavailable.");
    await expect(page.locator("[data-asset-tool-batch-status='FAIL']")).toContainText("Write result: FAIL: Browser file writes are not supported");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "unsupported-write-a.png" })).toHaveCount(0);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("codex review diff artifact is readable UTF-8 text", () => {
  const reviewDiffPath = resolve(REPO_ROOT, "docs_build", "dev", "reports", "codex_review.diff");
  expect(existsSync(reviewDiffPath)).toBe(true);
  const bytes = readFileSync(reviewDiffPath);
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  expect(text).not.toContain("\u0000");
});

test("Assets launches as asset-type accordions with table row add, edit, delete, tags, and owner scope", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html", {
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await expect(page.getByRole("heading", { level: 1, name: "Assets" })).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    const runtimeReferences = await page.locator("script[src], link[href]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("src") || node.getAttribute("href") || "")
    );
    expect(runtimeReferences.join("\n")).not.toContain("archive/v1-v2");

    for (const assetType of ASSET_CATALOG_TYPES) {
      await expect(page.locator(`[data-asset-type-accordion="${assetType}"]`)).toBeVisible();
      await expect(page.locator(`[data-asset-type-table="${assetType}"]`)).toBeVisible();
      await expect(page.getByRole("button", { name: `Add ${assetType}` })).toBeVisible();
      const headers = await page.locator(`[data-asset-type-table="${assetType}"] thead th`).evaluateAll((headerNodes) =>
        headerNodes.map((header) => header.textContent?.trim() || "")
      );
      expect(headers).toEqual(REFERENCE_ASSET_TYPES.has(assetType) ? REFERENCE_COLUMNS : UPLOAD_COLUMNS);
    }
    await expect(page.locator("[data-asset-type-accordion='Color']")).toHaveCount(0);
    await expect(page.locator("[data-asset-type-accordion='Localization']")).toHaveCount(0);
    await expect(page.locator("[data-asset-type-accordion='Shader']")).toHaveCount(0);
    await expect(page.locator("[data-asset-type-accordion='Video']")).toHaveCount(0);

    await addSharedTag(page, "Hero");
    await page.goto(`${failures.server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Reset Asset Library" }).click();
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");
    await expect(page.locator("[data-asset-tool-shared-tags]")).toContainText("Hero");

    await page.getByRole("button", { name: "Add Images" }).click();
    const newRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await expect(newRow.getByLabel("Source")).toHaveValue("Upload");
    await newRow.getByLabel("Upload File").setInputFiles({
      buffer: Buffer.from("mock image"),
      mimeType: "image/png",
      name: "hero-portrait.png"
    });
    await expect(newRow.locator("[data-asset-tool-selected-file]")).toHaveText("hero-portrait.png");
    const usageOptions = await newRow.getByLabel("Usage").locator("option").evaluateAll((options) =>
      options.map((option) => option.textContent?.trim() || "")
    );
    expect(usageOptions).toEqual(USAGE_VALUES);
    expect(usageOptions).not.toContain("Projectile");
    await newRow.getByLabel("Usage").selectOption("Character");
    await newRow.getByLabel("Asset Tags").fill("Hero");
    await expect(newRow.getByLabel("Asset Tags")).toHaveAttribute("list", "assetToolTagOptions");
    await newRow.getByRole("button", { name: "Add Tag" }).click();
    await expect(newRow).toContainText("Hero");
    await newRow.getByRole("button", { name: "Save" }).click();

    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Added hero-portrait.png to Images.");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait.png" })).toContainText("Character");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait.png" })).toContainText("Upload");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait.png" })).toContainText("Hero");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("1");
    await expect(page.locator("[data-asset-tool-output-missing]")).toHaveText("None");

    await page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait.png" }).getByRole("button", { name: "View" }).click();
    await expect(page.locator("[data-asset-tool-selected]")).toHaveText("hero-portrait.png");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("Tags: Hero");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("Source: Upload");
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText("File: hero-portrait.png");

    await page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait.png" }).getByRole("button", { name: "Edit" }).click();
    const editRow = page.locator("[data-asset-tool-editing-row]");
    await expect(editRow.getByLabel("Source")).toHaveValue("Upload");
    await expect(editRow.locator("[data-asset-tool-selected-file]")).toHaveText("hero-portrait.png");
    await editRow.getByLabel("Upload File").setInputFiles({
      buffer: Buffer.from("mock image xl"),
      mimeType: "image/png",
      name: "hero-portrait-xl.png"
    });
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Updated hero-portrait-xl.png.");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait-xl.png" })).toBeVisible();

    await page.goto(`${failures.server.baseUrl}/toolbox/tags/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tags-row]").filter({ hasText: "Hero" })).toContainText("1");
    await page.locator("[data-tags-row]").filter({ hasText: "Hero" }).getByRole("button", { name: "Show usage for Hero" }).click();
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("Tool");
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("Item Name");
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("Assets");
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("hero-portrait-xl.png");

    await page.goto(`${failures.server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait-xl.png" })).toBeVisible();

    await setServerUser(failures.server, MOCK_DB_KEYS.users.user2);
    await page.goto(`${failures.server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait-xl.png" })).toHaveCount(0);

    await setServerUser(failures.server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${failures.server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait-xl.png" })).toBeVisible();
    await page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait-xl.png" }).getByRole("button", { name: "Trash" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Deleted hero-portrait-xl.png from your asset library.");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait-xl.png" })).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
