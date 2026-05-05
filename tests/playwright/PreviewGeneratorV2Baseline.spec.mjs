import { expect, test } from "@playwright/test";
import { startRepoServer } from "../helpers/playwrightRepoServer.mjs";

async function installFakeRepoPicker(page, { validSampleIds = ["0102"], invalidSampleIds = [] } = {}) {
  await page.addInitScript(({ validSampleIds: validIds, invalidSampleIds: invalidIds }) => {
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
      phase01.addDirectory(sampleId).addFile("index.html", "<!doctype html><canvas></canvas>");
    }
    for (const sampleId of invalidIds) {
      phase01.addDirectory(sampleId);
    }
    phase01.addFile("0199", "not a sample folder");

    window.__previewGeneratorV2Writes = [];
    window.showDirectoryPicker = async () => repo;
  }, { validSampleIds, invalidSampleIds });
}

async function openPreviewGenerator(page, { withFakeRepo = false, validSampleIds, invalidSampleIds } = {}) {
  const server = await startRepoServer();
  if (withFakeRepo) {
    await installFakeRepoPicker(page, { validSampleIds, invalidSampleIds });
  }
  await page.goto(`${server.baseUrl}/tools/preview-generator-v2/index.html`, { waitUntil: "domcontentloaded" });
  return server;
}

async function expectAccordionToggles(page, contentId) {
  const header = page.locator(`.accordion-v2__header[aria-controls="${contentId}"]`);
  const content = page.locator(`#${contentId}`);
  await expect(header).toBeVisible();
  await expect(content).toBeVisible();

  await header.click();
  await expect(content).toBeHidden();
  await expect(header).toHaveAttribute("aria-expanded", "false");

  await header.click();
  await expect(content).toBeVisible();
  await expect(header).toHaveAttribute("aria-expanded", "true");
}

test.describe("Preview Generator V2 baseline", () => {
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

      await page.locator("#pickRepoBtn").click();
      await expect(page.locator("#repoSelectedValue")).toHaveText("HTML-JavaScript-Gaming");
      await expect(page.locator("#executeBtn")).toBeEnabled();

      await page.locator("#clearLogBtn").click();
      await expect(page.locator("#log")).toHaveText("");

      for (const contentId of [
        "repoDestinationContent",
        "targetSourceContent",
        "assetFolderContent",
        "captureModeContent",
        "renderControlsContent",
        "outputSummaryContent"
      ]) {
        await expectAccordionToggles(page, contentId);
      }

      expect(pageErrors).toEqual([]);
    } finally {
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
      await server.close();
    }
  });
});
