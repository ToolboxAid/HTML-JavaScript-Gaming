import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
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
const GENERATED_PROJECT_ID_PATTERN = "[0-9A-HJKMNP-TV-Z]{26}";
const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const LEGACY_FALLBACK_PROJECT_ID = ["01K8M3K0EX7", "V5A3W9Q2Y6R4T1B"].join("");
const SMALL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR42mP8z8AABQMBgMZ0X4AAAAAASUVORK5CYII=",
  "base64"
);
const projectIdsToClean = new Set();

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "asset-tool-catalog",
    surface: "Assets catalog accordions and shared Tags references"
  });
  resetLegacyFallbackProjectFolder();
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
  cleanupGeneratedProjectFolders();
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function setServerSession(server, userKey = MOCK_DB_KEYS.users.user1, modeId = "local-mem") {
  await fetch(`${server.baseUrl}/api/session/mode`, {
    body: JSON.stringify({ modeId }),
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

  const sessionUserKey = Object.prototype.hasOwnProperty.call(options, "sessionUserKey")
    ? options.sessionUserKey
    : MOCK_DB_KEYS.users.user1;
  await setServerSession(server, sessionUserKey, options.sessionModeId || "local-mem");
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
}

function projectsRoot() {
  return resolve(REPO_ROOT, "projects");
}

function projectRootNames() {
  if (!existsSync(projectsRoot())) {
    return [];
  }
  return readdirSync(projectsRoot(), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function projectRootPath(projectId) {
  return resolve(projectsRoot(), projectId);
}

function projectAssetPath(projectId, assetFolder, fileName = "") {
  return resolve(projectRootPath(projectId), assetFolder, fileName);
}

function rememberProjectId(projectId) {
  expect(projectId).toMatch(ULID_PATTERN);
  projectIdsToClean.add(projectId);
  return projectId;
}

async function projectIdFromProjectPath(page) {
  const text = await page.locator("[data-asset-tool-project-path]").textContent();
  const projectId = text?.match(new RegExp(`projects/(${GENERATED_PROJECT_ID_PATTERN})/`))?.[1] || "";
  return rememberProjectId(projectId);
}

function cleanupGeneratedProjectFolders() {
  for (const projectId of projectIdsToClean) {
    const folder = projectRootPath(projectId);
    const allowedRoot = projectsRoot();
    if (!folder.startsWith(allowedRoot)) {
      throw new Error(`Refusing to remove unexpected test project folder: ${folder}`);
    }
    rmSync(folder, { force: true, recursive: true });
  }
  projectIdsToClean.clear();
}

function resetLegacyFallbackProjectFolder() {
  rmSync(projectRootPath(LEGACY_FALLBACK_PROJECT_ID), { force: true, recursive: true });
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

async function progressValue(locator) {
  return locator.evaluate((node) => Number(node.value) || 0);
}

function addButtonNameForType(assetType) {
  return assetType === "Vectors" ? "Add Vector" : `Add ${assetType}`;
}

async function addUploadBatch(page, assetType, files, usage = "Interface") {
  await page.getByRole("button", { name: `Add ${assetType}` }).click();
  const editRow = page.locator(`[data-asset-tool-editing-row='__new__:${assetType}']`);
  await expect(editRow.getByLabel("Source")).toHaveValue("Upload");
  await expect(editRow.getByLabel("Upload File")).toHaveJSProperty("multiple", true);
  await editRow.getByLabel("Usage").selectOption(usage);
  await editRow.getByLabel("Upload File").setInputFiles(files);
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
  const repositoryProjectId = rememberProjectId(assetResult.asset.projectId);
  expect(assetResult.asset.storedPath).toBe(`projects/${repositoryProjectId}/image/hero-portrait.png`);
  expect(assetResult.asset.viewPath).toBe(`projects/${repositoryProjectId}/image/hero-portrait.png`);
  expect(assetResult.asset.writeResult).toBe("Written");
  expect(assetResult.asset.usage).toBe("Character");
  expect(assetResult.asset.tagKeys).toEqual([tagResult.tag.id]);
  const lockedUpdateResult = assetRepository.updateAssetRecord(assetResult.asset.id, {
    assetType: "Audio",
    fileContentBase64: Buffer.from("malicious replacement").toString("base64"),
    fileName: "replacement.wav",
    hasFileBytes: true,
    mimeType: "audio/wav",
    name: "Replacement",
    source: "Upload",
    tagKeys: [tagResult.tag.id],
    usage: "Icon"
  });
  expect(lockedUpdateResult.updated).toBe(true);
  expect(lockedUpdateResult.asset).toEqual(expect.objectContaining({
    assetType: "Images",
    fileName: "hero-portrait.png",
    name: "hero-portrait.png",
    path: `projects/${repositoryProjectId}/image/hero-portrait.png`,
    source: "Upload",
    storedPath: `projects/${repositoryProjectId}/image/hero-portrait.png`,
    usage: "Icon"
  }));
  expect(existsSync(projectAssetPath(repositoryProjectId, "audio", "replacement.wav"))).toBe(false);
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
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await page.getByRole("button", { name: "Add Images" }).click();
    let editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await expect(editRow.getByLabel("Source")).toHaveValue("Upload");
    await expect(editRow.getByLabel("Upload File")).toBeVisible();
    await expect(editRow.getByLabel("Source").locator("option")).toHaveText(["Upload"]);
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Choose an upload file before saving.");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await editRow.getByLabel("Usage").selectOption("Character");
    await editRow.getByLabel("Upload File").setInputFiles({
      buffer: Buffer.from("mock image"),
      mimeType: "image/png",
      name: "source-image.png"
    });
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 1 written, 0 failed, 0 skipped, 0 warnings.");
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

    await expect(page.getByRole("button", { name: "Add Data" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Add Data" })).toHaveAttribute("title", "Planned");
    await expect(page.getByRole("button", { name: "Add Vector" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Add Vector" })).toHaveAttribute("title", "Planned");

    await page.getByRole("button", { name: "Add Audio" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Audio']");
    await expect(editRow.getByLabel("Source")).toHaveValue("Upload");
    await expect(editRow.getByLabel("Upload File")).toBeVisible();
    await editRow.getByLabel("Usage").selectOption("Music");
    await editRow.getByLabel("Upload File").setInputFiles({
      buffer: Buffer.from("mock audio"),
      mimeType: "audio/wav",
      name: "source-audio.wav"
    });
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "source-audio.wav" })).toBeVisible();

    await page.getByRole("button", { name: "Add Fonts" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Fonts']");
    await expect(editRow.getByLabel("Source")).toHaveValue("Upload");
    await expect(editRow.getByLabel("Source").locator("option")).toHaveText(["Upload"]);
    await editRow.getByLabel("Usage").selectOption("Font");
    await editRow.getByLabel("Upload File").setInputFiles({
      buffer: Buffer.from("mock font"),
      mimeType: "font/woff2",
      name: "source-font.woff2"
    });
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "source-font.woff2" })).toBeVisible();

    await page.getByRole("button", { name: "Add Sprites" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Sprites']");
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

    await projectIdFromProjectPath(page);
    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets upload writes to the project folder before creating a record and Image View renders the file", async ({ page }) => {
  const projectRootsBeforeLaunch = projectRootNames();
  const failures = await openRepoPage(page, "/toolbox/assets/index.html", {
    sessionModeId: "local-db",
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");
    const projectPath = page.locator("[data-asset-tool-project-path]");
    await expect(projectPath).toHaveText("Path: No project path yet");
    expect(projectRootNames()).toEqual(projectRootsBeforeLaunch);
    expect(existsSync(projectRootPath(LEGACY_FALLBACK_PROJECT_ID))).toBe(false);
    await expect.poll(() => projectPath.evaluate((node) => getComputedStyle(node).textAlign)).toBe("center");
    const projectPathBox = await projectPath.boundingBox();
    const imagesAccordionBox = await page.locator("[data-asset-type-accordion='Images']").boundingBox();
    expect(projectPathBox?.y || 0).toBeLessThan(imagesAccordionBox?.y || Number.POSITIVE_INFINITY);

    await page.getByRole("button", { name: "Add Images" }).click();
    const newRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await newRow.getByLabel("Usage").selectOption("Character");
    await newRow.getByLabel("Upload File").setInputFiles(uploadFile("write-view-image.png", "image/png", SMALL_PNG));
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "write-view-image.png" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("1");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "write-view-image.png" })).toContainText("image/write-view-image.png");
    const uploadProjectId = await projectIdFromProjectPath(page);

    const writtenFile = projectAssetPath(uploadProjectId, "image", "write-view-image.png");
    expect(existsSync(projectAssetPath(uploadProjectId, "image"))).toBe(true);
    expect(existsSync(writtenFile)).toBe(true);
    expect(readFileSync(writtenFile)).toEqual(SMALL_PNG);

    await page.locator("[data-asset-tool-row]").filter({ hasText: "write-view-image.png" }).getByRole("button", { name: "View" }).click();
    const metadata = page.locator("[data-asset-tool-metadata]");
    await expect(metadata).toContainText(`Stored path: projects/${uploadProjectId}/image/write-view-image.png`);
    await expect(metadata).toContainText(`Project ID: ${uploadProjectId}`);
    await expect(metadata).toContainText(`Target folder: projects/${uploadProjectId}/image`);
    await expect(metadata).toContainText(`Target directory: projects/${uploadProjectId}/image`);
    await expect(metadata).toContainText(`Directory result: Directory created: projects/${uploadProjectId}/image.`);
    await expect(metadata).toContainText("Directory status: created");
    await expect(metadata).toContainText(`Target file path: projects/${uploadProjectId}/image/write-view-image.png`);
    await expect(metadata).toContainText("Write result: Written");
    await expect(metadata).toContainText(`View path: projects/${uploadProjectId}/image/write-view-image.png`);
    const preview = page.locator("[data-asset-tool-view-preview]");
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("src", new RegExp(`projects/${uploadProjectId}/image/write-view-image\\.png$`));
    await expect.poll(() => preview.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);

    await addUploadBatch(page, "Images", [
      uploadFile("write-view-image-two.png", "image/png", SMALL_PNG)
    ], "Icon");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "write-view-image-two.png" })).toBeVisible();
    expect(await projectIdFromProjectPath(page)).toBe(uploadProjectId);
    expect(existsSync(projectAssetPath(uploadProjectId, "image", "write-view-image-two.png"))).toBe(true);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets Trash deletes uploaded records and physical files with scoped failure handling", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html", {
    sessionModeId: "local-db",
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await page.getByRole("button", { name: "Add Images" }).click();
    const row = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await row.getByLabel("Usage").selectOption("Character");
    await row.getByLabel("Upload File").setInputFiles(uploadFile("trash-delete-ok.png", "image/png", SMALL_PNG));
    const uploadProjectId = await projectIdFromProjectPath(page);

    const writtenFile = projectAssetPath(uploadProjectId, "image", "trash-delete-ok.png");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "trash-delete-ok.png" })).toBeVisible();
    expect(existsSync(writtenFile)).toBe(true);

    await page.locator("[data-asset-tool-row]").filter({ hasText: "trash-delete-ok.png" }).getByRole("button", { name: "Trash" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toContainText(`Deleted file projects/${uploadProjectId}/image/trash-delete-ok.png.`);
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "trash-delete-ok.png" })).toHaveCount(0);
    expect(existsSync(writtenFile)).toBe(false);

    await page.getByRole("button", { name: "Add Images" }).click();
    const missingRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await missingRow.getByLabel("Usage").selectOption("Character");
    await missingRow.getByLabel("Upload File").setInputFiles(uploadFile("trash-delete-missing.png", "image/png", SMALL_PNG));
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "trash-delete-missing.png" })).toBeVisible();
    const missingFile = projectAssetPath(uploadProjectId, "image", "trash-delete-missing.png");
    expect(existsSync(missingFile)).toBe(true);
    rmSync(missingFile, { force: true });
    await page.locator("[data-asset-tool-row]").filter({ hasText: "trash-delete-missing.png" }).getByRole("button", { name: "Trash" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toContainText("FAIL: Upload file delete failed");
    await expect(page.locator("[data-asset-tool-log]")).toContainText("trash-delete-missing.png does not exist");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "trash-delete-missing.png" })).toHaveCount(1);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets Trash rejects uploaded delete paths outside projects", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html?deletePath=escape", {
    sessionModeId: "local-db",
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await page.getByRole("button", { name: "Add Images" }).click();
    const row = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await row.getByLabel("Usage").selectOption("Character");
    await row.getByLabel("Upload File").setInputFiles(uploadFile("trash-delete-escape.png", "image/png", SMALL_PNG));
    const uploadProjectId = await projectIdFromProjectPath(page);
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "trash-delete-escape.png" })).toBeVisible();
    const writtenFile = projectAssetPath(uploadProjectId, "image", "trash-delete-escape.png");
    expect(existsSync(writtenFile)).toBe(true);

    await page.locator("[data-asset-tool-row]").filter({ hasText: "trash-delete-escape.png" }).getByRole("button", { name: "Trash" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toContainText("FAIL: Upload file delete failed: target path must stay under /projects/<projectId>/.");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "trash-delete-escape.png" })).toHaveCount(1);
    expect(existsSync(writtenFile)).toBe(true);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets worker keeps UI responsive while server-received upload progress drives the meter", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html?uploadProgressDelayMs=0&uploadChunkSizeBytes=8&serverReceiveChunkSizeBytes=8", {
    sessionModeId: "local-db",
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await page.getByRole("button", { name: "Add Images" }).click();
    const editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await editRow.getByLabel("Usage").selectOption("Character");
    const imagesAccordion = page.locator("[data-asset-type-accordion='Images']");
    const audioAccordion = page.locator("[data-asset-type-accordion='Audio']");
    const inlineProgress = imagesAccordion.locator("[data-asset-tool-inline-upload-progress='Images']");
    const progressBar = inlineProgress.locator("[data-asset-tool-inline-upload-progress-bar]");

    await page.evaluate(() => {
      window.__assetServerProgressEvents = [];
      const readProgress = () => {
        const container = document.querySelector("[data-asset-tool-inline-upload-progress='Images']");
        const progress = container?.querySelector("[data-asset-tool-inline-upload-progress-bar]");
        const bytes = container?.querySelector("[data-asset-tool-inline-upload-bytes-uploaded]")?.textContent || "";
        const updates = container?.dataset.assetToolServerReceiveUpdates || "0";
        const value = Number(progress?.value) || 0;
        const last = window.__assetServerProgressEvents.at(-1);
        if (!last || last.bytes !== bytes || last.updates !== updates || last.value !== value) {
          window.__assetServerProgressEvents.push({
            at: Date.now(),
            bytes,
            updates,
            value
          });
        }
      };
      const observer = new MutationObserver(readProgress);
      observer.observe(document.body, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
      });
      readProgress();
      window.__assetServerProgressObserver = observer;
    });

    const workerPromise = page.waitForEvent("worker");
    await editRow.getByLabel("Upload File").setInputFiles(uploadFile("worker-progress.png", "image/png", Buffer.alloc(48, 7)));
    const worker = await workerPromise;
    expect(worker.url()).toContain("toolbox/assets/assets-upload-worker.js");

    await expect(inlineProgress).toBeVisible();
    await expect(progressBar).toHaveJSProperty("value", 0);
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-bytes-uploaded]")).toHaveText("0 B");
    await expect(inlineProgress).toHaveAttribute("data-asset-tool-server-receive-updates", "0");

    await expect.poll(async () =>
      Number(await inlineProgress.getAttribute("data-asset-tool-server-receive-updates")) || 0,
      { timeout: 3500 }
    ).toBeGreaterThanOrEqual(1);
    expect(await progressValue(progressBar)).toBeLessThan(100);
    await expect.poll(async () => Number(await inlineProgress.locator("[data-asset-tool-inline-upload-bps]").textContent()) || 0).toBeGreaterThan(0);
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-speed]")).toContainText("/s");
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-eta]")).toContainText("s");
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-elapsed]")).toContainText("s");

    const audioOpenBefore = await audioAccordion.evaluate((node) => node.open);
    await audioAccordion.locator("summary").click();
    await expect.poll(() => audioAccordion.evaluate((node) => node.open)).toBe(!audioOpenBefore);
    const scrollY = await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
      return window.scrollY;
    });
    expect(scrollY).toBeGreaterThan(0);

    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 1 written, 0 failed, 0 skipped, 0 warnings.");
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-worker]")).toHaveText("Complete");
    await expect(progressBar).toHaveJSProperty("value", 100);
    const progressEvents = await page.evaluate(() => {
      window.__assetServerProgressObserver?.disconnect?.();
      const seen = new Set();
      return (window.__assetServerProgressEvents || []).filter((event) => {
        const updates = Number(event.updates) || 0;
        if (updates <= 0 || seen.has(updates)) {
          return false;
        }
        seen.add(updates);
        return true;
      });
    });
    expect(progressEvents.length).toBeGreaterThanOrEqual(2);
    expect(progressEvents[0].bytes).toBe("8 B");
    expect(progressEvents[0].value).toBe(16);
    expect(progressEvents[1].bytes).toBe("16 B");
    expect(progressEvents[1].value).toBe(33);
    expect(progressEvents[1].at - progressEvents[0].at).toBeGreaterThanOrEqual(900);
    await expect(inlineProgress.locator("[data-asset-tool-upload-status='OK']")).toContainText("worker-progress.png");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "worker-progress.png" })).toHaveCount(1);
    await projectIdFromProjectPath(page);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets batch progress uses summed uploaded bytes across selected files", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html?uploadProgressDelayMs=180&uploadChunkSizeBytes=10", {
    sessionModeId: "local-db",
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await page.getByRole("button", { name: "Add Images" }).click();
    const editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await editRow.getByLabel("Usage").selectOption("Character");
    await editRow.getByLabel("Upload File").setInputFiles([
      uploadFile("batch-byte-a.png", "image/png", Buffer.alloc(20, 1)),
      uploadFile("batch-byte-b.png", "image/png", Buffer.alloc(20, 2))
    ]);

    const inlineProgress = page.locator("[data-asset-type-accordion='Images']")
      .locator("[data-asset-tool-inline-upload-progress='Images']");
    const progressBar = inlineProgress.locator("[data-asset-tool-inline-upload-progress-bar]");
    await expect(inlineProgress.locator("[data-asset-tool-upload-status='OK']").filter({ hasText: "batch-byte-a.png" })).toBeVisible();
    await expect.poll(() => progressValue(progressBar), { timeout: 5000 }).toBe(50);
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 2 written, 0 failed, 0 skipped, 0 warnings.");
    await expect(progressBar).toHaveJSProperty("value", 100);
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-byte-a.png" })).toHaveCount(1);
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-byte-b.png" })).toHaveCount(1);
    await projectIdFromProjectPath(page);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets multi-file uploads create one catalog row per valid selected file with project paths and batch statuses", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html?uploadProgressDelayMs=250", {
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await page.getByRole("button", { name: "Add Images" }).click();
    const firstImageRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await expect(firstImageRow.locator("[data-asset-tool-selected-file]")).toHaveText("No file chosen");
    await expect(firstImageRow).not.toContainText("No file selected");
    await firstImageRow.getByLabel("Usage").selectOption("Character");
    await firstImageRow.getByLabel("Upload File").setInputFiles([
      uploadFile("batch-image-a.png", "image/png", "image a"),
      uploadFile("batch-image-b.png", "image/png", "image b")
    ]);
    await expect(firstImageRow.locator("[data-asset-tool-selected-file]")).toHaveText("batch-image-a.png, batch-image-b.png");
    const uploadDialog = page.locator("[data-asset-tool-upload-dialog]");
    const uploadDiagnosticsAccordion = page.locator("[data-asset-tool-upload-diagnostics-accordion]");
    const statusLogAccordion = page.locator("[data-asset-tool-status-log-accordion]");
    const imagesAccordion = page.locator("[data-asset-type-accordion='Images']");
    const inlineProgress = imagesAccordion.locator("[data-asset-tool-inline-upload-progress='Images']");
    const diagnosticsBox = await uploadDiagnosticsAccordion.boundingBox();
    const statusLogBox = await statusLogAccordion.boundingBox();
    expect(diagnosticsBox?.y || 0).toBeLessThan(statusLogBox?.y || Number.POSITIVE_INFINITY);
    await expect(uploadDialog).toBeVisible();
    await expect(inlineProgress).toBeVisible();
    await expect(uploadDialog.locator("[data-asset-tool-upload-progress-details]")).toBeVisible();
    await expect(uploadDialog.locator("table[aria-label='Upload file status'] th")).toHaveText(["File", "Status"]);
    await expect(uploadDialog.locator("table[aria-label='Upload file status'] th", { hasText: "Message" })).toHaveCount(0);
    await expect(uploadDialog.locator("[data-asset-tool-upload-phase]")).toHaveText("Uploading");
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-phase]")).toHaveText("Uploading");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='OK']")).toHaveCount(0, { timeout: 100 });
    await expect(uploadDialog.locator("[data-asset-tool-upload-current-file]")).toContainText(/batch-image-[ab]\.png/);
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-current-file]")).toContainText(/batch-image-[ab]\.png/);
    await expect(uploadDialog.locator("[data-asset-tool-upload-file-progress]")).toContainText("/ 2");
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-file-progress]")).toContainText("/ 2");
    await expect(uploadDialog.locator("[data-asset-tool-upload-total-bytes]")).not.toHaveText("0 B");
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-total-bytes]")).not.toHaveText("0 B");
    await expect(uploadDialog.locator("[data-asset-tool-upload-bytes-uploaded]")).not.toHaveText("0 B");
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-bytes-uploaded]")).not.toHaveText("0 B");
    await expect(uploadDialog.locator("[data-asset-tool-upload-bps]")).not.toHaveText("0");
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-bps]")).not.toHaveText("0");
    await expect(uploadDialog.locator("[data-asset-tool-upload-speed]")).toContainText("/s");
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-speed]")).toContainText("/s");
    await expect(uploadDialog.locator("[data-asset-tool-upload-eta]")).toContainText("s");
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-eta]")).toContainText("s");
    await expect(uploadDialog.locator("[data-asset-tool-upload-elapsed]")).toContainText("s");
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-elapsed]")).toContainText("s");
    const tableBox = await imagesAccordion.locator("[data-asset-type-table='Images']").boundingBox();
    const inlineBox = await inlineProgress.boundingBox();
    expect(inlineBox?.y || 0).toBeGreaterThan(tableBox?.y || 0);
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 2 written, 0 failed, 0 skipped, 0 warnings.");
    await expect(uploadDialog.locator("[data-asset-tool-upload-compact-status]")).toHaveText("Upload summary: 2 written, 0 failed, 0 skipped, 0 warnings.");
    await expect(uploadDialog.locator("[data-asset-tool-upload-progress-details]")).toBeHidden();
    await expect(inlineProgress).toBeHidden();
    await expect(uploadDialog.locator("[data-asset-tool-upload-progress]")).toHaveJSProperty("value", 100);
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-written]")).toHaveText("2");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-failed]")).toHaveText("0");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-skipped]")).toHaveText("0");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-warnings]")).toHaveText("0");
    await expect(uploadDialog.locator("[data-asset-tool-upload-issues]")).toBeHidden();
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='OK']").filter({ hasText: "batch-image-a.png" })).toBeVisible();
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='OK']").filter({ hasText: "projects/" })).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-image-a.png" })).toHaveCount(1);
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-image-b.png" })).toBeVisible();

    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("");
    await expect(page.locator("[data-asset-tool-batch-log]")).toHaveText("");
    await expect(uploadDialog).toBeVisible();
    await expect(uploadDialog.locator("[data-asset-tool-upload-compact-status]")).toHaveText("Upload summary: 2 written, 0 failed, 0 skipped, 0 warnings.");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "batch-image-a.png" })).toHaveCount(1);

    await page.locator("[data-asset-tool-row]").filter({ hasText: "batch-image-a.png" }).getByRole("button", { name: "View" }).click();
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText(/Stored path: projects\/[0-9A-HJKMNP-TV-Z]{26}\/image\/batch-image-a\.png/);

    await addUploadBatch(page, "Images", [
      uploadFile("batch-status-ok.png", "image/png", "image ok"),
      zeroByteUploadFile("batch-status-warning.png", "image/png"),
      uploadFile("batch-status-bad.exe", "application/octet-stream", "bad image"),
      uploadFile("batch-status-ok.png", "image/png", "duplicate image ok"),
      uploadFile("batch-status-late.png", "image/png", "image late")
    ], "Icon");
    await expect(page.locator("[data-asset-tool-log]")).toHaveText(
      "Batch upload complete: 3 written, 1 failed, 1 skipped, 1 warnings.",
      { timeout: 20000 }
    );
    await expect(page.locator("[data-asset-tool-batch-summary]")).toContainText("2 OK, 1 WARN, 1 FAIL, 1 SKIP");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-written]")).toHaveText("3");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-failed]")).toHaveText("1");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-skipped]")).toHaveText("1");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-warnings]")).toHaveText("1");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='OK']").filter({ hasText: "batch-status-ok.png" })).toBeVisible();
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='WARN']").filter({ hasText: "batch-status-warning.png" })).toBeVisible();
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']").filter({ hasText: "batch-status-bad.exe" })).toBeVisible();
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='SKIP']").filter({ hasText: "batch-status-ok.png" })).toBeVisible();
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']").filter({ hasText: "projects/" })).toHaveCount(0);
    await expect(uploadDialog.locator("[data-asset-tool-upload-issue='WARN']")).toContainText("Progress could not");
    await expect(uploadDialog.locator("[data-asset-tool-upload-issue='FAIL']")).toContainText("supported by this asset table");
    await expect(uploadDialog.locator("[data-asset-tool-upload-issue='SKIP']")).toContainText("Duplicate file name in this batch.");
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

    await expect(page.locator("[data-asset-tool-count]")).toHaveText("9");
    await projectIdFromProjectPath(page);

    for (const assetType of ["Sprites", "Palette References"]) {
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

test("Assets duplicate project-path uploads fail before write and do not create duplicate records", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html?uploadProgressDelayMs=120", {
    sessionModeId: "local-db",
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await page.getByRole("button", { name: "Add Images" }).click();
    let editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await editRow.getByLabel("Usage").selectOption("Character");
    await editRow.getByLabel("Upload File").setInputFiles(uploadFile("duplicate-path.png", "image/png", SMALL_PNG));
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 1 written, 0 failed, 0 skipped, 0 warnings.");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("1");
    const uploadProjectId = await projectIdFromProjectPath(page);
    expect(existsSync(projectAssetPath(uploadProjectId, "image", "duplicate-path.png"))).toBe(true);

    await page.getByRole("button", { name: "Add Images" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await editRow.getByLabel("Usage").selectOption("Character");
    await editRow.getByLabel("Upload File").setInputFiles(uploadFile("duplicate-path.png", "image/png", SMALL_PNG));

    const uploadDialog = page.locator("[data-asset-tool-upload-dialog]");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']")).toContainText("duplicate-path.png");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']")).toContainText("FAIL");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']")).not.toContainText("projects/");
    await expect(uploadDialog.locator("[data-asset-tool-upload-issue='FAIL']")).toContainText("File already exists.");
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 0 written, 1 failed, 0 skipped, 0 warnings.");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("1");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "duplicate-path.png" })).toHaveCount(1);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets upload fails visibly when the resolved target directory would escape the project asset folder", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html?uploadPath=escape&uploadProgressDelayMs=120", {
    sessionModeId: "local-db",
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await page.getByRole("button", { name: "Add Images" }).click();
    const editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await editRow.getByLabel("Usage").selectOption("Character");
    await editRow.getByLabel("Upload File").setInputFiles(uploadFile("escape-target.png", "image/png", SMALL_PNG));

    const uploadDialog = page.locator("[data-asset-tool-upload-dialog]");
    const inlineProgress = page.locator("[data-asset-type-accordion='Images']")
      .locator("[data-asset-tool-inline-upload-progress='Images']");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']")).toContainText("escape-target.png");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']")).toContainText("FAIL");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']")).not.toContainText("projects/");
    await expect(uploadDialog.locator("[data-asset-tool-upload-issue='FAIL']")).toContainText("Upload target path is outside the project asset folder.");
    await expect(inlineProgress).toBeHidden();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 0 written, 1 failed, 0 skipped, 0 warnings.");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "escape-target.png" })).toHaveCount(0);
    const uploadProjectId = await projectIdFromProjectPath(page);
    expect(existsSync(projectAssetPath(uploadProjectId, "outside", "escape-target.png"))).toBe(false);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets authenticated upload lazily creates one project id when no current project exists", async ({ page }) => {
  const projectRootsBeforeLaunch = projectRootNames();
  const failures = await openRepoPage(page, "/toolbox/assets/index.html?handoff=missing", {
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await expect(page.locator("[data-asset-tool-project-path]")).toHaveText("Path: No project path yet");
    expect(projectRootNames()).toEqual(projectRootsBeforeLaunch);
    await page.getByRole("button", { name: "Add Images" }).click();
    const editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await expect(editRow.getByLabel("Upload File")).toHaveJSProperty("multiple", true);
    await editRow.getByLabel("Usage").selectOption("Character");
    await editRow.getByLabel("Upload File").setInputFiles([
      uploadFile("missing-project-a.png", "image/png", "image a"),
      uploadFile("missing-project-b.png", "image/png", "image b")
    ]);
    const uploadDialog = page.locator("[data-asset-tool-upload-dialog]");
    await expect(uploadDialog).toBeVisible();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 2 written, 0 failed, 0 skipped, 0 warnings.");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-written]")).toHaveText("2");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-failed]")).toHaveText("0");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-skipped]")).toHaveText("0");
    await expect(uploadDialog.locator("[data-asset-tool-upload-summary-warnings]")).toHaveText("0");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='OK']")).toHaveCount(2);
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("2");
    const uploadProjectId = await projectIdFromProjectPath(page);
    expect(existsSync(projectAssetPath(uploadProjectId, "image", "missing-project-a.png"))).toBe(true);
    expect(existsSync(projectAssetPath(uploadProjectId, "image", "missing-project-b.png"))).toBe(true);
    await page.locator("[data-asset-tool-row]").filter({ hasText: "missing-project-a.png" }).getByRole("button", { name: "View" }).click();
    await expect(page.locator("[data-asset-tool-metadata]")).toContainText(`Project ID: ${uploadProjectId}`);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets upload write failure after byte transfer is visible and creates no asset record", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/assets/index.html?uploadWrite=unsupported&uploadProgressDelayMs=100&uploadChunkSizeBytes=8", {
    sessionUserKey: MOCK_DB_KEYS.users.user1
  });

  try {
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    await page.getByRole("button", { name: "Add Images" }).click();
    const editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await editRow.getByLabel("Usage").selectOption("Character");
    await editRow.getByLabel("Upload File").setInputFiles([
      uploadFile("unsupported-write-a.png", "image/png", SMALL_PNG),
      uploadFile("unsupported-write-b.png", "image/png", SMALL_PNG)
    ]);

    const uploadDialog = page.locator("[data-asset-tool-upload-dialog]");
    const inlineProgress = page.locator("[data-asset-type-accordion='Images']")
      .locator("[data-asset-tool-inline-upload-progress='Images']");
    const progressBar = inlineProgress.locator("[data-asset-tool-inline-upload-progress-bar]");
    await expect(uploadDialog).toBeVisible();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 0 written, 1 failed, 1 skipped, 0 warnings.");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']")).toContainText("unsupported-write-a.png");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='SKIP']")).toContainText("unsupported-write-b.png");
    await expect(uploadDialog.locator("[data-asset-tool-upload-status='FAIL']")).not.toContainText("projects/");
    await expect(uploadDialog.locator("[data-asset-tool-upload-issue='FAIL']")).toContainText("This runtime cannot write upload files.");
    await expect(uploadDialog.locator("[data-asset-tool-upload-issue='SKIP']")).toContainText("Open an active game with a valid project upload target before uploading.");
    await expect.poll(() => progressValue(progressBar)).toBeGreaterThan(0);
    expect(await progressValue(progressBar)).toBeLessThan(100);
    await expect(inlineProgress.locator("[data-asset-tool-inline-upload-worker]")).toHaveText("Failed");
    await expect(page.locator("[data-asset-tool-batch-status='FAIL']")).toContainText("This runtime cannot write upload files.");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "unsupported-write-a.png" })).toHaveCount(0);
    await projectIdFromProjectPath(page);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Assets guest upload action shows account prompt and creates no record", async ({ page }) => {
  const projectRootsBeforeLaunch = projectRootNames();
  const failures = await openRepoPage(page, "/toolbox/assets/index.html", {
    sessionUserKey: ""
  });

  try {
    await expect(page.locator("[data-asset-tool-project-path]")).toHaveText("Path: No project path yet");
    const startingCount = await page.locator("[data-asset-tool-count]").textContent();
    await expect(page.getByRole("button", { name: "Add Images" })).toBeEnabled();
    await page.getByRole("button", { name: "Add Images" }).click();
    const editRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await editRow.getByLabel("Usage").selectOption("Character");
    await editRow.getByLabel("Upload File").setInputFiles(uploadFile("guest-upload.png", "image/png", SMALL_PNG));

    const prompt = page.locator("[data-asset-tool-account-prompt]");
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText("Uploads require a Game Foundry account.");
    await expect(prompt.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(prompt.getByRole("link", { name: "Create Account" })).toBeVisible();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Uploads require a Game Foundry account.");
    await expect(page.locator("[data-asset-tool-count]")).toHaveText(startingCount || "0");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "guest-upload.png" })).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-project-path]")).toHaveText("Path: No project path yet");
    expect(projectRootNames()).toEqual(projectRootsBeforeLaunch);

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
    await expect(page.locator("[data-asset-tool-project-path]")).toHaveText("Path: No project path yet");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    const runtimeReferences = await page.locator("script[src], link[href]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("src") || node.getAttribute("href") || "")
    );
    expect(runtimeReferences.join("\n")).not.toContain("archive/v1-v2");

    for (const assetType of ASSET_CATALOG_TYPES) {
      await expect(page.locator(`[data-asset-type-accordion="${assetType}"]`)).toBeVisible();
      await expect(page.locator(`[data-asset-type-table="${assetType}"]`)).toBeVisible();
      await expect(page.getByRole("button", { name: addButtonNameForType(assetType) })).toBeVisible();
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
    await addSharedTag(page, "Rare");
    await page.goto(`${failures.server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");
    await expect(page.locator("[data-asset-tool-shared-tags]")).toContainText("Hero");

    await page.getByRole("button", { name: "Add Images" }).click();
    const newRow = page.locator("[data-asset-tool-editing-row='__new__:Images']");
    await expect(newRow.getByLabel("Source")).toHaveValue("Upload");
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
    await newRow.getByLabel("Upload File").setInputFiles({
      buffer: Buffer.from("mock image"),
      mimeType: "image/png",
      name: "hero-portrait.png"
    });

    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Batch upload complete: 1 written, 0 failed, 0 skipped, 0 warnings.");
    await projectIdFromProjectPath(page);
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
    await expect(editRow.getByLabel("Source")).toHaveCount(0);
    await expect(editRow.getByLabel("Upload File")).toHaveCount(0);
    await expect(editRow.getByLabel("Reference")).toHaveCount(0);
    await expect(editRow.getByLabel("Asset Type")).toHaveCount(0);
    await expect(editRow).toContainText("Upload");
    await expect(editRow).toContainText("hero-portrait.png");
    await expect(editRow).not.toContainText("projects/");
    await editRow.getByLabel("Usage").selectOption("Icon");
    await editRow.getByLabel("Asset Tags").fill("Rare");
    await editRow.getByRole("button", { name: "Add Tag" }).click();
    await expect(editRow).toContainText("Rare");
    await editRow.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toHaveText("Updated hero-portrait.png.");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait.png" })).toContainText("Icon");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait.png" })).toContainText("Rare");

    await page.goto(`${failures.server.baseUrl}/toolbox/tags/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-tags-row]").filter({ hasText: "Hero" })).toContainText("1");
    await page.locator("[data-tags-row]").filter({ hasText: "Hero" }).getByRole("button", { name: "Show usage for Hero" }).click();
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("Tool");
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("Item Name");
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("Assets");
    await expect(page.locator("[data-tags-usage-row='hero']")).toContainText("hero-portrait.png");

    await page.goto(`${failures.server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait.png" })).toBeVisible();

    await setServerUser(failures.server, MOCK_DB_KEYS.users.user2);
    await page.goto(`${failures.server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait.png" })).toHaveCount(0);

    await setServerUser(failures.server, MOCK_DB_KEYS.users.user1);
    await page.goto(`${failures.server.baseUrl}/toolbox/assets/index.html`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait.png" })).toBeVisible();
    await page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait.png" }).getByRole("button", { name: "Trash" }).click();
    await expect(page.locator("[data-asset-tool-log]")).toContainText("Deleted hero-portrait.png from your asset library.");
    await expect(page.locator("[data-asset-tool-row]").filter({ hasText: "hero-portrait.png" })).toHaveCount(0);
    await expect(page.locator("[data-asset-tool-count]")).toHaveText("0");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
