import { expect, test } from "@playwright/test";
import { MOCK_DB_KEYS } from "../../../../api/persistence/mock-db-store.js";
import {
  PALETTE_WORKSPACE_PATH,
  PALETTE_TOOL_TABLES,
  createGameWorkspacePaletteRepository,
  validatePaletteWorkspacePayload
} from "../../../../api/persistence/tool-repositories/palette-workspace-repository.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { expectCompactToolFormControls } from "../../helpers/toolFormControlAssertions.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const expectedThemeTypes = {
  Nature: ["Forest", "Jungle", "Desert", "Mountain", "Arctic", "Swamp", "Ocean", "Tropical"],
  ROYGBIV: ["ROYGBIV"],
  Floral: ["Rose Garden", "Spring Bloom", "Wildflowers", "Lavender Field", "Autumn Harvest"],
  Water: ["Deep Ocean", "Tropical Reef", "River", "Lake", "Storm Sea", "Frozen Water"],
  Elements: ["Fire", "Ice", "Earth", "Air", "Lightning", "Poison", "Crystal"],
  Fantasy: ["Medieval", "Dwarven", "Elven", "Dark Kingdom", "Magic", "Dragon"],
  "Sci-Fi": ["Space", "Cyberpunk", "Alien World", "Futuristic City", "Robot Factory"],
  Horror: ["Haunted House", "Gothic", "Blood Moon", "Undead", "Lovecraft"],
  Human: ["Skin Tones", "Hair Tones", "Eye Tones", "Clothing Support", "Shadow Highlight Support", "Human"],
  Modern: ["City", "Industrial", "Military", "Construction", "Sports"],
  Arcade: ["Arcade 1978", "Arcade 1980", "Arcade 1985", "Arcade 1990"],
  "8-Bit": ["NES Inspired", "Master System Inspired", "ZX Spectrum Inspired", "Commodore 64 Inspired", "Game Boy Inspired"],
  "16-Bit": ["SNES Inspired", "Genesis Inspired", "TurboGrafx Inspired", "Neo Geo Inspired"],
  "32/64-Bit": ["PlayStation Inspired", "Nintendo 64 Inspired", "Saturn Inspired"],
  Computer: ["DOS VGA", "EGA", "CGA", "Amiga"]
};

const optionSorter = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base"
});

function sortedLabels(labels) {
  return [...labels].sort((left, right) => optionSorter.compare(left, right));
}

