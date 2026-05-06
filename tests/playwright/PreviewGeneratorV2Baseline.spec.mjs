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

async function installFakeAssetFilePicker(page, files = []) {
  await page.addInitScript((initialFiles) => {
    window.__assetManagerV2FilePickerQueue = [...initialFiles];
    window.__assetManagerV2PickerOptions = [];
    window.showOpenFilePicker = async (options = {}) => {
      window.__assetManagerV2PickerOptions.push(options);
      const descriptor = window.__assetManagerV2FilePickerQueue.shift();
      if (!descriptor) {
        throw new Error("No fake asset file queued.");
      }
      const file = new File(
        [descriptor.contents || ""],
        descriptor.name,
        { type: descriptor.mimeType || "" }
      );
      if (descriptor.path) {
        Object.defineProperty(file, "path", { value: descriptor.path });
      }
      return [{
        kind: "file",
        name: descriptor.name,
        path: descriptor.path,
        async getFile() {
          return file;
        }
      }];
    };
  }, files);
}

async function queueAssetFile(page, descriptor) {
  await page.evaluate((queuedFile) => {
    window.__assetManagerV2FilePickerQueue.push(queuedFile);
  }, descriptor);
}

async function openAssetManagerV2(page, query = "", { assetFiles = [] } = {}) {
  const server = await startRepoServer();
  if (assetFiles.length) {
    await installFakeAssetFilePicker(page, assetFiles);
  }
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/asset-manager-v2/index.html${query}`, { waitUntil: "networkidle" });
  return server;
}

async function openWorkspaceV2(page, { assetFiles = [], gameId = "", paletteSwatches = [] } = {}) {
  const server = await startRepoServer();
  if (assetFiles.length) {
    await installFakeAssetFilePicker(page, assetFiles);
  }
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`, { waitUntil: "networkidle" });
  if (paletteSwatches.length || gameId) {
    await page.evaluate(({ gameId: nextGameId, swatches }) => {
      const hostContextId = sessionStorage.getItem("workspace-v2-active-host-context-id");
      const context = JSON.parse(sessionStorage.getItem(hostContextId));
      if (nextGameId) {
        context.gameId = nextGameId;
      }
      if (swatches.length) {
        context.workspaceManifest.tools["palette-browser"].swatches = swatches;
      }
      sessionStorage.setItem(hostContextId, JSON.stringify(context));
    }, { gameId, swatches: paletteSwatches });
  }
  return server;
}

