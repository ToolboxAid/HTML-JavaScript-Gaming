import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { startRepoServer } from "../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter as coverageReporter } from "../helpers/workspaceV2CoverageReporter.mjs";

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
  const workspaceUrl = new URL(`${server.baseUrl}/tools/workspace-v2/index.html`);
  if (gameId) {
    workspaceUrl.searchParams.set("gameId", gameId);
  }
  await page.goto(workspaceUrl.href, { waitUntil: "networkidle" });
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

test.describe("Asset Manager V2", () => {
  test.afterAll(async () => {
    await coverageReporter.writeReport();
  });

  test("shows Asset Manager V2 launch guard for direct launch without workspace context", async ({ page }) => {
    const server = await openAssetManagerV2(page);
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#assetLaunchGuard")).toBeVisible();
      await expect(page.locator("#assetLaunchGuardMessage")).toHaveText("Asset Manager V2 is only available through Workspace Manager with a game workspace and palette.");
      await expect(page.locator("#assetLaunchGuardReason")).toContainText("Launch context is missing.");
      await expect(page.locator("body")).toHaveClass(/asset-manager-v2--launch-blocked/);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("shows Asset Manager V2 launch guard for unsupported workspace query", async ({ page }) => {
    const server = await openAssetManagerV2(page, "?workspace=PROD");
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#assetLaunchGuard")).toBeVisible();
      await expect(page.locator("#assetLaunchGuardMessage")).toHaveText("Asset Manager V2 is only available through Workspace Manager with a game workspace and palette.");
      await expect(page.locator("#assetLaunchGuardReason")).toContainText("Temporary workspace PROD is not supported.");
      await expect(page.locator(".asset-manager-v2.app-shell")).toHaveCount(1);
      await expect(page.locator("body")).toHaveClass(/asset-manager-v2--launch-blocked/);
      expect(pageErrors).toEqual([]);
    } finally {
      await coverageReporter.stop(page);
      await server.close();
    }
  });

  test("launches Asset Manager V2 with temporary UAT context and schema-complete asset controls", async ({ page }) => {
    const server = await openAssetManagerV2(page, "?workspace=uat", {
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
      await expect(page.locator("#pickAssetFileButton")).toBeHidden();
      await expect(page.locator("#assetColorPickerPanel")).toBeVisible();
      await expect(page.locator("#assetUsageField")).toBeVisible();
      await expect(page.locator("#assetUsageInput")).toBeEnabled();
      await expect(page.locator("#assetUsageInput")).toHaveValue("");
      const usagePlacement = await page.locator("#assetUsageField").evaluate((usageField) => {
        const roleField = document.querySelector('label[for="assetRoleSelect"]');
        return {
          directlyAfterRole: usageField.previousElementSibling === roleField,
          columns: getComputedStyle(usageField).gridTemplateColumns.trim().split(/\s+/).length,
          usageTop: Math.round(usageField.getBoundingClientRect().top),
          roleBottom: Math.round(roleField.getBoundingClientRect().bottom)
        };
      });
      expect(usagePlacement.directlyAfterRole).toBe(true);
      expect(usagePlacement.columns).toBe(2);
      expect(usagePlacement.usageTop).toBeGreaterThanOrEqual(usagePlacement.roleBottom);
      await expect(page.locator("#assetRoleSelect")).toHaveValue("hud");
      await expect(page.locator("#assetRoleSelect")).toHaveAttribute("title", "Allowed roles for color: hud, text, background, border, accent, warning, success, danger, shadow, highlight");
      const colorPickerFileInputState = await page.locator("#assetFileInput").evaluate((input) => ({
        accept: input.getAttribute("accept") ?? "",
        disabled: input.disabled
      }));
      expect(colorPickerFileInputState).toEqual({ accept: "", disabled: true });
      await expect(page.locator("#assetColorSortControls button")).toHaveText(["Hue", "Sat", "Bri", "Nam", "Tag"]);
      await expect(page.locator("#assetColorPickerPanel input")).toHaveCount(0);
      await expect(page.locator("#assetColorSwatchList")).not.toContainText("No active Workspace V2 palette colors.");
      await expect(page.locator("#assetColorSwatchList button[data-color-swatch-index]")).toHaveCount(3);
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
      await expect(page.locator("#assetUsageField")).toBeHidden();
      await expect(page.locator("#assetUsageInput")).toBeDisabled();
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
      await expect(page.locator("#assetPathInput")).toBeDisabled();
      const generatedFieldState = await page.locator("#assetIdInput").evaluate((idInput) => ({
        idCursor: getComputedStyle(idInput).cursor,
        idDisabled: idInput.disabled,
        idReadonly: idInput.readOnly,
        pathCursor: getComputedStyle(document.getElementById("assetPathInput")).cursor,
        pathDisabled: document.getElementById("assetPathInput").disabled,
        pathReadOnly: document.getElementById("assetPathInput").readOnly
      }));
      expect(generatedFieldState).toEqual({
        idCursor: "not-allowed",
        idDisabled: true,
        idReadonly: false,
        pathCursor: "not-allowed",
        pathDisabled: true,
        pathReadOnly: false
      });
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
      await expect(page.locator("#toolExportButton")).toHaveCount(0);
      await expect(page.locator("#toolCopyJsonButton")).toHaveCount(0);
      await expect(page.locator("#toolExportToolStateButton")).toHaveCount(0);
      await expect(page.locator("#navImportJsonButton")).toHaveText("Import JSON");
      await expect(page.locator("#navExportJsonButton")).toHaveText("Export JSON");
      await expect(page.locator("#navImportJsonButton")).toBeEnabled();
      await expect(page.locator("#navExportJsonButton")).toBeEnabled();
      const historyAccordion = page.locator(".asset-manager-v2__history-accordion");
      await expect(historyAccordion).toBeVisible();
      await expect(page.locator('button[aria-controls="assetHistoryContent"] span').first()).toHaveText("History");
      await expect(historyAccordion.locator("#undoAssetButton")).toBeDisabled();
      await expect(historyAccordion.locator("#redoAssetButton")).toBeDisabled();
      await expectAccordionToggles(page, "assetHistoryContent");
      const historyPlacement = await historyAccordion.evaluate((history) => {
        const assetControls = document.getElementById("assetControlsContent");
        const leftPanel = document.querySelector(".asset-manager-v2__panel--left");
        const controlsSection = document.querySelector('[aria-controls="assetControlsContent"]').closest(".accordion-v2");
        const historyRect = history.getBoundingClientRect();
        const controlsRect = controlsSection.getBoundingClientRect();
        return {
          insideAssetControls: assetControls.contains(history),
          parentIsLeftPanel: history.parentElement === leftPanel,
          belowAssetControls: historyRect.top >= controlsRect.bottom
        };
      });
      expect(historyPlacement).toEqual({
        insideAssetControls: false,
        parentIsLeftPanel: true,
        belowAssetControls: true
      });
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
      await expect(page.locator("#assetPreview img.asset-manager-v2__preview-media")).toHaveAttribute("src", /\/games\/Asteroids\/assets\/images\/nebula-background\.png$/);
      await expect(page.locator("#assetPreview dl")).toHaveCount(0);
      await expect(page.locator('button[aria-controls="selectedAssetDetailsContent"] span').first()).toHaveText("Selected Asset Detail");
      await expect(page.locator("#selectedAssetDetailsContent #assetPreview")).toBeVisible();
      const selectedDetailPlacement = await page.evaluate(() => {
        const app = document.querySelector(".asset-manager-v2.app-shell");
        const assetsContent = document.getElementById("assetsContent");
        const centerPanel = document.querySelector(".asset-manager-v2__panel--center");
        const assetsAccordion = centerPanel.querySelector('[aria-controls="assetsContent"]').closest(".accordion-v2");
        const selectedDetailPanel = document.querySelector(".asset-manager-v2__selected-detail");
        const detailContent = document.getElementById("selectedAssetDetailsContent");
        const preview = document.getElementById("assetPreview");
        const appRect = app.getBoundingClientRect();
        const centerRect = centerPanel.getBoundingClientRect();
        const assetsRect = assetsAccordion.getBoundingClientRect();
        const detailRect = selectedDetailPanel.getBoundingClientRect();
        const detailStyle = getComputedStyle(selectedDetailPanel);
        return {
          detailInsideAssets: assetsContent.contains(detailContent),
          detailParentIsCenterPanel: selectedDetailPanel.parentElement === centerPanel,
          previewInsideDetail: detailContent.contains(preview),
          detailBelowAssetsList: detailRect.top > assetsRect.top,
          detailFlexBasis: detailStyle.flexBasis,
          detailHeight: Math.round(detailRect.height),
          detailMinHeight: detailStyle.minHeight,
          previewMinHeight: getComputedStyle(preview).minHeight,
          detailWithinCenterPanel: detailRect.left >= centerRect.left
            && detailRect.right <= centerRect.right
            && detailRect.bottom <= centerRect.bottom,
          detailDoesNotSpanFullWidth: detailRect.left > appRect.left
            && detailRect.right < appRect.right
        };
      });
      expect(selectedDetailPlacement.detailInsideAssets).toBe(false);
      expect(selectedDetailPlacement.detailParentIsCenterPanel).toBe(true);
      expect(selectedDetailPlacement.previewInsideDetail).toBe(true);
      expect(selectedDetailPlacement.detailBelowAssetsList).toBe(true);
      expect(selectedDetailPlacement.detailFlexBasis).toBe("auto");
      expect(selectedDetailPlacement.detailHeight).toBeGreaterThan(140);
      expect(selectedDetailPlacement.detailHeight).not.toBe(300);
      expect(selectedDetailPlacement.detailMinHeight).toBe("0px");
      expect(selectedDetailPlacement.previewMinHeight).toBe("124px");
      expect(selectedDetailPlacement.detailWithinCenterPanel).toBe(true);
      expect(selectedDetailPlacement.detailDoesNotSpanFullWidth).toBe(true);
      const selectedDetailLayout = await page.locator("#selectedAssetDetails").evaluate((detail) => {
        const line = detail.querySelector(".asset-manager-v2__selected-detail-line");
        return {
          lineLabels: Array.from(line.querySelectorAll("b"), (node) => node.textContent.trim()),
          lineText: line.textContent.replace(/\s+/g, " ").trim(),
          pathText: detail.querySelector(".asset-manager-v2__selected-detail-path").textContent.replace(/\s+/g, " ").trim(),
          hasSeparateTypeRow: detail.textContent.includes("Type image"),
          hasSeparateKindRow: detail.textContent.includes("Kind png"),
          hasFinalId: detail.textContent.includes("Final ID")
        };
      });
      expect(selectedDetailLayout).toEqual({
        lineLabels: ["ID", "type/kind", "Role"],
        lineText: "ID assets.image.background.nebula-background type/kind image/png Role background",
        pathText: "Path assets/images/nebula-background.png",
        hasSeparateTypeRow: false,
        hasSeparateKindRow: false,
        hasFinalId: false
      });
      await expect(page.locator("#inspectorOutput")).toContainText("\"assets.image.background.nebula-background\"");
      await expect(page.locator("#inspectorOutput")).toContainText("\"type\": \"image\"");
      await expect(page.locator("#inspectorOutput")).toContainText("\"kind\": \"png\"");
      await expect(page.locator("#inspectorOutput")).not.toContainText("Added assets.image.background.nebula-background");
      const backgroundOutput = JSON.parse(await page.locator("#inspectorOutput").textContent());
      expect(backgroundOutput.assets.find((asset) => asset.id === "assets.image.background.nebula-background").stretchOverride).toBeUndefined();
      const accordionBottomSpacing = await page.evaluate(() => {
        const measureTrailingGap = (contentId) => {
          const content = document.getElementById(contentId);
          const style = getComputedStyle(content);
          const visibleChildren = Array.from(content.children).filter((child) => {
            const childStyle = getComputedStyle(child);
            return !child.hidden && childStyle.display !== "none";
          });
          const lastChild = visibleChildren.at(-1);
          if (!lastChild) {
            return 0;
          }
          const contentRect = content.getBoundingClientRect();
          const childRect = lastChild.getBoundingClientRect();
          const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
          return Math.round(Math.max(0, contentRect.bottom - childRect.bottom - paddingBottom));
        };
        return {
          assetControls: measureTrailingGap("assetControlsContent"),
          assets: measureTrailingGap("assetsContent"),
          selectedDetail: measureTrailingGap("selectedAssetDetailsContent")
        };
      });
      expect(accordionBottomSpacing.assetControls).toBeLessThanOrEqual(4);
      expect(accordionBottomSpacing.assets).toBeLessThanOrEqual(4);
      expect(accordionBottomSpacing.selectedDetail).toBeLessThanOrEqual(4);

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
        deleteHeight: Math.round(tile.querySelector("[data-delete-asset-id]").getBoundingClientRect().height),
        deleteWidth: Math.round(tile.querySelector("[data-delete-asset-id]").getBoundingClientRect().width),
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
          deleteHeight: 17,
          deleteWidth: 17,
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
          deleteHeight: 17,
          deleteWidth: 17,
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
          deleteHeight: 17,
          deleteWidth: 17,
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
          deleteHeight: 17,
          deleteWidth: 17,
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
      await page.locator('button[data-asset-id="assets.audio.sound.fire-boom"]').click();
      await expect(page.locator(".asset-manager-v2__asset-tile.is-selected button[data-asset-id]")).toHaveAttribute("data-asset-id", "assets.audio.sound.fire-boom");
      await expect(page.locator("#selectedAssetDetails")).toContainText("assets.audio.sound.fire-boom");
      await expect(page.locator('#assetPreview [data-preview-type="audio"][data-preview-kind="wav"]')).toBeVisible();
      await page.locator('button[data-asset-id="assets.image.background.nebula-background"]').click();
      await expect(page.locator(".asset-manager-v2__asset-tile.is-selected button[data-asset-id]")).toHaveAttribute("data-asset-id", "assets.image.background.nebula-background");
      await expect(page.locator("#selectedAssetDetails")).toContainText("assets.image.background.nebula-background");
      await expect(page.locator('#assetPreview [data-preview-type="image"][data-preview-kind="png"]')).toBeVisible();

      const helperPreviewCoverage = await page.evaluate(async () => {
        const { createAssetPreviewModel, renderAssetPreviewHtml } = await import("/tools/asset-manager-v2/js/assetPreviewHelpers.js");
        const sharedHelperResponse = await fetch("/src/shared/assets/assetPreviewHelpers.js", { cache: "no-store" });
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
        const coverage = Object.fromEntries(entries.map(([type, kind, role, path]) => {
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
            hasFontFamilyFromId: html.includes("asset-preview-assets-font-display-sample"),
            hasScopedFontFamilyData: html.includes('data-preview-font-family="asset-preview-assets-font-display-sample"'),
            hasInspection: html.includes("inspection")
          }];
        }));
        return {
          localHelperLoaded: true,
          sharedHelperStatus: sharedHelperResponse.status,
          coverage
        };
      });
      expect(helperPreviewCoverage.localHelperLoaded).toBe(true);
      expect(helperPreviewCoverage.sharedHelperStatus).toBe(404);
      expect(helperPreviewCoverage.coverage).toEqual({
        image: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: true, hasAudio: false, hasVideo: false, hasFontFace: false, hasFontFamilyFromId: false, hasScopedFontFamilyData: false, hasInspection: false },
        audio: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: false, hasAudio: true, hasVideo: false, hasFontFace: false, hasFontFamilyFromId: false, hasScopedFontFamilyData: false, hasInspection: false },
        color: { hasAutoplay: false, hasDataType: true, hasColor: true, hasImage: false, hasAudio: false, hasVideo: false, hasFontFace: false, hasFontFamilyFromId: false, hasScopedFontFamilyData: false, hasInspection: false },
        video: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: false, hasAudio: false, hasVideo: true, hasFontFace: false, hasFontFamilyFromId: false, hasScopedFontFamilyData: false, hasInspection: false },
        font: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: false, hasAudio: false, hasVideo: false, hasFontFace: true, hasFontFamilyFromId: true, hasScopedFontFamilyData: true, hasInspection: false },
        shader: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: false, hasAudio: false, hasVideo: false, hasFontFace: false, hasFontFamilyFromId: false, hasScopedFontFamilyData: false, hasInspection: true },
        data: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: false, hasAudio: false, hasVideo: false, hasFontFace: false, hasFontFamilyFromId: false, hasScopedFontFamilyData: false, hasInspection: true },
        localization: { hasAutoplay: false, hasDataType: true, hasColor: false, hasImage: false, hasAudio: false, hasVideo: false, hasFontFace: false, hasFontFamilyFromId: false, hasScopedFontFamilyData: false, hasInspection: true }
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

      const invalidImportChooserPromise = page.waitForEvent("filechooser");
      await page.locator("#navImportJsonButton").click();
      const invalidImportChooser = await invalidImportChooserPromise;
      await invalidImportChooser.setFiles({
        name: "invalid-asset-manager-v2.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify({ invalid: true }))
      });
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Import JSON failed schema validation:/);
      await expect(page.locator("#inspectorOutput")).not.toContainText("Import JSON failed");

      const importedPayload = {
        assets: {
          "assets.font.ui.vector-battle": {
            path: "assets/fonts/vector_battle.ttf",
            type: "font",
            kind: "ttf",
            role: "ui",
            source: "asset-manager-v2"
          },
          "assets.video.cutscene.8-mile": {
            path: "assets/video/8 mile.mp4",
            type: "video",
            kind: "mp4",
            role: "cutscene",
            source: "asset-manager-v2"
          }
        }
      };
      const validImportChooserPromise = page.waitForEvent("filechooser");
      await page.locator("#navImportJsonButton").click();
      const validImportChooser = await validImportChooserPromise;
      await validImportChooser.setFiles({
        name: "asset-manager-v2-assets.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(importedPayload))
      });
      await expect(page.locator("#statusLog")).toHaveValue(/OK Imported JSON with 2 validated assets\./);
      await expect(page.locator("#statusLog")).not.toHaveValue(/Missing referenced file for assets\.font\.ui\.vector-battle/);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO File availability warning: Missing referenced file for assets\.video\.cutscene\.8-mile: assets\/video\/8 mile\.mp4\./);
      const missingFileTileState = await page.locator(".asset-manager-v2__asset-tile").evaluateAll((tiles) => Object.fromEntries(tiles.map((tile) => {
        const id = tile.querySelector("button[data-asset-id]")?.dataset.assetId || "";
        const typeRole = tile.querySelector(".asset-manager-v2__asset-type-role");
        return [id, {
          isMissingFile: tile.classList.contains("is-missing-file"),
          typeRoleColor: getComputedStyle(typeRole).color
        }];
      })));
      expect(missingFileTileState["assets.font.ui.vector-battle"].isMissingFile).toBe(false);
      expect(missingFileTileState["assets.font.ui.vector-battle"].typeRoleColor).not.toBe("rgb(255, 180, 180)");
      expect(missingFileTileState["assets.video.cutscene.8-mile"]).toEqual({
        isMissingFile: true,
        typeRoleColor: "rgb(255, 180, 180)"
      });
      await expect(page.locator("#assetList")).toContainText("assets.font.ui.vector-battle");
      await expect(page.locator("#assetList")).toContainText("assets.video.cutscene.8-mile");
      await expect(page.locator("#selectedAssetDetails")).toContainText("assets.font.ui.vector-battle");
      await expect(page.locator("#selectedAssetDetails")).toContainText("assets/fonts/vector_battle.ttf");
      await expect(page.locator("#inspectorOutput")).not.toContainText("Imported JSON");
      const importedOutput = JSON.parse(await page.locator("#inspectorOutput").textContent());
      expect(importedOutput.assets.find((asset) => asset.id === "assets.font.ui.vector-battle").path).toBe("assets/fonts/vector_battle.ttf");
      expect(importedOutput.assets.find((asset) => asset.id === "assets.video.cutscene.8-mile").path).toBe("assets/video/8 mile.mp4");

      const downloadPromise = page.waitForEvent("download");
      await page.locator("#navExportJsonButton").click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe("asset-manager-v2-assets.json");
      const exportedPath = await download.path();
      const exportedPayload = JSON.parse(await readFile(exportedPath, "utf8"));
      expect(exportedPayload).toEqual(importedPayload);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Exported JSON with 2 validated assets\./);
      await expect(page.locator("#inspectorOutput")).not.toContainText("Exported JSON");

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

  test("loads Asset Manager V2 temporary UAT workspace context from query", async ({ page }) => {
    await page.addInitScript(() => {
      const NativeFontFace = window.FontFace;
      window.__assetManagerV2FontFaceLoads = [];
      window.FontFace = class AssetManagerV2UatFontFace {
        constructor(family, source, descriptors) {
          this.family = family;
          this.source = source;
          this.descriptors = descriptors;
          window.__assetManagerV2FontFaceLoads.push({ family, source });
        }

        async load() {
          if (String(this.source).includes("vector_battle.ttf")) {
            throw new Error("UAT font load rejected.");
          }
          if (typeof NativeFontFace === "function") {
            const nativeFontFace = new NativeFontFace(this.family, this.source, this.descriptors);
            return nativeFontFace.load();
          }
          return this;
        }
      };
    });
    const server = await openAssetManagerV2(page, "?workspace=UAT", {
      assetFiles: [
        {
          name: "uat-preview.png",
          mimeType: "image/png",
          contents: "png",
          path: "HTML-JavaScript-Gaming/assets/images/uat-preview.png"
        },
        {
          name: "vector_battle.ttf",
          mimeType: "font/ttf",
          contents: "font",
          path: "HTML-JavaScript-Gaming/assets/fonts/vector_battle.ttf"
        },
        {
          name: "8 mile.mp4",
          mimeType: "video/mp4",
          contents: "video",
          path: "HTML-JavaScript-Gaming/assets/video/8 mile.mp4"
        }
      ]
    });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded temporary UAT-only sample palette from \?workspace=UAT \(3 colors\)\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Temporary UAT-only Asset Manager V2 session context set to games\/Asteroids\/ with assetsPath games\/Asteroids\/assets\./);
      const uatContext = await page.evaluate(async () => {
        const { readTemporaryUatWorkspaceContext } = await import("/tools/asset-manager-v2/js/services/TemporaryUatWorkspace.js");
        const result = readTemporaryUatWorkspaceContext(window.location);
        return {
          assetsPath: result.assetsPath,
          gameRoot: result.gameRoot,
          ok: result.ok,
          sourceId: result.palette?.sourceId,
          swatchCount: result.palette?.swatches?.length || 0
        };
      });
      expect(uatContext).toEqual({
        assetsPath: "games/Asteroids/assets",
        gameRoot: "games/Asteroids/",
        ok: true,
        sourceId: "?workspace=UAT",
        swatchCount: 3
      });

      await page.locator("#assetKindImage").check();
      await page.locator("#pickAssetFileButton").click();
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.image.sprite.uat-preview");
      await expect(page.locator("#assetPathInput")).toHaveValue("assets/images/uat-preview.png");
      await page.locator("#addAssetButton").click();
      await expect(page.locator('#assetPreview [data-preview-type="image"][data-preview-kind="png"] img')).toHaveAttribute("src", "/games/Asteroids/assets/images/uat-preview.png");
      const uatPreviewRoot = await page.locator("#assetPreview img.asset-manager-v2__preview-media").evaluate((image) => image.getAttribute("src"));
      expect(uatPreviewRoot).toContain("/games/Asteroids/assets/");
      expect(uatPreviewRoot).not.toContain("/samples/");
      expect(uatPreviewRoot).not.toContain("/tools/");

      await page.locator("#assetKindFont").check();
      await page.locator("#pickAssetFileButton").click();
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.font.ui.vector-battle");
      await expect(page.locator("#assetPathInput")).toHaveValue("assets/fonts/vector_battle.ttf");
      await page.locator("#addAssetButton").click();
      await expect(page.locator('#assetPreview [data-preview-type="font"][data-preview-kind="ttf"]')).toBeVisible();
      const fontPreviewState = await page.locator("#assetPreview").evaluate((preview) => {
        const style = preview.querySelector("style")?.textContent || "";
        const sample = preview.querySelector(".asset-manager-v2__preview-font");
        return {
          fontFamily: sample ? getComputedStyle(sample).fontFamily : "",
          scopedFamily: sample?.dataset.previewFontFamily || "",
          style
        };
      });
      expect(fontPreviewState.style).toContain('@font-face{font-family:"asset-preview-assets-font-ui-vector-battle"');
      expect(fontPreviewState.style).toContain('/games/Asteroids/assets/fonts/vector_battle.ttf');
      expect(fontPreviewState.fontFamily).toContain("asset-preview-assets-font-ui-vector-battle");
      expect(fontPreviewState.scopedFamily).toBe("asset-preview-assets-font-ui-vector-battle");
      await expect.poll(async () => await page.evaluate(() => window.__assetManagerV2FontFaceLoads)).toEqual([{
        family: "asset-preview-assets-font-ui-vector-battle",
        source: 'url("/games/Asteroids/assets/fonts/vector_battle.ttf")'
      }]);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Font preview failed for assets\.font\.ui\.vector-battle: UAT font load rejected\./);

      await page.locator("#assetKindVideo").check();
      await page.locator("#pickAssetFileButton").click();
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.video.cutscene.8-mile");
      await expect(page.locator("#assetPathInput")).toHaveValue("assets/video/8 mile.mp4");
      await page.locator("#addAssetButton").click();
      await expect(page.locator('#assetPreview [data-preview-type="video"][data-preview-kind="mp4"] video')).toHaveAttribute("src", "/games/Asteroids/assets/video/8 mile.mp4");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected file 8 mile\.mp4 validated as type video, kind mp4, role cutscene\./);

      await page.locator("#assetKindColor").check();
      await expect(page.locator("#assetFilePickerPanel")).toBeHidden();
      await expect(page.locator("#pickAssetFileButton")).toBeHidden();
      await expect(page.locator("#assetColorPickerPanel")).toBeVisible();
      await expect(page.locator("#assetUsageField")).toBeVisible();
      await expect(page.locator("#assetUsageInput")).toHaveValue("");
      await expect(page.locator("#assetColorSortControls button")).toHaveText(["Hue", "Sat", "Bri", "Nam", "Tag"]);
      await expect(page.locator("#assetColorPickerPanel input")).toHaveCount(0);
      const sampleSwatches = await page.locator("#assetColorSwatchList button[data-color-swatch-index]").evaluateAll((buttons) => buttons.map((button) => ({
        text: button.innerText.trim(),
        title: button.getAttribute("title"),
        swatchSize: Math.round(button.querySelector(".asset-manager-v2__color-swatch").getBoundingClientRect().width)
      })));
      expect(sampleSwatches).toEqual([
        { text: "", title: "name: Alert Amber\nhex: #F59E0B\nsymbol: A\nsource: UAT Sample\ntags: warning, hud", swatchSize: 35 },
        { text: "", title: "name: Signal Violet!\nhex: #7C3AED\nsymbol: V\nsource: UAT Sample\ntags: ui, accent", swatchSize: 35 },
        { text: "", title: "name: Success Green\nhex: #22C55E\nsymbol: G\nsource: UAT Sample\ntags: success, hud", swatchSize: 35 }
      ]);
      await page.locator('#assetColorSwatchList button[title*="Signal Violet"]').click();
      const selectedSampleSwatch = await page.locator('#assetColorSwatchList button[title*="Signal Violet"]').evaluate((button) => ({
        ariaPressed: button.getAttribute("aria-pressed"),
        buttonBorderColor: getComputedStyle(button).borderTopColor,
        isSelected: button.classList.contains("is-selected"),
        swatchBorderColor: getComputedStyle(button.querySelector(".asset-manager-v2__color-swatch")).borderTopColor
      }));
      expect(selectedSampleSwatch).toEqual({
        ariaPressed: "true",
        buttonBorderColor: "rgb(255, 255, 255)",
        isSelected: true,
        swatchBorderColor: "rgb(255, 255, 255)"
      });
      await expect(page.locator("#assetIdInput")).toHaveValue("");
      await expect(page.locator("#assetPathInput")).toHaveValue("palette://workspace/signal-violet");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Selected color validation failed: Color usage is required for color assets\./);
      await expect(page.locator("#addAssetButton")).toBeDisabled();
      await page.locator("#assetUsageInput").fill("Menu Highlight");
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.color.hud.menu-highlight.signal-violet");
      await expect(page.locator("#assetPathInput")).toHaveValue("palette://workspace/signal-violet");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected color Signal Violet! validated as type color, kind hex, role hud\./);
      await page.locator("#addAssetButton").click();
      await expect(page.locator("#assetList")).toContainText("assets.color.hud.menu-highlight.signal-violet");
      await expect(page.locator("#assetList")).toContainText("assets.font.ui.vector-battle");
      await expect(page.locator("#assetList")).toContainText("assets.image.sprite.uat-preview");
      await expect(page.locator("#assetList")).toContainText("assets.video.cutscene.8-mile");
      await expect(page.locator("#selectedAssetDetails")).not.toContainText("Final ID");
      await expect(page.locator("#selectedAssetDetails")).toContainText("assets.color.hud.menu-highlight.signal-violet");
      const output = JSON.parse(await page.locator("#inspectorOutput").textContent());
      expect(output.assets[0]).toEqual({
        id: "assets.color.hud.menu-highlight.signal-violet",
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

  test("shows Asset Manager V2 launch guard when Workspace palette is missing", async ({ page }) => {
    const server = await openWorkspaceV2(page, {
      gameId: "Asteroids"
    });
    const pageErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    try {
      await page.locator("#workspaceV2OpenAssetManagerButton").click();
      await expect(page).toHaveURL(/asset-manager-v2\/index\.html.*launch=workspace/);
      await expect(page).toHaveURL(/gameId=Asteroids/);
      await expect(page.locator("#assetLaunchGuard")).toBeVisible();
      await expect(page.locator("#assetLaunchGuardMessage")).toHaveText("Asset Manager V2 is only available through Workspace Manager with a game workspace and palette.");
      await expect(page.locator("#assetLaunchGuardReason")).toContainText("No active palette is present.");
      await expect(page.locator("body")).toHaveClass(/asset-manager-v2--launch-blocked/);

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
      await expect(page).toHaveURL(/gameId=Asteroids/);
      await expect(page.locator(".asset-manager-v2__tool__menu")).toBeHidden();
      await expect(page.locator(".asset-manager-v2__workspace__menu")).toBeVisible();
      await expect(page.locator("#statusLog")).toHaveValue(/Workspace mode loaded 0 validated assets from tools\.asset-browser\.assets/);
      const workspacePreviewContext = await page.evaluate(async () => {
        const { WorkspaceBridge } = await import("/tools/asset-manager-v2/js/services/WorkspaceBridge.js");
        return new WorkspaceBridge({ windowRef: window }).readWorkspacePreviewContext();
      });
      expect(workspacePreviewContext).toEqual({
        workspaceMode: true,
        workspaceGameId: "Asteroids",
        workspaceGameRoot: "games/Asteroids/"
      });
      expect(JSON.stringify(workspacePreviewContext)).not.toMatch(/samples|tools/i);

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
      await expect(page.locator("#assetUsageField")).toBeHidden();
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
      await expect(page.locator("#assetUsageField")).toBeVisible();
      await expect(page.locator("#assetUsageInput")).toBeEnabled();
      await expect(page.locator("#assetUsageInput")).toHaveValue("");
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
      await expect(page.locator("#assetColorSortControls button")).toHaveText(["Hue", "Sat", "Bri", "Nam", "Tag"]);
      await expect(page.locator('#assetColorSortControls button[data-color-sort-key="name"]')).toHaveAttribute("aria-checked", "true");
      await expect(page.locator("#assetColorPickerPanel input")).toHaveCount(0);
      const pickerCountAfterColor = await page.evaluate(() => window.__assetManagerV2PickerOptions.length);
      expect(pickerCountAfterColor).toBe(pickerCountBeforeColor);
      const nameSortedSwatches = await page.locator("#assetColorSwatchList button[data-color-swatch-index]").evaluateAll((buttons) => buttons.map((button) => {
        const swatch = button.querySelector(".asset-manager-v2__color-swatch");
        const rect = swatch.getBoundingClientRect();
        return {
          text: button.innerText.trim(),
          title: button.getAttribute("title"),
          swatchHeight: Math.round(rect.height),
          swatchWidth: Math.round(rect.width)
        };
      }));
      expect(nameSortedSwatches).toEqual([
        { text: "", title: "name: Amber\nhex: #FFAA00\nsymbol: A\nsource: Workspace\ntags: warm, warning", swatchHeight: 35, swatchWidth: 35 },
        { text: "", title: "name: Mint\nhex: #00CC88\nsymbol: M\nsource: Workspace\ntags: success", swatchHeight: 35, swatchWidth: 35 },
        { text: "", title: "name: Sky Blue\nhex: #3366FF\nsymbol: S\nsource: Workspace\ntags: cool, ui", swatchHeight: 35, swatchWidth: 35 }
      ]);
      await page.locator('#assetColorSortControls button[data-color-sort-key="tag"]').click();
      await expect(page.locator('#assetColorSortControls button[data-color-sort-key="tag"]')).toHaveAttribute("aria-checked", "true");
      const tagSortedNames = await page.locator("#assetColorSwatchList button[data-color-swatch-index]").evaluateAll((buttons) => buttons.map((button) => button.getAttribute("title").match(/^name: ([^\n]+)/)?.[1] || ""));
      expect(tagSortedNames).toEqual(["Sky Blue", "Mint", "Amber"]);
      await page.locator('#assetColorSwatchList button[title*="Sky Blue"]').click();
      await expect(page.locator("#assetIdInput")).toHaveValue("");
      await expect(page.locator("#assetPathInput")).toHaveValue("palette://workspace/sky-blue");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Selected color validation failed: Color usage is required for color assets\./);
      await expect(page.locator("#addAssetButton")).toBeDisabled();
      await page.locator("#assetUsageInput").fill("Primary HUD");
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.color.hud.primary-hud.sky-blue");
      await expect(page.locator("#assetPathInput")).toHaveValue("palette://workspace/sky-blue");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected color Sky Blue validated as type color, kind hex, role hud\./);
      await page.locator("#assetRoleSelect").selectOption("accent");
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.color.accent.primary-hud.sky-blue");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Selected color Sky Blue validated as type color, kind hex, role accent\./);
      await page.locator("#assetRoleSelect").selectOption("hud");
      await expect(page.locator("#assetIdInput")).toHaveValue("assets.color.hud.primary-hud.sky-blue");
      await expect(page.locator("#addAssetButton")).toBeEnabled();
      await page.locator("#addAssetButton").click();
      await expect(page.locator("#assetList")).toContainText("assets.color.hud.primary-hud.sky-blue");
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
      expect(storedContext.workspaceManifest.tools["asset-browser"].assets["assets.color.hud.primary-hud.sky-blue"]).toEqual({
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
});
