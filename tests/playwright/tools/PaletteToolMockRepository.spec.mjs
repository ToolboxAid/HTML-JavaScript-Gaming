import { expect, test } from "@playwright/test";
import {
  PALETTE_WORKSPACE_PATH,
  PALETTE_TOOL_TABLES,
  createProjectWorkspacePaletteRepository
} from "../../../toolbox/colors/palette-workspace-repository.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { expectCompactToolFormControls } from "../../helpers/toolFormControlAssertions.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const sourcePaletteRows = [
  { source: "reference", sourceLabel: "Reference", symbol: "R", hex: "#FF0000", name: "Reference Red", tags: ["warm"] },
  { source: "reference", sourceLabel: "Reference", symbol: "G", hex: "#00FF00", name: "Reference Green", tags: ["cool"] }
];

const requiredMockDbSourceOptions = [
  { id: "palette-colors008", label: "8-color set", swatchCount: 8 },
  { id: "palette-colors016", label: "16-color set", swatchCount: 16 },
  { id: "palette-colors032", label: "32-color set", swatchCount: 32 },
  { id: "w3c", label: "W3C", swatchCount: 139 },
  { id: "javascript", label: "JavaScript", swatchCount: 140 }
];

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "palette-tool",
    surface: "Palette Tool project palette runtime"
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

const palettePreviewWidths = {
  large: 54,
  medium: 44,
  small: 28
};

async function expectSinglePreviewWidth(tile, size) {
  const preview = tile.locator("[data-palette-swatch-preview]");
  const pin = tile.locator("[data-palette-pin-indicator]");
  await expect(preview).toHaveCount(1);
  await expect(pin).toHaveCount(1);
  await expect(tile).toHaveAttribute("title", /^Name: .+\nHex: #[0-9A-F]{6,8}\nSource: .+(?:\nTags: .+)?$/i);
  await expect(preview).toHaveAttribute("data-palette-swatch-size", size);
  await expect(preview).toHaveCSS("padding-left", "0px");
  const borderWidth = await preview.evaluate((node) => Number.parseFloat(getComputedStyle(node).borderLeftWidth));
  expect(borderWidth).toBeGreaterThan(0);
  expect(borderWidth).toBeLessThanOrEqual(1);
  const box = await preview.boundingBox();
  const tileBox = await tile.boundingBox();
  const pinBox = await pin.boundingBox();
  const width = box?.width || 0;
  expect(width).toBeGreaterThan(0);
  expect(width).toBeGreaterThanOrEqual(palettePreviewWidths[size] - 1);
  expect(width).toBeLessThanOrEqual(palettePreviewWidths[size] + 4);
  expect(pinBox?.x || 0).toBeGreaterThanOrEqual((tileBox?.x || 0) + (tileBox?.width || 0) - (pinBox?.width || 0) - 8);
  expect(pinBox?.y || 0).toBeLessThanOrEqual((tileBox?.y || 0) + 8);
  await tile.hover();
  await expect(tile).not.toHaveCSS("box-shadow", "none");
  return width;
}

async function expectSortButtons(page, selector) {
  const group = page.locator(selector);
  const buttons = group.locator("[data-palette-sort-key]");
  await expect(buttons).toHaveText(["Hue", "Sat", "Brit", "Name ^", "Tag"]);
  expect(await buttons.evaluateAll((nodes) => nodes.every((node) => node.classList.contains("btn--compact")))).toBe(true);
  const compactStyle = await buttons.first().evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      marginLeft: style.marginLeft
    };
  });
  expect(compactStyle.fontSize).toBe("12px");
  expect(Number.parseInt(compactStyle.fontWeight, 10)).toBeLessThanOrEqual(600);
  expect(compactStyle.marginLeft).toBe("0px");
  await expect(group.locator("[data-palette-sort-key='name']")).toHaveClass(/primary/);
  await expect(group.locator("[data-palette-sort-key='name']")).toHaveAttribute("aria-pressed", "true");
  const groupBox = await group.boundingBox();
  const firstBox = await buttons.first().boundingBox();
  expect((firstBox?.x || 0) - (groupBox?.x || 0)).toBeLessThan(8);
}

async function expectSizeButtons(page, selector) {
  const group = page.locator(selector);
  const buttons = group.locator("[data-palette-size-key]");
  await expect(buttons).toHaveText(["Small", "Medium", "Large"]);
  expect(await buttons.evaluateAll((nodes) => nodes.every((node) => node.classList.contains("btn--compact")))).toBe(true);
  await expect(group.locator("[data-palette-size-key='medium']")).toHaveClass(/primary/);
  await expect(group.locator("[data-palette-size-key='medium']")).toHaveAttribute("aria-pressed", "true");
  const groupBox = await group.boundingBox();
  const lastBox = await buttons.last().boundingBox();
  expect((groupBox?.x || 0) + (groupBox?.width || 0) - ((lastBox?.x || 0) + (lastBox?.width || 0))).toBeLessThan(8);
}

async function expectControlGroupsShareLine(page, sortSelector, sizeSelector) {
  const sortButtons = page.locator(`${sortSelector} [data-palette-sort-key]`);
  const sizeButtons = page.locator(`${sizeSelector} [data-palette-size-key]`);
  const sortFirstBox = await sortButtons.first().boundingBox();
  const sortLastBox = await sortButtons.last().boundingBox();
  const sizeFirstBox = await sizeButtons.first().boundingBox();
  const sizeLastBox = await sizeButtons.last().boundingBox();
  const sortCenter = (sortFirstBox?.y || 0) + (sortFirstBox?.height || 0) / 2;
  const sizeCenter = (sizeFirstBox?.y || 0) + (sizeFirstBox?.height || 0) / 2;
  expect(Math.abs((sortFirstBox?.y || 0) - (sortLastBox?.y || 0))).toBeLessThan(3);
  expect(Math.abs((sizeFirstBox?.y || 0) - (sizeLastBox?.y || 0))).toBeLessThan(3);
  expect(Math.abs(sortCenter - sizeCenter)).toBeLessThan(4);
}

async function expectReadableDisabledField(page, selector, value) {
  const field = page.locator(selector);
  await expect(field).toBeDisabled();
  await expect(field).toHaveValue(value);
  const style = await field.evaluate((node) => {
    const computed = getComputedStyle(node);
    return {
      bodyColor: getComputedStyle(document.body).color,
      color: computed.color,
      opacity: computed.opacity,
      textFillColor: computed.webkitTextFillColor
    };
  });
  expect(style.opacity).toBe("1");
  expect(style.color).toBe(style.bodyColor);
  expect(style.textFillColor).toBe(style.bodyColor);
}

