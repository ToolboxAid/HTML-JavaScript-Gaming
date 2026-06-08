import { expect, test } from "@playwright/test";
import {
  PALETTE_WORKSPACE_PATH,
  PALETTE_TOOL_TABLES,
  createProjectWorkspacePaletteRepository
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
    await expect(page.getByText("Project Palette Tags")).toBeVisible();
    await expect(page.getByText("Swatch Editor")).toHaveCount(0);
    await expect(page.locator("[data-palette-clear-checked]")).toBeDisabled();

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
      "Picker Swatches",
      "Picker Preview"
    ]);
    const accordionOrder = await page.locator("[data-palette-project-accordion]").evaluate((projectAccordion) => {
      const pickerAccordion = document.querySelector("[data-palette-picker-accordion]");
      return {
        pickerTop: Math.round(pickerAccordion.getBoundingClientRect().top),
        projectTop: Math.round(projectAccordion.getBoundingClientRect().top)
      };
    });
    expect(accordionOrder.projectTop).toBeLessThan(accordionOrder.pickerTop);
    await expect(page.locator("[data-palette-project-accordion] [data-palette-generator-preview]")).toHaveCount(0);
    await expect(page.locator("[data-palette-picker-accordion] [data-palette-generator-preview]")).toHaveCount(0);
    await expect(page.locator("[data-palette-preview-accordion] [data-palette-generator-preview]")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Defined Swatch Selector" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Swatch Type / Theme" })).toBeVisible();
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

    const selectorLayout = await page.locator("[data-palette-picker-accordion] .grid.cols-3").first().evaluate((grid) => (
      Array.from(grid.querySelectorAll("select")).map((select) => Math.round(select.getBoundingClientRect().top))
    ));
    expect(new Set(selectorLayout).size).toBe(1);
    const sliderLayout = await page.locator("[aria-label='Palette generator sliders']").evaluate((grid) => (
      Array.from(grid.querySelectorAll("input[type='range']")).map((slider) => Math.round(slider.getBoundingClientRect().top))
    ));
    expect(new Set(sliderLayout).size).toBe(1);
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
    await expect(page.locator("[data-palette-enable-picker-swatches]")).toBeChecked();
    await expect(page.locator("[data-palette-picker-disabled-reason]")).toContainText("display-only");
    await expect(page.locator("[data-palette-generator-swatch]:disabled")).toHaveCount(0);
    await page.locator("[data-palette-enable-picker-swatches]").uncheck();
    await expect(page.locator("[data-palette-picker-disabled-reason]")).toContainText("Enable visible picker swatches");
    await expect(page.locator("[data-palette-generator-swatch]:disabled")).toHaveCount(64);
    await page.locator("[data-palette-enable-picker-swatches]").check();
    await expect(page.locator("[data-palette-generator-swatch]:disabled")).toHaveCount(0);
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-collection", "Nature");
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-type-name", "Forest");
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-generator-variant-name", "Full");
    await expect(page.locator("[data-palette-generator-preview-status]")).toContainText("Nature / Forest / Full preview uses 8 colors and 8 steps.");

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

    await page.locator("[data-palette-theme-collection]").selectOption("Sci-Fi");
    await expect(page.locator("[data-palette-generator-type] option")).toHaveText(expectedThemeTypes["Sci-Fi"]);
    await page.locator("[data-palette-generator-type]").selectOption("Cyberpunk");
    await expect(page.locator("[data-palette-generator-preview-status]")).toContainText("Sci-Fi / Cyberpunk");
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
        await expect(page.locator("[data-palette-generator-preview-status]")).toContainText(`${collection} / ${type}`);
      }
    }

    await page.locator("[data-palette-generator-generate]").click();
    await expect(page.locator("[data-palette-generator-preview-status]")).toContainText("Computer / Amiga");
    await expect(page.locator("[data-palette-log]")).toContainText("Generated palette grid: Computer / Amiga");

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
    await expect(page.locator("[data-palette-generator-swatch]:disabled")).toHaveCount(0);
    const pickerCursors = await page.locator("[data-palette-generator-swatch]").evaluateAll((swatches) => (
      swatches.map((swatch) => getComputedStyle(swatch).cursor)
    ));
    expect(pickerCursors.every((cursor) => cursor !== "not-allowed")).toBe(true);
    for (let index = 0; index < 8; index += 1) {
      await page.locator("[data-palette-generator-swatch]").nth(index).click();
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
      const cells = Array.from(firstRow.querySelectorAll("[data-palette-generator-swatch]")).slice(0, 2);
      const leftBox = cells[0].getBoundingClientRect();
      const rightBox = cells[1].getBoundingClientRect();
      return {
        columnGap: getComputedStyle(firstRow).columnGap,
        previewGap: getComputedStyle(preview).rowGap,
        xGap: Math.round(rightBox.left - leftBox.right)
      };
    });
    expect(gridSpacing.previewGap).toBe("0px");
    expect(gridSpacing.columnGap).toBe("0px");
    expect(Math.abs(gridSpacing.xGap)).toBeLessThanOrEqual(1);

    await firstGenerated.click();
    await expect(page.locator("[data-palette-count]")).toHaveText("9");
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
    await expect(page.locator("[data-palette-generator-swatch]").first()).toHaveAttribute("data-palette-pinned", "true");
    await expect(page.locator("[data-palette-generator-swatch]").first().locator("[data-palette-pin-indicator]")).toHaveCount(1);
    await expect(page.locator("[data-palette-log]")).toContainText("Added picker swatch");

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
    await expect(page.getByText("Project Palette Tags")).toBeVisible();
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
