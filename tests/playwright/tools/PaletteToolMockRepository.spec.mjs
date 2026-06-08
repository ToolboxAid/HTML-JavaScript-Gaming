import { expect, test } from "@playwright/test";
import {
  PALETTE_WORKSPACE_PATH,
  PALETTE_TOOL_TABLES,
  createProjectWorkspacePaletteRepository,
  validatePaletteWorkspacePayload
} from "../../../src/dev-runtime/persistence/tool-repositories/palette-workspace-repository.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { expectCompactToolFormControls } from "../../helpers/toolFormControlAssertions.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const sourcePaletteRows = [
  { source: "reference", sourceLabel: "Reference", swatchKey: "reference-red", hex: "#FF0000", name: "Reference Red", tags: ["warm"] },
  { source: "reference", sourceLabel: "Reference", swatchKey: "reference-green", hex: "#00FF00", name: "Reference Green", tags: ["cool"] }
];

const expectedThemeTypes = {
  Nature: ["Forest", "Jungle", "Desert", "Mountain", "Arctic", "Swamp", "Ocean", "Tropical"],
  ROYGBIV: ["ROYGBIV"],
  Floral: ["Rose Garden", "Spring Bloom", "Wildflowers", "Lavender Field", "Autumn Harvest"],
  Water: ["Deep Ocean", "Tropical Reef", "River", "Lake", "Storm Sea", "Frozen Water"],
  Elements: ["Fire", "Ice", "Earth", "Air", "Lightning", "Poison", "Crystal"],
  Fantasy: ["Medieval", "Dwarven", "Elven", "Dark Kingdom", "Magic", "Dragon"],
  "Sci-Fi": ["Space", "Cyberpunk", "Alien World", "Futuristic City", "Robot Factory"],
  Horror: ["Haunted House", "Gothic", "Blood Moon", "Undead", "Lovecraft"],
  Modern: ["City", "Industrial", "Military", "Construction", "Sports"],
  Arcade: ["Arcade 1978", "Arcade 1980", "Arcade 1985", "Arcade 1990"],
  "8-Bit": ["NES Inspired", "Master System Inspired", "ZX Spectrum Inspired", "Commodore 64 Inspired", "Game Boy Inspired"],
  "16-Bit": ["SNES Inspired", "Genesis Inspired", "TurboGrafx Inspired", "Neo Geo Inspired"],
  "32/64-Bit": ["PlayStation Inspired", "Nintendo 64 Inspired", "Saturn Inspired"],
  Computer: ["DOS VGA", "EGA", "CGA", "Amiga"]
};

const expectedVariants = [
  "Full",
  "32 colors",
  "16 colors",
  "8 colors",
  "4 colors",
  "High Contrast",
  "Color Blind Safe",
  "Grayscale",
  "Print Friendly",
  "Day",
  "Night",
  "Dawn",
  "Dusk",
  "Winter",
  "Summer"
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
    swatches.map((swatch) => swatch.value.toUpperCase())
  ));
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

  const sourceSwatch = repository.listSourceSwatches({ sourceId: "reference", sortKey: "hue" })[0];
  const pinResult = repository.pinSourceSwatch(sourceSwatch);
  expect(pinResult.ok).toBe(true);
  expect(repository.findSwatch("reference-red")).toMatchObject({ name: "Reference Red", source: "reference", tags: [] });
  expect(repository.displaySource("reference")).toBe("Reference");

  const tagResult = repository.addTagToSwatches([heroKey, "reference-red"], "batch");
  expect(tagResult.ok).toBe(true);
  expect(repository.findSwatch(heroKey)).toMatchObject({ name: "Hero Blue", tags: ["batch"] });
  expect(repository.findSwatch("reference-red")).toMatchObject({ name: "Reference Red", tags: ["batch"] });
  expect(repository.findSwatch("reference-green")).toBeNull();

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

  const lifecycleRepository = createProjectWorkspacePaletteRepository({ sourcePaletteRows });
  const lifecycleAdd = lifecycleRepository.addSwatch({ hex: "#224466", name: "Lifecycle Blue" });
  expect(lifecycleAdd.ok).toBe(true);
  const lifecycleKey = lifecycleAdd.snapshot.selectedSwatch.key;
  expect(lifecycleRepository.updateSelectedSwatch({ hex: "#224477", name: "Lifecycle Updated" }).ok).toBe(true);
  expect(lifecycleRepository.findSwatch(lifecycleKey)).toMatchObject({ hex: "#224477", name: "Lifecycle Updated" });
  expect(lifecycleRepository.removeSwatch(lifecycleKey).ok).toBe(true);
  expect(lifecycleRepository.findSwatch(lifecycleKey)).toBeNull();
  const lifecycleSourceSwatch = lifecycleRepository.listSourceSwatches({ sourceId: "reference" })[0];
  expect(lifecycleRepository.pinSourceSwatch(lifecycleSourceSwatch).ok).toBe(true);
  expect(lifecycleRepository.findSwatch(lifecycleSourceSwatch.key)).toMatchObject({ name: lifecycleSourceSwatch.name });
  expect(lifecycleRepository.removeSwatch(lifecycleSourceSwatch.key).ok).toBe(true);
  expect(lifecycleRepository.findSwatch(lifecycleSourceSwatch.key)).toBeNull();
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

