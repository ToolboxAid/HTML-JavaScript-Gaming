import { expect, test } from "@playwright/test";
import { startRepoServer } from "../helpers/playwrightRepoServer.mjs";
import { PlaywrightV8CoverageReporter } from "../helpers/playwrightV8CoverageReporter.mjs";

const coverageReporter = new PlaywrightV8CoverageReporter();

async function installFakeRepoPicker(page, {
  validSampleIds = ["0102"],
  invalidSampleIds = [],
  existingPreviewBySampleId = {}
} = {}) {
  await page.addInitScript(({
    validSampleIds: validIds,
    invalidSampleIds: invalidIds,
    existingPreviewBySampleId: existingPreviews
  }) => {
    class FakeFileHandle {
      constructor(name, path, contents = "") {
        this.kind = "file";
        this.name = name;
        this.path = path;
        this.contents = contents;
      }

      async getFile() {
        const handle = this;
        return {
          async text() {
            return handle.contents;
          }
        };
      }

      async createWritable() {
        const handle = this;
        return {
          async write(contents) {
            handle.contents = String(contents);
            window.__previewGeneratorV2Writes.push({ path: handle.path, contents: handle.contents });
          },
          async close() {}
        };
      }
    }

    class FakeDirectoryHandle {
      constructor(name, path = name) {
        this.kind = "directory";
        this.name = name;
        this.path = path;
        this.children = new Map();
      }

      addDirectory(name) {
        const directory = new FakeDirectoryHandle(name, `${this.path}/${name}`);
        this.children.set(name, directory);
        return directory;
      }

      addFile(name, contents = "") {
        const file = new FakeFileHandle(name, `${this.path}/${name}`, contents);
        this.children.set(name, file);
        return file;
      }

      async getDirectoryHandle(name, options = {}) {
        const child = this.children.get(name);
        if (child?.kind === "directory") {
          return child;
        }
        if (options.create) {
          return this.addDirectory(name);
        }
        throw new Error(`Missing directory: ${this.path}/${name}`);
      }

      async getFileHandle(name, options = {}) {
        const child = this.children.get(name);
        if (child?.kind === "file") {
          return child;
        }
        if (options.create) {
          return this.addFile(name);
        }
        throw new Error(`Missing file: ${this.path}/${name}`);
      }

      async *entries() {
        for (const entry of this.children.entries()) {
          yield entry;
        }
      }
    }

    const repo = new FakeDirectoryHandle("HTML-JavaScript-Gaming");
    const samples = repo.addDirectory("samples");
    const phase01 = samples.addDirectory("phase-01");
    repo.addDirectory("games");
    repo.addDirectory("tools");

    for (const sampleId of validIds) {
      const sampleDir = phase01.addDirectory(sampleId);
      sampleDir.addFile("index.html", "<!doctype html><canvas></canvas>");
      if (Object.prototype.hasOwnProperty.call(existingPreviews, sampleId)) {
        const assetsDir = sampleDir.addDirectory("assets");
        const imagesDir = assetsDir.addDirectory("images");
        imagesDir.addFile("preview.svg", existingPreviews[sampleId]);
      }
    }
    for (const sampleId of invalidIds) {
      phase01.addDirectory(sampleId);
    }
    phase01.addFile("0199", "not a sample folder");

    window.__previewGeneratorV2Writes = [];
    window.showDirectoryPicker = async () => repo;
  }, { validSampleIds, invalidSampleIds, existingPreviewBySampleId });
}

async function openPreviewGenerator(page, {
  withFakeRepo = false,
  validSampleIds,
  invalidSampleIds,
  existingPreviewBySampleId
} = {}) {
  const server = await startRepoServer();
  if (withFakeRepo) {
    await installFakeRepoPicker(page, {
      validSampleIds,
      invalidSampleIds,
      existingPreviewBySampleId
    });
  }
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html`, { waitUntil: "domcontentloaded" });
  return server;
}

async function openPaletteManager(page) {
  const server = await startRepoServer();
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/palette-manager-v2/index.html`, { waitUntil: "networkidle" });
  return server;
}

