import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { startRepoServer } from "../helpers/playwrightRepoServer.mjs";

const TOOL_PATH = "/toolbox/palette-manager-v2/index.html";
const ACCORDION_CONTENT_IDS = Object.freeze([
  { id: "userPaletteAccordionContent", label: "User Palette" },
  { id: "sourcePaletteAccordionContent", label: "Sample Palette Swatch" },
  { id: "tagsAccordionContent", label: "Tags" },
  { id: "selectedSwatchAccordionContent", label: "Selected Swatch" },
  { id: "userDefinedSwatchAccordionContent", label: "User Defined Swatch" },
  { id: "importExportAccordionContent", label: "Palette JSON" },
  { id: "validationErrorAccordionContent", label: "Validation/Error Viewer" }
]);

function createFailureMessage(label, details) {
  return `${label}: ${details}`;
}

async function assertLocatorActionable(locator, label) {
  await locator.waitFor({ state: "visible" });
  assert.equal(await locator.isEnabled(), true, `${label} should be enabled.`);
  await locator.click({ trial: true });
}

async function assertAccordionToggles(page, { id, label }) {
  const header = page.locator(`.accordion-v2__header[aria-controls="${id}"]`);
  const content = page.locator(`#${id}`);

  assert.equal(await header.count(), 1, `${label} accordion header should exist once.`);
  assert.equal(await content.count(), 1, `${label} accordion content should exist once.`);
  await header.waitFor({ state: "visible" });

  await header.click();
  await page.waitForFunction((contentId) => {
    const element = document.getElementById(contentId);
    return Boolean(element?.hidden);
  }, id);
  assert.equal(await header.getAttribute("aria-expanded"), "false", `${label} should collapse.`);

  await header.click();
  await page.waitForFunction((contentId) => {
    const element = document.getElementById(contentId);
    return Boolean(element && !element.hidden);
  }, id);
  assert.equal(await header.getAttribute("aria-expanded"), "true", `${label} should reopen.`);
}

async function selectLargestSourcePalette(page) {
  const largestPalette = await page.evaluate(() => {
    const palettes = globalThis.paletteList?.SOURCE_PALETTES || {};
    const entries = Object.entries(palettes)
      .map(([sourceId, swatches]) => ({ sourceId, count: Array.isArray(swatches) ? swatches.length : 0 }))
      .sort((left, right) => right.count - left.count);
    return entries[0] || null;
  });

  assert.ok(largestPalette, "Palette Manager should expose source palettes.");
  assert.ok(largestPalette.count > 12, `Expected a scrollable source palette, found ${largestPalette.count} swatches.`);
  await page.locator("#sourcePaletteSelect").selectOption(largestPalette.sourceId);
  await page.waitForFunction((minimumCount) => {
    return document.querySelectorAll("#sourceSwatchList .palette-manager-v2__source-tile").length >= minimumCount;
  }, Math.min(12, largestPalette.count));
  return largestPalette;
}

async function assertSourcePinPreservesScroll(page) {
  await selectLargestSourcePalette(page);
  const result = await page.evaluate(async () => {
    const grid = document.getElementById("sourceSwatchList");
    if (!grid) {
      return { error: "missing source grid" };
    }
    grid.scrollTop = Math.min(220, Math.max(0, grid.scrollHeight - grid.clientHeight));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const before = grid.scrollTop;
    const gridRect = grid.getBoundingClientRect();
    const visiblePinButton = Array.from(grid.querySelectorAll(".palette-manager-v2__source-tile .palette-manager-v2__pin-button"))
      .find((button) => {
        const rect = button.getBoundingClientRect();
        return rect.top >= gridRect.top && rect.bottom <= gridRect.bottom;
      });

    if (!visiblePinButton) {
      return {
        before,
        after: grid.scrollTop,
        clicked: false,
        scrollHeight: grid.scrollHeight,
        clientHeight: grid.clientHeight
      };
    }

    visiblePinButton.click();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return {
      before,
      after: grid.scrollTop,
      clicked: true,
      scrollHeight: grid.scrollHeight,
      clientHeight: grid.clientHeight
    };
  });

  assert.equal(result.error, undefined, result.error);
  assert.ok(result.scrollHeight > result.clientHeight, "Source grid should be scrollable for the pin scroll baseline.");
  assert.ok(result.before > 0, `Source grid should scroll before pinning. Result: ${JSON.stringify(result)}`);
  assert.equal(result.clicked, true, "A visible source swatch pin button should be clicked.");
  assert.ok(Math.abs(result.after - result.before) <= 1, `Source pin should preserve scrollTop. Result: ${JSON.stringify(result)}`);
}

async function addUserSwatch(page, swatch) {
  await page.locator("#swatchSymbolInput").fill(swatch.symbol);
  await page.locator("#swatchHexInput").fill(swatch.hex);
  await page.locator("#swatchNameInput").fill(swatch.name);
  await page.locator("#addSwatchButton").click();
  await page.waitForFunction((name) => {
    return globalThis.paletteManagerV2App?.getPaletteValue().swatches
      .some((entry) => entry.name === name);
  }, swatch.name);

  if (swatch.tag) {
    await page.locator("#tagEntryInput").fill(swatch.tag);
    await page.locator("#addTagButton").click();
    await page.waitForFunction(({ name, tag }) => {
      return globalThis.paletteManagerV2App?.getPaletteValue().swatches
        .some((entry) => entry.name === name && Array.isArray(entry.tags) && entry.tags.includes(tag));
    }, { name: swatch.name, tag: swatch.tag });
  }
}