async function openToolsIndex(page) {
  const server = await startRepoServer();
  await coverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/index.html`, { waitUntil: "networkidle" });
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

  test("loads Palette Manager V2 so coverage includes Palette Manager V2 runtime files", async ({ page }) => {
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

  test("launches Asset Manager V2 in tool mode with schema-complete asset controls and schema rejection", async ({ page }) => {
    const server = await openAssetManagerV2(page, "", {
      assetFiles: [{
        name: "nebula-background.png",
        mimeType: "image/png",
        contents: "fake-png",
        path: "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming\\assets\\images\\nebula-background.png"
      }]
    });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("body.tools-platform-tool-page[data-tool-id='asset-manager-v2']")).toBeVisible();
      await expect(page.locator(".asset-manager-v2.app-shell")).toBeVisible();
      await expect(page.locator(".asset-manager-v2__tool__menu")).toBeVisible();
      await expect(page.locator(".asset-manager-v2__workspace__menu")).toBeHidden();
      await expect(page.locator('fieldset[aria-label="Asset type"] legend')).toHaveText("Type");
      await expect(page.locator('input[name="assetKind"]')).toHaveCount(8);
      await expect(page.locator(".asset-manager-v2__kind-controls label span")).toHaveText([
        "Audio",
        "Color",
        "Data",
        "Font",
        "Image",
        "Localization",
        "Shader",
        "Video"
      ]);
      await expect(page.locator("#pickAssetFileButton")).toHaveText("Pick Asset");
      await expect(page.locator(".asset-manager-v2__file-picker-controls legend")).toHaveText("Pick Asset");
      await expect(page.locator("#assetKindAudio")).toBeChecked();
      await expect(page.locator("#assetKindAudio")).toBeVisible();
      await expect(page.locator("#assetKindColor")).toBeVisible();
      await expect(page.locator("#assetKindFont")).toBeVisible();
      await expect(page.locator("#assetKindVideo")).toBeVisible();
      await expect(page.locator("#assetKindShader")).toBeVisible();
      await expect(page.locator("#assetKindData")).toBeVisible();
      await expect(page.locator("#assetKindLocalization")).toBeVisible();
      const kindRadioLayout = await page.locator(".asset-manager-v2__kind-controls").evaluate((fieldset) => {
        const imageLabel = fieldset.querySelector('label[for="assetKindImage"]');
        const imageInput = imageLabel.querySelector("input");
        const imageText = imageLabel.querySelector("span");
        const localizationLabel = fieldset.querySelector('label[for="assetKindLocalization"]');
        const localizationText = localizationLabel.querySelector("span");
        return {
          imageJustify: getComputedStyle(imageLabel).justifyContent,
          imageInputLeft: imageInput.getBoundingClientRect().left,
          imageTextLeft: imageText.getBoundingClientRect().left,
          imageFontSize: Number.parseFloat(getComputedStyle(imageText).fontSize),
          localizationFontSize: Number.parseFloat(getComputedStyle(localizationText).fontSize),
          localizationFits: localizationText.scrollWidth <= localizationText.clientWidth
        };
      });
      expect(kindRadioLayout.imageJustify).toBe("flex-start");
      expect(kindRadioLayout.imageInputLeft).toBeLessThan(kindRadioLayout.imageTextLeft);
      expect(kindRadioLayout.localizationFontSize).toBeLessThan(kindRadioLayout.imageFontSize);
      expect(kindRadioLayout.localizationFits).toBe(true);
      await expect(page.locator("#pickAssetFileButton")).toBeVisible();
      await expect(page.locator("#assetFileInput")).toHaveAttribute("accept", /audio\/wav/);
      await expect(page.locator("#assetFileInput")).not.toHaveAttribute("accept", /image\/png/);
      await expect(page.locator("#assetColorPickerPanel")).toBeHidden();
      await expect(page.locator("#assetFilePickerPanel")).toBeVisible();
      await page.locator("#assetKindColor").check();
      await expect(page.locator("#assetFilePickerPanel")).toBeHidden();
      await expect(page.locator("#assetColorPickerPanel")).toBeVisible();
      await expect(page.locator("#assetRoleSelect")).toHaveValue("hud");
      await expect(page.locator("#assetRoleSelect")).toHaveAttribute("title", "Allowed roles for color: hud, text, background, border, accent, warning, success, danger, shadow, highlight");
      const colorPickerFileInputState = await page.locator("#assetFileInput").evaluate((input) => ({
        accept: input.getAttribute("accept") ?? "",
        disabled: input.disabled
      }));
      expect(colorPickerFileInputState).toEqual({ accept: "", disabled: true });
      await expect(page.locator("#assetColorSortControls button")).toHaveText(["Hue", "Sat", "Bright", "Name", "Tag"]);
      await expect(page.locator("#assetColorPickerPanel input")).toHaveCount(0);
      await expect(page.locator("#assetColorSwatchList")).not.toContainText("No active Workspace V2 palette colors.");
      await expect(page.locator("#assetColorSwatchList button[data-color-swatch-index]")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL No active Workspace V2 palette colors\./);
      const colorLegendStyle = await page.locator("#assetColorPickerPanel legend").evaluate((legend) => {
        const style = getComputedStyle(legend);
        const typeStyle = getComputedStyle(document.querySelector(".asset-manager-v2__kind-controls legend"));
        return {
          colorFontSize: Number.parseFloat(style.fontSize),
          colorFontWeight: Number.parseFloat(style.fontWeight),
          typeFontSize: Number.parseFloat(typeStyle.fontSize),
          typeFontWeight: Number.parseFloat(typeStyle.fontWeight)
        };
      });
      expect(colorLegendStyle.colorFontSize).toBeLessThan(colorLegendStyle.typeFontSize);
      expect(colorLegendStyle.colorFontWeight).toBeLessThan(colorLegendStyle.typeFontWeight);
      await expect(page.locator("#addAssetButton")).toBeDisabled();
      await page.locator("#assetKindAudio").check();
      await expect(page.locator("#assetColorPickerPanel")).toBeHidden();
      await expect(page.locator("#assetFilePickerPanel")).toBeVisible();
      await expect(page.locator("input[data-asset-file-kind]")).toHaveCount(0);
      await expect(page.locator("#assetStretchOverrideField")).toBeHidden();
      await expect(page.locator("#assetStretchOverrideInput")).toBeDisabled();
      await expect(page.locator("#assetKindValue")).toHaveCount(0);
      await expect(page.locator("#assetSourceValue")).toHaveCount(0);
      await expect(page.locator("#assetValidationMessage")).toHaveCount(0);
      await expect(page.locator("#assetSelectedFileText")).toHaveCount(0);
      await expect(page.locator("label", { hasText: "Source" })).toHaveCount(0);
      await expect(page.locator("label[for='assetIdInput'] span")).toHaveText("ID");
      await expect(page.locator("label[for='assetPathInput'] span")).toHaveText("Path");
      await expect(page.locator("#assetIdInput")).toBeDisabled();
      await expect(page.locator("#assetPathInput")).toHaveAttribute("readonly", "");
      const generatedFieldState = await page.locator("#assetIdInput").evaluate((idInput) => ({
        idCursor: getComputedStyle(idInput).cursor,
        idDisabled: idInput.disabled,
        idReadonly: idInput.readOnly,
        pathReadOnly: document.getElementById("assetPathInput").readOnly
      }));
      expect(generatedFieldState).toEqual({ idCursor: "not-allowed", idDisabled: true, idReadonly: false, pathReadOnly: true });
      const stackedFieldColumns = await page.locator("label[for='assetIdInput']").evaluate((label) => getComputedStyle(label).gridTemplateColumns.trim().split(/\s+/));
      expect(stackedFieldColumns).toHaveLength(1);
      const fullscreenLayout = await page.evaluate(() => {
        document.documentElement.classList.add("tools-platform-fullscreen-active");
        document.body.classList.add("tools-platform-fullscreen-active");
        const shell = document.querySelector(".asset-manager-v2.app-shell");
        const leftPanel = document.querySelector(".asset-manager-v2__panel--left");
        const centerPanel = document.querySelector(".asset-manager-v2__panel--center");
        const rightPanel = document.querySelector(".asset-manager-v2__panel--right");
        const shellRect = shell.getBoundingClientRect();
        const leftRect = leftPanel.getBoundingClientRect();
        const centerRect = centerPanel.getBoundingClientRect();
        const rightRect = rightPanel.getBoundingClientRect();
        const result = {
          centerWidth: centerRect.width,
          leftEdgeDelta: Math.abs(leftRect.left - shellRect.left),
          rightEdgeDelta: Math.abs(rightRect.right - shellRect.right),
          centerBetweenPanels: centerRect.left > leftRect.right && centerRect.right < rightRect.left
        };
        document.documentElement.classList.remove("tools-platform-fullscreen-active");
        document.body.classList.remove("tools-platform-fullscreen-active");
        return result;
      });
      expect(fullscreenLayout.leftEdgeDelta).toBeLessThan(2);
      expect(fullscreenLayout.rightEdgeDelta).toBeLessThan(2);
      expect(fullscreenLayout.centerWidth).toBeGreaterThan(360);
      expect(fullscreenLayout.centerBetweenPanels).toBe(true);
      await expect(page.locator("#assetRoleSelect")).toBeEnabled();
      await expect(page.locator("#assetRoleSelect")).toHaveValue("sound");
      await expect(page.locator("#assetRoleSelect")).toHaveAttribute("title", "Allowed roles for audio: sound, music");
      const historyControls = page.locator('fieldset[aria-label="Asset history"]');
      await expect(historyControls).toBeVisible();
      await expect(historyControls.locator("#undoAssetButton")).toBeDisabled();
      await expect(historyControls.locator("#redoAssetButton")).toBeDisabled();
      await expect(page.locator('button[aria-controls="schemaValidationContent"]')).toHaveCount(0);
      await expect(page.locator("#schemaValidationContent")).toHaveCount(0);
      await expect(page.locator("#jsonInput")).toHaveCount(0);
      await expect(page.locator("#validateJsonButton")).toHaveCount(0);
      await expect(page.locator('button[aria-controls="assetsContent"] span').first()).toHaveText("Assets");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Loaded asset-browser\.schema\.json/);

      await page.locator("#assetKindAudio").check();
      await expect(page.locator("#assetFileInput")).toHaveAttribute("accept", /audio\/wav/);
      await expect(page.locator("#assetFileInput")).not.toHaveAttribute("accept", /image\/png/);
      await expect(page.locator("#assetRoleSelect")).toHaveValue("sound");
      await expect(page.locator("#assetRoleSelect")).toHaveAttribute("title", "Allowed roles for audio: sound, music");
      await page.locator("#assetRoleSelect").selectOption("music");
      await expect(page.locator("#assetRoleSelect")).toHaveValue("music");
      await page.locator("#assetKindImage").check();
      await expect(page.locator("#assetRoleSelect")).toHaveValue("sprite");
      await page.locator("#pickAssetFileButton").click();
      const pickerOptions = await page.evaluate(() => window.__assetManagerV2PickerOptions.at(-1));
      expect(pickerOptions.types[0].description).toBe("Image assets");
      expect(Object.keys(pickerOptions.types[0].accept)).toContain("image/png");
      await expect(page.locator("#assetRoleSelect")).toHaveValue("background");
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.image.background.nebula-background");
      await expect(page.locator("#assetPathInput")).toHaveValue("assets/images/nebula-background.png");
      await expect(page.locator("#assetStretchOverrideField")).toBeHidden();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected file nebula-background\.png validated as type image, kind png, role background\./);
      await expect(page.locator("#addAssetButton")).toBeEnabled();
      await page.locator("#addAssetButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Added assets\.image\.background\.nebula-background\./);
      await expect(page.locator("#assetList")).toContainText("assets.image.background.nebula-background");
      await expect(page.locator("#assetPreview")).toBeVisible();
      await expect(page.locator('#assetPreview [data-preview-type="image"][data-preview-kind="png"]')).toBeVisible();
      await expect(page.locator("#assetPreview img.asset-manager-v2__preview-media")).toHaveAttribute("src", /\/assets\/images\/nebula-background\.png$/);
      await expect(page.locator("#assetPreview dl")).toHaveCount(0);
      await expect(page.locator('button[aria-controls="selectedAssetDetailsContent"] span').first()).toHaveText("Selected Asset Detail");
      const selectedDetailRows = await page.locator("#selectedAssetDetails").evaluate((detail) => Object.fromEntries(
        Array.from(detail.querySelectorAll("dt")).map((dt) => [dt.textContent.trim(), dt.nextElementSibling?.textContent.trim() || ""])
      ));
      expect(selectedDetailRows).toEqual({
        "type/kind": "image/png",
        ID: "assets.image.background.nebula-background",
        Type: "image",
        Kind: "png",
        Role: "background",
        Path: "assets/images/nebula-background.png",
        "Final ID": "assets.image.background.nebula-background"
      });
      await expect(page.locator("#inspectorOutput")).toContainText("\"assets.image.background.nebula-background\"");
      await expect(page.locator("#inspectorOutput")).toContainText("\"type\": \"image\"");
      await expect(page.locator("#inspectorOutput")).toContainText("\"kind\": \"png\"");
      await expect(page.locator("#inspectorOutput")).not.toContainText("Added assets.image.background.nebula-background");
      const backgroundOutput = JSON.parse(await page.locator("#inspectorOutput").textContent());
      expect(backgroundOutput.assets.find((asset) => asset.id === "assets.image.background.nebula-background").stretchOverride).toBeUndefined();

      await page.locator("#assetRoleSelect").selectOption("ui");
      await queueAssetFile(page, {
        name: "preview.png",
        mimeType: "image/png",
        contents: "fake-png",
        path: "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming\\assets\\images\\preview.png"
      });
      await page.locator("#pickAssetFileButton").click();
      await expect(page.locator("#assetRoleSelect")).toHaveValue("sprite");
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.image.sprite.preview");
      await page.locator("#addAssetButton").click();

      await queueAssetFile(page, {
        name: "chrome-bezel.png",
        mimeType: "image/png",
        contents: "fake-png",
        path: "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming\\assets\\images\\chrome-bezel.png"
      });
      await page.locator("#pickAssetFileButton").click();
      await expect(page.locator("#assetRoleSelect")).toHaveValue("bezel");
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.image.bezel.chrome-bezel");
      await expect(page.locator("#assetStretchOverrideField")).toBeVisible();
      await expect(page.locator("#assetStretchOverrideField legend")).toHaveText("Stretch Override");
      await expect(page.locator("#assetStretchOverrideInput")).toBeEnabled();
      await expect(page.locator("#assetStretchOverrideInput")).toHaveValue("10");
      const stretchGroupStyle = await page.locator("#assetStretchOverrideField").evaluate((fieldset) => {
        const style = getComputedStyle(fieldset);
        return {
          borderStyle: style.borderTopStyle,
          borderWidth: Math.round(Number.parseFloat(style.borderTopWidth)),
          radius: Math.round(Number.parseFloat(style.borderTopLeftRadius))
        };
      });
      expect(stretchGroupStyle).toEqual({ borderStyle: "solid", borderWidth: 1, radius: 8 });
      await page.locator("#addAssetButton").click();
      const bezelOutput = JSON.parse(await page.locator("#inspectorOutput").textContent());
      expect(bezelOutput.assets.find((asset) => asset.id === "assets.image.bezel.chrome-bezel").stretchOverride).toEqual({
        uniformEdgeStretchPx: 10
      });

      await page.locator("#assetKindAudio").check();
      await queueAssetFile(page, {
        name: "Fire Boom!.WAV",
        mimeType: "audio/wav",
        contents: "RIFF",
        path: "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming\\assets\\audio\\Fire Boom!.WAV"
      });
      await page.locator("#pickAssetFileButton").click();
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.audio.sound.fire-boom");
      await expect(page.locator("#assetStretchOverrideField")).toBeHidden();
      await page.locator("#addAssetButton").click();
      await expect(page.locator('#assetPreview [data-preview-type="audio"][data-preview-kind="wav"]')).toBeVisible();
      const audioPreviewState = await page.locator("#assetPreview audio").evaluate((audio) => ({
        autoplay: audio.autoplay,
        hasAutoplayAttribute: audio.hasAttribute("autoplay"),
        preload: audio.getAttribute("preload"),
        controls: audio.controls
      }));
      expect(audioPreviewState).toEqual({
        autoplay: false,
        hasAutoplayAttribute: false,
        preload: "metadata",
        controls: true
      });

      const tileSummaries = await page.locator(".asset-manager-v2__asset-tile").evaluateAll((tiles) => tiles.map((tile) => ({
        deleteTopRight: (() => {
          const tileRect = tile.getBoundingClientRect();
          const deleteRect = tile.querySelector("[data-delete-asset-id]").getBoundingClientRect();
          return Math.abs(tileRect.right - deleteRect.right) < 10 && Math.abs(tileRect.top - deleteRect.top) < 10;
        })(),
        typeRole: tile.querySelector(".asset-manager-v2__asset-type-role")?.textContent?.trim(),
        id: tile.querySelector("strong")?.textContent?.trim(),
        textLeftAligned: (() => {
          const typeRoleRect = tile.querySelector(".asset-manager-v2__asset-type-role").getBoundingClientRect();
          const idRect = tile.querySelector("strong").getBoundingClientRect();
          return Math.abs(typeRoleRect.left - idRect.left) < 1;
        })(),
        hasSeparateDeleteButton: Boolean(tile.querySelector(":scope > button[data-delete-asset-id]")),
        hasInlineDelete: Boolean(tile.querySelector(".asset-manager-v2__asset-select [data-delete-asset-id]")),
        tileHeight: Math.round(tile.getBoundingClientRect().height),
        tileWidth: Math.round(tile.getBoundingClientRect().width),
        typeRoleColor: getComputedStyle(tile.querySelector(".asset-manager-v2__asset-type-role")).color,
        idColor: getComputedStyle(tile.querySelector("strong")).color,
        idFontSize: Number.parseFloat(getComputedStyle(tile.querySelector("strong")).fontSize),
        typeRoleFontSize: Number.parseFloat(getComputedStyle(tile.querySelector(".asset-manager-v2__asset-type-role")).fontSize),
        idFontWeight: Number.parseFloat(getComputedStyle(tile.querySelector("strong")).fontWeight),
        typeRoleFontWeight: Number.parseFloat(getComputedStyle(tile.querySelector(".asset-manager-v2__asset-type-role")).fontWeight),
        rowGap: Number.parseFloat(getComputedStyle(tile.querySelector(".asset-manager-v2__asset-copy")).rowGap),
        text: tile.innerText,
        tooltip: tile.getAttribute("title")
      })));
      expect(tileSummaries).toEqual([
        {
          deleteTopRight: true,
          typeRole: "audio:sound",
          id: "assets.audio.sound.fire-boom",
          textLeftAligned: true,
          hasSeparateDeleteButton: false,
          hasInlineDelete: true,
          tileHeight: 88,
          tileWidth: 154,
          typeRoleColor: "rgb(247, 244, 255)",
          idColor: "rgb(233, 221, 255)",
          idFontSize: 12,
          typeRoleFontSize: 13,
          idFontWeight: 500,
          typeRoleFontWeight: 800,
          rowGap: 2,
          text: "X\naudio:sound\nassets.audio.sound.fire-boom",
          tooltip: "id: assets.audio.sound.fire-boom\ntype: audio\nkind: wav\nrole: sound\npath: assets/audio/Fire Boom!.WAV"
        },
        {
          deleteTopRight: true,
          typeRole: "image:background",
          id: "assets.image.background.nebula-background",
          textLeftAligned: true,
          hasSeparateDeleteButton: false,
          hasInlineDelete: true,
          tileHeight: 88,
          tileWidth: 154,
          typeRoleColor: "rgb(247, 244, 255)",
          idColor: "rgb(233, 221, 255)",
          idFontSize: 12,
          typeRoleFontSize: 13,
          idFontWeight: 500,
          typeRoleFontWeight: 800,
          rowGap: 2,
          text: "X\nimage:background\nassets.image.background.nebula-background",
          tooltip: "id: assets.image.background.nebula-background\ntype: image\nkind: png\nrole: background\npath: assets/images/nebula-background.png"
        },
        {
          deleteTopRight: true,
          typeRole: "image:bezel",
          id: "assets.image.bezel.chrome-bezel",
          textLeftAligned: true,
          hasSeparateDeleteButton: false,
          hasInlineDelete: true,
          tileHeight: 88,
          tileWidth: 154,
          typeRoleColor: "rgb(247, 244, 255)",
          idColor: "rgb(233, 221, 255)",
          idFontSize: 12,
          typeRoleFontSize: 13,
          idFontWeight: 500,
          typeRoleFontWeight: 800,
          rowGap: 2,
          text: "X\nimage:bezel\nassets.image.bezel.chrome-bezel",
          tooltip: "id: assets.image.bezel.chrome-bezel\ntype: image\nkind: png\nrole: bezel\npath: assets/images/chrome-bezel.png"
        },
        {
          deleteTopRight: true,
          typeRole: "image:sprite",
          id: "assets.image.sprite.preview",
          textLeftAligned: true,
          hasSeparateDeleteButton: false,
          hasInlineDelete: true,
          tileHeight: 88,
          tileWidth: 154,
          typeRoleColor: "rgb(247, 244, 255)",
          idColor: "rgb(233, 221, 255)",
          idFontSize: 12,
          typeRoleFontSize: 13,
          idFontWeight: 500,
          typeRoleFontWeight: 800,
          rowGap: 2,
          text: "X\nimage:sprite\nassets.image.sprite.preview",
          tooltip: "id: assets.image.sprite.preview\ntype: image\nkind: png\nrole: sprite\npath: assets/images/preview.png"
        }
      ]);
      const tileLayout = await page.locator("#assetList").evaluate((list) => {
        document.documentElement.classList.add("tools-platform-fullscreen-active");
        document.body.classList.add("tools-platform-fullscreen-active");
        const columns = getComputedStyle(list).gridTemplateColumns.split(" ").filter(Boolean);
        const tileCount = list.querySelectorAll(".asset-manager-v2__asset-tile").length;
        const result = {
          columnCount: columns.length,
          tileCount
        };
        document.documentElement.classList.remove("tools-platform-fullscreen-active");
        document.body.classList.remove("tools-platform-fullscreen-active");
        return result;
      });
      expect(tileLayout.columnCount).toBeGreaterThan(1);
      expect(tileLayout.tileCount).toBe(4);
      await expect(page.locator("#assetList")).not.toContainText("Path:");
      await expect(page.locator("#assetList")).not.toContainText("Source:");

      const helperPreviewCoverage = await page.evaluate(async () => {
        const { createAssetPreviewModel, renderAssetPreviewHtml } = await import("/src/shared/assets/assetPreviewHelpers.js");
        const entries = [
          ["image", "png", "sprite", "assets/images/preview.png"],
          ["audio", "wav", "sound", "assets/audio/fire.wav"],
          ["color", "hex", "hud", "palette://workspace/sky-blue"],
          ["video", "mp4", "cutscene", "assets/video/intro.mp4"],
          ["font", "woff2", "display", "assets/fonts/display.woff2"],
          ["shader", "glsl", "fragment", "assets/shaders/fx.glsl"],
          ["data", "json", "config", "assets/data/config.json"],
          ["localization", "po", "strings", "assets/localization/en.po"]
        ];
        return Object.fromEntries(entries.map(([type, kind, role, path]) => {
          const model = createAssetPreviewModel(`assets.${type}.${role}.sample`, {
            path,
            type,
            kind,
            role,
            ...(type === "color" ? { color: { hex: "#3366FF", name: "Sky Blue" } } : {})
          }, { documentRef: document });
          const html = renderAssetPreviewHtml(model);
          return [type, {
            hasAutoplay: html.includes("autoplay"),
            hasDataType: html.includes(`data-preview-type="${type}"`),
            hasColor: html.includes("asset-manager-v2__preview-color"),
            hasImage: html.includes("<img"),
            hasAudio: html.includes("<audio"),
            hasVideo: html.includes("<video"),
            hasFontFace: html.includes("@font-face"),
            hasInspection: html.includes("inspection")
          }];
        }));
      });
      expect(helperPreviewCoverage).toEqual({
        image: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: true, hasAudio: false, hasVideo: false, hasFontFace: false, hasInspection: false },
        audio: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: false, hasAudio: true, hasVideo: false, hasFontFace: false, hasInspection: false },
        color: { hasAutoplay: false, hasDataType: true, hasColor: true, hasImage: false, hasAudio: false, hasVideo: false, hasFontFace: false, hasInspection: false },
        video: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: false, hasAudio: false, hasVideo: true, hasFontFace: false, hasInspection: false },
        font: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: false, hasAudio: false, hasVideo: false, hasFontFace: true, hasInspection: false },
        shader: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: false, hasAudio: false, hasVideo: false, hasFontFace: false, hasInspection: true },
        data: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: false, hasAudio: false, hasVideo: false, hasFontFace: false, hasInspection: true },
        localization: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: false, hasAudio: false, hasVideo: false, hasFontFace: false, hasInspection: true }
      });

      await page.locator('button[data-asset-id="assets.image.background.nebula-background"]').click();
      await expect(page.locator('#assetPreview [data-preview-type="image"][data-preview-kind="png"]')).toBeVisible();
      await expect(page.locator("#selectedAssetDetails")).toContainText("assets.image.background.nebula-background");

      await page.locator('button[data-asset-id="assets.audio.sound.fire-boom"]').click();
      await expect(page.locator('#assetPreview [data-preview-type="audio"][data-preview-kind="wav"]')).toBeVisible();
      await expect(page.locator("#updateAssetButton")).toBeEnabled();
      await page.locator("#assetRoleSelect").selectOption("music");
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.audio.music.fire-boom");
      await expect(page.locator("#assetStretchOverrideField")).toBeHidden();
      await page.locator("#updateAssetButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Updated assets\.audio\.music\.fire-boom\./);
      await expect(page.locator("#assetList")).not.toContainText("assets.audio.sound.fire-boom");
      await expect(page.locator("#assetList")).toContainText("assets.audio.music.fire-boom");
      await expect(page.locator("#inspectorOutput")).toContainText("\"role\": \"music\"");
      await expect(page.locator("#inspectorOutput")).not.toContainText("Updated assets.audio.music.fire-boom");
      await expect(page.locator("#undoAssetButton")).toBeEnabled();
      await page.locator("#undoAssetButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Undo restored asset state\./);
      await expect(page.locator("#assetList")).toContainText("assets.audio.sound.fire-boom");
      await expect(page.locator("#assetList")).not.toContainText("assets.audio.music.fire-boom");
      await expect(page.locator("#inspectorOutput")).toContainText("\"role\": \"sound\"");
      await expect(page.locator("#redoAssetButton")).toBeEnabled();
      await page.locator("#redoAssetButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Redo restored asset state\./);
      await expect(page.locator("#assetList")).toContainText("assets.audio.music.fire-boom");
      await expect(page.locator("#assetList")).not.toContainText("assets.audio.sound.fire-boom");
      await expect(page.locator("#inspectorOutput")).toContainText("\"role\": \"music\"");

      await page.locator('[data-delete-asset-id="assets.image.background.nebula-background"]').click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted assets\.image\.background\.nebula-background\./);
      await expect(page.locator("#inspectorOutput")).not.toContainText("Deleted assets.image.background.nebula-background");
      await expect(page.locator("#assetList")).not.toContainText("assets.image.background.nebula-background");
      await expect(page.locator(".asset-manager-v2__asset-tile")).toHaveCount(3);
      await page.locator("#undoAssetButton").click();
      await expect(page.locator("#assetList")).toContainText("assets.image.background.nebula-background");
      await expect(page.locator(".asset-manager-v2__asset-tile")).toHaveCount(4);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Undo restored asset state\./);
      await page.locator("#redoAssetButton").click();
      await expect(page.locator("#assetList")).not.toContainText("assets.image.background.nebula-background");
      await expect(page.locator(".asset-manager-v2__asset-tile")).toHaveCount(3);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Redo restored asset state\./);

      const outputLayout = await page.evaluate(() => {
        const panel = document.querySelector(".asset-manager-v2__panel--right");
        const inspectorContent = document.getElementById("inspectorContent");
        const inspectorOutput = document.getElementById("inspectorOutput");
        const statusSection = document.getElementById("statusLogContent").closest(".accordion-v2");
        const panelRect = panel.getBoundingClientRect();
        const contentRect = inspectorContent.getBoundingClientRect();
        const outputRect = inspectorOutput.getBoundingClientRect();
        const statusRect = statusSection.getBoundingClientRect();
        return {
          outputFillsContent: contentRect.height - outputRect.height,
          statusBottomDelta: Math.abs(panelRect.bottom - statusRect.bottom),
          statusBelowOutput: statusRect.top > outputRect.bottom
        };
      });
      expect(outputLayout.outputFillsContent).toBeLessThan(40);
      expect(outputLayout.statusBottomDelta).toBeLessThan(20);
      expect(outputLayout.statusBelowOutput).toBe(true);

      const rightPanelLayout = async () => await page.evaluate(() => {
        const panel = document.querySelector(".asset-manager-v2__panel--right");
        const outputSection = document.querySelector(".asset-manager-v2__accordion--output");
        const outputContent = document.getElementById("inspectorContent");
        const output = document.getElementById("inspectorOutput");
        const statusSection = document.querySelector(".asset-manager-v2__accordion--status");
        const statusContent = document.getElementById("statusLogContent");
        const panelRect = panel.getBoundingClientRect();
        const outputSectionRect = outputSection.getBoundingClientRect();
        const outputContentRect = outputContent.getBoundingClientRect();
        const outputRect = output.getBoundingClientRect();
        const statusSectionRect = statusSection.getBoundingClientRect();
        return {
          outputExpanded: outputSection.classList.contains("is-open"),
          outputSectionHeight: outputSectionRect.height,
          outputContentHidden: outputContent.hidden,
          outputFillsContent: outputContentRect.height - outputRect.height,
          statusExpanded: statusSection.classList.contains("is-open"),
          statusSectionHeight: statusSectionRect.height,
          statusContentHidden: statusContent.hidden,
          statusBottomDelta: Math.abs(panelRect.bottom - statusSectionRect.bottom)
        };
      });

      const expandedRightPanel = await rightPanelLayout();
      await page.locator('.asset-manager-v2__accordion--output .accordion-v2__header').click();
      await expect(page.locator("#inspectorContent")).toBeHidden();
      const outputCollapsedLayout = await rightPanelLayout();
      expect(outputCollapsedLayout.outputExpanded).toBe(false);
      expect(outputCollapsedLayout.outputContentHidden).toBe(true);
      expect(outputCollapsedLayout.outputSectionHeight).toBeLessThan(expandedRightPanel.outputSectionHeight);
      expect(outputCollapsedLayout.statusBottomDelta).toBeLessThan(20);

      await page.locator('.asset-manager-v2__accordion--output .accordion-v2__header').click();
      await expect(page.locator("#inspectorContent")).toBeVisible();
      const outputReexpandedLayout = await rightPanelLayout();
      expect(outputReexpandedLayout.outputExpanded).toBe(true);
      expect(outputReexpandedLayout.outputFillsContent).toBeLessThan(40);

      await page.locator(".asset-manager-v2__status-accordion-header > span").first().click();
      await expect(page.locator("#statusLogContent")).toBeHidden();
      const statusCollapsedLayout = await rightPanelLayout();
      expect(statusCollapsedLayout.statusExpanded).toBe(false);
      expect(statusCollapsedLayout.statusContentHidden).toBe(true);
      expect(statusCollapsedLayout.statusSectionHeight).toBeLessThan(outputReexpandedLayout.statusSectionHeight);
      expect(statusCollapsedLayout.statusBottomDelta).toBeLessThan(20);

      await page.locator(".asset-manager-v2__status-accordion-header > span").first().click();
      await expect(page.locator("#statusLogContent")).toBeVisible();
      const statusReexpandedLayout = await rightPanelLayout();
      expect(statusReexpandedLayout.statusExpanded).toBe(true);
      expect(statusReexpandedLayout.statusBottomDelta).toBeLessThan(20);

      await page.locator("#assetKindImage").check();
      await queueAssetFile(page, {
        name: "notes.exe",
        mimeType: "application/octet-stream",
        contents: "not an asset",
        path: "C:\\Users\\davidq\\Documents\\GitHub\\HTML-JavaScript-Gaming\\assets\\data\\notes.exe"
      });
      await page.locator("#pickAssetFileButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Selected file validation failed: File notes\.exe is not accepted for Image assets\./);
      await expect(page.locator("#addAssetButton")).toBeDisabled();

      await page.locator("#clearStatusButton").click();
      await expect(page.locator("#statusLog")).toHaveValue("");

      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("loads Asset Manager V2 temporary UAT sample palette from query", async ({ page }) => {
    const server = await openAssetManagerV2(page, "?palette=sample");
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded temporary UAT-only sample palette from \?palette=sample \(3 colors\)\./);
      await page.locator("#assetKindColor").check();
      await expect(page.locator("#assetFilePickerPanel")).toBeHidden();
      await expect(page.locator("#assetColorPickerPanel")).toBeVisible();
      await expect(page.locator("#assetColorSortControls button")).toHaveText(["Hue", "Sat", "Bright", "Name", "Tag"]);
      await expect(page.locator("#assetColorPickerPanel input")).toHaveCount(0);
      const sampleSwatches = await page.locator("#assetColorSwatchList button[data-color-swatch-index]").evaluateAll((buttons) => buttons.map((button) => ({
        label: button.querySelector("span:last-child").textContent.trim(),
        swatchSize: Math.round(button.querySelector(".asset-manager-v2__color-swatch").getBoundingClientRect().width)
      })));
      expect(sampleSwatches).toEqual([
        { label: "Alert Amber", swatchSize: 20 },
        { label: "Signal Violet!", swatchSize: 20 },
        { label: "Success Green", swatchSize: 20 }
      ]);
      await page.locator('#assetColorSwatchList button[data-color-swatch-index]', { hasText: "Signal Violet!" }).click();
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.color.hud.signal-violet");
      await expect(page.locator("#assetPathInput")).toHaveValue("palette://workspace/signal-violet");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected color Signal Violet! validated as type color, kind hex, role hud\./);
      await page.locator("#addAssetButton").click();
      await expect(page.locator("#assetList")).toContainText("assets.color.hud.signal-violet");
      await expect(page.locator("#selectedAssetDetails")).toContainText("Final ID");
      await expect(page.locator("#selectedAssetDetails")).toContainText("assets.color.hud.signal-violet");
      const output = JSON.parse(await page.locator("#inspectorOutput").textContent());
      expect(output.assets[0]).toEqual({
        id: "assets.color.hud.signal-violet",
        type: "color",
        kind: "hex",
        role: "hud",
        path: "palette://workspace/signal-violet",
        color: {
          hex: "#7C3AED",
          name: "Signal Violet!",
          symbol: "V",
          source: "UAT Sample",
          tags: ["ui", "accent"]
        }
      });

      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("launches Asset Manager V2 from Workspace V2 and inserts only Workspace asset entries", async ({ page }) => {
    const server = await openWorkspaceV2(page, {
      assetFiles: [
        {
          name: "fire.wav",
          mimeType: "audio/wav",
          contents: "RIFF",
          path: "HTML-JavaScript-Gaming/assets/audio/fire.wav"
        },
        {
          name: "vector_battle.ttf",
          mimeType: "font/ttf",
          contents: "font",
          path: "HTML-JavaScript-Gaming/assets/fonts/vector_battle.ttf"
        },
        {
          name: "preview.png",
          mimeType: "image/png",
          contents: "png",
          path: "HTML-JavaScript-Gaming/assets/images/preview.png"
        }
      ],
      gameId: "Asteroids",
      paletteSwatches: [
        { symbol: "S", hex: "#3366FF", name: "Sky Blue", source: "Workspace", tags: ["cool", "ui"] },
        { symbol: "A", hex: "#FFAA00", name: "Amber", source: "Workspace", tags: ["warm", "warning"] },
        { symbol: "M", hex: "#00CC88", name: "Mint", source: "Workspace", tags: ["success"] }
      ]
    });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#workspaceV2OpenAssetManagerButton")).toBeVisible();
      await expect(page.locator("#workspaceManifestText")).toHaveValue(/"asset-browser"/);
      const hostContextId = await page.evaluate(() => sessionStorage.getItem("workspace-v2-active-host-context-id"));
      const initialAssetCount = await page.evaluate((id) => {
        const context = JSON.parse(sessionStorage.getItem(id));
        return Object.keys(context.workspaceManifest.tools["asset-browser"].assets).length;
      }, hostContextId);
      expect(initialAssetCount).toBe(0);

      await page.locator("#workspaceV2OpenAssetManagerButton").click();
      await expect(page).toHaveURL(/asset-manager-v2\/index\.html.*launch=workspace/);
      await expect(page.locator(".asset-manager-v2__tool__menu")).toBeHidden();
      await expect(page.locator(".asset-manager-v2__workspace__menu")).toBeVisible();
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace mode loaded 0 validated assets from tools\.asset-browser\.assets/);

      await page.locator("#assetKindAudio").check();
      await expect(page.locator("#assetRoleSelect")).toHaveValue("sound");
      await expect(page.locator("#assetFileInput")).toHaveAttribute("accept", /audio\/wav/);
      await page.locator("#pickAssetFileButton").click();
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.audio.sound.fire");
      await expect(page.locator("#assetPathInput")).toHaveValue("assets/audio/fire.wav");
      await page.locator("#addAssetButton").click();
      await expect(page.locator('#assetPreview [data-preview-type="audio"][data-preview-kind="wav"] audio')).toHaveAttribute("src", "/games/Asteroids/assets/audio/fire.wav");
      await expect(page.locator("#selectedAssetDetails")).toContainText("assets.audio.sound.fire");

      await page.locator("#assetKindFont").check();
      await expect(page.locator("#assetFilePickerPanel")).toBeVisible();
      await expect(page.locator("#assetColorPickerPanel")).toBeHidden();
      await page.locator("#pickAssetFileButton").click();
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.font.ui.vector-battle");
      await expect(page.locator("#assetPathInput")).toHaveValue("assets/fonts/vector_battle.ttf");
      await page.locator("#addAssetButton").click();
      await expect(page.locator('#assetPreview [data-preview-type="font"][data-preview-kind="ttf"]')).toBeVisible();
      const fontPreviewStyle = await page.locator("#assetPreview style").textContent();
      expect(fontPreviewStyle).toContain('/games/Asteroids/assets/fonts/vector_battle.ttf');

      await page.locator("#assetKindImage").check();
      await page.locator("#pickAssetFileButton").click();
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.image.sprite.preview");
      await expect(page.locator("#assetPathInput")).toHaveValue("assets/images/preview.png");
      await page.locator("#addAssetButton").click();
      await expect(page.locator('#assetPreview [data-preview-type="image"][data-preview-kind="png"] img')).toHaveAttribute("src", "/games/Asteroids/assets/images/preview.png");

      await page.locator("#assetKindColor").check();
      await expect(page.locator("#assetFilePickerPanel")).toBeHidden();
      await expect(page.locator("#assetColorPickerPanel")).toBeVisible();
      await expect(page.locator("#assetRoleSelect")).toHaveValue("hud");
      await expect(page.locator("#assetRoleSelect option")).toHaveText([
        "hud",
        "text",
        "background",
        "border",
        "accent",
        "warning",
        "success",
        "danger",
        "shadow",
        "highlight"
      ]);
      await expect(page.locator("#assetRoleSelect")).toHaveAttribute("title", "Allowed roles for color: hud, text, background, border, accent, warning, success, danger, shadow, highlight");
      const colorInputState = await page.locator("#assetFileInput").evaluate((input) => ({
        accept: input.getAttribute("accept") ?? "",
        disabled: input.disabled
      }));
      expect(colorInputState).toEqual({ accept: "", disabled: true });
      const pickerCountBeforeColor = await page.evaluate(() => window.__assetManagerV2PickerOptions.length);
      await expect(page.locator("#assetColorPickerPanel")).toBeVisible();
      await expect(page.locator("#assetColorSortControls button")).toHaveText(["Hue", "Sat", "Bright", "Name", "Tag"]);
      await expect(page.locator('#assetColorSortControls button[data-color-sort-key="name"]')).toHaveAttribute("aria-checked", "true");
      await expect(page.locator("#assetColorPickerPanel input")).toHaveCount(0);
      const pickerCountAfterColor = await page.evaluate(() => window.__assetManagerV2PickerOptions.length);
      expect(pickerCountAfterColor).toBe(pickerCountBeforeColor);
      const nameSortedSwatches = await page.locator("#assetColorSwatchList button[data-color-swatch-index]").evaluateAll((buttons) => buttons.map((button) => {
        const swatch = button.querySelector(".asset-manager-v2__color-swatch");
        const rect = swatch.getBoundingClientRect();
        return {
          name: button.querySelector("span:last-child").textContent.trim(),
          swatchHeight: Math.round(rect.height),
          swatchWidth: Math.round(rect.width)
        };
      }));
      expect(nameSortedSwatches).toEqual([
        { name: "Amber", swatchHeight: 20, swatchWidth: 20 },
        { name: "Mint", swatchHeight: 20, swatchWidth: 20 },
        { name: "Sky Blue", swatchHeight: 20, swatchWidth: 20 }
      ]);
      await page.locator('#assetColorSortControls button[data-color-sort-key="tag"]').click();
      await expect(page.locator('#assetColorSortControls button[data-color-sort-key="tag"]')).toHaveAttribute("aria-checked", "true");
      const tagSortedNames = await page.locator("#assetColorSwatchList button[data-color-swatch-index]").evaluateAll((buttons) => buttons.map((button) => button.querySelector("span:last-child").textContent.trim()));
      expect(tagSortedNames).toEqual(["Sky Blue", "Mint", "Amber"]);
      await page.locator('#assetColorSwatchList button[data-color-swatch-index]', { hasText: "Sky Blue" }).click();
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.color.hud.sky-blue");
      await expect(page.locator("#assetPathInput")).toHaveValue("palette://workspace/sky-blue");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected color Sky Blue validated as type color, kind hex, role hud\./);
      await page.locator("#assetRoleSelect").selectOption("accent");
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.color.accent.sky-blue");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected color Sky Blue validated as type color, kind hex, role accent\./);
      await page.locator("#assetRoleSelect").selectOption("hud");
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.color.hud.sky-blue");
      await expect(page.locator("#addAssetButton")).toBeEnabled();
      await page.locator("#addAssetButton").click();
      await expect(page.locator("#assetList")).toContainText("assets.color.hud.sky-blue");
      await expect(page.locator('#assetPreview [data-preview-type="color"][data-preview-kind="hex"]')).toBeVisible();
      await expect(page.locator(".asset-manager-v2__preview-color span")).toHaveCSS("background-color", "rgb(51, 102, 255)");
      await expect(page.locator("#inspectorOutput")).toContainText("\"type\": \"color\"");
      await expect(page.locator("#inspectorOutput")).toContainText("\"kind\": \"hex\"");
      await expect(page.locator("#inspectorOutput")).toContainText("\"name\": \"Sky Blue\"");

      await expect(page.locator("#workspaceInsertAssetsButton")).toBeEnabled();
      await page.locator("#workspaceInsertAssetsButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Inserted 4 validated assets into Workspace V2 tools\.asset-browser\.assets/);

      const storedContext = await page.evaluate((id) => JSON.parse(sessionStorage.getItem(id)), hostContextId);
      expect(storedContext.workspaceManifest.tools["asset-browser"].assets["assets.audio.sound.fire"]).toEqual({
        path: "assets/audio/fire.wav",
        type: "audio",
        kind: "wav",
        role: "sound",
        source: "asset-manager-v2"
      });
      expect(storedContext.workspaceManifest.tools["asset-browser"].assets["assets.font.ui.vector-battle"]).toEqual({
        path: "assets/fonts/vector_battle.ttf",
        type: "font",
        kind: "ttf",
        role: "ui",
        source: "asset-manager-v2"
      });
      expect(storedContext.workspaceManifest.tools["asset-browser"].assets["assets.image.sprite.preview"]).toEqual({
        path: "assets/images/preview.png",
        type: "image",
        kind: "png",
        role: "sprite",
        source: "asset-manager-v2"
      });
      expect(storedContext.workspaceManifest.tools["asset-browser"].assets["assets.color.hud.sky-blue"]).toEqual({
        path: "palette://workspace/sky-blue",
        type: "color",
        kind: "hex",
        role: "hud",
        source: "asset-manager-v2",
        color: {
          hex: "#3366FF",
          name: "Sky Blue",
          symbol: "S",
          source: "Workspace",
          tags: ["cool", "ui"]
        }
      });
      expect(storedContext.workspaceManifest.tools["asset-manager-v2"]).toBeUndefined();
      expect(storedContext.workspaceManifest.tools["workspace-v2"]).toBeUndefined();
      expect(Object.keys(storedContext.workspaceManifest.tools).sort()).toEqual(["asset-browser", "palette-browser"]);

      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("renders Asset Manager V2 as a first-class tool in the tools index", async ({ page }) => {
    const server = await openToolsIndex(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      const assetManagerLink = page.locator(".tools-platform-card h3 a", { hasText: "Asset Manager V2" });
      const assetManagerCard = page.locator(".tools-platform-card").filter({
        has: page.locator("h3 a", { hasText: "Asset Manager V2" })
      });
      await expect(assetManagerLink).toBeVisible();
      await expect(assetManagerLink).toHaveAttribute("href", "/tools/asset-manager-v2/index.html");
      await expect(assetManagerCard).toContainText("Schema Validated");
      const plannedToolNames = await page.locator("[data-planned-tools-grid] h3").allTextContents();
      for (const plannedToolName of [
        "Asset Manager V2",
        "Animation / Flipbook Editor",
        "Audio / SFX Playground",
        "Collision / Hitbox Editor"
      ]) {
        expect(plannedToolNames).toContain(plannedToolName);
      }
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
      const formStyle = await page.locator(".tool-starter__field").first().evaluate((field) => {
        const sourceInput = document.getElementById("sourceInput");
        const statusLog = document.getElementById("statusLog");
        const toolButton = document.getElementById("toolExportButton");
        const panel = document.querySelector(".tool-starter__panel--left");
        const fieldStyle = getComputedStyle(field);
        const sourceInputStyle = getComputedStyle(sourceInput);
        const statusLogStyle = getComputedStyle(statusLog);
        const toolButtonStyle = getComputedStyle(toolButton);
        const panelStyle = getComputedStyle(panel);
        return {
          fieldGap: fieldStyle.gap,
          fieldColumns: fieldStyle.gridTemplateColumns,
          inputBorderRadius: sourceInputStyle.borderRadius,
          inputBackground: sourceInputStyle.backgroundColor,
          inputColor: sourceInputStyle.color,
          buttonBorderRadius: toolButtonStyle.borderRadius,
          buttonPaddingLeft: toolButtonStyle.paddingLeft,
          buttonPaddingRight: toolButtonStyle.paddingRight,
          textareaBorderRadius: statusLogStyle.borderRadius,
          textareaBackground: statusLogStyle.backgroundColor,
          panelBorderRadius: panelStyle.borderRadius,
          panelPadding: panelStyle.paddingTop
        };
      });
      expect(formStyle.fieldGap).toBe("8px");
      expect(formStyle.fieldColumns).toContain("74px");
      expect(formStyle.inputBorderRadius).toBe("10px");
      expect(formStyle.inputBackground).toBe("rgba(43, 16, 91, 0.9)");
      expect(formStyle.inputColor).toBe("rgb(247, 244, 255)");
      expect(formStyle.buttonBorderRadius).toBe("10px");
      expect(formStyle.buttonPaddingLeft).toBe("6px");
      expect(formStyle.buttonPaddingRight).toBe("6px");
      expect(formStyle.textareaBorderRadius).toBe("8px");
      expect(formStyle.textareaBackground).toBe("rgba(0, 0, 0, 0.24)");
      expect(formStyle.panelBorderRadius).toBe("8px");
      expect(formStyle.panelPadding).toBe("14px");

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
