import { expect, test } from "@playwright/test";
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
const REFERENCE_ASSET_TYPES = new Set(["Palette References", "Data"]);

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

async function addSharedTag(page, tagName = "Hero") {
  await page.goto(`${page.url().split("/toolbox/")[0]}/toolbox/tags/index.html`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add Tag" }).click();
  const row = page.locator("[data-tags-editing-row='__new__']");
  await row.getByLabel("Tag Name").fill(tagName);
  await row.getByLabel("Description").fill(`${tagName} assets`);
  await row.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("[data-tags-row]").filter({ hasText: tagName })).toBeVisible();
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
    fileName: "hero-portrait.png",
    name: "Hero Portrait",
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

    await page.getByRole("button", { name: "Add Palette References" }).click();
    editRow = page.locator("[data-asset-tool-editing-row='__new__:Palette References']");
    await expect(editRow.getByLabel("Source")).toHaveValue("Reference");
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