const expectedVariants = [
  "Full",
  "4 colors",
  "8 colors",
  "16 colors",
  "32 colors",
  "Color Blind Safe",
  "Dawn",
  "Day",
  "Dusk",
  "Grayscale",
  "High Contrast",
  "Night",
  "Print Friendly",
  "Summer",
  "Winter"
];

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "palette-tool",
    surface: "Colors project swatches runtime"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

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

  if (options.sessionUserKey !== undefined) {
    await fetch(`${server.baseUrl}/api/session/mode`, {
      body: JSON.stringify({ modeId: options.sessionModeId || "local-db" }),
      headers: { "content-type": "application/json" },
      method: "POST"
    });
    await fetch(`${server.baseUrl}/api/session/user`, {
      body: JSON.stringify({ userKey: options.sessionUserKey || "" }),
      headers: { "content-type": "application/json" },
      method: "POST"
    });
  }

  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}${pathName}`, { waitUntil: "networkidle" });
  return { consoleErrors, failedRequests, pageErrors, server };
}

function expectNoPageFailures(failures) {
  expect(failures.failedRequests).toEqual([]);
  expect(failures.pageErrors).toEqual([]);
  expect(failures.consoleErrors).toEqual([]);
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

async function setGeneratorSteps(page, value) {
  const control = page.locator("[data-palette-generator-steps]");
  await control.fill(String(value));
  await expect(control).toHaveValue(String(value));
}

async function setGeneratorColors(page, value) {
  const control = page.locator("[data-palette-generator-colors]");
  await control.fill(String(value));
  await expect(control).toHaveValue(String(value));
}

function swatchTileByName(page, name) {
  const escapedName = String(name).replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  return page.locator(`[data-palette-user-list] [data-palette-swatch-key][data-palette-swatch-name="${escapedName}"]`);
}

async function fillUserSwatch(page, { hex, name }) {
  await page.locator("[data-palette-hex]").fill(hex);
  await page.locator("[data-palette-name]").fill(name);
}

async function addUserSwatch(page, swatch) {
  await fillUserSwatch(page, swatch);
  await expect(page.locator("[data-palette-add]")).toBeEnabled();
  await page.locator("[data-palette-add]").click();
  await expect(swatchTileByName(page, swatch.name)).toHaveCount(1);
}

async function currentPreviewHexes(page, row) {
  return page.locator(`[data-palette-generator-preview-row='${row}'] [data-palette-generator-color]`).evaluateAll((swatches) => (
    swatches.map((swatch) => swatch.dataset.paletteGeneratorColor.toUpperCase())
  ));
}

function hexLightness(hex) {
  const normalized = String(hex || "").replace("#", "");
  const values = [0, 2, 4].map((start) => Number.parseInt(normalized.slice(start, start + 2), 16) / 255);
  const max = Math.max(...values);
  const min = Math.min(...values);
  return (max + min) / 2;
}

async function columnLightnessSpread(page, column = 0) {
  const rows = await page.locator("[data-palette-generator-preview-row]").count();
  const top = (await currentPreviewHexes(page, 0))[column];
  const center = (await currentPreviewHexes(page, Math.floor(rows / 2)))[column];
  const bottom = (await currentPreviewHexes(page, rows - 1))[column];
  const topLightness = hexLightness(top);
  const centerLightness = hexLightness(center);
  const bottomLightness = hexLightness(bottom);
  return {
    bottom,
    bottomDistance: Math.abs(centerLightness - bottomLightness),
    bottomLightness,
    center,
    centerLightness,
    spread: Math.abs(topLightness - bottomLightness),
    top,
    topDistance: Math.abs(topLightness - centerLightness),
    topLightness
  };
}

async function expectPickerRowsToHaveColumnCount(page, columns) {
  const counts = await page.locator("[data-palette-generator-preview-row]").evaluateAll((rows) => (
    rows.map((row) => row.children.length)
  ));
  expect(counts.length).toBeGreaterThan(0);
  expect(counts).toEqual(counts.map(() => columns));
}

async function visiblePaletteNames(page) {
  return page.locator("[data-palette-user-list] [data-palette-swatch-key]").evaluateAll((swatches) => (
    swatches.map((swatch) => swatch.dataset.paletteSwatchName)
  ));
}

async function expectSortToggle(page, key, label) {
  const button = page.locator(`[data-palette-user-sort] [data-palette-sort-key='${key}']`);
  await button.click();
  let ascending = [];
  let descending = [];
  if ((await button.textContent())?.includes("^")) {
    ascending = await visiblePaletteNames(page);
    await button.click();
    await expect(button).toHaveText(`${label} v`);
    descending = await visiblePaletteNames(page);
  } else {
    await expect(button).toHaveText(`${label} v`);
    descending = await visiblePaletteNames(page);
    await button.click();
    await expect(button).toHaveText(`${label} ^`);
    ascending = await visiblePaletteNames(page);
  }
  expect(ascending).toEqual([...descending].reverse());
}

test("Palette repository owns project swatches and protects invalid payloads", async () => {
  const repository = createGameWorkspacePaletteRepository();
  const baseline = repository.getSnapshot();

  expect(baseline.palettePath).toBe(PALETTE_WORKSPACE_PATH);
  expect(Object.keys(repository.getTables()).sort()).toEqual([...PALETTE_TOOL_TABLES].sort());
  expect(repository.getTables().palette_colors).toEqual([]);
  expect(repository.getTables().palette_source_swatches).toBeUndefined();
  expect(baseline).not.toHaveProperty("sourcePaletteOptions");
  expect(baseline).not.toHaveProperty("sourcePaletteRecordCount");
  expect(baseline.workspace.tools["palette-browser"].swatches).toEqual([]);
  expect(baseline.validation.status).toBe("Ready");

  const invalidInput = { hex: "#12", name: "", tags: ["Hero"] };
  const invalidResult = repository.addSwatch(invalidInput);
  expect(invalidResult.ok).toBe(false);
  expect(invalidResult.issues.map((issue) => issue.label)).toEqual(expect.arrayContaining(["Hex", "Name"]));
  expect(invalidInput.tags).toEqual(["Hero"]);
  expect(repository.getSnapshot().workspace.tools["palette-browser"].swatches).toEqual([]);

  expect(repository.addSwatch({ hex: "#123456AA", name: "Hero Blue" }).ok).toBe(true);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Hero Blue" });
  const heroKey = repository.getSnapshot().selectedSwatch.key;
  expect(heroKey).toBeTruthy();
  expect(repository.getTables().palette_colors).toHaveLength(1);
  expect(repository.getSnapshot().tableCounts).toEqual(expect.arrayContaining([
    expect.objectContaining({ rows: 1, table: "palette_colors" })
  ]));

  expect(repository.addSwatch({ hex: "#FF0000", name: "Reference Red", source: "reference" }).ok).toBe(true);
  const referenceKey = repository.getSnapshot().selectedSwatch.key;

  const tagResult = repository.addTagToSwatches([heroKey, referenceKey], "batch");
  expect(tagResult.ok).toBe(true);
  expect(repository.findSwatch(heroKey)).toMatchObject({ name: "Hero Blue", tags: ["batch"] });
  expect(repository.findSwatch(referenceKey)).toMatchObject({ name: "Reference Red", tags: ["batch"] });

  const noSymbolPayloadValidation = validatePaletteWorkspacePayload({
    tools: {
      "palette-browser": {
        swatches: [
          { key: "symbol-free-swatch", hex: "#224466", name: "Symbol Free Swatch", tags: [] }
        ]
      }
    }
  });
  expect(noSymbolPayloadValidation.valid).toBe(true);
  expect(noSymbolPayloadValidation.normalized.tools["palette-browser"].swatches[0]).toMatchObject({
    hex: "#224466",
    key: "symbol-free-swatch",
    name: "Symbol Free Swatch"
  });

  const lifecycleRepository = createGameWorkspacePaletteRepository();
  const lifecycleAdd = lifecycleRepository.addSwatch({ hex: "#224466", name: "Lifecycle Blue" });
  expect(lifecycleAdd.ok).toBe(true);
  const lifecycleKey = lifecycleAdd.snapshot.selectedSwatch.key;
  expect(lifecycleRepository.updateSelectedSwatch({ hex: "#224477", name: "Lifecycle Updated" }).ok).toBe(true);
  expect(lifecycleRepository.findSwatch(lifecycleKey)).toMatchObject({ hex: "#224477", name: "Lifecycle Updated" });
  expect(lifecycleRepository.removeSwatch(lifecycleKey).ok).toBe(true);
  expect(lifecycleRepository.findSwatch(lifecycleKey)).toBeNull();
  const lifecycleGeneratedSwatch = { hex: "#FF6600", key: "runtime-generated-orange", name: "Runtime Generated Orange", source: "generated" };
  expect(lifecycleRepository.pinSourceSwatch(lifecycleGeneratedSwatch).ok).toBe(true);
  expect(lifecycleRepository.findSwatch(lifecycleGeneratedSwatch.key)).toMatchObject({ name: lifecycleGeneratedSwatch.name });
  expect(lifecycleRepository.removeSwatch(lifecycleGeneratedSwatch.key).ok).toBe(true);
  expect(lifecycleRepository.findSwatch(lifecycleGeneratedSwatch.key)).toBeNull();
  lifecycleRepository.addSwatch({ hex: "#667788", name: "Clearable Swatch" });
  lifecycleRepository.clearProjectData();
  expect(lifecycleRepository.getTables().palette_colors).toEqual([]);

  const invalidPayload = {
    tools: {
      "palette-browser": {
        swatches: [{ hex: "#12", name: "" }]
      }
    }
  };
  const invalidPayloadCopy = structuredClone(invalidPayload);
  const loadResult = repository.loadActiveProjectPalettePayload(invalidPayload);
  expect(loadResult.ok).toBe(false);
  expect(invalidPayload).toEqual(invalidPayloadCopy);
});

test("Colors adds, updates, validates, and shows project-owned swatches", async ({ page }) => {
  test.setTimeout(120000);
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await expect(page).toHaveTitle("Colors - GameFoundryStudio");
    await expect(page.getByRole("heading", { name: "Colors", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Colors", level: 2 })).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Palette", exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Selected Swatches", exact: true })).toHaveCount(0);
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/import json|export json|Crayola/i);
    await expect(page.getByText("Palette Tool")).toHaveCount(0);
    await expect(page.getByText("Palette Browser")).toHaveCount(0);
    await expect(page.getByText("Palette Generator")).toHaveCount(0);
    await expect(page.getByText("Palette Preview")).toHaveCount(0);
    await expect(page.getByText("Palette Validation")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("tools.palette-browser");
    await expect(page.locator("[data-palette-source-select], [data-palette-source-search], [data-palette-source-pin-all]")).toHaveCount(0);
    await expect(page.locator("[data-palette-active-project]")).toHaveText("Demo Project - Game Project");
    await expect(page.locator("[data-palette-storage-path]")).toHaveText("Colors storage contract active.");
    await expect(page.locator("[data-palette-count]")).toHaveText("0");
    await expect(page.locator("[data-palette-editor-form] button")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Remove Selected" })).toHaveCount(0);
    await expect(page.getByText("Project Palette Tags")).toHaveCount(0);
    await expect(page.getByText("Defined Swatch Selector", { exact: true })).toBeVisible();
    await expect(page.getByText("Picker Swatches", { exact: true })).toBeVisible();
    await expect(page.locator("[data-palette-project-accordion] > summary")).toContainText("Project Swatches");
    await expect(page.locator("[data-palette-preview-accordion] > summary > span").first()).toHaveText("Picker Preview");
    await expect(page.locator(".tool-column:last-child details.vertical-accordion > summary").filter({ hasText: "Swatch Validation" })).toHaveCount(1);
    await expect(page.locator("[data-palette-tags-list]")).toBeVisible();
    await expect(page.getByText("Swatch Editor")).toHaveCount(0);
    await expect(page.locator("[data-palette-clear-checked]")).toBeDisabled();
    const tagEditorLayout = await page.locator("[data-palette-clear-tag-filters]").evaluate((clearFilters) => {
      const tagsAccordion = clearFilters.closest("details");
      const tagInput = tagsAccordion.querySelector("[data-palette-tags]");
      const clearChecked = tagsAccordion.querySelector("[data-palette-clear-checked]");
      const columnHeader = tagsAccordion.closest(".tool-column").querySelector(".tool-column-header h2");
      return {
        clearCheckedTop: Math.round(clearChecked.getBoundingClientRect().top),
        clearFiltersTop: Math.round(clearFilters.getBoundingClientRect().top),
        columnHeading: columnHeader.textContent.trim(),
        tagInputTop: Math.round(tagInput.getBoundingClientRect().top)
      };
    });
    expect(tagEditorLayout.columnHeading).toBe("Colors");
    expect(tagEditorLayout.clearFiltersTop).toBeLessThan(tagEditorLayout.tagInputTop);
    expect(tagEditorLayout.tagInputTop).toBeLessThan(tagEditorLayout.clearCheckedTop);

    await expectCompactToolFormControls(page, [
      "[data-palette-selected-hex]",
      "[data-palette-selected-name]",
      "[data-palette-tags]",
      "[data-palette-hex]",
      "[data-palette-name]",
      "[data-palette-theme-collection]",
      "[data-palette-generator-type]",
      "[data-palette-generator-variant]",
      "[data-palette-generator-colors]",
      "[data-palette-generator-steps]",
      "[data-palette-harmony-match]",
      "[data-palette-harmony-scheme]"
    ]);

    await expectUserHexPreview(page, "invalid", "#ffffff");
    await expect(page.locator("[data-palette-add]")).toBeDisabled();
    await expect(page.locator("[data-palette-update]")).toBeDisabled();
    await expect(page.locator("[data-palette-clear]")).toBeEnabled();
    await expect(page.locator("[data-palette-add]")).toHaveClass("btn");
    await expect(page.locator("[data-palette-update]")).toHaveClass("btn");
    await expect(page.locator("[data-palette-clear]")).toHaveClass("btn");
    await expect(page.locator("[data-palette-tags]")).toBeDisabled();

    await fillUserSwatch(page, { hex: "#12", name: "" });
    await expect(page.locator("[data-palette-add]")).toBeDisabled();
    await expectUserHexPreview(page, "invalid", "#ffffff");
    await expect(page.locator("[data-palette-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Hex");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Name");

    await addUserSwatch(page, { hex: "#123456aa", name: "Hero Blue" });
    await expect(page.locator("[data-palette-count]")).toHaveText("1");
    const heroTile = swatchTileByName(page, "Hero Blue");
    await expect(heroTile).toHaveAttribute("data-palette-swatch-hex", "#123456AA");
    await expect(heroTile).toHaveAttribute("title", "Name: Hero Blue\nHex: #123456AA\nTheme: User Defined\nPalette Type: Custom");
    await expect(heroTile).toHaveAttribute("data-palette-metadata-hex", "#123456AA");
    await expect(heroTile).toHaveAttribute("data-palette-metadata-theme-collection", "User Defined");
    await expect(heroTile).toHaveAttribute("data-palette-selected", "true");
    const selectedOutline = await heroTile.evaluate((tile) => {
      const computed = getComputedStyle(tile);
      return {
        outlineOffset: Number.parseFloat(computed.outlineOffset),
        transform: computed.transform
      };
    });
    expect(selectedOutline.outlineOffset).toBeLessThanOrEqual(0);
    expect(selectedOutline.transform).toBe("none");
    await expectReadableDisabledField(page, "[data-palette-selected-hex]", "#123456AA");
    await expectReadableDisabledField(page, "[data-palette-selected-name]", "Hero Blue");
    await expect(page.locator("[data-palette-tags]")).toBeEnabled();
    await expect(page.locator("[data-palette-update]")).toBeEnabled();

    await page.locator("[data-palette-tags]").fill("hero");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(heroTile).toHaveAttribute("data-palette-swatch-tags", "hero");
    await page.locator("[data-palette-tags]").fill("ui");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(heroTile).toHaveAttribute("data-palette-swatch-tags", "hero, ui");
    await expect(page.locator("[data-palette-editor-tags-list] [data-palette-tag-value]")).toHaveText(["hero", "ui"]);

    await page.locator("[data-palette-hex]").fill("#ABCDEF");
    await page.locator("[data-palette-name]").fill("Hero Updated");
    await page.locator("[data-palette-update]").click();
    await expect(swatchTileByName(page, "Hero Updated")).toHaveAttribute("data-palette-swatch-name", "Hero Updated");
    await expect(swatchTileByName(page, "Hero Updated")).toHaveAttribute("data-palette-swatch-tags", "hero, ui");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Hero Updated");
    await expect(page.locator("[data-palette-table-counts]")).toContainText("Project Swatches");
    await expect(page.locator("[data-palette-table-counts]")).not.toContainText("palette_colors");

    await page.locator("[data-palette-harmony-match]").selectOption("all");
    await page.locator("[data-palette-harmony-scheme]").selectOption("triadic");
    await expect(page.locator("[data-palette-harmony-choice]").first()).toBeVisible();
    await expect(page.locator("[data-palette-harmony-choice]").first()).toHaveAttribute("title", /Nature Forest Full/);
    await page.locator("[data-palette-harmony-choice]").first().click();
    await expect(page.locator("[data-palette-count]")).toHaveText("2");
    await expect(page.locator("[data-palette-selected-summary]")).toContainText("Triadic");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Colors renders curated swatch selector controls and live preview", async ({ page }) => {
  test.setTimeout(120000);
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await expect(page.locator("[data-palette-project-accordion] > summary")).toContainText("Project Swatches");
    await expect(page.locator("[data-palette-preview-accordion] > summary > span").first()).toHaveText("Picker Preview");
    const accordionOrder = await page.locator("[data-palette-picker-accordion]").evaluate((pickerAccordion) => {
      const gameWorkspaceAccordion = pickerAccordion.previousElementSibling;
      return {
        pickerTop: Math.round(pickerAccordion.getBoundingClientRect().top),
        gameWorkspaceTop: Math.round(gameWorkspaceAccordion.getBoundingClientRect().top)
      };
    });
    expect(accordionOrder.gameWorkspaceTop).toBeLessThan(accordionOrder.pickerTop);
    await expect(page.locator("[data-palette-picker-accordion]")).toBeVisible();
    await expect(page.locator("[data-palette-project-accordion] [data-palette-generator-preview]")).toHaveCount(0);
    await expect(page.locator("[data-palette-picker-accordion] [data-palette-generator-preview]")).toHaveCount(0);
    await expect(page.locator("[data-palette-preview-accordion] [data-palette-generator-preview]")).toHaveCount(1);
    await expect(page.locator("[data-palette-preview-accordion]")).toHaveClass(/accordion-fill-panel/);
    await expect(page.locator("[data-palette-preview-accordion] summary [data-palette-generator-preview-status]")).toHaveText(/Available Picker Swatches \(\d+\)/);
    const previewStatusWeight = await page.locator("[data-palette-preview-accordion] summary [data-palette-generator-preview-status]").evaluate((status) => (
      getComputedStyle(status).fontWeight
    ));
    expect(Number.parseInt(previewStatusWeight, 10)).toBeLessThan(700);
    await expect(page.locator("[data-palette-preview-accordion] > .accordion-body > [data-palette-generator-preview-status]")).toHaveCount(0);
    await expect(page.getByText("Defined Swatch Selector")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Swatch Type / Theme" })).toHaveCount(0);
    await expect(page.locator("[data-palette-source-select], [data-palette-source-search], [data-palette-source-pin-all]")).toHaveCount(0);

    await expect(page.locator("[data-palette-theme-collection] option")).toHaveText(sortedLabels(Object.keys(expectedThemeTypes)));
    await expect(page.locator("[data-palette-generator-type] option")).toHaveText(sortedLabels(expectedThemeTypes.Nature));
    await expect(page.locator("[data-palette-generator-variant] option")).toHaveText(expectedVariants);
    await expect(page.locator("[data-palette-generator-colors]")).toHaveAttribute("type", "number");
    await expect(page.locator("[data-palette-generator-colors]")).toHaveAttribute("step", "1");
    await expect(page.locator("[data-palette-generator-colors]")).toHaveValue("8");
    await expect(page.locator("[data-palette-generator-steps]")).toHaveAttribute("type", "number");
    await expect(page.locator("[data-palette-generator-steps]")).toHaveAttribute("step", "1");
    await expect(page.locator("[data-palette-generator-steps]")).toHaveValue("1");
    await expect(page.locator("[data-palette-generator-contrast]")).toHaveValue("40");
    await expect(page.locator("[data-palette-generator-saturation]")).toHaveValue("100");
    await expect(page.locator("[data-palette-generator-hue-shift]")).toHaveValue("0");
    await expect(page.locator("[data-palette-generator-step-range]")).toHaveValue("50");
    await expect(page.locator("[data-palette-generator-contrast-value]")).toHaveText("40%");
    await expect(page.locator("[data-palette-generator-saturation-value]")).toHaveText("100%");
    await expect(page.locator("[data-palette-generator-hue-shift-value]")).toHaveText("0°");
    await expect(page.locator("[data-palette-generator-step-range-value]")).toHaveText("50%");
    await expect(page.locator("[data-palette-generator-contrast]")).toHaveAttribute("title", /default 40%/);
    await expect(page.locator("[data-palette-generator-saturation]")).toHaveAttribute("title", /default 100%/);
    await expect(page.locator("[data-palette-generator-hue-shift]")).toHaveAttribute("title", /default 0/);
    await expect(page.locator("[data-palette-generator-step-range]")).toHaveAttribute("title", /default 50%/);
    await expect(page.locator("[data-palette-generator-step-range]")).toHaveAttribute("type", "range");
    await expect(page.locator("[data-palette-generator-generate]")).toHaveCount(0);
    await expect(page.locator("[data-palette-show-duplicates]")).toBeChecked();
    expect(await page.locator("[data-palette-generator-variant] option").allTextContents()).not.toEqual(expect.arrayContaining(["64 colors", "128 colors", "256 colors"]));

    const pickerLayout = await page.locator("[data-palette-picker-accordion]").evaluate((accordion) => {
      const rows = ["paletteThemeCollection", "paletteGeneratorType", "paletteGeneratorVariant"].map((id) => {
        const label = accordion.querySelector(`label[for='${id}']`);
        const control = accordion.querySelector(`#${id}`);
        return {
          controlTop: Math.round(control.getBoundingClientRect().top),
          labelTop: Math.round(label.getBoundingClientRect().top)
        };
      });
      const sliders = ["paletteGeneratorContrast", "paletteGeneratorSaturation", "paletteGeneratorHueShift"].map((id) => {
        const input = accordion.querySelector(`#${id}`);
        const label = accordion.querySelector(`label[for='${id}']`);
        const labelText = label.querySelector("span");
        const inputBox = input.getBoundingClientRect();
        const labelBox = labelText.getBoundingClientRect();
        return {
          inputLeft: Math.round(inputBox.left),
          inputRight: Math.round(inputBox.right),
          inputTop: Math.round(inputBox.top),
          inputWidth: Math.round(inputBox.width),
          labelRight: Math.round(labelBox.right),
          labelTop: Math.round(labelBox.top)
        };
      });
      const summary = accordion.querySelector("[data-palette-generator-grid-summary]");
      return {
        rowAlignment: rows.map((row) => Math.abs(row.controlTop - row.labelTop)),
        sliderPositions: sliders.map((slider) => slider.inputTop),
        sliderLabelPositions: sliders.map((slider) => slider.labelTop),
        sliderRows: sliders,
        slidersShareLabelRows: sliders.map((slider) => Math.abs(slider.labelTop - slider.inputTop) <= 4),
        summaryText: summary.textContent.trim()
      };
    });
    expect(pickerLayout.rowAlignment.every((offset) => offset <= 4)).toBe(true);
    expect(pickerLayout.summaryText).toBe("Grid 8 x 3");
    expect(pickerLayout.sliderPositions[0]).toBeLessThan(pickerLayout.sliderPositions[1]);
    expect(pickerLayout.sliderPositions[1]).toBeLessThan(pickerLayout.sliderPositions[2]);
    expect(pickerLayout.slidersShareLabelRows.every(Boolean)).toBe(true);
    expect(pickerLayout.sliderRows.every((slider) => slider.labelRight < slider.inputLeft)).toBe(true);
    expect(pickerLayout.sliderRows.every((slider) => slider.inputWidth <= 170)).toBe(true);
    const sliderAccentColors = await page.locator("[data-palette-picker-accordion]").evaluate((accordion) => {
      const column = accordion.closest(".tool-column");
      const probe = document.createElement("span");
      probe.style.color = "var(--tool-group-color)";
      column.append(probe);
      const groupColor = getComputedStyle(probe).color;
      probe.remove();
      return ["paletteGeneratorContrast", "paletteGeneratorSaturation", "paletteGeneratorHueShift"].map((id) => ({
        accent: getComputedStyle(accordion.querySelector(`#${id}`)).accentColor,
        groupColor
      }));
    });
    expect(sliderAccentColors.every((item) => item.accent === item.groupColor)).toBe(true);
    const movedAccordionLayout = await page.locator(".tool-workspace").evaluate((workspace) => {
      const picker = workspace.querySelector("[data-palette-picker-accordion]");
      const tags = workspace.querySelector("[data-palette-tags-accordion]");
      const userDefinedSummary = [...workspace.querySelectorAll(".tool-column:first-child details.vertical-accordion summary")]
        .find((summary) => summary.textContent.trim() === "User Defined Swatch");
      const history = workspace.querySelector("[data-palette-history-accordion]");
      const validationSummary = [...workspace.querySelectorAll(".tool-column:last-child details.vertical-accordion summary")]
        .find((summary) => summary.textContent.trim() === "Swatch Validation");
      return {
        historyLeft: Math.round(history.getBoundingClientRect().left),
        historyTop: Math.round(history.getBoundingClientRect().top),
        tagsLeft: Math.round(tags.getBoundingClientRect().left),
        tagsTop: Math.round(tags.getBoundingClientRect().top),
        pickerTop: Math.round(picker.getBoundingClientRect().top),
        userDefinedTop: Math.round(userDefinedSummary.closest("details").getBoundingClientRect().top),
        validationTop: Math.round(validationSummary.closest("details").getBoundingClientRect().top)
      };
    });
    expect(movedAccordionLayout.tagsTop).toBeGreaterThan(movedAccordionLayout.pickerTop);
    expect(movedAccordionLayout.tagsTop).toBeLessThan(movedAccordionLayout.userDefinedTop);
    expect(movedAccordionLayout.historyTop).toBeLessThan(movedAccordionLayout.validationTop);
    expect(movedAccordionLayout.historyLeft).toBeGreaterThan(movedAccordionLayout.tagsLeft);
    const undoRedoLayout = await page.locator("[data-palette-undo]").evaluate((undo) => {
      const redo = document.querySelector("[data-palette-redo]");
      return {
        redoLeft: Math.round(redo.getBoundingClientRect().left),
        undoLeft: Math.round(undo.getBoundingClientRect().left),
        undoTop: Math.round(undo.getBoundingClientRect().top),
        redoTop: Math.round(redo.getBoundingClientRect().top)
      };
    });
    expect(undoRedoLayout.undoTop).toBe(undoRedoLayout.redoTop);
    expect(undoRedoLayout.undoLeft).toBeLessThan(undoRedoLayout.redoLeft);
    const swatchControlsLayout = await page.locator("[data-palette-project-accordion]").evaluate((accordion) => {
      const controls = accordion.querySelector("[data-palette-user-controls]");
      const sort = controls.querySelector("[data-palette-user-sort]");
      const size = controls.querySelector("[data-palette-user-size]");
      const restore = accordion.querySelector("[data-palette-restore-picker-settings]");
      const summary = accordion.querySelector("summary");
      const summaryBox = summary.getBoundingClientRect();
      const restoreBox = restore.getBoundingClientRect();
      const sortBox = sort.getBoundingClientRect();
      const sizeBox = size.getBoundingClientRect();
      return {
        restoreText: restore.textContent.trim(),
        restoreRight: Math.round(restoreBox.right),
        sizeLeft: Math.round(sizeBox.left),
        summaryRight: Math.round(summaryBox.right),
        sortRight: Math.round(sortBox.right)
      };
    });
    expect(swatchControlsLayout.sizeLeft).toBeGreaterThan(swatchControlsLayout.sortRight);
    expect(swatchControlsLayout.restoreText).toBe("Restore Grid Picker Settings");
    expect(swatchControlsLayout.summaryRight - swatchControlsLayout.restoreRight).toBeLessThanOrEqual(64);
    await expect(page.locator("[data-palette-user-sort] [data-palette-sort-key], [data-palette-user-size] [data-palette-size-key]")).toHaveText([
      "Hue ^",
      "Sat",
      "Brit",
      "Name",
      "Tag",
      "Small",
      "Medium",
      "Large"
    ]);

    await expect(page.locator("[data-palette-generator-preview-row]")).toHaveCount(3);
    await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(24);
    await expect(page.locator("[data-palette-include-already-project-swatches]")).toHaveCount(0);
    await expect(page.locator("[data-palette-picker-disabled-reason]")).toHaveCount(0);
    await expect(page.locator("[data-palette-picker-group-label='available']")).toHaveCount(0);
    await expect(page.locator("[data-palette-picker-group-label='unavailable']")).toHaveCount(0);
    const initialAvailability = await page.locator("[data-palette-generator-swatch]").evaluateAll((swatches) => {
      const unavailable = swatches.filter((swatch) => swatch.dataset.paletteGeneratorUnavailable === "true").length;
      return {
        available: swatches.length - unavailable,
        total: swatches.length,
        unavailable
      };
    });
    expect(initialAvailability.total).toBe(24);
    await expect(page.locator("[data-palette-generator-preview-status]")).toHaveText(`Available Picker Swatches (${initialAvailability.available})`);
    await expect(page.locator("[data-palette-generator-swatch][data-palette-generator-unavailable='true']")).toHaveCount(initialAvailability.unavailable);
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-collection", "Nature");
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-type-name", "Forest");
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-variant-name", "Full");
    const accordionFillMetrics = await page.locator("[data-palette-fullscreen-panels]").evaluate((stack) => {
      const project = stack.querySelector("[data-palette-project-accordion]");
      const preview = stack.querySelector("[data-palette-preview-accordion]");
      const projectScroll = project.querySelector("[data-palette-user-scroll]");
      const previewGrid = preview.querySelector("[data-palette-generator-preview]");
      const previewBody = preview.querySelector(".accordion-body");
      return {
        bodyDisplay: getComputedStyle(previewBody).display,
        gridHeight: Math.round(previewGrid.getBoundingClientRect().height),
        gridWidth: Math.round(previewGrid.getBoundingClientRect().width),
        previewBodyHeight: Math.round(previewBody.getBoundingClientRect().height),
        previewBodyWidth: Math.round(previewBody.getBoundingClientRect().width),
        projectScrollHeight: Math.round(projectScroll.getBoundingClientRect().height)
      };
    });
    expect(accordionFillMetrics.bodyDisplay).toBe("flex");
    expect(accordionFillMetrics.gridHeight).toBeGreaterThan(accordionFillMetrics.previewBodyHeight * 0.8);
    expect(accordionFillMetrics.gridWidth).toBeGreaterThan(accordionFillMetrics.previewBodyWidth * 0.9);
    await page.locator("[data-palette-project-accordion] > summary").click();
    const previewOnlyHeight = await page.locator("[data-palette-generator-preview]").evaluate((preview) => (
      Math.round(preview.getBoundingClientRect().height)
    ));
    expect(previewOnlyHeight).toBeGreaterThan(accordionFillMetrics.gridHeight + 20);
    await page.locator("[data-palette-project-accordion] > summary").click();
    await page.locator("[data-palette-preview-accordion] > summary").click();
    const projectOnlyHeight = await page.locator("[data-palette-user-scroll]").evaluate((scrollRegion) => (
      Math.round(scrollRegion.getBoundingClientRect().height)
    ));
    expect(projectOnlyHeight).toBeGreaterThan(accordionFillMetrics.projectScrollHeight + 20);
    await page.locator("[data-palette-preview-accordion] > summary").click();

    const topColors = await currentPreviewHexes(page, 0);
    const bottomColors = await currentPreviewHexes(page, 2);
    expect(topColors).not.toContain("#FFFFFF");
    expect(bottomColors).not.toContain("#000000");
    const stepRangeEvidenceColumn = 3;
    const defaultStepRangeSpread = await columnLightnessSpread(page, stepRangeEvidenceColumn);
    await page.locator("[data-palette-generator-step-range]").evaluate((control) => {
      control.value = "0";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.locator("[data-palette-generator-step-range-value]")).toHaveText("0%");
    const tightStepRangeSpread = await columnLightnessSpread(page, stepRangeEvidenceColumn);
    expect(tightStepRangeSpread.topDistance).toBeGreaterThan(0);
    expect(tightStepRangeSpread.bottomDistance).toBeGreaterThan(0);
    expect(tightStepRangeSpread.spread).toBeLessThan(defaultStepRangeSpread.spread);
    expect(tightStepRangeSpread.topLightness).toBeLessThan(defaultStepRangeSpread.topLightness);
    expect(tightStepRangeSpread.bottomLightness).toBeGreaterThan(defaultStepRangeSpread.bottomLightness);
    expect(tightStepRangeSpread.center).toBe(defaultStepRangeSpread.center);
    await page.locator("[data-palette-generator-step-range]").evaluate((control) => {
      control.value = "100";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.locator("[data-palette-generator-step-range-value]")).toHaveText("100%");
    const wideStepRangeSpread = await columnLightnessSpread(page, stepRangeEvidenceColumn);
    expect(wideStepRangeSpread.spread).toBeGreaterThan(defaultStepRangeSpread.spread);
    expect(wideStepRangeSpread.topLightness).toBeGreaterThan(defaultStepRangeSpread.topLightness);
    expect(wideStepRangeSpread.bottomLightness).toBeLessThan(defaultStepRangeSpread.bottomLightness);
    expect(wideStepRangeSpread.topLightness).toBeGreaterThan(0.98);
    expect(wideStepRangeSpread.bottomLightness).toBeLessThan(0.02);
    expect(wideStepRangeSpread.center).toBe(defaultStepRangeSpread.center);
    await page.locator("[data-palette-generator-step-range]").evaluate((control) => {
      control.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    });
    await expect(page.locator("[data-palette-generator-step-range-value]")).toHaveText("50%");
    const restoredStepRangeSpread = await columnLightnessSpread(page, stepRangeEvidenceColumn);
    expect(restoredStepRangeSpread.top).toBe(defaultStepRangeSpread.top);
    expect(restoredStepRangeSpread.center).toBe(defaultStepRangeSpread.center);
    expect(restoredStepRangeSpread.bottom).toBe(defaultStepRangeSpread.bottom);
    await expect(page.locator("[data-palette-generator-step-range]")).toHaveValue("50");

    const firstSwatch = page.locator("[data-palette-generator-color]").first();
    const initialBox = await firstSwatch.boundingBox();
    const initialColor = await firstSwatch.getAttribute("data-palette-generator-color");
    await page.locator("[data-palette-generator-hue-shift]").evaluate((control) => {
      control.value = "45";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.locator("[data-palette-generator-hue-shift]")).toHaveValue("45");
    await expect(page.locator("[data-palette-generator-hue-shift-value]")).toHaveText("+45°");
    expect(await firstSwatch.getAttribute("data-palette-generator-color")).not.toBe(initialColor);
    await page.locator("[data-palette-generator-hue-shift]").evaluate((control) => {
      control.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    });
    await expect(page.locator("[data-palette-generator-hue-shift]")).toHaveValue("0");
    await expect(page.locator("[data-palette-generator-hue-shift-value]")).toHaveText("0°");

    await page.locator("[data-palette-theme-collection]").selectOption("ROYGBIV");
    await expect(page.locator("[data-palette-generator-type] option")).toHaveText(["ROYGBIV"]);
    await setGeneratorColors(page, "7");
    await setGeneratorSteps(page, "2");
    await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(35);
    const royNames = await page.locator("[data-palette-generator-swatch]").evaluateAll((swatches) => (
      swatches.slice(0, 7).map((swatch) => swatch.dataset.paletteGeneratorName)
    ));
    expect(royNames.join(" ")).toContain("Red");
    expect(royNames.join(" ")).toContain("Orange");
    expect(royNames.join(" ")).toContain("Yellow");
    expect(royNames.join(" ")).toContain("Green");
    expect(royNames.join(" ")).toContain("Blue");
    expect(royNames.join(" ")).toContain("Indigo");
    expect(royNames.join(" ")).toContain("Violet");

    await page.locator("[data-palette-generator-hue-shift]").evaluate((control) => {
      control.value = "0";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.locator("[data-palette-theme-collection]").selectOption("Human");
    await expect(page.locator("[data-palette-generator-type] option")).toHaveText(sortedLabels(expectedThemeTypes.Human));
    await page.locator("[data-palette-generator-type]").selectOption("Skin Tones");
    await setGeneratorColors(page, "8");
    await setGeneratorSteps(page, "0");
    await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(8);
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-collection", "Human");
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-type-name", "Skin Tones");
    const humanSkinHexes = await currentPreviewHexes(page, 0);
    expect(humanSkinHexes).toEqual(["#3A2118", "#5A3224", "#7A4B35", "#9D6B4D", "#B88661", "#D0A37A", "#E4BF9D", "#F3D8C4"]);
    await page.locator("[data-palette-generator-type]").selectOption("Human");
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-type-name", "Human");
    await setGeneratorColors(page, "20");
    const humanCombinedNames = await page.locator("[data-palette-generator-swatch]").evaluateAll((swatches) => (
      swatches.map((swatch) => swatch.dataset.paletteGeneratorName)
    ));
    const humanCombinedHexes = await currentPreviewHexes(page, 0);
    expect(humanCombinedHexes).toEqual([
      "#3A2118",
      "#5A3224",
      "#8A5A3D",
      "#9A7B4F",
      "#D7A982",
      "#F0D1BA",
      "#FFE0C2",
      "#2A2E38",
      "#0D0A08",
      "#4B2C1A",
      "#8A3E24",
      "#C6A15D",
      "#B8B8B2",
      "#3B6EA5",
      "#3F7A52",
      "#5A321E",
      "#273D5F",
      "#8F2F3D",
      "#4F6B45",
      "#B2A08A"
    ]);
    [
      "Deep Skin",
      "Dark Skin",
      "Medium Skin",
      "Olive Skin",
      "Light Skin",
      "Pale Skin",
      "Warm Highlight",
      "Cool Shadow",
      "Black Hair",
      "Brown Hair",
      "Auburn Hair",
      "Blonde Hair",
      "Gray Hair",
      "Eye Blue",
      "Eye Green",
      "Eye Brown",
      "Cloth Navy",
      "Cloth Red",
      "Cloth Green",
      "Cloth Neutral"
    ].forEach((name) => {
      expect(humanCombinedNames.join(" ")).toContain(name);
    });

    await setGeneratorSteps(page, "8");
    await page.locator("[data-palette-theme-collection]").selectOption("Sci-Fi");
    await expect(page.locator("[data-palette-generator-type] option")).toHaveText(sortedLabels(expectedThemeTypes["Sci-Fi"]));
    await page.locator("[data-palette-generator-type]").selectOption("Cyberpunk");
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-collection", "Sci-Fi");
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-type-name", "Cyberpunk");
    expect(await page.locator("[data-palette-generator-type] option").allTextContents()).not.toContain("Space Station");

    await page.locator("[data-palette-generator-variant]").selectOption("4");
    await expect(page.locator("[data-palette-generator-colors]")).toHaveValue("4");
    await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(68);

    await setGeneratorColors(page, "16");
    await setGeneratorSteps(page, "8");
    await expect(page.locator("[data-palette-generator-preview-row]")).toHaveCount(17);
    await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(272);
    const resizedBox = await firstSwatch.boundingBox();
    expect(resizedBox?.width || 0).toBeLessThan(initialBox?.width || Number.MAX_SAFE_INTEGER);
    expect(resizedBox?.height || 0).toBeLessThan(initialBox?.height || Number.MAX_SAFE_INTEGER);

    await page.locator("[data-palette-generator-contrast]").evaluate((control) => {
      control.value = "80";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.locator("[data-palette-generator-saturation]").evaluate((control) => {
      control.value = "20";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.locator("[data-palette-generator-contrast]")).toHaveValue("80");
    await expect(page.locator("[data-palette-generator-saturation]")).toHaveValue("20");
    await expect(page.locator("[data-palette-generator-contrast-value]")).toHaveText("80%");
    await expect(page.locator("[data-palette-generator-saturation-value]")).toHaveText("20%");
    await page.locator("[data-palette-generator-contrast]").evaluate((control) => {
      control.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    });
    await page.locator("[data-palette-generator-saturation]").evaluate((control) => {
      control.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    });
    await expect(page.locator("[data-palette-generator-contrast]")).toHaveValue("40");
    await expect(page.locator("[data-palette-generator-saturation]")).toHaveValue("100");
    await expect(page.locator("[data-palette-generator-contrast-value]")).toHaveText("40%");
    await expect(page.locator("[data-palette-generator-saturation-value]")).toHaveText("100%");
    await page.locator("[data-palette-generator-reset]").click();
    await expect(page.locator("[data-palette-generator-contrast]")).toHaveValue("40");
    await expect(page.locator("[data-palette-generator-saturation]")).toHaveValue("100");
    await expect(page.locator("[data-palette-generator-hue-shift]")).toHaveValue("0");
    await expect(page.locator("[data-palette-generator-step-range]")).toHaveValue("50");
    await expect(page.locator("[data-palette-generator-contrast-value]")).toHaveText("40%");
    await expect(page.locator("[data-palette-generator-saturation-value]")).toHaveText("100%");
    await expect(page.locator("[data-palette-generator-hue-shift-value]")).toHaveText("0°");
    await expect(page.locator("[data-palette-generator-step-range-value]")).toHaveText("50%");

    await setGeneratorColors(page, "4");
    await setGeneratorSteps(page, "2");
    for (const [collection, types] of Object.entries(expectedThemeTypes)) {
      await page.locator("[data-palette-theme-collection]").selectOption(collection);
      await expect(page.locator("[data-palette-generator-type] option")).toHaveText(sortedLabels(types));
      for (const type of types) {
        await page.locator("[data-palette-generator-type]").selectOption(type);
        await setGeneratorColors(page, "4");
        await setGeneratorSteps(page, "2");
        await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(20);
        await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-collection", collection);
        await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-type-name", type);
      }
    }

    await expect(page.locator("[data-palette-generator-generate]")).toHaveCount(0);
    await expect(page.locator("[data-palette-generator-preview-status]")).toHaveText(/Available Picker Swatches \(\d+\)/);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Palette Tool uses green pins to remove already-added picker swatches", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await setGeneratorColors(page, "8");
    await setGeneratorSteps(page, "2");
    await expectPickerRowsToHaveColumnCount(page, 8);
    const firstAvailableEightColumnSwatch = page.locator("[data-palette-generator-swatch][data-palette-generator-availability='available']").first();
    const eightColumnHex = await firstAvailableEightColumnSwatch.getAttribute("data-palette-generator-hex");
    await firstAvailableEightColumnSwatch.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("1");
    const addedEightColumnSwatch = page.locator(`[data-palette-user-list] [data-palette-swatch-key][data-palette-swatch-hex='${eightColumnHex}']`).first();
    await expect(addedEightColumnSwatch).toHaveAttribute("data-palette-selected", "true");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText(await addedEightColumnSwatch.getAttribute("data-palette-swatch-name") || "");

    await expectPickerRowsToHaveColumnCount(page, 8);
    const pinnedEightColumnSwatch = page.locator(`[data-palette-generator-swatch][data-palette-generator-hex='${eightColumnHex}']`).first();
    await expect(pinnedEightColumnSwatch).toHaveAttribute("data-palette-generator-availability", "available");
    await expect(pinnedEightColumnSwatch).toHaveAttribute("data-palette-pinned", "true");
    await expect(pinnedEightColumnSwatch.locator("[data-palette-pin-indicator]")).toHaveCount(1);
    const pinnedVisual = await pinnedEightColumnSwatch.evaluate((swatch) => ({
      cursor: getComputedStyle(swatch).cursor,
      opacity: getComputedStyle(swatch).opacity,
      value: swatch.querySelector("[data-palette-generator-color]").dataset.paletteGeneratorColor
    }));
    expect(pinnedVisual.cursor).not.toBe("not-allowed");
    expect(pinnedVisual.opacity).toBe("1");
    expect(pinnedVisual.value.toUpperCase()).toBe((eightColumnHex || "").slice(0, 7).toUpperCase());
    const greenPinColor = await pinnedEightColumnSwatch.locator("[data-palette-pin-indicator]").evaluate((pin) => {
      const probe = document.createElement("span");
      probe.style.color = "var(--green)";
      document.body.append(probe);
      const green = getComputedStyle(probe).color;
      probe.remove();
      return {
        green,
        pin: getComputedStyle(pin).backgroundColor
      };
    });
    expect(greenPinColor.pin).toBe(greenPinColor.green);

    await pinnedEightColumnSwatch.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("0");
    await expect(page.locator("[data-palette-log]")).toContainText("Removed picker swatch");
    await page.locator("[data-palette-generator-swatch][data-palette-generator-availability='available']").first().click();
    await expect(page.locator("[data-palette-count]")).toHaveText("1");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Palette Tool blocks only lower duplicate hexes within each picker column", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await setGeneratorColors(page, "8");
    await setGeneratorSteps(page, "2");
    await page.locator("[data-palette-generator-contrast]").evaluate((control) => {
      control.value = "100";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expectPickerRowsToHaveColumnCount(page, 8);

    const duplicateGroup = await page.locator("[data-palette-generator-swatch]").evaluateAll((swatches) => {
      const groups = new Map();
      swatches.forEach((swatch) => {
        const key = `${swatch.dataset.paletteGeneratorColumn}:${swatch.dataset.paletteGeneratorHex}`;
        const group = groups.get(key) || [];
        group.push({
          column: swatch.dataset.paletteGeneratorColumn,
          hex: swatch.dataset.paletteGeneratorHex,
          row: swatch.dataset.paletteGeneratorRow
        });
        groups.set(key, group);
      });
      const duplicate = [...groups.values()]
        .filter((group) => group.length > 1)
        .map((group) => group.sort((left, right) => Number(left.row) - Number(right.row)))
        .at(0);
      return duplicate || [];
    });
    expect(duplicateGroup.length).toBeGreaterThan(1);

    const topDuplicate = duplicateGroup[0];
    const lowerDuplicate = duplicateGroup.at(-1);
    const topSwatch = page.locator(`[data-palette-generator-row='${topDuplicate.row}'][data-palette-generator-column='${topDuplicate.column}']`);
    const lowerSwatch = page.locator(`[data-palette-generator-row='${lowerDuplicate.row}'][data-palette-generator-column='${lowerDuplicate.column}']`);

    await expect(lowerSwatch).toHaveAttribute("data-palette-generator-availability", "unavailable");
    await expect(lowerSwatch).toHaveAttribute("data-palette-generator-unavailable-reason", "Duplicate Hex in Column");
    await expect(lowerSwatch.locator("[data-palette-pin-indicator]")).toHaveCount(0);
    const lowerVisual = await lowerSwatch.evaluate((swatch) => ({
      cursor: getComputedStyle(swatch).cursor,
      opacity: getComputedStyle(swatch).opacity,
      value: swatch.querySelector("[data-palette-generator-color]").dataset.paletteGeneratorColor
    }));
    expect(lowerVisual.cursor).not.toBe("not-allowed");
    expect(lowerVisual.opacity).toBe("1");
    expect(lowerVisual.value.toUpperCase()).toBe(lowerDuplicate.hex.slice(0, 7).toUpperCase());
    await lowerSwatch.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("0");
    await expect(page.locator("[data-palette-log]")).toContainText("Duplicate Hex in Column picker swatch has no pin and was not added.");

    await page.locator("[data-palette-show-duplicates]").uncheck();
    await expectPickerRowsToHaveColumnCount(page, 8);
    await expect(lowerSwatch).toHaveCount(1);
    await expect(lowerSwatch).toHaveAttribute("data-palette-generator-duplicate-hidden", "true");
    await expect(lowerSwatch.locator("[data-palette-pin-indicator]")).toHaveCount(0);
    const hiddenDuplicateVisual = await lowerSwatch.evaluate((swatch) => {
      const visual = swatch.querySelector("[data-palette-generator-color]");
      return {
        color: visual.dataset.paletteGeneratorColor,
        fill: visual.querySelector("rect").getAttribute("fill"),
        visibleColor: visual.dataset.paletteGeneratorVisibleColor
      };
    });
    expect(hiddenDuplicateVisual.color.toUpperCase()).toBe(lowerDuplicate.hex.slice(0, 7).toUpperCase());
    expect(hiddenDuplicateVisual.fill).toBe("transparent");
    expect(hiddenDuplicateVisual.visibleColor).toBe("transparent");
    await expect(topSwatch).toHaveCount(1);
    await lowerSwatch.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("0");
    await page.locator("[data-palette-show-duplicates]").check();
    await expect(lowerSwatch).toHaveCount(1);
    await expect(lowerSwatch).toHaveAttribute("data-palette-generator-duplicate-hidden", "false");
    await expect(lowerSwatch.locator("[data-palette-pin-indicator]")).toHaveCount(0);
    const shownDuplicateVisual = await lowerSwatch.evaluate((swatch) => {
      const visual = swatch.querySelector("[data-palette-generator-color]");
      return {
        color: visual.dataset.paletteGeneratorColor,
        fill: visual.querySelector("rect").getAttribute("fill"),
        visibleColor: visual.dataset.paletteGeneratorVisibleColor
      };
    });
    expect(shownDuplicateVisual.color.toUpperCase()).toBe(lowerDuplicate.hex.slice(0, 7).toUpperCase());
    expect(shownDuplicateVisual.fill.toUpperCase()).toBe(lowerDuplicate.hex.slice(0, 7).toUpperCase());
    expect(shownDuplicateVisual.visibleColor.toUpperCase()).toBe(lowerDuplicate.hex.slice(0, 7).toUpperCase());

    await expect(topSwatch).toHaveAttribute("data-palette-generator-availability", "available");
    await expect(topSwatch.locator("[data-palette-pin-indicator]")).toHaveCount(1);
    const topPinColor = await topSwatch.locator("[data-palette-pin-indicator]").evaluate((pin) => {
      const probe = document.createElement("span");
      probe.style.color = "var(--red)";
      document.body.append(probe);
      const red = getComputedStyle(probe).color;
      probe.remove();
      return {
        red,
        pin: getComputedStyle(pin).backgroundColor
      };
    });
    expect(topPinColor.pin).toBe(topPinColor.red);
    await topSwatch.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("1");
    await expect(topSwatch).toHaveAttribute("data-palette-pinned", "true");
    const addedPinColor = await topSwatch.locator("[data-palette-pin-indicator]").evaluate((pin) => {
      const probe = document.createElement("span");
      probe.style.color = "var(--green)";
      document.body.append(probe);
      const green = getComputedStyle(probe).color;
      probe.remove();
      return {
        green,
        pin: getComputedStyle(pin).backgroundColor
      };
    });
    expect(addedPinColor.pin).toBe(addedPinColor.green);

    const addableSwatchData = await page.locator("[data-palette-generator-swatch][data-palette-generator-availability='available'][data-palette-pinned='false']").evaluateAll((swatches) => {
      return swatches
        .map((swatch) => ({
          column: swatch.dataset.paletteGeneratorColumn,
          row: swatch.dataset.paletteGeneratorRow
        }))
        .at(0);
    });
    expect(addableSwatchData).toBeTruthy();
    const uniqueSwatch = page.locator(`[data-palette-generator-row='${addableSwatchData.row}'][data-palette-generator-column='${addableSwatchData.column}']`);
    await expect(uniqueSwatch).toHaveAttribute("data-palette-generator-availability", "available");
    await expect(uniqueSwatch.locator("[data-palette-pin-indicator]")).toHaveCount(1);
    await uniqueSwatch.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("2");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Palette Tool generated grid swatches can be selected, pinned, and refreshed", async ({ page }) => {
  test.setTimeout(120000);
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await setGeneratorColors(page, "4");
    await setGeneratorSteps(page, "2");
    await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(20);
    await expect(page.locator("[data-palette-generator-swatch][data-palette-generator-unavailable='true'] [data-palette-pin-indicator]")).toHaveCount(0);
    const pickerCursors = await page.locator("[data-palette-generator-swatch]").evaluateAll((swatches) => (
      swatches.map((swatch) => getComputedStyle(swatch).cursor)
    ));
    expect(pickerCursors.every((cursor) => cursor !== "not-allowed")).toBe(true);
    for (let index = 0; index < 8; index += 1) {
      await page.locator("[data-palette-generator-swatch][data-palette-generator-availability='available'][data-palette-pinned='false']").first().click();
    }
    await expect(page.locator("[data-palette-count]")).toHaveText("8");

    await page.locator("[data-palette-generator-reset]").click();
    const firstGenerated = page.locator("[data-palette-generator-swatch]").first();
    await page.locator("[data-palette-theme-collection]").selectOption("Sci-Fi");
    await page.locator("[data-palette-generator-type]").selectOption("Cyberpunk");
    await page.locator("[data-palette-generator-variant]").selectOption("16");
    await setGeneratorColors(page, "16");
    await setGeneratorSteps(page, "4");
    await page.locator("[data-palette-generator-contrast]").evaluate((control) => {
      control.value = "72";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.locator("[data-palette-generator-saturation]").evaluate((control) => {
      control.value = "58";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.locator("[data-palette-generator-hue-shift]").evaluate((control) => {
      control.value = "-35";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.locator("[data-palette-generator-step-range]").evaluate((control) => {
      control.value = "70";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.locator("[data-palette-generator-contrast-value]")).toHaveText("72%");
    await expect(page.locator("[data-palette-generator-saturation-value]")).toHaveText("58%");
    await expect(page.locator("[data-palette-generator-hue-shift-value]")).toHaveText("-35°");
    await expect(page.locator("[data-palette-generator-step-range-value]")).toHaveText("70%");
    await expect(firstGenerated).toHaveAttribute("data-palette-pinned", "false");
    const generatedName = await firstGenerated.getAttribute("data-palette-generator-name");
    const generatedHex = await firstGenerated.getAttribute("data-palette-generator-hex");
    expect(generatedName || "").toContain((generatedHex || "").slice(0, 7).toUpperCase());
    expect(generatedName || "").not.toMatch(/R\d+ C\d+/);
    await expect(firstGenerated).toHaveAttribute("title", /Name: Sci-Fi Cyberpunk 16 colors[\s\S]*Hex: #[0-9A-F]{6}[\s\S]*Theme: Sci-Fi[\s\S]*Palette Type: Cyberpunk/);
    const pickerTooltip = await firstGenerated.getAttribute("title");
    expect(pickerTooltip?.split("\n")).toHaveLength(4);
    expect(pickerTooltip).not.toContain("Contrast:");

    const gridSpacing = await page.locator("[data-palette-generator-preview]").evaluate((preview) => {
      const firstRow = preview.querySelector("[data-palette-generator-preview-row]");
      const rows = Array.from(preview.querySelectorAll("[data-palette-generator-preview-row]"));
      const cells = Array.from(firstRow.querySelectorAll("[data-palette-generator-swatch]")).slice(0, 2);
      const previewBox = preview.getBoundingClientRect();
      const rowBox = firstRow.getBoundingClientRect();
      const rowHeightTotal = rows.reduce((total, row) => total + row.getBoundingClientRect().height, 0);
      const leftBox = cells[0].getBoundingClientRect();
      const rightBox = cells[1].getBoundingClientRect();
      const visual = cells[0].querySelector("[data-palette-generator-color]");
      const visualBox = visual.getBoundingClientRect();
      return {
        columnGap: getComputedStyle(firstRow).columnGap,
        preserveAspectRatio: visual.getAttribute("preserveAspectRatio"),
        previewHeight: Math.round(previewBox.height),
        previewWidth: Math.round(previewBox.width),
        previewGap: getComputedStyle(preview).rowGap,
        rowHeightTotal: Math.round(rowHeightTotal),
        rowWidth: Math.round(rowBox.width),
        swatchHeight: Math.round(leftBox.height),
        swatchWidth: Math.round(leftBox.width),
        visualHeight: Math.round(visualBox.height),
        visualWidth: Math.round(visualBox.width),
        xGap: Math.round(rightBox.left - leftBox.right)
      };
    });
    expect(gridSpacing.previewGap).toBe("0px");
    expect(gridSpacing.columnGap).toBe("0px");
    expect(gridSpacing.preserveAspectRatio).toBe("none");
    expect(Math.abs(gridSpacing.xGap)).toBeLessThanOrEqual(1);
    expect(Math.abs(gridSpacing.rowWidth - gridSpacing.previewWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(gridSpacing.rowHeightTotal - gridSpacing.previewHeight)).toBeLessThanOrEqual(2);
    expect(Math.abs(gridSpacing.visualWidth - gridSpacing.swatchWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(gridSpacing.visualHeight - gridSpacing.swatchHeight)).toBeLessThanOrEqual(1);

    await firstGenerated.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("9");
    await expect(page.locator("[data-palette-log]")).toContainText("Added picker swatch");
    await page.mouse.move(0, 0);
    await expect(firstGenerated).toHaveAttribute("data-palette-selected", "false");
    await expect(firstGenerated).not.toHaveAttribute("aria-current", "true");
    const pickerSelectionStyle = await firstGenerated.evaluate((swatch) => {
      const computed = getComputedStyle(swatch);
      return {
        boxShadow: computed.boxShadow,
        outlineStyle: computed.outlineStyle
      };
    });
    expect(pickerSelectionStyle.boxShadow).toBe("none");
    expect(pickerSelectionStyle.outlineStyle).toBe("none");
    const generatedTile = swatchTileByName(page, generatedName || "");
    await expect(generatedTile).toHaveAttribute("data-palette-swatch-name", generatedName || "");
    await expect(generatedTile).toHaveAttribute("data-palette-swatch-hex", generatedHex || "");
    await expect(generatedTile).toHaveAttribute("data-palette-selected", "true");
    await expect(generatedTile).toHaveAttribute("title", `Name: ${generatedName}\nHex: ${generatedHex}\nTheme: Sci-Fi\nPalette Type: Cyberpunk`);
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-theme-collection", "Sci-Fi");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-palette-type", "Cyberpunk");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-variant", "16 colors");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-colors", "16");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-steps", "4");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-contrast", "72");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-saturation", "58");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-step-range", "70");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-hue-shift", "-35");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-sort-field", "hue");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-sort-direction", "asc");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-swatch-size", "medium");
    const pinnedPickerSwatch = page.locator(`[data-palette-generator-swatch][data-palette-generator-hex='${generatedHex}']`).first();
    await expect(pinnedPickerSwatch).toHaveAttribute("data-palette-pinned", "true");
    await expect(pinnedPickerSwatch.locator("[data-palette-pin-indicator]")).toHaveCount(1);
    await expect(pinnedPickerSwatch).toHaveAttribute("data-palette-generator-availability", "available");
    await expect(pinnedPickerSwatch).toHaveAttribute("data-palette-generator-unavailable-reason", "");
    await expect(pinnedPickerSwatch).not.toBeDisabled();
    const refreshedAvailability = await page.locator("[data-palette-generator-swatch]").evaluateAll((swatches) => {
      const unavailable = swatches.filter((swatch) => swatch.dataset.paletteGeneratorUnavailable === "true").length;
      const addable = swatches.filter((swatch) => (
        swatch.dataset.paletteGeneratorUnavailable !== "true" && swatch.dataset.palettePinned !== "true"
      )).length;
      return {
        addable,
        unavailable
      };
    });
    await expect(page.locator("[data-palette-generator-preview-status]")).toHaveText(`Available Picker Swatches (${refreshedAvailability.addable})`);
    await expect(page.locator("[data-palette-picker-group-label='available']")).toHaveCount(0);
    await expect(page.locator("[data-palette-picker-group-label='unavailable']")).toHaveCount(0);
    await expect(page.locator("[data-palette-generator-swatch][data-palette-generator-unavailable='true']")).toHaveCount(refreshedAvailability.unavailable);
    await expectPickerRowsToHaveColumnCount(page, 16);
    const pinnedVisual = await pinnedPickerSwatch.evaluate((swatch) => ({
      cursor: getComputedStyle(swatch).cursor,
      opacity: getComputedStyle(swatch).opacity,
      value: swatch.querySelector("[data-palette-generator-color]").dataset.paletteGeneratorColor
    }));
    expect(pinnedVisual.cursor).not.toBe("not-allowed");
    expect(pinnedVisual.opacity).toBe("1");
    expect(pinnedVisual.value.toUpperCase()).toBe((generatedHex || "").slice(0, 7).toUpperCase());
    await expect(page.locator("[data-palette-include-already-project-swatches]")).toHaveCount(0);
    await expect(pinnedPickerSwatch).toHaveAttribute("data-palette-generator-availability", "available");
    await expect(page.locator("[data-palette-generator-swatch][data-palette-generator-unavailable='true']")).toHaveCount(refreshedAvailability.unavailable);

    await page.locator("[data-palette-theme-collection]").selectOption("Nature");
    await page.locator("[data-palette-generator-type]").selectOption("Forest");
    await page.locator("[data-palette-generator-variant]").selectOption("High Contrast");
    await setGeneratorColors(page, "12");
    await setGeneratorSteps(page, "16");
    await page.locator("[data-palette-generator-contrast]").evaluate((control) => {
      control.value = "40";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.locator("[data-palette-generator-saturation]").evaluate((control) => {
      control.value = "100";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.locator("[data-palette-generator-hue-shift]").evaluate((control) => {
      control.value = "0";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(generatedTile).toHaveAttribute("data-palette-swatch-name", generatedName || "");
    await expect(page.locator("[data-palette-count]")).toHaveText("9");

    await page.locator("[data-palette-restore-picker-settings]").click();
    await expect(page.locator("[data-palette-theme-collection]")).toHaveValue("Sci-Fi");
    await expect(page.locator("[data-palette-generator-type]")).toHaveValue("Cyberpunk");
    await expect(page.locator("[data-palette-generator-variant]")).toHaveValue("16");
    await expect(page.locator("[data-palette-generator-colors]")).toHaveValue("16");
    await expect(page.locator("[data-palette-generator-steps]")).toHaveValue("4");
    await expect(page.locator("[data-palette-generator-contrast]")).toHaveValue("72");
    await expect(page.locator("[data-palette-generator-saturation]")).toHaveValue("58");
    await expect(page.locator("[data-palette-generator-step-range]")).toHaveValue("70");
    await expect(page.locator("[data-palette-generator-hue-shift]")).toHaveValue("-35");
    await expect(page.locator("[data-palette-generator-contrast-value]")).toHaveText("72%");
    await expect(page.locator("[data-palette-generator-saturation-value]")).toHaveText("58%");
    await expect(page.locator("[data-palette-generator-step-range-value]")).toHaveText("70%");
    await expect(page.locator("[data-palette-generator-hue-shift-value]")).toHaveText("-35°");

    await expect(page.locator("[data-palette-generator-generate]")).toHaveCount(0);
    await expect(generatedTile).toHaveAttribute("data-palette-swatch-name", generatedName || "");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Palette Tool batch tags checked project palette swatches", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await expect(page.getByText("Project Palette Tags")).toHaveCount(0);
    await expect(page.getByText("Swatch Editor")).toHaveCount(0);
    await expect(page.locator("[data-palette-clear-checked]")).toBeDisabled();

    await addUserSwatch(page, { hex: "#111111", name: "Anchor" });
    await addUserSwatch(page, { hex: "#6B4F2A", name: "Brownstone" });
    await addUserSwatch(page, { hex: "#264EA4", name: "Bluegate" });
    await expect(page.locator("[data-palette-count]")).toHaveText("3");
    await expect(page.locator("[data-palette-swatch-check]")).toHaveCount(3);

    const anchorItem = page.locator("[data-palette-swatch-item]", {
      has: page.locator("[data-palette-swatch-name='Anchor']")
    });
    const brownItem = page.locator("[data-palette-swatch-item]", {
      has: page.locator("[data-palette-swatch-name='Brownstone']")
    });
    const blueItem = page.locator("[data-palette-swatch-item]", {
      has: page.locator("[data-palette-swatch-name='Bluegate']")
    });
    const anchorTile = anchorItem.locator("[data-palette-swatch-key]");
    const brownTile = brownItem.locator("[data-palette-swatch-key]");
    const blueTile = blueItem.locator("[data-palette-swatch-key]");
    const anchorCheck = anchorItem.locator("[data-palette-swatch-check]");
    const brownCheck = brownItem.locator("[data-palette-swatch-check]");

    await anchorTile.click();
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Anchor");
    const checkBox = await anchorCheck.boundingBox();
    const tileBox = await anchorTile.boundingBox();
    const checkboxLeftInset = (checkBox?.x || 0) - (tileBox?.x || 0);
    const checkboxTopInset = (checkBox?.y || 0) - (tileBox?.y || 0);
    expect(checkboxLeftInset).toBeGreaterThanOrEqual(2);
    expect(checkboxLeftInset).toBeLessThanOrEqual(6);
    expect(checkboxTopInset).toBeGreaterThanOrEqual(2);
    expect(checkboxTopInset).toBeLessThanOrEqual(6);

    await page.locator("[data-palette-tags]").fill("solo");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(anchorTile).toHaveAttribute("data-palette-swatch-tags", "solo");
    await expect(brownTile).toHaveAttribute("data-palette-swatch-tags", "");
    await expect(blueTile).toHaveAttribute("data-palette-swatch-tags", "");

    await anchorCheck.check();
    await brownCheck.check();
    await expect(page.locator("[data-palette-clear-checked]")).toBeEnabled();
    await page.locator("[data-palette-tags]").fill("batch");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(anchorTile).toHaveAttribute("data-palette-swatch-tags", "solo, batch");
    await expect(brownTile).toHaveAttribute("data-palette-swatch-tags", "batch");
    await expect(blueTile).toHaveAttribute("data-palette-swatch-tags", "");

    await page.locator("[data-palette-clear-checked]").click();
    await expect(anchorCheck).not.toBeChecked();
    await expect(brownCheck).not.toBeChecked();
    await expect(page.locator("[data-palette-clear-checked]")).toBeDisabled();

    await page.locator("[data-palette-tags]").fill("afterclear");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(anchorTile).toHaveAttribute("data-palette-swatch-tags", "solo, batch, afterclear");
    await expect(brownTile).toHaveAttribute("data-palette-swatch-tags", "batch");
    await expect(blueTile).toHaveAttribute("data-palette-swatch-tags", "");

    const tagFilterCountBeforeHelp = await page.locator("[data-palette-tag-filter]").count();
    await page.locator("[data-palette-tags-help] > summary").click();
    await expect(page.locator("[data-palette-tags-help]")).toHaveAttribute("open", "");
    await expect(page.locator("[data-palette-tags-help-list] li")).toHaveCount(64);
    await expect(page.locator("[data-palette-tags-help-list]")).toContainText("UI");
    await expect(page.locator("[data-palette-tags-help-list]")).toContainText("16-Bit");
    await expect(page.locator("[data-palette-tag-filter]")).toHaveCount(tagFilterCountBeforeHelp);
    await page.locator("[data-palette-tags-help] > summary").click();
    await expect(page.locator("[data-palette-tags-help]")).not.toHaveAttribute("open", "");

    await page.locator("[data-palette-tags]").fill("pla");
    await expect(page.locator("#paletteTagSuggestions option[value='Player']")).toHaveCount(1);
    await page.locator("[data-palette-tags]").fill("Player");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(anchorTile).toHaveAttribute("data-palette-swatch-tags", "solo, batch, afterclear, player");

    await expectSortToggle(page, "hue", "Hue");
    await expectSortToggle(page, "saturation", "Sat");
    await expectSortToggle(page, "brightness", "Brit");
    await expectSortToggle(page, "name", "Name");
    await expectSortToggle(page, "tag", "Tag");

    const tagFilters = page.locator("[data-palette-tag-filter]");
    const tagFilterItems = page.locator("[data-palette-tags-list] li");
    await expect(tagFilters).toHaveCount(4);
    await expect(tagFilterItems).toHaveText(["afterclear", "batch", "player", "solo"]);
    await expect(page.getByRole("button", { name: "Deselect All" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Clear Filters" })).toBeDisabled();
    await expect(page.getByRole("radio", { name: "Any selected tag" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "All selected tags" })).not.toBeChecked();

    await page.locator("[data-palette-tag-filter='batch']").check();
    await expect(page.getByRole("button", { name: "Clear Filters" })).toBeEnabled();
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Anchor']")).toHaveCount(1);
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Brownstone']")).toHaveCount(1);
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Bluegate']")).toHaveCount(0);
    await page.locator("[data-palette-tag-filter='solo']").check();
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Anchor']")).toHaveCount(1);
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Brownstone']")).toHaveCount(1);
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Bluegate']")).toHaveCount(0);
    await page.getByRole("radio", { name: "All selected tags" }).check();
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Anchor']")).toHaveCount(1);
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Brownstone']")).toHaveCount(0);
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Bluegate']")).toHaveCount(0);
    await page.locator("[data-palette-tag-filter='solo']").click();
    await expect(page.locator("[data-palette-tag-filter='solo']")).not.toBeChecked();
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Anchor']")).toHaveCount(1);
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-name='Brownstone']")).toHaveCount(1);
    await page.locator("[data-palette-tag-filter='solo']").check();
    await page.getByRole("button", { name: "Clear Filters" }).click();
    await expect(page.locator("[data-palette-tag-filter='batch']")).not.toBeChecked();
    await expect(page.locator("[data-palette-tag-filter='solo']")).not.toBeChecked();
    await expect(page.getByRole("button", { name: "Clear Filters" })).toBeDisabled();
    await expect(page.locator("[data-palette-user-list] [data-palette-swatch-key]")).toHaveCount(3);

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Colors rejects invalid payloads before render and blocks editing without an active project", async ({ page }) => {
  const invalidFailures = await openRepoPage(page, "/toolbox/colors/index.html?palette=invalid");

  try {
    await expect(page.locator("[data-palette-log]")).toContainText("Invalid Colors payload rejected before render");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Hex");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Name");
    await expect(page.locator("[data-palette-count]")).toHaveText("0");
    expectNoPageFailures(invalidFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await invalidFailures.server.close();
  }

  const missingProjectFailures = await openRepoPage(page, "/toolbox/colors/index.html?project=missing");

  try {
    await expect(page.locator("[data-palette-active-project]")).toHaveText("No active project.");
    await expect(page.locator("[data-palette-project-overlay]")).toBeVisible();
    await expect(page.locator("[data-palette-add]")).toBeDisabled();
    await expect(page.locator("[data-palette-update]")).toBeDisabled();
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Active Project");
    expectNoPageFailures(missingProjectFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await missingProjectFailures.server.close();
  }
});

test("Theme V2 Admin Controls range slider displays a live persistent value", async ({ page }) => {
  const failures = await openRepoPage(page, "/admin/controls.html", {
    sessionUserKey: MOCK_DB_KEYS.users.admin
  });

  try {
    await expect(page.getByRole("heading", { name: "Controls.", level: 1 })).toBeVisible();
    await expect(page.locator("#range")).toHaveValue("68");
    await expect(page.locator("#range")).toHaveAttribute("data-slider-default", "68");
    await expect(page.locator("#range")).toHaveAttribute("title", "Double-click to reset to default 68.");
    await expect(page.locator("[data-slider-value-for='range']")).toHaveText("68");
    await page.locator("#range").evaluate((control) => {
      control.value = "42";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.locator("[data-slider-value-for='range']")).toHaveText("42");
    await page.locator("#range").evaluate((control) => {
      control.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    });
    await expect(page.locator("#range")).toHaveValue("68");
    await expect(page.locator("[data-slider-value-for='range']")).toHaveText("68");
    await expect(page.locator("[oninput], [onchange], [onclick]")).toHaveCount(0);
    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});
