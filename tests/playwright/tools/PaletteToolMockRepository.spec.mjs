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
  { source: "reference", sourceLabel: "Reference", symbol: "R", hex: "#FF0000", name: "Reference Red", tags: ["warm"] },
  { source: "reference", sourceLabel: "Reference", symbol: "G", hex: "#00FF00", name: "Reference Green", tags: ["cool"] }
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
  "256 colors",
  "128 colors",
  "64 colors",
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

async function fillUserSwatch(page, { hex, name, symbol }) {
  await page.locator("[data-palette-symbol]").fill(symbol);
  await page.locator("[data-palette-hex]").fill(hex);
  await page.locator("[data-palette-name]").fill(name);
}

async function addUserSwatch(page, swatch) {
  await fillUserSwatch(page, swatch);
  await expect(page.getByRole("button", { name: "Add User Defined" })).toBeEnabled();
  await page.getByRole("button", { name: "Add User Defined" }).click();
  await expect(page.locator(`[data-palette-swatch-row='${swatch.symbol}']`)).toHaveAttribute("data-palette-swatch-name", swatch.name);
}

async function currentPreviewHexes(page, row) {
  return page.locator(`[data-palette-generator-preview-row='${row}'] [data-palette-generator-color]`).evaluateAll((swatches) => (
    swatches.map((swatch) => swatch.value.toUpperCase())
  ));
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

  const invalidInput = { symbol: "AB", hex: "#112233", name: "Invalid Symbol", tags: ["Hero"] };
  const invalidResult = repository.addSwatch(invalidInput);
  expect(invalidResult.ok).toBe(false);
  expect(invalidResult.issues.map((issue) => issue.label)).toContain("Symbol");
  expect(invalidInput.tags).toEqual(["Hero"]);
  expect(repository.getSnapshot().workspace.tools["palette-browser"].swatches).toEqual([]);

  expect(repository.addSwatch({ symbol: "H", hex: "#123456AA", name: "Hero Blue" }).ok).toBe(true);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Hero Blue", symbol: "H" });
  expect(repository.getTables().palette_colors).toHaveLength(1);
  expect(repository.getSnapshot().tableCounts).toEqual(expect.arrayContaining([
    expect.objectContaining({ rows: 1, table: "palette_colors" })
  ]));

  const sourceSwatch = repository.listSourceSwatches({ sourceId: "reference", sortKey: "hue" })[0];
  const pinResult = repository.pinSourceSwatch(sourceSwatch);
  expect(pinResult.ok).toBe(true);
  expect(repository.findSwatch("R")).toMatchObject({ name: "Reference Red", source: "reference", tags: [] });
  expect(repository.displaySource("reference")).toBe("Reference");

  const tagResult = repository.addTagToSwatches(["H", "R"], "batch");
  expect(tagResult.ok).toBe(true);
  expect(repository.findSwatch("H")).toMatchObject({ name: "Hero Blue", tags: ["batch"] });
  expect(repository.findSwatch("R")).toMatchObject({ name: "Reference Red", tags: ["batch"] });
  expect(repository.findSwatch("G")).toBeNull();

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

test("Palette Tool adds, updates, validates, and shows project-owned swatches", async ({ page }) => {
  test.setTimeout(120000);
  const failures = await openRepoPage(page, "/toolbox/colors/index.html");

  try {
    await expect(page.getByRole("heading", { name: "Colors" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Selected Swatches", exact: true })).toBeVisible();
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
      "[data-palette-selected-symbol]",
      "[data-palette-selected-hex]",
      "[data-palette-selected-name]",
      "[data-palette-tags]",
      "[data-palette-symbol]",
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
    await expect(page.getByRole("button", { name: "Add User Defined" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Update Selected" })).toBeDisabled();
    await expect(page.locator("[data-palette-tags]")).toBeDisabled();

    await fillUserSwatch(page, { symbol: "HH", hex: "#12", name: "" });
    await expect(page.getByRole("button", { name: "Add User Defined" })).toBeDisabled();
    await expectUserHexPreview(page, "invalid", "#ffffff");
    await expect(page.locator("[data-palette-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Symbol");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Hex");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Name");

    await addUserSwatch(page, { symbol: "H", hex: "#123456aa", name: "Hero Blue" });
    await expect(page.locator("[data-palette-count]")).toHaveText("1");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-hex", "#123456AA");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("title", "Name: Hero Blue\nHex: #123456AA\nSource: custom");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-selected", "true");
    await expectReadableDisabledField(page, "[data-palette-selected-symbol]", "H");
    await expectReadableDisabledField(page, "[data-palette-selected-hex]", "#123456AA");
    await expectReadableDisabledField(page, "[data-palette-selected-name]", "Hero Blue");
    await expect(page.locator("[data-palette-tags]")).toBeEnabled();
    await expect(page.getByRole("button", { name: "Update Selected" })).toBeEnabled();

    await page.locator("[data-palette-tags]").fill("hero");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-tags", "hero");
    await page.locator("[data-palette-tags]").fill("ui");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-tags", "hero, ui");
    await expect(page.locator("[data-palette-editor-tags-list] [data-palette-tag-value]")).toHaveText(["hero", "ui"]);

    await page.locator("[data-palette-symbol]").fill("J");
    await page.locator("[data-palette-hex]").fill("#ABCDEF");
    await page.locator("[data-palette-name]").fill("Hero Updated");
    await page.getByRole("button", { name: "Update Selected" }).click();
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("data-palette-swatch-name", "Hero Updated");
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("data-palette-swatch-tags", "hero, ui");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Hero Updated");
    await expect(page.locator("[data-palette-table-counts]")).toContainText("palette_colors");

    await page.locator("[data-palette-harmony-scheme]").selectOption("triadic");
    await expect(page.locator("[data-palette-harmony-choice]")).toHaveCount(2);
    await page.locator("[data-palette-harmony-choice='1']").click();
    await expect(page.locator("[data-palette-count]")).toHaveText("2");
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Triadic 2");

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
    await expect(page.locator("[data-palette-project-accordion] > summary")).toHaveText("Selected Swatches");
    await expect(page.locator("[data-palette-source-accordion] > summary")).toHaveText("Defined Swatch Selector");
    await expect(page.locator("[data-palette-generator-accordion] > summary")).toHaveText("Swatch Type / Theme");
    await expect(page.locator("[data-palette-project-accordion] [data-palette-generator-preview]")).toHaveCount(1);
    await expect(page.locator("[data-palette-generator-accordion] [data-palette-generator-preview]")).toHaveCount(0);
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

    await expect(page.locator("[data-palette-generator-preview-row]")).toHaveCount(8);
    await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(64);
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
        await expect(page.locator("[data-palette-generator-swatch]")).toHaveCount(8);
        await expect(page.locator("[data-palette-generator-preview-status]")).toContainText(`${collection} / ${type}`);
      }
    }

    await page.locator("[data-palette-generator-generate]").click();
    await expect(page.locator("[data-palette-generator-preview-status]")).toContainText("Computer / Amiga");

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

    await addUserSwatch(page, { symbol: "A", hex: "#111111", name: "Anchor" });
    await addUserSwatch(page, { symbol: "B", hex: "#6B4F2A", name: "Brownstone" });
    await addUserSwatch(page, { symbol: "C", hex: "#264EA4", name: "Bluegate" });
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
    const anchorTile = anchorItem.locator("[data-palette-swatch-row]");
    const brownTile = brownItem.locator("[data-palette-swatch-row]");
    const blueTile = blueItem.locator("[data-palette-swatch-row]");
    const anchorCheck = anchorItem.locator("[data-palette-swatch-check]");
    const brownCheck = brownItem.locator("[data-palette-swatch-check]");

    await anchorTile.click();
    await expect(page.locator("[data-palette-selected-summary]")).toHaveText("Anchor");
    const checkBox = await anchorCheck.boundingBox();
    const tileBox = await anchorTile.boundingBox();
    expect((checkBox?.x || 0) - (tileBox?.x || 0)).toBeLessThan(10);
    expect((checkBox?.y || 0) - (tileBox?.y || 0)).toBeLessThan(10);

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