async function openToolTemplate(page, query = "") {
  const server = await startRepoServer();
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/templates-v2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

async function expectAccordionToggles(page, contentId) {
  const header = page.locator(`.accordion-v2__header[aria-controls="${contentId}"]`);
  const content = page.locator(`#${contentId}`);
  const icon = header.locator(".accordion-v2__icon");
  const readLayout = async () => await page.evaluate((id) => {
    const contentEl = document.getElementById(id);
    const section = contentEl.closest(".accordion-v2");
    return {
      sectionHeight: section.getBoundingClientRect().height,
      contentHeight: contentEl.getBoundingClientRect().height,
      sectionFlex: getComputedStyle(section).flex,
      contentDisplay: getComputedStyle(contentEl).display,
      contentHidden: contentEl.hidden
    };
  }, contentId);

  await expect(header).toBeVisible();
  await expect(content).toBeVisible();
  await expect(header).toHaveAttribute("aria-expanded", "true");
  await expect(icon).toHaveAttribute("data-accordion-v2-icon-state", "open");
  const expandedLayout = await readLayout();
  expect(expandedLayout.contentHidden).toBe(false);
  expect(expandedLayout.contentDisplay).not.toBe("none");

  await header.click();
  await expect(content).toBeHidden();
  await expect(header).toHaveAttribute("aria-expanded", "false");
  await expect(icon).toHaveAttribute("data-accordion-v2-icon-state", "closed");
  const collapsedLayout = await readLayout();
  expect(collapsedLayout.contentHidden).toBe(true);
  expect(collapsedLayout.contentDisplay).toBe("none");
  expect(collapsedLayout.contentHeight).toBe(0);
  expect(collapsedLayout.sectionHeight).toBeLessThan(expandedLayout.sectionHeight);
  expect(collapsedLayout.sectionFlex).toContain("0 0");

  await header.click();
  await expect(content).toBeVisible();
  await expect(header).toHaveAttribute("aria-expanded", "true");
  await expect(icon).toHaveAttribute("data-accordion-v2-icon-state", "open");
  const reopenedLayout = await readLayout();
  expect(reopenedLayout.contentHidden).toBe(false);
  expect(reopenedLayout.contentDisplay).not.toBe("none");
  expect(reopenedLayout.contentHeight).toBeGreaterThan(0);
}

async function expectPathsOrIdsAccordionToggles(page) {
  const header = page.locator('.accordion-v2__header[aria-controls="pathsOrIdsContent"]');
  const content = page.locator("#pathsOrIdsContent");
  const textarea = page.locator("#sampleList");
  const icon = header.locator(".accordion-v2__icon");

  const readLayout = async () => await page.evaluate(() => {
    const section = document.querySelector(".preview-generator-v2__paths-section");
    const contentEl = document.getElementById("pathsOrIdsContent");
    const textareaEl = document.getElementById("sampleList");
    return {
      sectionFlex: getComputedStyle(section).flex,
      sectionHeight: section.getBoundingClientRect().height,
      contentDisplay: getComputedStyle(contentEl).display,
      contentHidden: contentEl.hidden,
      textareaHeight: textareaEl.getBoundingClientRect().height,
      textareaHidden: textareaEl.checkVisibility ? !textareaEl.checkVisibility() : textareaEl.offsetParent === null
    };
  });

  await expect(header).toBeVisible();
  await expect(content).toBeVisible();
  await expect(textarea).toBeVisible();
  const expanded = await readLayout();
  expect(expanded.sectionFlex).toContain("1 1");
  expect(expanded.contentDisplay).toBe("flex");
  expect(expanded.contentHidden).toBe(false);
  expect(expanded.textareaHeight).toBeGreaterThan(0);
  expect(expanded.textareaHidden).toBe(false);

  await header.click();
  await expect(content).toBeHidden();
  await expect(textarea).toBeHidden();
  await expect(header).toHaveAttribute("aria-expanded", "false");
  await expect(icon).toHaveAttribute("data-accordion-v2-icon-state", "closed");
  const collapsed = await readLayout();
  expect(collapsed.sectionFlex).toContain("0 0");
  expect(collapsed.contentDisplay).toBe("none");
  expect(collapsed.contentHidden).toBe(true);
  expect(collapsed.textareaHeight).toBe(0);
  expect(collapsed.textareaHidden).toBe(true);
  expect(collapsed.sectionHeight).toBeLessThanOrEqual(expanded.sectionHeight);

  await header.click();
  await expect(content).toBeVisible();
  await expect(textarea).toBeVisible();
  await expect(header).toHaveAttribute("aria-expanded", "true");
  await expect(icon).toHaveAttribute("data-accordion-v2-icon-state", "open");
  const reopened = await readLayout();
  expect(reopened.sectionFlex).toContain("1 1");
  expect(reopened.contentDisplay).toBe("flex");
  expect(reopened.contentHidden).toBe(false);
  expect(reopened.textareaHeight).toBeGreaterThan(0);
  expect(reopened.textareaHidden).toBe(false);
}

test.describe("Preview Generator V2 baseline", () => {
  test.afterAll(async () => {
    await coverageReporter.writeReport();
  });

  test("launches the tool shell and toggles a working accordion", async ({ page }) => {
    const server = await openPreviewGenerator(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator(".preview-generator-v2.app-shell")).toBeVisible();
      await expect(page.locator('link[href="../common/toolShellCommon.css"]')).toHaveCount(1);
      await expect(page.locator("h1", { hasText: "Preview Generator V2" })).toBeVisible();
      await expect(page.locator('nav[aria-label="menuSample"]')).toBeVisible();

      await expect(page.locator("#executeBtn")).toBeVisible();
      await expect(page.locator("#executeBtn")).toBeDisabled();
      await expect(page.locator("#stopBtn")).toBeVisible();
      await expect(page.locator("#stopBtn")).toBeDisabled();

      await expect(page.locator("#targetTypeGames")).toBeChecked();
      await expect(page.locator("#sampleList")).toBeVisible();
      await expect(page.locator("#statusAccordion")).toBeVisible();

      const commonStyleResult = await page.evaluate(() => {
        const header = document.querySelector("[data-preview-generator-v2-header]");
        const accordion = document.querySelector(".preview-generator-v2__left-accordion");
        const appShell = document.querySelector(".preview-generator-v2.app-shell");
        const layout = document.querySelector(".preview-generator-v2__layout");
        if (!header || !accordion || !appShell || !layout) {
          return { error: "missing common style target" };
        }

        document.body.classList.add("tools-platform-fullscreen-active");
        const headerStyle = getComputedStyle(header);
        const accordionStyle = getComputedStyle(accordion);
        const appStyle = getComputedStyle(appShell);
        const layoutStyle = getComputedStyle(layout);
        const result = {
          headerDisplay: headerStyle.display,
          headerWidth: headerStyle.width,
          accordionSurface: accordionStyle.getPropertyValue("--accordion-v2-surface").trim(),
          appDisplay: appStyle.display,
          appOverflow: appStyle.overflow,
          layoutColumns: layoutStyle.gridTemplateColumns
        };
        document.body.classList.remove("tools-platform-fullscreen-active");
        return result;
      });

      expect(commonStyleResult.error).toBeUndefined();
      expect(commonStyleResult.headerDisplay).toBe("block");
      expect(commonStyleResult.headerWidth).not.toBe("auto");
      expect(commonStyleResult.accordionSurface).not.toBe("");
      expect(commonStyleResult.appDisplay).toBe("flex");
      expect(commonStyleResult.appOverflow).toBe("hidden");
      expect(commonStyleResult.layoutColumns).toContain("340px");

      const repoHeader = page.locator('.accordion-v2__header[aria-controls="repoDestinationContent"]');
      const repoContent = page.locator("#repoDestinationContent");
      await expect(repoHeader).toBeVisible();
      await expect(repoContent).toBeVisible();

      await repoHeader.click();
      await expect(repoContent).toBeHidden();
      await expect(repoHeader).toHaveAttribute("aria-expanded", "false");

      await repoHeader.click();
      await expect(repoContent).toBeVisible();
      await expect(repoHeader).toHaveAttribute("aria-expanded", "true");

      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("exercises controls, required-field gating, accordions, paths layout, and status clear", async ({ page }) => {
    const server = await openPreviewGenerator(page, { withFakeRepo: true });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#targetTypeGames")).toBeChecked();
      await expect(page.locator("#executeBtn")).toBeDisabled();

      await page.locator("#sampleList").fill("my-game");
      await expect(page.locator("#sampleList")).toHaveValue("my-game");
      await expect(page.locator("#executeBtn")).toBeDisabled();

      const pathsLayout = await page.locator("#sampleList").evaluate((input) => {
        const content = document.getElementById("pathsOrIdsContent");
        const inputRect = input.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        const inputStyle = getComputedStyle(input);
        const contentStyle = getComputedStyle(content);
        return {
          inputHeight: inputRect.height,
          contentHeight: contentRect.height,
          inputWidth: inputRect.width,
          contentWidth: contentRect.width,
          display: inputStyle.display,
          height: inputStyle.height,
          overflow: inputStyle.overflow,
          resize: inputStyle.resize,
          contentDisplay: contentStyle.display
        };
      });
      expect(pathsLayout.display).not.toBe("none");
      expect(pathsLayout.contentDisplay).toBe("flex");
      expect(pathsLayout.inputHeight).toBeGreaterThan(0);
      expect(pathsLayout.height).not.toBe("auto");
      expect(pathsLayout.overflow).toBe("auto");
      expect(pathsLayout.resize).toBe("none");
      expect(pathsLayout.contentHeight - pathsLayout.inputHeight).toBeLessThan(40);
      expect(pathsLayout.contentWidth - pathsLayout.inputWidth).toBeLessThan(40);
      await expect(page.locator(".accordion-v2__header")).toHaveCount(9);
      await expect(page.locator('.accordion-v2__header[data-accordion-v2-bound="true"]')).toHaveCount(9);
      await expectPathsOrIdsAccordionToggles(page);

      await page.locator("#pickRepoBtn").click();
      await expect(page.locator("#repoSelectedValue")).toHaveText("HTML-JavaScript-Gaming");
      await expect(page.locator("#executeBtn")).toBeEnabled();

      const statusHeader = page.locator('#statusAccordion .accordion-v2__header[aria-controls="statusAccordionContent"]');
      const statusContent = page.locator("#statusAccordionContent");
      await expect(statusHeader.locator("#clearLogBtn")).toBeVisible();
      await expect(statusHeader).toHaveAttribute("aria-expanded", "true");
      await expect(statusContent).toBeVisible();
      await page.locator("#clearLogBtn").click();
      await expect(page.locator("#log")).toHaveText("");
      await expect(statusHeader).toHaveAttribute("aria-expanded", "true");
      await expect(statusContent).toBeVisible();

      for (const contentId of [
        "repoDestinationContent",
        "targetSourceContent",
        "assetFolderContent",
        "captureModeContent",
        "renderControlsContent",
        "lastGeneratedImageContent",
        "outputSummaryContent",
        "statusAccordionContent"
      ]) {
        await expectAccordionToggles(page, contentId);
      }
      await expect(page.locator("#clearLogBtn")).toBeVisible();
      await expect(statusHeader.locator(".preview-generator-v2__status-header-actions #clearLogBtn")).toBeVisible();
      await page.locator("#captureModeFullScreen").check();
      await expect(page.locator("#log")).toContainText("Capture mode: Full Screen");
      await statusHeader.click();
      await expect(statusContent).toBeHidden();
      await expect(statusHeader).toHaveAttribute("aria-expanded", "false");
      await page.locator("#clearLogBtn").click();
      await expect(page.locator("#log")).toHaveText("");
      await expect(statusHeader).toHaveAttribute("aria-expanded", "false");
      await expect(statusContent).toBeHidden();

      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("phase folder input enumerates existing sample folders only", async ({ page }) => {
    const server = await openPreviewGenerator(page, {
      withFakeRepo: true,
      validSampleIds: ["0102"],
      invalidSampleIds: ["0101", "0103"]
    });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await page.locator("#pickRepoBtn").click();
      await page.locator("#targetTypeSamples").check();
      await page.locator("#baseUrl").fill(server.baseUrl);
      await page.locator("#sampleList").fill("samples/phase-01");

      await expect(page.locator("#writeFolderActualValue")).toHaveText("samples\\phase-01\\0102\\assets\\images");
      await expect(page.locator("#executeBtn")).toBeEnabled();

      await page.locator("#executeBtn").click();
      await expect(page.locator("#log")).toContainText("RUN  0102", { timeout: 10000 });
      await expect(page.locator("#log")).toContainText("Done.", { timeout: 10000 });

      const logText = await page.locator("#log").textContent();
      expect(logText).not.toContain("RUN  0101");
      expect(logText).not.toContain("RUN  0103");
      expect(logText).not.toContain("RUN  0199");

      const writes = await page.evaluate(() => window.__previewGeneratorV2Writes);
      expect(writes).toHaveLength(1);
      expect(writes[0].path).toBe("HTML-JavaScript-Gaming/samples/phase-01/0102/assets/images/preview.svg");

      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("generates real batch output with skip, failure, status, and summary assertions", async ({ page }) => {
    const server = await openPreviewGenerator(page, {
      withFakeRepo: true,
      validSampleIds: ["0102", "0103"],
      existingPreviewBySampleId: {
        "0102": "<svg xmlns=\"http://www.w3.org/2000/svg\"><text>existing preview</text></svg>"
      }
    });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await page.locator("#pickRepoBtn").click();
      await page.locator("#targetTypeSamples").check();
      await page.locator("#baseUrl").fill(server.baseUrl);
      await page.locator("#waitMs").fill("3000");
      await page.locator("#sampleList").fill([
        "samples/phase-01/0102/index.html",
        "samples/phase-01/0103/index.html",
        "samples/phase-99"
      ].join("\n"));

      await expect(page.locator("#executeBtn")).toBeEnabled();
      await page.locator("#executeBtn").click();

      const log = page.locator("#log");
      await expect(log).toContainText("Starting execution...", { timeout: 15000 });
      await expect(log).toContainText("Target type: samples", { timeout: 15000 });
      await expect(log).toContainText("SKIP 0102", { timeout: 15000 });
      await expect(log).toContainText("Existing preview.svg does not contain Capture timeout; skipping rewrite.", { timeout: 15000 });
      await expect(log).toContainText("RUN  0103", { timeout: 15000 });
      await expect(log).toContainText("OUT  samples\\phase-01\\0103\\assets\\images\\preview.svg", { timeout: 15000 });
      await expect(log).toContainText(`URL  ${server.baseUrl}/samples/phase-01/0103/index.html`, { timeout: 15000 });
      await expect(log).toContainText("OK   0103", { timeout: 15000 });
      await expect(log).toContainText("FAIL INPUT  samples/phase-99", { timeout: 15000 });
      await expect(log).toContainText("===== SUMMARY =====", { timeout: 15000 });
      await expect(log).toContainText("Written: 1", { timeout: 15000 });
      await expect(log).toContainText("Warnings: 0", { timeout: 15000 });
      await expect(log).toContainText("Failed: 1", { timeout: 15000 });
      await expect(log).toContainText("Skipped: 1", { timeout: 15000 });
      await expect(log).toContainText("Skipped (existing-preview-without-capture-timeout):", { timeout: 15000 });
      await expect(log).toContainText("Done.", { timeout: 15000 });

      const logText = await log.textContent();
      expect(logText).toContain("0103");
      expect(logText).toContain("samples/phase-99(");
      expect(logText).not.toContain("WARN ");
      expect(logText).not.toContain("RUN  0102");

      await expect(page.locator("#lastGeneratedImagePreview")).toBeVisible();
      await expect(page.locator("#lastGeneratedImageMeta")).toContainText("0103");

      const writes = await page.evaluate(() => window.__previewGeneratorV2Writes);
      expect(writes).toHaveLength(1);
      expect(writes[0].path).toBe("HTML-JavaScript-Gaming/samples/phase-01/0103/assets/images/preview.svg");
      expect(writes[0].contents).toContain("<svg");
      expect(writes[0].contents).not.toContain("Capture timeout");

      await page.locator("#clearLogBtn").click();
      await expect(log).toHaveText("");

      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("loads Palette Manager V2 so coverage includes Palette Manager runtime files", async ({ page }) => {
    const server = await openPaletteManager(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator(".palette-manager-v2.app-shell")).toBeVisible();
      await expect(page.locator("h1", { hasText: "Palette Manager V2" })).toBeVisible();
      await expect(page.locator('nav[aria-label="menuSample"]')).toBeVisible();
      await expect(page.locator("#sourcePaletteSelect")).toBeVisible();
      await expect(page.locator("#sourceSwatchList .palette-manager-v2__source-tile").first()).toBeVisible();
      await expect(page.locator("#importPaletteButton")).toBeVisible();
      await expect(page.locator("#copyPaletteButton")).toBeVisible();
      await expect(page.locator("#exportPaletteButton")).toBeVisible();
      await expect(page.locator("#paletteStatus")).toContainText("Ready.");
      await page.waitForFunction(() => Boolean(globalThis.paletteManagerV2App?.getPaletteValue));

      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("launches Tool Template V2 with runtime-valid controls", async ({ page }) => {
    const server = await openToolTemplate(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("body.tools-platform-tool-page[data-tool-id='tool-template-v2']")).toBeVisible();
      await expect(page.locator('link[href="../../src/engine/theme/main.css"]')).toHaveCount(1);
      await expect(page.locator('link[href="../../src/engine/theme/accordionV2/accordionV2.css"]')).toHaveCount(1);
      await expect(page.locator("#shared-theme-header")).toBeAttached();
      await expect(page.locator("[data-tool-starter-header]")).toContainText("First-Class Tool Starter V2");
      await expect(page.locator("[data-tool-starter-header]")).toContainText("First-Class Tools Surface V2");
      await expect(page.locator("[data-tool-starter-summary]")).toHaveAttribute("data-tools-platform-summary-active", "1");
      await expect(page.locator(".tool-starter__tool__menu")).toBeVisible();
      await expect(page.locator(".tool-starter__tool__menu")).toHaveAttribute("aria-label", "Tool actions");
      await expect(page.locator(".tool-starter__workspace__menu")).toBeHidden();
      await expect(page.locator("#toolExportButton")).toHaveText("Export");
      await expect(page.locator("#toolCopyJsonButton")).toHaveText("Copy JSON");
      await expect(page.locator("#toolExportToolStateButton")).toHaveText("Export toolState");
      await expect(page.locator(".tool-starter__panel--left #sourceInputContent")).toBeVisible();
      await expect(page.locator(".tool-starter__panel--left #statusLogContent")).toHaveCount(0);
      await expect(page.locator(".tool-starter__panel--center #previewPanelContent")).toBeVisible();
      await expect(page.locator(".tool-starter__panel--right #inspectorContent")).toBeVisible();
      await expect(page.locator(".tool-starter__panel--right #statusLogContent")).toBeVisible();
      await expect(page.locator(".tool-starter__panel--right .accordion-v2").last()).toContainText("Status");
      const templateStatusHeader = page.locator('.tool-starter__panel--right .accordion-v2__header[aria-controls="statusLogContent"]');
      const templateStatusContent = page.locator("#statusLogContent");
      const templateStatusTitle = templateStatusHeader.locator("span").first();
      await expect(templateStatusHeader.locator("#clearStatusButton")).toBeVisible();
      await expect(templateStatusContent.locator("#clearStatusButton")).toHaveCount(0);
      const clearAlignment = await page.evaluate(() => {
        const header = document.querySelector('.tool-starter__panel--right .accordion-v2__header[aria-controls="statusLogContent"]');
        const clear = document.getElementById("clearStatusButton");
        const headerRect = header.getBoundingClientRect();
        const clearRect = clear.getBoundingClientRect();
        return {
          clearInsideHeader: header.contains(clear),
          headerCenterY: headerRect.top + headerRect.height / 2,
          clearCenterY: clearRect.top + clearRect.height / 2,
          headerHeight: headerRect.height
        };
      });
      expect(clearAlignment.clearInsideHeader).toBe(true);
      expect(Math.abs(clearAlignment.clearCenterY - clearAlignment.headerCenterY)).toBeLessThan(clearAlignment.headerHeight / 2);
      const clearStyle = await page.locator("#clearStatusButton").evaluate((button) => {
        const style = getComputedStyle(button);
        return {
          borderRadius: style.borderRadius,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
          cursor: style.cursor
        };
      });
      expect(clearStyle.borderRadius).toBe("10px");
      expect(clearStyle.paddingLeft).toBe("6px");
      expect(clearStyle.paddingRight).toBe("6px");
      expect(clearStyle.cursor).toBe("pointer");

      const duplicateIds = await page.evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
        return ids.filter((id, index) => ids.indexOf(id) !== index);
      });
      expect(duplicateIds).toEqual([]);

      const sharedReferences = await page.evaluate(() => [
        ...document.querySelectorAll("script[src],link[href]")
      ].map((element) => element.getAttribute("src") || element.getAttribute("href"))
        .filter((value) => value && value.includes("tools/shared")));
      expect(sharedReferences).toEqual([]);

      const summary = page.locator("[data-tool-starter-summary]");
      const details = page.locator(".is-collapsible");
      await expect(summary).toContainText("Hide Header and Details");
      await summary.click();
      await expect(details).not.toHaveAttribute("open", "");
      await expect(summary).toHaveAttribute("data-tools-platform-summary-state", "collapsed");

      await expectAccordionToggles(page, "sourceInputContent");

      const exportButton = page.locator("#toolExportButton");
      const copyJsonButton = page.locator("#toolCopyJsonButton");
      const exportToolStateButton = page.locator("#toolExportToolStateButton");
      await expect(exportButton).toBeDisabled();
      await expect(copyJsonButton).toBeDisabled();
      await expect(exportToolStateButton).toBeDisabled();
      await page.locator("#sourceInput").fill("starter value");
      await expect(exportButton).toBeEnabled();
      await expect(copyJsonButton).toBeEnabled();
      await expect(exportToolStateButton).toBeEnabled();
      await exportButton.click();
      await expect(page.locator("#statusLog")).toHaveValue(/Processed source value/);
      await expect(templateStatusHeader).toHaveAttribute("aria-expanded", "true");
      await expect(templateStatusContent).toBeVisible();
      await page.locator("#clearStatusButton").click();
      await expect(page.locator("#statusLog")).toHaveValue("");
      await expect(templateStatusHeader).toHaveAttribute("aria-expanded", "true");
      await expect(templateStatusContent).toBeVisible();

      await exportButton.click();
      await expect(page.locator("#statusLog")).toHaveValue(/Processed source value/);
      await templateStatusTitle.click();
      await expect(templateStatusContent).toBeHidden();
      await expect(templateStatusHeader).toHaveAttribute("aria-expanded", "false");
      await page.locator("#clearStatusButton").click();
      await expect(page.locator("#statusLog")).toHaveValue("");
      await expect(templateStatusHeader).toHaveAttribute("aria-expanded", "false");
      await expect(templateStatusContent).toBeHidden();
      await templateStatusTitle.click();
      await expect(templateStatusContent).toBeVisible();
      await expect(templateStatusHeader).toHaveAttribute("aria-expanded", "true");

      await page.locator("#sourceInput").fill("");
      await expect(exportButton).toBeDisabled();
      await expect(page.locator("#sourceValidationMessage")).toContainText("Input is required");

      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("launches Tool Template V2 in workspace nav mode", async ({ page }) => {
    const server = await openToolTemplate(page, "?launch=workspace");
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator(".tool-starter__tool__menu")).toBeHidden();
      await expect(page.locator(".tool-starter__workspace__menu")).toBeVisible();
      await expect(page.locator(".tool-starter__workspace__menu")).toHaveAttribute("aria-label", "Workspace actions");
      await expect(page.locator("#workspaceImportManifestButton")).toHaveText("Import manifest");
      await expect(page.locator("#workspaceCopyManifestButton")).toHaveText("Copy manifest");
      await expect(page.locator("#workspaceExportManifestButton")).toHaveText("Export manifest");
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });
});
