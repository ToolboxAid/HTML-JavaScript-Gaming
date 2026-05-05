import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { startRepoServer } from "../helpers/playwrightRepoServer.mjs";

const TOOL_PATH = "/tools/preview-generator-v2/index.html";

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
  assert.equal(await page.locator("pre:visible").count(), 0, "Preview Generator V2 should not show visible JSON preview blocks.");
  assert.equal(await page.locator("textarea[aria-label*=\"JSON\" i]:visible").count(), 0, "Preview Generator V2 should not show visible JSON textareas.");
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
    await page.addInitScript(() => {
      const writes = [];
      class FakeFileHandle {
        constructor(path) {
          this.path = path;
        }

        async getFile() {
          return new File([""], this.path.split("/").pop() || "preview.svg", { type: "image/svg+xml" });
        }

        async createWritable() {
          const path = this.path;
          return {
            write: async (content) => {
              writes.push({ path, content: String(content) });
            },
            close: async () => {}
          };
        }
      }

      class FakeDirectoryHandle {
        constructor(path = "") {
          this.path = path;
          this.name = path ? path.split("/").pop() : "HTML-JavaScript-Gaming";
        }

        async getDirectoryHandle(name) {
          return new FakeDirectoryHandle(this.path ? `${this.path}/${name}` : name);
        }

        async getFileHandle(name, options = {}) {
          if (!options.create) {
            throw new Error("NotFound");
          }
          return new FakeFileHandle(this.path ? `${this.path}/${name}` : name);
        }
      }

      window.__previewGeneratorV2Writes = writes;
      window.showDirectoryPicker = async () => new FakeDirectoryHandle();
    });
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

    const navButtons = await page.locator("nav.preview-generator-v2__menu-sample button").allTextContents();
    assert.deepEqual(navButtons, ["Generate Preview"], "NAV should contain only Generate Preview.");
    assert.equal(await page.locator("#executeBtn").count(), 1, "Generate Preview should preserve the existing executeBtn id.");
    assert.equal(await page.locator("#applyToGameButton, #exportImageButton, #generatePreviewButton").count(), 0);

    const leftHeaders = await page.locator(".preview-generator-v2__panel--left .accordion-v2__header > span:first-child").allTextContents();
    assert.deepEqual(leftHeaders, ["Repo Destination", "Target Source", "Render Controls"]);
    const centerHeaders = await page.locator(".preview-generator-v2__panel--center .accordion-v2__header > span:first-child").allTextContents();
    assert.deepEqual(centerHeaders, ["Paths or IDs"]);
    const rightHeaders = await page.locator(".preview-generator-v2__panel--right .accordion-v2__header > span:first-child").allTextContents();
    assert.deepEqual(rightHeaders, ["Output Summary", "Status"]);

    assert.equal(await page.locator("#previewSurface, #lastGeneratedPreviewSection, #destinationDataInput").count(), 0);
    assert.equal(await page.locator("#sampleList").isVisible(), true, "Paths or IDs input box should be visible.");

    const executeButton = page.locator("#executeBtn");
    await assertButtonState(executeButton, false, "Generate Preview initial");

    const targetRadios = page.locator('input[type="radio"][name="targetType"]');
    assert.equal(await targetRadios.count(), 3, "Target selection should preserve three native targetType radios.");
    assert.deepEqual(
      (await targetRadios.evaluateAll((inputs) => inputs.map((input) => input.value).sort())),
      ["games", "samples", "tools"],
      "Target radio values should preserve samples, games, and tools."
    );
    assert.equal(await page.locator("#targetTypeSamples").isChecked(), true, "Samples should remain the default target.");
    assert.equal(await page.locator('input[name="previewTarget"], select#previewTargetModeGroup, select[name="previewTarget"]').count(), 0);

    await assertNoVisibleJsonControls(page);

    await page.locator("#baseUrl").fill(server.baseUrl);
    await page.locator("#sampleList").fill("0107");
    await page.locator("#pickRepoBtn").click();
    await page.waitForFunction(() => !document.getElementById("executeBtn")?.disabled);
    await assertButtonState(executeButton, true, "Generate Preview after repo selection");

    await executeButton.click();
    await page.waitForFunction(() => window.__previewGeneratorV2Writes.length >= 1);
    await page.waitForFunction(() => document.getElementById("log")?.textContent.includes("===== SUMMARY ====="));

    const writeResult = await page.evaluate(() => window.__previewGeneratorV2Writes[0]);
    assert.match(writeResult.path, /samples\/phase-01\/0107\/assets\/images\/preview\.svg$/);
    assert.match(writeResult.content, /<svg[\s>]/);

    const logText = await page.locator("#log").innerText();
    assert.match(logText, /Starting execution/);
    assert.match(logText, /Target type: samples/);
    assert.match(logText, /Done\./);

    await assertNoVisibleJsonControls(page);
    assert.deepEqual(pageErrors, [], createFailureMessage("page errors", pageErrors.join(" | ")));
    assert.deepEqual(consoleErrors, [], createFailureMessage("console errors", consoleErrors.join(" | ")));
    assert.deepEqual(failedRequests, [], createFailureMessage("failed requests", failedRequests.join(" | ")));
    console.log("Preview Generator V2 corrected reskin Playwright coverage: PASS");
  } finally {
    if (browser) {
      await browser.close();
    }
    await server.close();
  }
}

await run();