test("Palette Tool adds, updates, validates, and shows project-owned swatches", async ({ page }) => {
  test.setTimeout(120000);
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await expect(page.getByRole("heading", { name: "Colors" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Palette", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Selected Swatches", exact: true })).toHaveCount(0);
    await expect(page.locator(".tool-workspace")).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/import json|export json|Crayola/i);
    await expect(page.locator("[data-palette-source-select], [data-palette-source-search], [data-palette-source-pin-all]")).toHaveCount(0);
    await expect(page.locator("[data-palette-active-project]")).toHaveText("Demo Project - Game Project");
    await expect(page.locator("[data-palette-storage-path]")).toHaveText("tools.palette-browser.swatches");
    await expect(page.locator("[data-palette-count]")).toHaveText("0");
    await expect(page.locator("[data-palette-editor-form] button")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Remove Selected" })).toHaveCount(0);
    await expect(page.getByText("Project Palette Tags")).toHaveCount(0);
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
    expect(tagEditorLayout.columnHeading).toBe("Inspector");
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
    await expect(page.locator("[data-palette-table-counts]")).toContainText("palette_colors");

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

test("Palette Tool renders curated swatch selector controls and live preview", async ({ page }) => {
  test.setTimeout(120000);
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await expect(page.locator("[data-palette-fullscreen-panels] > details > summary")).toHaveText([
      "Project Swatches",
      "Picker Preview"
    ]);
    const accordionOrder = await page.locator("[data-palette-picker-accordion]").evaluate((pickerAccordion) => {
      const projectWorkspaceAccordion = pickerAccordion.previousElementSibling;
      return {
        pickerTop: Math.round(pickerAccordion.getBoundingClientRect().top),
        projectWorkspaceTop: Math.round(projectWorkspaceAccordion.getBoundingClientRect().top)
      };
    });
    expect(accordionOrder.projectWorkspaceTop).toBeLessThan(accordionOrder.pickerTop);
    await expect(page.locator("[data-palette-picker-accordion]")).toBeVisible();
    await expect(page.locator("[data-palette-project-accordion] [data-palette-generator-preview]")).toHaveCount(0);
    await expect(page.locator("[data-palette-picker-accordion] [data-palette-generator-preview]")).toHaveCount(0);
    await expect(page.locator("[data-palette-preview-accordion] [data-palette-generator-preview]")).toHaveCount(1);
    await expect(page.locator("[data-palette-preview-accordion]")).not.toHaveClass(/accordion-fill-panel/);
    await expect(page.getByRole("heading", { name: "Defined Swatch Selector" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Swatch Type / Theme" })).toHaveCount(0);
    await expect(page.locator("[data-palette-source-select], [data-palette-source-search], [data-palette-source-pin-all]")).toHaveCount(0);

    await expect(page.locator("[data-palette-theme-collection] option")).toHaveText(Object.keys(expectedThemeTypes));
    await expect(page.locator("[data-palette-generator-type] option")).toHaveText(expectedThemeTypes.Nature);
    await expect(page.locator("[data-palette-generator-variant] option")).toHaveText(expectedVariants);
    await expect(page.locator("[data-palette-generator-colors] option")).toHaveText([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "12",
      "16",
      "24",
      "32",
      "64",
      "128",
      "256"
    ]);
    await expect(page.locator("[data-palette-generator-steps] option")).toHaveText(["2", "4", "8", "16", "32", "64"]);
    await expect(page.locator("[data-palette-generator-contrast]")).toHaveValue("40");
    await expect(page.locator("[data-palette-generator-saturation]")).toHaveValue("100");
    await expect(page.locator("[data-palette-generator-hue-shift]")).toHaveValue("0");
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
        return {
          inputTop: Math.round(input.getBoundingClientRect().top),
          labelTop: Math.round(label.getBoundingClientRect().top)
        };
      });
      const summary = accordion.querySelector("[data-palette-generator-grid-summary]");
      return {
        rowAlignment: rows.map((row) => Math.abs(row.controlTop - row.labelTop)),
        sliderPositions: sliders.map((slider) => slider.inputTop),
        slidersStackedUnderLabels: sliders.map((slider) => slider.labelTop < slider.inputTop),
        summaryText: summary.textContent.trim()
      };
    });
    expect(pickerLayout.rowAlignment.every((offset) => offset <= 4)).toBe(true);
    expect(pickerLayout.summaryText).toBe("Colors x Steps 8 x 8");
    expect(pickerLayout.sliderPositions[0]).toBeLessThan(pickerLayout.sliderPositions[1]);
    expect(pickerLayout.sliderPositions[1]).toBeLessThan(pickerLayout.sliderPositions[2]);
    expect(pickerLayout.slidersStackedUnderLabels.every(Boolean)).toBe(true);
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

    await expect(page.locator("[data-palette-generator-preview-row]")).toHaveCount(8);
    await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(64);
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
    expect(initialAvailability.total).toBe(64);
    await expect(page.locator("[data-palette-generator-preview-status]")).toHaveText(`Available Picker Swatches (${initialAvailability.available})`);
    await expect(page.locator("[data-palette-generator-swatch][data-palette-generator-unavailable='true']")).toHaveCount(initialAvailability.unavailable);
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-collection", "Nature");
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-type-name", "Forest");
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-variant-name", "Full");

    const topColors = await currentPreviewHexes(page, 0);
    const bottomColors = await currentPreviewHexes(page, 7);
    expect(topColors).not.toContain("#FFFFFF");
    expect(bottomColors).not.toContain("#000000");

    const firstSwatch = page.locator("[data-palette-generator-color]").first();
    const initialBox = await firstSwatch.boundingBox();
    const initialColor = await firstSwatch.inputValue();
    await page.locator("[data-palette-generator-hue-shift]").evaluate((control) => {
      control.value = "45";
      control.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.locator("[data-palette-generator-hue-shift]")).toHaveValue("45");
    expect(await firstSwatch.inputValue()).not.toBe(initialColor);

    await page.locator("[data-palette-theme-collection]").selectOption("ROYGBIV");
    await expect(page.locator("[data-palette-generator-type] option")).toHaveText(["ROYGBIV"]);
    await page.locator("[data-palette-generator-colors]").selectOption("7");
    await page.locator("[data-palette-generator-steps]").selectOption("2");
    await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(14);
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

    await page.locator("[data-palette-generator-steps]").selectOption("8");
    await page.locator("[data-palette-theme-collection]").selectOption("Sci-Fi");
    await expect(page.locator("[data-palette-generator-type] option")).toHaveText(expectedThemeTypes["Sci-Fi"]);
    await page.locator("[data-palette-generator-type]").selectOption("Cyberpunk");
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-collection", "Sci-Fi");
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-type-name", "Cyberpunk");
    expect(await page.locator("[data-palette-generator-type] option").allTextContents()).not.toContain("Space Station");

    await page.locator("[data-palette-generator-variant]").selectOption("4");
    await expect(page.locator("[data-palette-generator-colors]")).toHaveValue("4");
    await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(32);

    await page.locator("[data-palette-generator-colors]").selectOption("16");
    await page.locator("[data-palette-generator-steps]").selectOption("16");
    await expect(page.locator("[data-palette-generator-preview-row]")).toHaveCount(16);
    await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(256);
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
    await page.locator("[data-palette-generator-reset]").click();
    await expect(page.locator("[data-palette-generator-contrast]")).toHaveValue("40");
    await expect(page.locator("[data-palette-generator-saturation]")).toHaveValue("100");
    await expect(page.locator("[data-palette-generator-hue-shift]")).toHaveValue("0");

    await page.locator("[data-palette-generator-colors]").selectOption("4");
    await page.locator("[data-palette-generator-steps]").selectOption("2");
    for (const [collection, types] of Object.entries(expectedThemeTypes)) {
      await page.locator("[data-palette-theme-collection]").selectOption(collection);
      await expect(page.locator("[data-palette-generator-type] option")).toHaveText(types);
      for (const type of types) {
        await page.locator("[data-palette-generator-type]").selectOption(type);
        await page.locator("[data-palette-generator-colors]").selectOption("4");
        await page.locator("[data-palette-generator-steps]").selectOption("2");
        await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(8);
        await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-collection", collection);
        await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-type-name", type);
      }
    }

    await page.locator("[data-palette-generator-generate]").click();
    await expect(page.locator("[data-palette-generator-preview-status]")).toHaveText("Available Picker Swatches (8)");
    await expect(page.locator("[data-palette-log]")).toContainText("Generated palette grid: Computer / Amiga");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Palette Tool preserves eight-column picker rows when swatches are unavailable", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await page.locator("[data-palette-generator-colors]").selectOption("8");
    await page.locator("[data-palette-generator-steps]").selectOption("2");
    await expectPickerRowsToHaveColumnCount(page, 8);
    const firstAvailableEightColumnSwatch = page.locator("[data-palette-generator-swatch][data-palette-generator-availability='available']").first();
    const eightColumnHex = await firstAvailableEightColumnSwatch.getAttribute("data-palette-generator-hex");
    await firstAvailableEightColumnSwatch.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("1");

    await expectPickerRowsToHaveColumnCount(page, 8);
    const unavailableEightColumnSwatch = page.locator(`[data-palette-generator-swatch][data-palette-generator-hex='${eightColumnHex}'][data-palette-generator-availability='unavailable']`);
    await expect(unavailableEightColumnSwatch).toHaveAttribute("data-palette-generator-unavailable-reason", "Already in Project");
    const unavailableEightColumnVisual = await unavailableEightColumnSwatch.evaluate((swatch) => ({
      cursor: getComputedStyle(swatch).cursor,
      opacity: getComputedStyle(swatch).opacity,
      value: swatch.querySelector("input[type='color']").value
    }));
    expect(unavailableEightColumnVisual.cursor).not.toBe("not-allowed");
    expect(unavailableEightColumnVisual.opacity).toBe("1");
    expect(unavailableEightColumnVisual.value.toUpperCase()).toBe((eightColumnHex || "").slice(0, 7).toUpperCase());

    await unavailableEightColumnSwatch.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("1");
    await expect(page.locator("[data-palette-log]")).toContainText("Already in Project picker swatch is already present and was not added again.");
    await page.locator("[data-palette-generator-swatch][data-palette-generator-availability='available']").first().click();
    await expect(page.locator("[data-palette-count]")).toHaveText("2");

    expectNoPageFailures(failures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await failures.server.close();
  }
});

test("Palette Tool blocks only earlier duplicate hexes within each picker column", async ({ page }) => {
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await page.locator("[data-palette-generator-colors]").selectOption("8");
    await page.locator("[data-palette-generator-steps]").selectOption("64");
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

    const earlierDuplicate = duplicateGroup[0];
    const bottomDuplicate = duplicateGroup.at(-1);
    const earlierSwatch = page.locator(`[data-palette-generator-row='${earlierDuplicate.row}'][data-palette-generator-column='${earlierDuplicate.column}']`);
    const bottomSwatch = page.locator(`[data-palette-generator-row='${bottomDuplicate.row}'][data-palette-generator-column='${bottomDuplicate.column}']`);

    await expect(earlierSwatch).toHaveAttribute("data-palette-generator-availability", "unavailable");
    await expect(earlierSwatch).toHaveAttribute("data-palette-generator-unavailable-reason", "Duplicate Hex in Column");
    await expect(earlierSwatch.locator("[data-palette-pin-indicator]")).toHaveCount(0);
    const earlierVisual = await earlierSwatch.evaluate((swatch) => ({
      cursor: getComputedStyle(swatch).cursor,
      opacity: getComputedStyle(swatch).opacity,
      value: swatch.querySelector("input[type='color']").value
    }));
    expect(earlierVisual.cursor).not.toBe("not-allowed");
    expect(earlierVisual.opacity).toBe("1");
    expect(earlierVisual.value.toUpperCase()).toBe(earlierDuplicate.hex.slice(0, 7).toUpperCase());
    await earlierSwatch.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("0");
    await expect(page.locator("[data-palette-log]")).toContainText("Duplicate Hex in Column picker swatch was not added.");

    await expect(bottomSwatch).toHaveAttribute("data-palette-generator-availability", "available");
    await expect(bottomSwatch.locator("[data-palette-pin-indicator]")).toHaveCount(1);
    await bottomSwatch.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("1");

    const uniqueSwatchData = await page.locator("[data-palette-generator-swatch][data-palette-generator-availability='available']").evaluateAll((swatches) => {
      const groups = new Map();
      swatches.forEach((swatch) => {
        const key = `${swatch.dataset.paletteGeneratorColumn}:${swatch.dataset.paletteGeneratorHex}`;
        groups.set(key, (groups.get(key) || 0) + 1);
      });
      return swatches
        .map((swatch) => ({
          column: swatch.dataset.paletteGeneratorColumn,
          hex: swatch.dataset.paletteGeneratorHex,
          row: swatch.dataset.paletteGeneratorRow
        }))
        .find((swatch) => groups.get(`${swatch.column}:${swatch.hex}`) === 1);
    });
    expect(uniqueSwatchData).toBeTruthy();
    const uniqueSwatch = page.locator(`[data-palette-generator-row='${uniqueSwatchData.row}'][data-palette-generator-column='${uniqueSwatchData.column}']`);
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
    await page.locator("[data-palette-generator-colors]").selectOption("4");
    await page.locator("[data-palette-generator-steps]").selectOption("2");
    await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(8);
    await expect(page.locator("[data-palette-generator-swatch][data-palette-generator-unavailable='true']")).toHaveCount(0);
    const pickerCursors = await page.locator("[data-palette-generator-swatch]").evaluateAll((swatches) => (
      swatches.map((swatch) => getComputedStyle(swatch).cursor)
    ));
    expect(pickerCursors.every((cursor) => cursor !== "not-allowed")).toBe(true);
    for (let index = 0; index < 8; index += 1) {
      await page.locator("[data-palette-generator-swatch][data-palette-generator-availability='available']").first().click();
    }
    await expect(page.locator("[data-palette-count]")).toHaveText("8");

    await page.locator("[data-palette-generator-reset]").click();
    const firstGenerated = page.locator("[data-palette-generator-swatch]").first();
    await page.locator("[data-palette-theme-collection]").selectOption("Sci-Fi");
    await page.locator("[data-palette-generator-type]").selectOption("Cyberpunk");
    await page.locator("[data-palette-generator-variant]").selectOption("16");
    await page.locator("[data-palette-generator-colors]").selectOption("16");
    await page.locator("[data-palette-generator-steps]").selectOption("4");
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
    await expect(firstGenerated).toHaveAttribute("data-palette-pinned", "false");
    const generatedName = await firstGenerated.getAttribute("data-palette-generator-name");
    const generatedHex = await firstGenerated.getAttribute("data-palette-generator-hex");
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
      return {
        columnGap: getComputedStyle(firstRow).columnGap,
        previewHeight: Math.round(previewBox.height),
        previewWidth: Math.round(previewBox.width),
        previewGap: getComputedStyle(preview).rowGap,
        rowHeightTotal: Math.round(rowHeightTotal),
        rowWidth: Math.round(rowBox.width),
        xGap: Math.round(rightBox.left - leftBox.right)
      };
    });
    expect(gridSpacing.previewGap).toBe("0px");
    expect(gridSpacing.columnGap).toBe("0px");
    expect(Math.abs(gridSpacing.xGap)).toBeLessThanOrEqual(1);
    expect(Math.abs(gridSpacing.rowWidth - gridSpacing.previewWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(gridSpacing.rowHeightTotal - gridSpacing.previewHeight)).toBeLessThanOrEqual(2);

    await firstGenerated.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("9");
    await expect(page.locator("[data-palette-log]")).toContainText("Added picker swatch");
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
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-hue-shift", "-35");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-sort-field", "hue");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-sort-direction", "asc");
    await expect(generatedTile).toHaveAttribute("data-palette-metadata-swatch-size", "medium");
    const unavailablePickerSwatch = page.locator(`[data-palette-generator-swatch][data-palette-generator-hex='${generatedHex}']`);
    await expect(unavailablePickerSwatch).toHaveAttribute("data-palette-pinned", "true");
    await expect(unavailablePickerSwatch.locator("[data-palette-pin-indicator]")).toHaveCount(0);
    await expect(unavailablePickerSwatch).toHaveAttribute("data-palette-generator-availability", "unavailable");
    await expect(unavailablePickerSwatch).toHaveAttribute("data-palette-generator-unavailable-reason", "Already in Project");
    await expect(unavailablePickerSwatch).not.toBeDisabled();
    const refreshedAvailability = await page.locator("[data-palette-generator-swatch]").evaluateAll((swatches) => {
      const unavailable = swatches.filter((swatch) => swatch.dataset.paletteGeneratorUnavailable === "true").length;
      return {
        available: swatches.length - unavailable,
        unavailable
      };
    });
    expect(refreshedAvailability.unavailable).toBeGreaterThanOrEqual(1);
    await expect(page.locator("[data-palette-generator-preview-status]")).toHaveText(`Available Picker Swatches (${refreshedAvailability.available})`);
    await expect(page.locator("[data-palette-picker-group-label='available']")).toHaveCount(0);
    await expect(page.locator("[data-palette-picker-group-label='unavailable']")).toHaveCount(0);
    await expect(page.locator("[data-palette-generator-swatch][data-palette-generator-unavailable='true']")).toHaveCount(refreshedAvailability.unavailable);
    await expectPickerRowsToHaveColumnCount(page, 16);
    const unavailableVisual = await unavailablePickerSwatch.evaluate((swatch) => ({
      cursor: getComputedStyle(swatch).cursor,
      opacity: getComputedStyle(swatch).opacity,
      value: swatch.querySelector("input[type='color']").value
    }));
    expect(unavailableVisual.cursor).not.toBe("not-allowed");
    expect(unavailableVisual.opacity).toBe("1");
    expect(unavailableVisual.value.toUpperCase()).toBe((generatedHex || "").slice(0, 7).toUpperCase());
    await unavailablePickerSwatch.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("9");
    await expect(page.locator("[data-palette-log]")).toContainText("Already in Project picker swatch is already present and was not added again.");
    await expect(page.locator("[data-palette-include-already-project-swatches]")).toHaveCount(0);
    await expect(unavailablePickerSwatch).toHaveAttribute("data-palette-generator-availability", "unavailable");
    await expect(page.locator("[data-palette-generator-swatch][data-palette-generator-unavailable='true']")).toHaveCount(refreshedAvailability.unavailable);

    await page.locator("[data-palette-theme-collection]").selectOption("Nature");
    await page.locator("[data-palette-generator-type]").selectOption("Forest");
    await page.locator("[data-palette-generator-variant]").selectOption("High Contrast");
    await page.locator("[data-palette-generator-colors]").selectOption("12");
    await page.locator("[data-palette-generator-steps]").selectOption("16");
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
    await expect(page.locator("[data-palette-generator-hue-shift]")).toHaveValue("-35");

    await page.locator("[data-palette-generator-generate]").click();
    await expect(page.locator("[data-palette-log]")).toContainText("Generated palette grid: Sci-Fi / Cyberpunk / 16 colors, 16 colors x 4 steps.");
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

test("Palette Tool rejects invalid payloads before render and blocks editing without an active project", async ({ page }) => {
  const invalidFailures = await openRepoPage(page, "/toolbox/colors/index.html?palette=invalid");

  try {
    await expect(page.locator("[data-palette-log]")).toContainText("Invalid palette payload rejected before render");
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