async function expectUserHexPreview(page, state, value) {
  const preview = page.locator("[data-palette-user-hex-preview]");
  await expect(preview).toHaveCount(1);
  await expect(preview).toHaveAttribute("data-palette-preview-state", state);
  await expect(preview).toHaveAttribute("data-palette-swatch-size", "small");
  await expect(preview).toHaveValue(value);
  if (state === "invalid") {
    await expect(preview).toHaveCSS("border-top-style", "dashed");
  }
}

async function expectUserHexPreviewInHexHeader(page) {
  const hexHeader = page.locator("[data-palette-user-swatch-form] th", {
    has: page.locator("label[for='paletteHexInput']")
  });
  await expect(hexHeader.locator("[data-palette-user-hex-preview]")).toHaveCount(1);
  await expect(page.locator("[data-palette-user-swatch-form] td", {
    has: page.locator("#paletteHexInput")
  }).locator("[data-palette-user-hex-preview]")).toHaveCount(0);
  const headerOrder = await hexHeader
    .locator("label[for='paletteHexInput'], [data-palette-user-hex-preview]")
    .evaluateAll((nodes) => nodes.map((node) => node.tagName === "LABEL" ? node.textContent.trim() : node.id));
  expect(headerOrder).toEqual(["Hex", "paletteHexPreview"]);
}

async function expectSwatchRegionScrollsOnly(page, scrollSelector, controlsSelector, summarySelector) {
  const scrollRegion = page.locator(scrollSelector);
  const controls = page.locator(controlsSelector);
  const summary = page.locator(summarySelector);
  const metrics = await scrollRegion.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      clientHeight: node.clientHeight,
      overflowY: style.overflowY,
      scrollHeight: node.scrollHeight
    };
  });
  expect(metrics.overflowY).toMatch(/auto|scroll/);
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
  const controlsBefore = await controls.boundingBox();
  const summaryBefore = await summary.boundingBox();
  await scrollRegion.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  const controlsAfter = await controls.boundingBox();
  const summaryAfter = await summary.boundingBox();
  expect(Math.abs((controlsBefore?.y || 0) - (controlsAfter?.y || 0))).toBeLessThan(2);
  expect(Math.abs((summaryBefore?.y || 0) - (summaryAfter?.y || 0))).toBeLessThan(2);
}

async function expectFullscreenAccordionSplit(page) {
  const projectBox = await page.locator("[data-palette-project-accordion]").boundingBox();
  const sourceBox = await page.locator("[data-palette-source-accordion]").boundingBox();
  expect(projectBox?.height || 0).toBeGreaterThan(180);
  expect(sourceBox?.height || 0).toBeGreaterThan(180);
  expect(Math.abs((projectBox?.height || 0) - (sourceBox?.height || 0))).toBeLessThan(12);
  expect(sourceBox?.y || 0).toBeGreaterThan((projectBox?.y || 0) + (projectBox?.height || 0) - 4);
  return { projectBox, sourceBox };
}

