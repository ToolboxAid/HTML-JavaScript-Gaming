import { expect, test } from "@playwright/test";
import {
  PALETTE_WORKSPACE_PATH,
  PALETTE_TOOL_TABLES,
  createProjectWorkspacePaletteRepository
} from "../../../toolbox/colors/palette-workspace-repository.js";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const sourcePaletteRows = [
  { source: "reference", sourceLabel: "Reference", symbol: "R", hex: "#FF0000", name: "Reference Red", tags: ["warm"] },
  { source: "reference", sourceLabel: "Reference", symbol: "G", hex: "#00FF00", name: "Reference Green", tags: ["cool"] }
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
  await expect(tile).toHaveAttribute("title", /^Symbol: .+\nHex: #[0-9A-F]{6,8}\nName: .+\nTags: .+$/i);
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
  await expect(group.locator("[data-palette-size-key='medium']")).toHaveClass(/primary/);
  await expect(group.locator("[data-palette-size-key='medium']")).toHaveAttribute("aria-pressed", "true");
  const groupBox = await group.boundingBox();
  const lastBox = await buttons.last().boundingBox();
  expect((groupBox?.x || 0) + (groupBox?.width || 0) - ((lastBox?.x || 0) + (lastBox?.width || 0))).toBeLessThan(8);
}

test("Palette repository owns active project swatches without mutating invalid payloads", async () => {
  const emptyRepository = createProjectWorkspacePaletteRepository();
  expect(emptyRepository.sourcePaletteOptions()).toEqual([]);
  expect(emptyRepository.listSourceSwatches()).toEqual([]);

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
      tags: ["hero", "ui"]
    }
  ]);
  expect(repository.getTables().palette_colors).toHaveLength(1);
  expect(repository.getSnapshot().tableCounts).toEqual(expect.arrayContaining([
    expect.objectContaining({ rows: 1, table: "palette_colors" })
  ]));

  expect(repository.addSwatch({ symbol: "H", hex: "#654321", name: "Other" }).ok).toBe(false);
  expect(repository.addSwatch({ symbol: "O", hex: "#654321", name: "Hero Blue" }).ok).toBe(false);
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
    tags: ["primary"]
  });

  expect(repository.undo().ok).toBe(true);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Hero Blue", symbol: "H" });
  expect(repository.redo().ok).toBe(true);
  expect(repository.getSnapshot().selectedSwatch).toMatchObject({ name: "Hero Updated", symbol: "J" });

  const sourceSwatch = repository.listSourceSwatches({ sourceId: "reference", sortKey: "hue" })[0];
  const pinResult = repository.pinSourceSwatch(sourceSwatch);
  expect(pinResult.ok).toBe(true);
  expect(repository.findSwatch("R")).toMatchObject({ name: "Reference Red", source: "reference" });
  expect(repository.listSwatches({ sortKey: "hue" }).map((swatch) => swatch.name)).toContain("Reference Red");
  expect(repository.createHarmonySuggestions(repository.findSwatch("R"), {
    matchSource: "calculated",
    schemeId: "triadic"
  })).toHaveLength(3);

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
    await expect(page.locator("[data-palette-table-counts]")).toContainText("palette_colors");
    await expect(page.locator("[data-palette-project-accordion]")).toBeVisible();
    await expect(page.locator("[data-palette-source-accordion]")).toBeVisible();
    await expect(page.locator("[data-palette-source-search]").locator("xpath=ancestor::*[@data-palette-source-scroll]")).toHaveCount(0);
    await expectSortButtons(page, "[data-palette-user-sort]");
    await expectSizeButtons(page, "[data-palette-user-size]");
    await expectSortButtons(page, "[data-palette-source-sort]");
    await expectSizeButtons(page, "[data-palette-source-size]");
    await expect(page.locator("[data-palette-source-select]")).toBeDisabled();
    await expect(page.locator("[data-palette-source-select] option")).toHaveText(["No source palettes"]);
    await expect(page.locator("[data-palette-source-list]")).toContainText("No source palettes found");
    await expect(page.locator("[data-palette-source-index]")).toHaveCount(0);
    await expect(page.locator("[data-palette-user-list]")).not.toContainText(/Symbol|Name|Hex|Source|Tags/);
    await expect(page.locator("[data-palette-source-list]")).not.toContainText(/Symbol|Name|Hex|Source|Tags/);
    await page.locator("[data-palette-source-sort] [data-palette-sort-key='hue']").click();
    await expect(page.locator("[data-palette-source-sort] [data-palette-sort-key='hue']")).toHaveText("Hue ^");
    await page.locator("[data-palette-source-sort] [data-palette-sort-key='hue']").click();
    await expect(page.locator("[data-palette-source-sort] [data-palette-sort-key='hue']")).toHaveText("Hue v");
    await page.locator("[data-palette-source-size] [data-palette-size-key='small']").click();
    await expect(page.locator("[data-palette-source-size] [data-palette-size-key='small']")).toHaveClass(/primary/);
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

    await page.getByRole("button", { name: "Add Swatch" }).click();
    await expect(page.locator("[data-palette-validation-overlay]")).toBeVisible();
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Symbol");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Hex");
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Name");

    await page.locator("[data-palette-symbol]").fill("H");
    await page.locator("[data-palette-hex]").fill("#123456aa");
    await page.locator("[data-palette-name]").fill("Hero Blue");
    await page.locator("[data-palette-tags]").fill("Hero, UI, hero");
    await page.getByRole("button", { name: "Add Swatch" }).click();
    await expect(page.locator("[data-palette-count]")).toHaveText("1");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-name", "Hero Blue");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-hex", "#123456AA");
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("title", "Symbol: H\nHex: #123456AA\nName: Hero Blue\nTags: hero, ui");
    await expect(page.locator("[data-palette-user-list]")).not.toContainText(/Hero Blue|#123456AA|hero, ui|Symbol|Name|Hex|Source|Tags/);
    await expect(page.locator("[data-palette-selected-details]")).toHaveCount(0);
    await expect(page.locator("[data-palette-project-accordion]")).not.toContainText(/Symbol:|Hex:|Name:|Source:|Tags:/);
    await expect(page.locator("[data-palette-table-counts]")).toContainText("palette_colors");
    await expect(page.locator("[data-palette-harmony-list]")).toContainText("Complementary");

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

    await page.locator("[data-palette-tags]").fill("he");
    await expect(page.locator("[data-palette-tag-suggestions] option")).toHaveAttribute("value", "hero");
    await page.locator("[data-palette-tags]").fill("feature");
    await page.locator("[data-palette-tags]").press("Enter");
    await expect(page.locator("[data-palette-editor-tags-list]")).toContainText("feature");

    await page.locator("[data-palette-symbol]").fill("J");
    await page.locator("[data-palette-hex]").fill("#ABCDEF");
    await page.locator("[data-palette-name]").fill("Hero Updated");
    await page.locator("[data-palette-tags]").fill("primary");
    await page.getByRole("button", { name: "Update Selected" }).click();
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("data-palette-swatch-name", "Hero Updated");
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("data-palette-swatch-tags", "feature, primary");
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("title", "Symbol: J\nHex: #ABCDEF\nName: Hero Updated\nTags: feature, primary");
    await expect(page.locator("[data-palette-user-list]")).not.toContainText(/Hero Updated|feature, primary|Symbol|Name|Hex|Source|Tags/);

    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.locator("[data-palette-swatch-row='H']")).toHaveAttribute("data-palette-swatch-name", "Hero Blue");
    await page.getByRole("button", { name: "Redo" }).click();
    await expect(page.locator("[data-palette-swatch-row='J']")).toHaveAttribute("data-palette-swatch-name", "Hero Updated");

    await page.locator("[data-palette-symbol]").fill("J");
    await page.locator("[data-palette-hex]").fill("#111111");
    await page.locator("[data-palette-name]").fill("Duplicate Symbol");
    await page.getByRole("button", { name: "Add Swatch" }).click();
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Duplicate Symbol");

    await page.getByRole("button", { name: "Clear Form" }).click();
    await expect(page.locator("[data-palette-symbol]")).toHaveValue("");
    await expect(page.locator("[data-palette-log]")).toHaveText("Editor form cleared.");

    await page.locator("[data-palette-harmony-scheme]").selectOption("triadic");
    await expect(page.locator("[data-palette-harmony-list]")).toContainText("Triadic");
    await page.locator("[data-palette-harmony-choice='1']").check();
    await page.locator("[data-palette-harmony-add-selected]").click();
    await expect(page.locator("[data-palette-log]")).toContainText("Saved palette to tools.palette-browser.swatches.");

    await page.getByLabel("Tool Display Mode").click();
    await expect(page.locator("body")).toHaveClass(/tool-focus-mode/);
    const projectBox = await page.locator("[data-palette-project-accordion]").boundingBox();
    const sourceBox = await page.locator("[data-palette-source-accordion]").boundingBox();
    expect(projectBox?.width || 0).toBeGreaterThan(300);
    expect(sourceBox?.width || 0).toBeGreaterThan(300);
    expect(sourceBox?.y || 0).toBeGreaterThan((projectBox?.y || 0) + (projectBox?.height || 0) - 4);
    expect(Math.abs((projectBox?.width || 0) - (sourceBox?.width || 0))).toBeLessThan(80);

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
    await expect(page.getByRole("button", { name: "Add Swatch" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Update Selected" })).toBeDisabled();
    await expect(page.locator("[data-palette-validation-list]")).toContainText("Active Project");
    expectNoPageFailures(missingProjectFailures);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await missingProjectFailures.server.close();
  }
});