async function createTagSortFixture(page) {
  const existingSymbols = await page.evaluate(() => {
    return globalThis.paletteManagerV2App?.getPaletteValue().swatches.map((swatch) => swatch.symbol) || [];
  });
  const symbolPool = ["A", "B", "C", "D", "E", "F", "G", "H"].filter((symbol) => !existingSymbols.includes(symbol));
  assert.ok(symbolPool.length >= 4, "Tag sort fixture needs four available symbols.");

  const swatches = [
    { symbol: symbolPool[0], hex: "#010203", name: "Tag Sort Zeta", tag: "zeta" },
    { symbol: symbolPool[1], hex: "#020304", name: "Tag Sort Alpha", tag: "alpha" },
    { symbol: symbolPool[2], hex: "#030405", name: "Tag Sort Untagged One" },
    { symbol: symbolPool[3], hex: "#040506", name: "Tag Sort Untagged Two" }
  ];

  for (const swatch of swatches) {
    await addUserSwatch(page, swatch);
  }
}

async function readUserTileRows(page) {
  return page.$$eval("#userSwatchList .palette-manager-v2__user-tile", (tiles) => {
    return tiles.map((tile) => {
      const title = tile.getAttribute("title") || "";
      const name = title.match(/^Name: (.*)$/m)?.[1] || "";
      const tagsText = title.match(/^Tags: (.*)$/m)?.[1] || "None";
      const tags = tagsText === "None"
        ? []
        : tagsText.split(",").map((tag) => tag.trim()).filter(Boolean);
      return { name, tags };
    });
  });
}

function assertTagRowsKeepUntaggedLast(rows, expectedTaggedNames, expectedTags, label) {
  const taggedRows = rows.filter((row) => row.tags.length > 0);
  const firstUntaggedIndex = rows.findIndex((row) => row.tags.length === 0);
  assert.ok(taggedRows.length >= expectedTaggedNames.length, `${label} should include tagged swatches.`);
  assert.ok(firstUntaggedIndex >= expectedTaggedNames.length, `${label} should keep untagged rows after tagged rows.`);
  assert.ok(rows.slice(firstUntaggedIndex).every((row) => row.tags.length === 0), `${label} should keep all trailing rows untagged.`);
  assert.deepEqual(
    taggedRows.slice(0, expectedTaggedNames.length).map((row) => row.name),
    expectedTaggedNames,
    `${label} should order tagged swatches by tag.`
  );
  assert.deepEqual(
    taggedRows.slice(0, expectedTags.length).map((row) => row.tags[0]),
    expectedTags,
    `${label} should expose expected tag order.`
  );
}

async function assertTagSortKeepsUntaggedLast(page) {
  await createTagSortFixture(page);
  const tagSortButton = page.locator('#userPaletteSortControls [data-sort-key="tag"]');

  await tagSortButton.click();
  await page.waitForFunction(() => {
    const active = document.querySelector('#userPaletteSortControls [data-sort-key="tag"].is-active');
    return Boolean(active && active.textContent.includes("Tag"));
  });
  assertTagRowsKeepUntaggedLast(
    await readUserTileRows(page),
    ["Tag Sort Alpha", "Tag Sort Zeta"],
    ["alpha", "zeta"],
    "Tag ascending sort"
  );

  await tagSortButton.click();
  await page.waitForFunction(() => {
    const active = document.querySelector('#userPaletteSortControls [data-sort-key="tag"].is-active');
    return Boolean(active && active.textContent.includes("Tag"));
  });
  assertTagRowsKeepUntaggedLast(
    await readUserTileRows(page),
    ["Tag Sort Zeta", "Tag Sort Alpha"],
    ["zeta", "alpha"],
    "Tag descending sort"
  );
}

async function run() {
  const server = await startRepoServer();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });
    page.on("requestfailed", (request) => {
      failedRequests.push(`${request.url()} ${request.failure()?.errorText || "failed"}`);
    });

    await page.goto(`${server.baseUrl}${TOOL_PATH}`, { waitUntil: "networkidle" });
    await page.locator(".palette-manager-v2.app-shell").waitFor({ state: "visible" });

    const menu = page.locator('nav[aria-label="menuSample"]');
    await menu.waitFor({ state: "visible" });
    assert.equal(await menu.count(), 1, "menuSample nav should exist once.");

    await assertLocatorActionable(page.locator("#importPaletteButton"), "Import JSON");
    await assertLocatorActionable(page.locator("#copyPaletteButton"), "Copy JSON");
    await assertLocatorActionable(page.locator("#exportPaletteButton"), "Export JSON");

    for (const accordion of ACCORDION_CONTENT_IDS) {
      await assertAccordionToggles(page, accordion);
    }

    const clearButtonInsideViewerHeader = await page.locator(".palette-manager-v2__validation-header #clearValidationViewerButton").count();
    assert.equal(clearButtonInsideViewerHeader, 1, "Validation/Error Viewer Clear button should be inside the viewer header.");

    await assertSourcePinPreservesScroll(page);
    await assertTagSortKeepsUntaggedLast(page);

    assert.deepEqual(pageErrors, [], createFailureMessage("page errors", pageErrors.join(" | ")));
    assert.deepEqual(consoleErrors, [], createFailureMessage("console errors", consoleErrors.join(" | ")));
    assert.deepEqual(failedRequests, [], createFailureMessage("failed requests", failedRequests.join(" | ")));
    console.log("Palette Manager V2 Playwright baseline: PASS");
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.close();
  }
}

await run();