test("Palette repository owns active project swatches without mutating invalid payloads", async () => {
  const emptyRepository = createProjectWorkspacePaletteRepository({ tables: { palette_source_swatches: [] } });
  expect(emptyRepository.sourcePaletteOptions()).toEqual([]);
  expect(emptyRepository.listSourceSwatches()).toEqual([]);

  const mockDbRepository = createProjectWorkspacePaletteRepository();
  expect(mockDbRepository.getTables().palette_source_swatches.length).toBeGreaterThan(800);
  expect(mockDbRepository.sourcePaletteOptions()).toEqual(expect.arrayContaining(requiredMockDbSourceOptions));
  expect(mockDbRepository.sourcePaletteOptions().map((source) => source.label)).toEqual(expect.arrayContaining([
    "24-color set",
    "48-color set",
    "64-color set",
    "96-color set",
    "120-color set",
    "150-color set"
  ]));

  const repository = createProjectWorkspacePaletteRepository({ sourcePaletteRows });
  const baseline = repository.getSnapshot();

  expect(baseline.palettePath).toBe(PALETTE_WORKSPACE_PATH);
  expect(Object.keys(repository.getTables()).sort()).toEqual([...PALETTE_TOOL_TABLES].sort());
  expect(repository.getTables().palette_colors).toEqual([]);
  expect(repository.getTables().palette_source_swatches).toHaveLength(2);
  expect(repository.sourcePaletteOptions()).toEqual([
    { id: "reference", label: "Reference", swatchCount: 2 }
  ]);
  expect(baseline.workspace.tools["palette-browser"].swatches).toEqual([]);
  expect(baseline.validation.status).toBe("Ready");

  const invalidInput = { symbol: "AB", hex: "#112233", name: "Invalid Symbol", tags: ["Hero"] };
  const invalidResult = repository.addSwatch(invalidInput);
  expect(invalidResult.ok).toBe(false);
  expect(invalidResult.issues.map((issue) => issue.label)).toContain("Symbol");
  expect(invalidInput.tags).toEqual(["Hero"]);
  expect(repository.getSnapshot().workspace.tools["palette-browser"].swatches).toEqual([]);

  const addResult = repository.addSwatch({
    symbol: "H",
    hex: "#123456AA",
    name: "Hero Blue",
    tags: "Hero, UI, hero"
  });
  expect(addResult.ok).toBe(true);
  expect(repository.getSnapshot().workspace.tools["palette-browser"].swatches).toEqual([
    {
      hex: "#123456AA",
      name: "Hero Blue",
      source: "user",
      symbol: "H",
      tags: []
    }
  ]);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Hero Blue", symbol: "H" });
  expect(repository.getTables().palette_colors).toHaveLength(1);
  expect(repository.getSnapshot().tableCounts).toEqual(expect.arrayContaining([
    expect.objectContaining({ rows: 1, table: "palette_colors" })
  ]));

  expect(repository.addSwatch({ symbol: "H", hex: "#654321", name: "Other" }).ok).toBe(false);
  const duplicateNameResult = repository.addSwatch({ symbol: "O", hex: "#654321", name: "Hero Blue" });
  expect(duplicateNameResult.ok).toBe(false);
  expect(duplicateNameResult.issues.map((issue) => issue.label)).toContain("Duplicate Name");
  expect(repository.addSwatch({ symbol: "O", hex: "#123456", name: "Other" }).ok).toBe(false);

  const updateResult = repository.updateSelectedSwatch({
    symbol: "J",
    hex: "#ABCDEF",
    name: "Hero Updated",
    tags: "primary"
  });
  expect(updateResult.ok).toBe(true);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({
    hex: "#ABCDEF",
    name: "Hero Updated",
    symbol: "J",
    tags: []
  });

  expect(repository.undo().ok).toBe(true);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Hero Blue", symbol: "H" });
  expect(repository.redo().ok).toBe(true);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Hero Updated", symbol: "J" });
  const tagResult = repository.updateSelectedSwatchTags(["primary"]);
  expect(tagResult.ok).toBe(true);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Hero Updated", symbol: "J", tags: ["primary"] });

  const sourceSwatch = repository.listSourceSwatches({ sourceId: "reference", sortKey: "hue" })[0];
  const pinResult = repository.pinSourceSwatch(sourceSwatch);
  expect(pinResult.ok).toBe(true);
  expect(repository.findSwatch("R")).toMatchObject({ name: "Reference Red", source: "reference", tags: [] });
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Reference Red", symbol: "R" });
  expect(repository.displaySource("reference")).toBe("Reference");
  expect(repository.listSwatches({ sortKey: "hue" }).map((swatch) => swatch.name)).toContain("Reference Red");
  const duplicatePinResult = repository.pinSourceSwatch(sourceSwatch);
  expect(duplicatePinResult.ok).toBe(true);
  expect(duplicatePinResult.message).toBe("Source swatch already pinned.");
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Reference Red", symbol: "R" });
  const pinAllResult = repository.pinSourceSwatches(repository.listSourceSwatches({ sourceId: "reference", sortKey: "hue" }));
  expect(pinAllResult.ok).toBe(true);
  expect(pinAllResult.message).toContain("1 pinned, 1 already pinned");
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Reference Green", symbol: "G" });
  expect(repository.listSwatches().filter((swatch) => swatch.source === "reference").map((swatch) => swatch.name)).toEqual([
    "Reference Green",
    "Reference Red"
  ]);
  expect(repository.listSwatches().filter((swatch) => swatch.source === "reference").every((swatch) => swatch.tags.length === 0)).toBe(true);
  const sourceCountAfterPinAll = repository.listSwatches().filter((swatch) => swatch.source === "reference").length;
  const repeatPinAllResult = repository.pinSourceSwatches(repository.listSourceSwatches({ sourceId: "reference", sortKey: "hue" }));
  expect(repeatPinAllResult.ok).toBe(true);
  expect(repeatPinAllResult.message).toContain("0 pinned, 2 already pinned");
  expect(repository.listSwatches().filter((swatch) => swatch.source === "reference")).toHaveLength(sourceCountAfterPinAll);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Reference Green", symbol: "G" });
  const batchTagResult = repository.addTagToSwatches(["J", "R"], "batch");
  expect(batchTagResult.ok).toBe(true);
  expect(batchTagResult.message).toBe("Added tag batch to 2 checked swatches.");
  expect(repository.findSwatch("J")).toMatchObject({ name: "Hero Updated", tags: ["primary", "batch"] });
  expect(repository.findSwatch("R")).toMatchObject({ name: "Reference Red", tags: ["batch"] });
  expect(repository.findSwatch("G")).toMatchObject({ name: "Reference Green", tags: [] });
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Reference Green", symbol: "G" });

  const bulkPinRepository = createProjectWorkspacePaletteRepository({ sourcePaletteRows });
  const bulkSourceSwatches = bulkPinRepository.listSourceSwatches({ sourceId: "reference", sortKey: "hue" });
  const bulkPinResult = bulkPinRepository.pinSourceSwatches(bulkSourceSwatches);
  expect(bulkPinResult.ok).toBe(true);
  expect(bulkPinRepository.getSnapshot().selectedSwatch).toMatchObject({
    name: bulkSourceSwatches.at(-1).name,
    symbol: bulkSourceSwatches.at(-1).symbol
  });
  const bulkSelectedAfterAdd = bulkPinRepository.getSnapshot().selectedSwatch;
  const bulkRepeatResult = bulkPinRepository.pinSourceSwatches(bulkSourceSwatches);
  expect(bulkRepeatResult.ok).toBe(true);
  expect(bulkRepeatResult.message).toContain("0 pinned, 2 already pinned");
  expect(bulkPinRepository.getSnapshot().selectedSwatch).toEqual(bulkSelectedAfterAdd);
  const sourceTableCount = repository.getTables().palette_source_swatches.length;
  repository.selectSwatch("G");
  const removePinnedResult = repository.removeSwatch("G");
  expect(removePinnedResult.ok).toBe(true);
  expect(removePinnedResult.message).toBe("Removed Reference Green from the active project palette.");
  expect(repository.findSwatch("G")).toBeNull();
  expect(repository.getTables().palette_colors.some((row) => row.symbol === "G")).toBe(false);
  expect(repository.getTables().palette_source_swatches).toHaveLength(sourceTableCount);
  expect(repository.getSnapshot().selectedSwatch).toBeNull();
  expect(repository.createHarmonySuggestions(repository.findSwatch("R"), {
    matchSource: "calculated",
    schemeId: "triadic"
  })).toHaveLength(2);
  const harmonySuggestion = repository.createHarmonySuggestions(repository.findSwatch("R"), {
    matchSource: "calculated",
    schemeId: "triadic"
  })[0];
  const harmonyResult = repository.addHarmonySuggestion(harmonySuggestion);
  expect(harmonyResult.ok).toBe(true);
  const harmonySwatch = repository.listSwatches().find((swatch) => swatch.name === harmonySuggestion.name);
  expect(harmonySwatch).toMatchObject({ source: "triadic", tags: [] });
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: harmonySuggestion.name, source: "triadic" });
  expect(repository.displaySource("triadic")).toBe("Triadic");
  const duplicateHarmonyResult = repository.addHarmonySuggestions([harmonySuggestion]);
  expect(duplicateHarmonyResult.ok).toBe(false);
  expect(duplicateHarmonyResult.issues).toEqual([]);
  expect(repository.listSwatches().filter((swatch) => swatch.name === harmonySuggestion.name)).toHaveLength(1);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: harmonySuggestion.name, source: "triadic" });

  const harmonyRepository = createProjectWorkspacePaletteRepository({ sourcePaletteRows });
  expect(harmonyRepository.addSwatch({ symbol: "A", hex: "#112233", name: "Base One" }).ok).toBe(true);
  expect(harmonyRepository.addSwatch({ symbol: "B", hex: "#445566", name: "Base Two" }).ok).toBe(true);
  const firstComplementary = harmonyRepository.createHarmonySuggestions(harmonyRepository.findSwatch("A"), {
    matchSource: "calculated",
    schemeId: "complementary"
  })[0];
  const secondComplementary = harmonyRepository.createHarmonySuggestions(harmonyRepository.findSwatch("B"), {
    matchSource: "calculated",
    schemeId: "complementary"
  })[0];
  expect(firstComplementary.name).toBe("Complementary 1");
  expect(secondComplementary.name).toBe("Complementary 1");
  expect(harmonyRepository.addHarmonySuggestion(firstComplementary).ok).toBe(true);
  expect(harmonyRepository.getSnapshot().selectedSwatch).toMatchObject({ name: "Complementary 1", source: "complementary" });
  expect(harmonyRepository.addHarmonySuggestion(secondComplementary).ok).toBe(true);
  expect(harmonyRepository.getSnapshot().selectedSwatch).toMatchObject({ name: "Complementary 2", source: "complementary" });
  expect(harmonyRepository.listSwatches().filter((swatch) => swatch.source === "complementary").map((swatch) => swatch.name)).toEqual([
    "Complementary 1",
    "Complementary 2"
  ]);
  const triadicSuggestions = harmonyRepository.createHarmonySuggestions(harmonyRepository.findSwatch("A"), {
    matchSource: "calculated",
    schemeId: "triadic"
  });
  const triadicAddAllResult = harmonyRepository.addHarmonySuggestions(triadicSuggestions);
  expect(triadicAddAllResult.ok).toBe(true);
  expect(triadicAddAllResult.message).toBe("Harmony add complete: 2 added, 0 skipped.");
  expect(harmonyRepository.getSnapshot().selectedSwatch).toMatchObject({ name: "Triadic 2", source: "triadic" });
  expect(harmonyRepository.listSwatches().filter((swatch) => swatch.name.startsWith("Triadic ")).map((swatch) => swatch.name)).toEqual([
    "Triadic 1",
    "Triadic 2"
  ]);
  const repeatTriadicResult = harmonyRepository.addHarmonySuggestions(triadicSuggestions);
  expect(repeatTriadicResult.ok).toBe(false);
  expect(repeatTriadicResult.message).toBe("Harmony add complete: 0 added, 2 skipped.");
  expect(repeatTriadicResult.issues).toEqual([]);
  expect(harmonyRepository.listSwatches().filter((swatch) => swatch.name.startsWith("Triadic "))).toHaveLength(2);
  expect(harmonyRepository.getSnapshot().selectedSwatch).toMatchObject({ name: "Triadic 2", source: "triadic" });

  repository.selectSwatch("R");
  repository.recordSwatchUsage({ assetId: "asset.color.red", symbol: "R", toolId: "assets" });
  const blockedRemoval = repository.removeSelectedSwatch();
  expect(blockedRemoval.ok).toBe(false);
  expect(blockedRemoval.message).toBe("Palette removal blocked: swatch is used by dependent tools.");

  const invalidPayload = {
    tools: {
      "palette-browser": {
        swatches: [{ symbol: "XX", hex: "#FFFFFF", name: "Invalid" }]
      }
    }
  };
  const invalidPayloadCopy = structuredClone(invalidPayload);
  const loadResult = repository.loadActiveProjectPalettePayload(invalidPayload);
  expect(loadResult.ok).toBe(false);
  expect(invalidPayload).toEqual(invalidPayloadCopy);
});

