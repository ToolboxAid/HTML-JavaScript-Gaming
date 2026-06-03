import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { clearPlaywrightStorage, installPlaywrightStorageIsolation } from "../../helpers/playwrightStorageIsolation.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.beforeEach(async ({ page }) => {
  await installPlaywrightStorageIsolation(page, {
    lane: "tool-runtime",
    surface: "Tool Template V2"
  });
});

test.afterEach(async ({ page }) => {
  await clearPlaywrightStorage(page);
});

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openToolTemplate(page, query = "") {
  const server = await startRepoServer();
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/toolbox/_tool_template-v2/index.html${query}`, { waitUntil: "networkidle" });
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
      .filter((value) => value && value.includes("toolbox/shared")));
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
    await workspaceV2CoverageReporter.stop(page);
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
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
