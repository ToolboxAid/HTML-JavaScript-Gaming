import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { startRepoServer } from "../helpers/playwrightRepoServer.mjs";

const TOOL_PATH = "/tools/preview/index.html";

function createFailureMessage(label, details) {
  return `${label}: ${details}`;
}

async function assertButtonState(locator, expectedEnabled, label) {
  await locator.waitFor({ state: "visible" });
  assert.equal(await locator.isEnabled(), expectedEnabled, `${label} enabled state should be ${expectedEnabled}.`);
}

async function assertNoVisibleJsonControls(page) {
  const visibleJsonText = await page.locator("body").innerText();
  assert.equal(/\bJSON\b/i.test(visibleJsonText), false, "Preview Generator V2 should not show visible JSON UI text.");
  assert.equal(await page.locator("textarea:visible").count(), 0, "Preview Generator V2 should not show visible JSON textareas.");
  assert.equal(await page.locator("pre:visible").count(), 0, "Preview Generator V2 should not show visible JSON preview blocks.");
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
    await page.locator(".preview-generator-v2.app-shell").waitFor({ state: "visible" });

    assert.equal(await page.locator(".tools-platform-frame__title", { hasText: "Preview Generator V2" }).count(), 1);
    assert.equal(await page.locator("nav.preview-generator-v2__menu-sample[aria-label=\"menuSample\"]").count(), 1);
    assert.equal(await page.locator(".preview-generator-v2__panel").count(), 3, "Preview Generator V2 should render three panels.");
    assert.equal(await page.locator("#previewCanvas").count(), 1, "Main preview canvas should exist.");
    assert.equal(await page.locator("#lastGeneratedPreviewSection").count(), 1, "Last Generated Preview section should exist.");

    const generateButton = page.locator("#generatePreviewButton");
    const applyButton = page.locator("#applyToGameButton");
    const exportButton = page.locator("#exportImageButton");
    await assertButtonState(generateButton, false, "Generate Preview initial");
    await assertButtonState(applyButton, false, "Apply to Game initial");
    await assertButtonState(exportButton, false, "Export Image initial");

    const targetRadios = page.locator('input[type="radio"][name="previewTarget"]');
    assert.equal(await targetRadios.count(), 3, "Target selection should use three native previewTarget radios.");
    assert.deepEqual(
      (await targetRadios.evaluateAll((inputs) => inputs.map((input) => input.value).sort())),
      ["game", "sample", "tool"],
      "Target radio values should include game, sample, and tool."
    );
    assert.equal(await page.locator("select#previewTargetModeGroup, select[name=\"previewTarget\"]").count(), 0);

    await assertNoVisibleJsonControls(page);

    await page.locator("#previewTargetModeSample").check();
    await page.locator("#previewTargetInput").fill("0107");
    await page.waitForFunction(() => !document.getElementById("generatePreviewButton")?.disabled);
    await assertButtonState(generateButton, true, "Generate Preview after Sample selection");
    await assertButtonState(applyButton, false, "Apply to Game remains disabled for Sample");
    await assertButtonState(exportButton, false, "Export Image before generation");

    await generateButton.click();
    await page.waitForFunction(() => Boolean(document.getElementById("lastGeneratedPreviewImage")?.getAttribute("src")));
    await assertButtonState(exportButton, true, "Export Image after generation");
    await assertButtonState(applyButton, false, "Apply to Game remains disabled after Sample generation");

    await page.locator("#previewTargetModeGame").check();
    await page.locator("#previewTargetInput").fill("Bouncing-ball");
    await page.waitForFunction(() => document.getElementById("generatePreviewButton")?.disabled === true);
    await assertButtonState(generateButton, false, "Generate Preview blocked for Game without destination data");

    const destinationValidation = await page.evaluate(() => {
      return globalThis.previewGeneratorV2App.setDestinationData({ assets: {} });
    });
    assert.equal(destinationValidation.valid, true, "Test destination data should validate.");
    await page.waitForFunction(() => !document.getElementById("generatePreviewButton")?.disabled);
    await assertButtonState(generateButton, true, "Generate Preview enabled for Game with valid destination data");

    await generateButton.click();
    await page.waitForFunction(() => !document.getElementById("applyToGameButton")?.disabled);
    await assertButtonState(applyButton, true, "Apply to Game enabled after Game generation");
    await applyButton.click();

    const destinationData = await page.evaluate(() => globalThis.previewGeneratorV2App.getDestinationData());
    assert.deepEqual(
      destinationData.assets["image.bouncing-ball.preview"],
      {
        path: "games/Bouncing-ball/assets/images/preview.svg",
        kind: "image",
        source: "asset-browser"
      },
      "Apply to Game should add the schema-compatible game preview asset entry."
    );

    await exportButton.click({ trial: true });
    await assertNoVisibleJsonControls(page);

    assert.deepEqual(pageErrors, [], createFailureMessage("page errors", pageErrors.join(" | ")));
    assert.deepEqual(consoleErrors, [], createFailureMessage("console errors", consoleErrors.join(" | ")));
    assert.deepEqual(failedRequests, [], createFailureMessage("failed requests", failedRequests.join(" | ")));
    console.log("Preview Generator V2 first pass Playwright coverage: PASS");
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.close();
  }
}

await run();