test("Palette Tool adds, updates, pins, validates, and shows project-owned details", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await expect(page.getByRole("heading", { name: "Colors", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Palette Colors", exact: true })).toBeVisible();
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/import json|export json/i);
    await expect(page.locator("body")).not.toContainText(/Crayola/i);
    await expect(page.locator("[data-palette-active-project]")).toHaveText("Demo Project - Game Project");
    await expect(page.locator("[data-palette-storage-path]")).toHaveText("tools.palette-browser.swatches");
    await expect(page.locator("[data-palette-count]")).toHaveText("0");
    await expect(page.locator("[data-palette-editor-form] button")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Remove Selected" })).toHaveCount(0);
    await expect(page.getByText("User Defined Swatch")).toBeVisible();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-symbol]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-hex]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-name]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-tags]")).toHaveCount(0);
    await expectUserHexPreviewInHexHeader(page);
    await expectUserHexPreview(page, "invalid", "#ffffff");
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Add User Defined" })).toBeDisabled();
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Update Selected" })).toBeDisabled();
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Clear Form" })).toBeEnabled();
    await expect(page.locator("[data-palette-selected-symbol]")).toBeDisabled();
    await expect(page.locator("[data-palette-selected-hex]")).toBeDisabled();
    await expect(page.locator("[data-palette-selected-name]")).toBeDisabled();
    await expect(page.locator("[data-palette-selected-symbol]")).toHaveValue("");
    await expect(page.locator("[data-palette-selected-hex]")).toHaveValue("");
    await expect(page.locator("[data-palette-selected-name]")).toHaveValue("");
    await expect(page.locator("[data-palette-tags]")).toBeDisabled();
    await expect(page.locator("[data-palette-tags]")).toHaveValue("");
    await expect(page.locator("[data-palette-editor-form] input[placeholder], [data-palette-user-swatch-form] input[placeholder]")).toHaveCount(0);
    await expectCompactToolFormControls(page, [
      "[data-palette-selected-symbol]",
      "[data-palette-selected-hex]",
      "[data-palette-selected-name]",
      "[data-palette-tags]",
      "[data-palette-symbol]",
      "[data-palette-hex]",
      "[data-palette-name]",
      "[data-palette-source-select]",
      "[data-palette-source-search]",
      "[data-palette-harmony-match]",
      "[data-palette-harmony-scheme]"
    ]);
    await expect(page.locator("[data-palette-user-hex-preview]")).not.toHaveClass(/tool-form-control/);
    await expect(page.locator("[data-palette-editor-tags-input-row] th")).toHaveAttribute("rowspan", "2");
    const tagInputRowBox = await page.locator("[data-palette-editor-tags-input-row]").boundingBox();
    const tagListRowBox = await page.locator("[data-palette-editor-tags-list-row]").boundingBox();
    expect(tagListRowBox?.y || 0).toBeGreaterThan((tagInputRowBox?.y || 0) + (tagInputRowBox?.height || 0) - 2);
    const tagActionLayout = await page.locator("[data-palette-editor-tags-list]").evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        columnGap: style.columnGap,
        hasTightClass: node.classList.contains("action-group--tight")
      };
    });
    expect(tagActionLayout.hasTightClass).toBe(true);
    expect(tagActionLayout.columnGap).toBe("5px");
    await expect(page.locator("[data-palette-table-counts]")).toContainText("palette_colors");
    await expect(page.locator("[data-palette-project-accordion]")).toBeVisible();
    await expect(page.locator("[data-palette-source-accordion]")).toBeVisible();
    await expect(page.locator("[data-palette-source-search]").locator("xpath=ancestor::*[@data-palette-source-scroll]")).toHaveCount(0);
    await expectSortButtons(page, "[data-palette-user-sort]");
    await expectSizeButtons(page, "[data-palette-user-size]");
    await expectSortButtons(page, "[data-palette-source-sort]");
    await expectSizeButtons(page, "[data-palette-source-size]");
    await expectControlGroupsShareLine(page, "[data-palette-user-sort]", "[data-palette-user-size]");
    await expectControlGroupsShareLine(page, "[data-palette-source-sort]", "[data-palette-source-size]");
    await expect(page.locator("[data-palette-source-select]")).toBeEnabled();
    const sourceOptionTexts = await page.locator("[data-palette-source-select] option").allTextContents();
    expect(sourceOptionTexts).toEqual(expect.arrayContaining([
      "8-color set (8)",
      "16-color set (16)",
      "32-color set (32)",
      "120-color set (120)",
      "150-color set (151)",
      "W3C (139)",
      "JavaScript (140)"
    ]));
    await page.locator("[data-palette-source-select]").selectOption("palette-colors008");
    await expect(page.locator("[data-palette-source-list]")).not.toContainText("No source palette");
    await expect(page.locator("[data-palette-source-index]")).toHaveCount(8);
    await expect(page.locator("[data-palette-source-pin-all]")).toBeEnabled();
    await expect(page.locator("[data-palette-table-counts]")).toContainText("palette_source_swatches");
    await expect(page.locator("[data-palette-user-list]")).not.toContainText(/Symbol|Name|Hex|Source|Tags/);
    await expect(page.locator("[data-palette-source-list]")).not.toContainText(/Symbol|Name|Hex|Source|Tags/);
    await page.locator("[data-palette-source-sort] [data-palette-sort-key='hue']").click();
    await expect(page.locator("[data-palette-source-sort] [data-palette-sort-key='hue']")).toHaveText("Hue ^");
    await page.locator("[data-palette-source-sort] [data-palette-sort-key='hue']").click();
    await expect(page.locator("[data-palette-source-sort] [data-palette-sort-key='hue']")).toHaveText("Hue v");
    await page.locator("[data-palette-source-size] [data-palette-size-key='small']").click();
    await expect(page.locator("[data-palette-source-size] [data-palette-size-key='small']")).toHaveClass(/primary/);
    const sourcePreviewTile = page.locator("[data-palette-source-index]").first();
    const sourceSmallWidth = await expectSinglePreviewWidth(sourcePreviewTile, "small");
    await page.locator("[data-palette-source-size] [data-palette-size-key='medium']").click();
    const sourceMediumWidth = await expectSinglePreviewWidth(sourcePreviewTile, "medium");
    expect(sourceMediumWidth).toBeGreaterThan(sourceSmallWidth);
    await page.locator("[data-palette-source-search]").fill("black");
    await expect(page.locator("[data-palette-source-index]")).toHaveCount(1);
    await page.locator("[data-palette-source-pin-all]").click();
    await expect(page.locator("[data-palette-count]")).toHaveText("1");
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Black']")).toHaveCount(1);
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Black']")).toHaveAttribute("data-palette-selected", "true");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Black");
    const blackTile = page.locator("[data-palette-user-list] [data-palette-swatch-name='Black']");
    const blackSymbol = await blackTile.getAttribute("data-palette-swatch-row");
    const blackHex = await blackTile.getAttribute("data-palette-swatch-hex");
    await expectReadableDisabledField(page, "[data-palette-selected-symbol]", blackSymbol || "");
    await expectReadableDisabledField(page, "[data-palette-selected-hex]", blackHex || "");
    await expectReadableDisabledField(page, "[data-palette-selected-name]", "Black");
    await expect(page.locator("[data-palette-tags]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-symbol]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-hex]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-name]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-symbol]")).toHaveValue("");
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-hex]")).toHaveValue("");
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-name]")).toHaveValue("");
    await expectUserHexPreview(page, "invalid", "#ffffff");
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Add User Defined" })).toBeDisabled();
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Update Selected" })).toBeDisabled();
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Clear Form" })).toBeEnabled();
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Black']")).toHaveAttribute("data-palette-swatch-tags", "");
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Black']")).toHaveAttribute("title", /^Name: Black\nHex: #[0-9A-F]{6}\nSource: 8-color set$/);
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Black']")).toHaveAttribute("data-palette-swatch-source", "8-color set");
    await expect(page.locator("[data-palette-source-index]").first()).toHaveAttribute("data-palette-pinned", "true");
    await page.locator("[data-palette-source-pin-all]").click();
    await expect(page.locator("[data-palette-count]")).toHaveText("1");
    await expect(page.locator("[data-palette-log]")).toContainText("0 pinned, 1 already pinned");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Black");
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Black']")).toHaveAttribute("data-palette-selected", "true");
    await expect(page.locator("[data-palette-harmony-choice]")).toHaveCount(0);
    await expect(page.locator("[data-palette-harmony-list]")).not.toContainText(/Complementary \d:/);
    await expect(page.locator("[data-palette-harmony-list]")).toContainText("No harmony scheme colors available.");
    await page.locator("[data-palette-user-list] [data-palette-swatch-name='Black'] [data-palette-pin-indicator]").click();
    await expect(page.locator("[data-palette-count]")).toHaveText("0");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("None");
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Black']")).toHaveCount(0);
    await expect(page.locator("[data-palette-source-index]").first()).toHaveAttribute("data-palette-pinned", "false");
    await expect(page.locator("[data-palette-log]")).toContainText("Removed Black from the active project palette.");
    await expect(page.locator("[data-palette-selected-symbol]")).toHaveValue("");
    await expect(page.locator("[data-palette-selected-hex]")).toHaveValue("");
    await expect(page.locator("[data-palette-selected-name]")).toHaveValue("");
    await expect(page.locator("[data-palette-tags]")).toBeDisabled();
    await expect(page.locator("[data-palette-tags]")).toHaveValue("");
    await expect(page.locator("[data-palette-editor-form] input[placeholder], [data-palette-user-swatch-form] input[placeholder]")).toHaveCount(0);
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-symbol]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-hex]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-name]")).toBeEnabled();
    await expectUserHexPreview(page, "invalid", "#ffffff");
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Add User Defined" })).toBeDisabled();
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Update Selected" })).toBeDisabled();
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Clear Form" })).toBeEnabled();
    await page.locator("[data-palette-source-index]").first().click();
    await expect(page.locator("[data-palette-count]")).toHaveText("1");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Black");
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Black']")).toHaveAttribute("data-palette-selected", "true");
    await expect(page.locator("[data-palette-source-index]").first()).toHaveAttribute("data-palette-pinned", "true");
    await page.locator("[data-palette-user-list] [data-palette-swatch-name='Black'] [data-palette-pin-indicator]").click();
    await expect(page.locator("[data-palette-count]")).toHaveText("0");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("None");
    await expect(page.locator("[data-palette-source-index]").first()).toHaveAttribute("data-palette-pinned", "false");
    await page.locator("[data-palette-source-search]").fill("");
    await expect(page.locator("[data-palette-source-index]")).toHaveCount(8);
    await expect(page.locator("[data-palette-harmony-choice]")).toHaveCount(0);
    await expect(page.locator("[data-palette-harmony-match] option")).toHaveText([
      "Calculated",
      "Source Palette Closest Match",
      "All Palettes Closest Match"
    ]);
    await expect(page.locator("[data-palette-harmony-scheme] option")).toHaveText([
      "Achromatic",
      "Accented Analogous",
      "Analogous",
      "Complementary",
      "Diadic",
      "Double-Complementary",
      "Double-Split-Complementary",
      "Hexadic",
      "Monochromatic",
      "Near-Complementary",
      "Polychromatic",
      "Side-Complementary",
      "Split-Complementary",
      "Square",
      "Tetradic",
      "Triadic"
    ]);
    await expect(page.locator("[data-palette-harmony-guidance]")).toContainText("Select a project or source palette color");

    await page.locator("[data-palette-symbol]").fill("HH");
    await page.locator("[data-palette-hex]").fill("#12");
    await page.locator("[data-palette-name]").fill("");
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Add User Defined" })).toBeDisabled();
    await expectUserHexPreview(page, "invalid", "#ffffff");
    await expect(page.locator("[data-palette-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Symbol");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Hex");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Name");

    await page.locator("[data-palette-symbol]").fill("H");
    await page.locator("[data-palette-hex]").fill("#123456aa");
    await page.locator("[data-palette-name]").fill("Hero Blue");
    await expectUserHexPreview(page, "valid", "#123456");
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Add User Defined" })).toBeEnabled();
    await page.getByRole("button", { name: "Add User Defined" }).click();
    await expect(page.locator("[data-palette-count]")).toHaveText("1");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-name", "Hero Blue");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-hex", "#123456AA");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("title", "Name: Hero Blue\nHex: #123456AA\nSource: custom");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-source", "custom");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-selected", "true");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-tags", "");
    await expectReadableDisabledField(page, "[data-palette-selected-symbol]", "H");
    await expectReadableDisabledField(page, "[data-palette-selected-hex]", "#123456AA");
    await expectReadableDisabledField(page, "[data-palette-selected-name]", "Hero Blue");
    await expect(page.locator("[data-palette-tags]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-symbol]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-hex]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-name]")).toBeEnabled();
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-symbol]")).toHaveValue("H");
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-hex]")).toHaveValue("#123456AA");
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-name]")).toHaveValue("Hero Blue");
    await expectUserHexPreview(page, "valid", "#123456");
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Add User Defined" })).toBeDisabled();
    await expect(page.locator("[data-palette-editor-tags-list]")).toContainText("No tags added.");
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Update Selected" })).toBeEnabled();
    await page.locator("[data-palette-symbol]").fill("K");
    await page.locator("[data-palette-hex]").fill("#654321");
    await page.locator("[data-palette-name]").fill("Hero Green");
    await expectUserHexPreview(page, "valid", "#654321");
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Add User Defined" })).toBeEnabled();
    await page.locator("[data-palette-symbol]").fill("H");
    await page.locator("[data-palette-hex]").fill("#123456AA");
    await page.locator("[data-palette-name]").fill("Hero Blue");
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Add User Defined" })).toBeDisabled();
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveCSS("outline-style", "solid");
    await expect(page.locator("[data-palette-swatch-row='H']")).not.toHaveCSS("box-shadow", "none");
    await expect(page.locator("[data-palette-swatch-row='H'] [data-palette-selected-indicator]")).toHaveCount(0);
    await expect(page.locator("[data-palette-swatch-row='H'] [data-palette-pin-indicator]")).toHaveCount(1);
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Black']")).toHaveCount(0);
    await expect(page.locator("[data-palette-user-list]")).not.toContainText(/Hero Blue|#123456AA|hero|ui|Symbol|Name|Hex|Source|Tags/);
    await expect(page.locator("[data-palette-selected-details]")).toHaveCount(0);
    await expect(page.locator("[data-palette-project-accordion]")).not.toContainText(/Symbol:|Hex:|Name:|Source:|Tags:/);
    await expect(page.locator("[data-palette-table-counts]")).toContainText("palette_colors");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Hero Blue");
    await expect(page.locator("[data-palette-harmony-add-selected]")).toHaveCount(0);
    await expect(page.locator("[data-palette-harmony-choice]")).toHaveCount(1);
    await expect(page.locator("[data-palette-harmony-list]")).not.toContainText(/Complementary \d:/);
    await expect(page.locator("[data-palette-harmony-choice]").first()).toHaveAttribute("title", /^Name: Complementary 1\nHex: #[0-9A-F]{6}\nSource: Complementary$/);
    await expect(page.locator("[data-palette-harmony-choice]").first()).toHaveAttribute("data-palette-swatch-source", "Complementary");
    await expect(page.locator("[data-palette-harmony-choice]").first()).toHaveAttribute("aria-label", /Add harmony swatch Complementary 1 #[0-9A-F]{6} from Complementary/);
    await expect(page.locator("[data-palette-harmony-choice]").first()).toHaveAttribute("data-palette-pinned", "false");
    await expect(page.locator("[data-palette-harmony-choice]").first().locator("[data-palette-pin-indicator]")).toHaveCount(1);

    await page.locator("[data-palette-tags]").fill("hero");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-tags", "hero");
    await expect(page.locator("[data-palette-editor-tags-list] [data-palette-tag-value='hero']")).toHaveCount(1);
    await page.locator("[data-palette-tags]").fill("ui");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-tags", "hero, ui");
    const tagButtons = page.locator("[data-palette-editor-tags-list] [data-palette-tag-value]");
    await expect(tagButtons).toHaveText(["hero", "ui"]);
    const tagButtonBoxes = await tagButtons.evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().top));
    expect(Math.abs(tagButtonBoxes[0] - tagButtonBoxes[1])).toBeLessThan(3);
    await page.locator("[data-palette-editor-tags-list] [data-palette-tag-value='hero']").click();
    await expect(page.locator("[data-palette-editor-tags-list] [data-palette-tag-value='hero']")).toHaveCount(0);
    await expect(page.locator("[data-palette-editor-tags-list] [data-palette-tag-value='ui']")).toHaveCount(1);
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-tags", "ui");

    const activePreviewTile = page.locator("[data-palette-swatch-row='H']");
    await page.locator("[data-palette-user-sort] [data-palette-sort-key='hue']").click();
    await expect(page.locator("[data-palette-user-sort] [data-palette-sort-key='hue']")).toHaveText("Hue ^");
    await page.locator("[data-palette-user-sort] [data-palette-sort-key='hue']").click();
    await expect(page.locator("[data-palette-user-sort] [data-palette-sort-key='hue']")).toHaveText("Hue v");

    await page.locator("[data-palette-user-size] [data-palette-size-key='small']").click();
    const activeSmallWidth = await expectSinglePreviewWidth(activePreviewTile, "small");
    await page.locator("[data-palette-user-size] [data-palette-size-key='medium']").click();
    const activeMediumWidth = await expectSinglePreviewWidth(activePreviewTile, "medium");
    await page.locator("[data-palette-user-size] [data-palette-size-key='large']").click();
    const activeLargeWidth = await expectSinglePreviewWidth(activePreviewTile, "large");
    expect(activeMediumWidth).toBeGreaterThan(activeSmallWidth);
    expect(activeLargeWidth).toBeGreaterThan(activeMediumWidth);

    await page.locator("[data-palette-tags]").fill("feature");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(page.locator("[data-palette-editor-tags-list]")).toContainText("feature");

    await page.locator("[data-palette-symbol]").fill("J");
    await page.locator("[data-palette-hex]").fill("#ABCDEF");
    await page.locator("[data-palette-name]").fill("Hero Updated");
    await page.getByRole("button", { name: "Update Selected" }).click();
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("data-palette-swatch-name", "Hero Updated");
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("data-palette-selected", "true");
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("data-palette-swatch-tags", "ui, feature");
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("title", "Name: Hero Updated\nHex: #ABCDEF\nSource: custom\nTags: ui, feature");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Hero Updated");
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-symbol]")).toHaveValue("J");
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-hex]")).toHaveValue("#ABCDEF");
    await expect(page.locator("[data-palette-user-swatch-form] [data-palette-name]")).toHaveValue("Hero Updated");
    await expectUserHexPreview(page, "valid", "#abcdef");
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Add User Defined" })).toBeDisabled();
    await expect(page.locator("[data-palette-user-list]")).not.toContainText(/Hero Updated|ui, feature|Symbol|Name|Hex|Source|Tags/);

    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-name", "Hero Blue");
    await page.getByRole("button", { name: "Redo" }).click();
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("data-palette-swatch-name", "Hero Updated");
    await page.locator("[data-palette-tags]").fill("primary");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("data-palette-swatch-tags", "ui, feature, primary");
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("title", "Name: Hero Updated\nHex: #ABCDEF\nSource: custom\nTags: ui, feature, primary");

    await page.locator("[data-palette-symbol]").fill("J");
    await page.locator("[data-palette-hex]").fill("#111111");
    await page.locator("[data-palette-name]").fill("Duplicate Symbol");
    await expectUserHexPreview(page, "valid", "#111111");
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Add User Defined" })).toBeDisabled();

    await page.getByRole("button", { name: "Clear Form" }).click();
    await expect(page.locator("[data-palette-symbol]")).toHaveValue("");
    await expect(page.locator("[data-palette-hex]")).toHaveValue("");
    await expect(page.locator("[data-palette-name]")).toHaveValue("");
    await expectUserHexPreview(page, "invalid", "#ffffff");
    await expect(page.locator("[data-palette-user-swatch-form]").getByRole("button", { name: "Add User Defined" })).toBeDisabled();
    await expect(page.locator("[data-palette-log]")).toHaveText("User defined swatch form cleared.");

    await page.locator("[data-palette-harmony-scheme]").selectOption("triadic");
    await expect(page.locator("[data-palette-harmony-choice]")).toHaveCount(2);
    await expect(page.locator("[data-palette-harmony-list]")).not.toContainText(/Triadic \d:/);
    await expect(page.locator("[data-palette-harmony-choice='1']")).toHaveAttribute("title", /^Name: Triadic 2\nHex: #[0-9A-F]{6}\nSource: Triadic$/);
    await expect(page.locator("[data-palette-harmony-choice='1']")).toHaveAttribute("data-palette-swatch-source", "Triadic");
    await expect(page.locator("[data-palette-harmony-choice='1']")).toHaveAttribute("aria-label", /Add harmony swatch Triadic 2 #[0-9A-F]{6} from Triadic/);
    await expect(page.locator("[data-palette-harmony-choice='1']")).toHaveAttribute("data-palette-pinned", "false");
    await page.locator("[data-palette-harmony-choice='1']").click();
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Triadic 2");
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Triadic 2']")).toHaveAttribute("data-palette-selected", "true");
    await expect(page.locator("[data-palette-log]")).toContainText("Saved palette to tools.palette-browser.swatches.");
    await expect(page.locator("[data-palette-count]")).toHaveText("2");
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Triadic 2']")).toHaveAttribute("data-palette-swatch-tags", "");
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Triadic 2']")).toHaveAttribute("title", /^Name: Triadic 2\nHex: #[0-9A-F]{6}\nSource: Triadic$/);
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Triadic 2']")).toHaveAttribute("data-palette-swatch-source", "Triadic");
    await page.locator("[data-palette-swatch-row='J']").click();
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Hero Updated");
    await expect(page.locator("[data-palette-harmony-choice='1']")).toHaveAttribute("data-palette-pinned", "true");
    await expect(page.locator("[data-palette-harmony-choice='1']")).toHaveAttribute("aria-label", /Remove harmony swatch Triadic 2 #[0-9A-F]{6} from Triadic/);
    await expect(page.locator("[data-palette-harmony-choice='1'] [data-palette-pin-indicator]")).toHaveCount(1);
    await page.locator("[data-palette-harmony-choice='1']").click();
    await expect(page.locator("[data-palette-harmony-choice='1']")).toHaveAttribute("data-palette-pinned", "false");
    await expect(page.locator("[data-palette-count]")).toHaveText("1");
    await page.locator("[data-palette-harmony-choice='1']").click();
    await expect(page.locator("[data-palette-count]")).toHaveText("2");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Triadic 2");
    await page.locator("[data-palette-swatch-row='J']").click();
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Hero Updated");
    await page.locator("[data-palette-harmony-add-all]").click();
    await expect(page.locator("[data-palette-log]")).toContainText("Harmony add complete: 1 added, 1 skipped.");
    await expect(page.locator("[data-palette-count]")).toHaveText("3");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Triadic 1");
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Triadic 1']")).toHaveAttribute("data-palette-selected", "true");
    await page.locator("[data-palette-swatch-row='J']").click();
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Hero Updated");
    await page.locator("[data-palette-harmony-add-all]").click();
    await expect(page.locator("[data-palette-log]")).toContainText("Harmony add complete: 0 added, 2 skipped.");
    await expect(page.locator("[data-palette-count]")).toHaveText("3");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Hero Updated");

    await page.locator("[data-palette-source-select]").selectOption("javascript");
    await expect(page.locator("[data-palette-source-index]")).toHaveCount(140);
    await page.locator("[data-palette-source-pin-all]").click();
    await expect(page.locator("[data-palette-log]")).toContainText("Pin All complete");

    await page.getByLabel("Tool Display Mode").click();
    await expect(page.locator("body")).toHaveClass(/tool-focus-mode/);
    await expect(page.locator(".tool-center-panel")).toHaveCSS("overflow-y", "hidden");
    const { projectBox, sourceBox } = await expectFullscreenAccordionSplit(page);
    expect(projectBox?.width || 0).toBeGreaterThan(300);
    expect(sourceBox?.width || 0).toBeGreaterThan(300);
    expect(Math.abs((projectBox?.width || 0) - (sourceBox?.width || 0))).toBeLessThan(80);
    await expectSwatchRegionScrollsOnly(
      page,
      "[data-palette-user-scroll]",
      "[aria-label='Active project palette controls']",
      "[data-palette-project-accordion] > summary"
    );
    await expectSwatchRegionScrollsOnly(
      page,
      "[data-palette-source-scroll]",
      "[aria-label='Source palette controls']",
      "[data-palette-source-accordion] > summary"
    );

    await page.locator("[data-palette-source-accordion] > summary").click();
    await expect(page.locator("[data-palette-source-accordion]")).not.toHaveAttribute("open", "");
    const projectOnlyBox = await page.locator("[data-palette-project-accordion]").boundingBox();
    const collapsedSourceBox = await page.locator("[data-palette-source-accordion]").boundingBox();
    expect(projectOnlyBox?.height || 0).toBeGreaterThan((projectBox?.height || 0) * 1.45);
    expect(collapsedSourceBox?.height || 0).toBeLessThan((sourceBox?.height || 0) * 0.45);

    await page.locator("[data-palette-source-accordion] > summary").click();
    await expect(page.locator("[data-palette-source-accordion]")).toHaveAttribute("open", "");
    await page.locator("[data-palette-project-accordion] > summary").click();
    await expect(page.locator("[data-palette-project-accordion]")).not.toHaveAttribute("open", "");
    const collapsedProjectBox = await page.locator("[data-palette-project-accordion]").boundingBox();
    const sourceOnlyBox = await page.locator("[data-palette-source-accordion]").boundingBox();
    expect(sourceOnlyBox?.height || 0).toBeGreaterThan((sourceBox?.height || 0) * 1.45);
    expect(collapsedProjectBox?.height || 0).toBeLessThan((projectBox?.height || 0) * 0.45);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Palette Tool batch tags checked project palette swatches", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await expect(page.getByText("Project Palette Tags")).toBeVisible();
    await expect(page.getByText("Swatch Editor")).toHaveCount(0);
    await expect(page.locator("[data-palette-clear-checked]")).toBeDisabled();

    await page.locator("[data-palette-source-select]").selectOption("palette-colors008");
    await page.locator("[data-palette-source-pin-all]").click();
    await expect(page.locator("[data-palette-count]")).toHaveText("8");
    await expect(page.locator("[data-palette-swatch-check]")).toHaveCount(8);

    const blackItem = page.locator("[data-palette-swatch-item]", {
      has: page.locator("[data-palette-swatch-name='Black']")
    });
    const brownItem = page.locator("[data-palette-swatch-item]", {
      has: page.locator("[data-palette-swatch-name='Brown']")
    });
    const blueItem = page.locator("[data-palette-swatch-item]", {
      has: page.locator("[data-palette-swatch-name='Blue']")
    });
    const blackTile = blackItem.locator("[data-palette-swatch-row]");
    const brownTile = brownItem.locator("[data-palette-swatch-row]");
    const blueTile = blueItem.locator("[data-palette-swatch-row]");
    const blackCheck = blackItem.locator("[data-palette-swatch-check]");
    const brownCheck = brownItem.locator("[data-palette-swatch-check]");

    await blackTile.click();
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Black");
    const checkBox = await blackCheck.boundingBox();
    const tileBox = await blackTile.boundingBox();
    expect((checkBox?.x || 0) - (tileBox?.x || 0)).toBeLessThan(10);
    expect((checkBox?.y || 0) - (tileBox?.y || 0)).toBeLessThan(10);

    await page.locator("[data-palette-tags]").fill("solo");
    await expect(blackTile).toHaveAttribute("data-palette-swatch-tags", "");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(blackTile).toHaveAttribute("data-palette-swatch-tags", "solo");
    await expect(brownTile).toHaveAttribute("data-palette-swatch-tags", "");
    await expect(blueTile).toHaveAttribute("data-palette-swatch-tags", "");

    await blackCheck.check();
    await brownCheck.check();
    await expect(page.locator("[data-palette-clear-checked]")).toBeEnabled();
    await page.locator("[data-palette-tags]").fill("batch");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(blackTile).toHaveAttribute("data-palette-swatch-tags", "solo, batch");
    await expect(brownTile).toHaveAttribute("data-palette-swatch-tags", "batch");
    await expect(blueTile).toHaveAttribute("data-palette-swatch-tags", "");

    await page.locator("[data-palette-clear-checked]").click();
    await expect(blackCheck).not.toBeChecked();
    await expect(brownCheck).not.toBeChecked();
    await expect(page.locator("[data-palette-clear-checked]")).toBeDisabled();

    await page.locator("[data-palette-tags]").fill("afterclear");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(blackTile).toHaveAttribute("data-palette-swatch-tags", "solo, batch, afterclear");
    await expect(brownTile).toHaveAttribute("data-palette-swatch-tags", "batch");
    await expect(blueTile).toHaveAttribute("data-palette-swatch-tags", "");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Palette Tool rejects invalid payloads before render and blocks editing without an active project", async ({ page }) => {
  const invalidFailures = await openRepoPage(page, "/toolbox/colors/index.html?palette=invalid");

  try {
    await expect(page.locator("[data-palette-log]")).toContainText("Invalid palette payload rejected before render");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Symbol must be exactly one character.");
    await expect(page.locator("[data-palette-count]")).toHaveText("0");
    expectNoPageFailures(invalidFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await invalidFailures.server.close();
  }

  const emptySourceFailures = await openRepoPage(page, "/toolbox/colors/index.html?source=empty");

  try {
    await expect(page.locator("[data-palette-source-select]")).toBeDisabled();
    await expect(page.locator("[data-palette-source-select] option")).toHaveText(["No source palette"]);
    await expect(page.locator("[data-palette-source-list]")).toContainText("No source palette found");
    await expect(page.locator("[data-palette-source-index]")).toHaveCount(0);
    await expect(page.locator("[data-palette-source-pin-all]")).toBeDisabled();
    expectNoPageFailures(emptySourceFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await emptySourceFailures.server.close();
  }

  const invalidSourceFailures = await openRepoPage(page, "/toolbox/colors/index.html?source=invalid");

  try {
    await expect(page.locator("[data-palette-source-select]")).toBeDisabled();
    await expect(page.locator("[data-palette-source-select] option")).toHaveText(["Source palettes unavailable"]);
    await expect(page.locator("[data-palette-source-list]")).toContainText("Source palette records exist, but the source dropdown is empty.");
    await expect(page.locator("[data-palette-source-index]")).toHaveCount(0);
    await expect(page.locator("[data-palette-source-pin-all]")).toBeDisabled();
    expectNoPageFailures(invalidSourceFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await invalidSourceFailures.server.close();
  }

  const missingProjectFailures = await openRepoPage(page, "/toolbox/colors/index.html?project=missing");

  try {
    await expect(page.locator("[data-palette-active-project]")).toHaveText("No active project.");
    await expect(page.locator("[data-palette-project-overlay]")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add User Defined" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Update Selected" })).toBeDisabled();
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Active Project");
    expectNoPageFailures(missingProjectFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await missingProjectFailures.server.close();
  }
});
