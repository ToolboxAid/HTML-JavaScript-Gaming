import { expect, test } from "@playwright/test";
import { createServer } from "node:http";
import { extname, join, normalize, relative, resolve } from "node:path";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const STARTER_ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const CONTENT_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"]
]);

let server;
let starterUrl;

async function startStaticServer() {
  server = createServer(async (request, response) => {
    try {
      const requestPath = request.url === "/" ? "/index.html" : new URL(request.url, "http://127.0.0.1").pathname;
      const filePath = normalize(join(STARTER_ROOT, decodeURIComponent(requestPath)));
      const relativePath = relative(STARTER_ROOT, filePath);
      if (relativePath.startsWith("..")) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      const contentType = CONTENT_TYPES.get(extname(filePath)) || "application/octet-stream";
      response.writeHead(200, { "content-type": contentType });
      response.end(await readFile(filePath));
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  await new Promise((resolveServer) => {
    server.listen(0, "127.0.0.1", resolveServer);
  });
  const address = server.address();
  starterUrl = `http://127.0.0.1:${address.port}/index.html`;
}

test.describe("Tool Template V2", () => {
  test.beforeAll(async () => {
    await startStaticServer();
  });

  test.afterAll(async () => {
    await new Promise((resolveServer) => server.close(resolveServer));
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(starterUrl);
  });

  test("launches with Palette Manager-style header shell", async ({ page }) => {
    await expect(page.locator("body.tools-platform-tool-page[data-tool-id='tool-template-v2']")).toBeVisible();
    await expect(page.locator(".is-collapsible")).toBeVisible();
    await expect(page.locator("#shared-theme-header")).toBeAttached();
    await expect(page.locator("[data-tool-starter-header]")).toContainText("First-Class Tool Starter V2");
    await expect(page.locator("[data-tool-starter-header]")).toContainText("First-Class Tools Surface V2");
    await expect(page.locator("[data-tool-starter-summary]")).toContainText("Hide Header and Details");
    await expect(page.locator("[data-tool-starter-summary]")).toHaveAttribute("data-tools-platform-summary-active", "1");
  });

  test("defaults to tool mode NAV", async ({ page }) => {
    const toolNav = page.locator(".tool-starter__tool__menu");
    const workspaceNav = page.locator(".tool-starter__workspace__menu");

    await expect(toolNav).toBeVisible();
    await expect(toolNav).toHaveAttribute("aria-label", "Tool actions");
    await expect(workspaceNav).toBeHidden();
    await expect(toolNav.getByRole("button", { name: "Export", exact: true })).toBeVisible();
    await expect(toolNav.getByRole("button", { name: "Copy JSON" })).toBeVisible();
    await expect(toolNav.getByRole("button", { name: "Export toolState" })).toBeVisible();
  });

  test("launch workspace mode shows workspace NAV only", async ({ page }) => {
    await page.goto(`${starterUrl}?launch=workspace`);

    const toolNav = page.locator(".tool-starter__tool__menu");
    const workspaceNav = page.locator(".tool-starter__workspace__menu");

    await expect(toolNav).toBeHidden();
    await expect(workspaceNav).toBeVisible();
    await expect(workspaceNav).toHaveAttribute("aria-label", "Workspace actions");
    await expect(workspaceNav.getByRole("button", { name: "Import manifest" })).toBeVisible();
    await expect(workspaceNav.getByRole("button", { name: "Copy manifest" })).toBeVisible();
    await expect(workspaceNav.getByRole("button", { name: "Export manifest" })).toBeVisible();
  });

  test("uses standardized panel roles", async ({ page }) => {
    const leftPanel = page.locator(".tool-starter__panel--left");
    const centerPanel = page.locator(".tool-starter__panel--center");
    const rightPanel = page.locator(".tool-starter__panel--right");

    await expect(leftPanel.locator("#sourceInputContent")).toBeVisible();
    await expect(leftPanel.locator("#statusLogContent")).toHaveCount(0);
    await expect(centerPanel.locator("#previewPanelContent")).toBeVisible();
    await expect(rightPanel.locator("#inspectorContent")).toBeVisible();
    await expect(rightPanel.locator("#statusLogContent")).toBeVisible();
    await expect(rightPanel.locator(".accordion-v2").last()).toContainText("Status");
  });

  test("shows editable and non-editable field patterns", async ({ page }) => {
    const notEditableField = page.locator("#notEditableField");
    const editableField = page.locator("#editableField");

    await expect(page.locator("label[for='notEditableField']")).toContainText("Not Editable");
    await expect(notEditableField).toHaveAttribute("readonly", "");
    await expect(notEditableField).toHaveValue("Read-only display value");
    await expect(page.locator("label[for='editableField']")).toContainText("Editable");
    await expect(editableField).toBeEditable();
    await expect(editableField).toHaveValue("No tags.");
    await expect(editableField).toHaveClass(/tool-starter__editable-tags-box/);
    await expect(async () => {
      const readonlyHeight = await notEditableField.evaluate((element) => element.getBoundingClientRect().height);
      const editableHeight = await editableField.evaluate((element) => element.getBoundingClientRect().height);
      expect(editableHeight).toBeGreaterThan(readonlyHeight);
    }).toPass();
    await editableField.fill("tag-example");
    await expect(editableField).toHaveValue("tag-example");
  });

  test("Hide Header and Details toggles header state", async ({ page }) => {
    const summary = page.locator("[data-tool-starter-summary]");
    const details = page.locator(".is-collapsible");

    await expect(summary).toHaveAttribute("data-tools-platform-summary-state", "expanded");
    await summary.click();
    await expect(details).not.toHaveAttribute("open", "");
    await expect(summary).toHaveAttribute("data-tools-platform-summary-state", "collapsed");
    await expect(summary).toContainText(/First-Class Tool Starter V2|Show Header and Details/);
  });

  test("accordion sections collapse and expand", async ({ page }) => {
    const sourceHeader = page.getByRole("button", { name: "Input Source" });
    const sourceContent = page.locator("#sourceInputContent");

    await expect(sourceContent).toBeVisible();
    await sourceHeader.click();
    await expect(sourceContent).toBeHidden();
    await expect(sourceHeader).toHaveAttribute("aria-expanded", "false");
    await sourceHeader.click();
    await expect(sourceContent).toBeVisible();
    await expect(sourceHeader).toHaveAttribute("aria-expanded", "true");
  });

  test("primary action state changes when required input is valid", async ({ page }) => {
    const exportButton = page.locator("#toolExportButton");
    const copyJsonButton = page.locator("#toolCopyJsonButton");
    const exportToolStateButton = page.locator("#toolExportToolStateButton");
    const sourceInput = page.locator("#sourceInput");

    await expect(exportButton).toBeDisabled();
    await expect(copyJsonButton).toBeDisabled();
    await expect(exportToolStateButton).toBeDisabled();
    await sourceInput.fill("starter value");
    await expect(exportButton).toBeEnabled();
    await expect(copyJsonButton).toBeEnabled();
    await expect(exportToolStateButton).toBeEnabled();
  });

  test("missing input failure state is visible", async ({ page }) => {
    const sourceInput = page.locator("#sourceInput");
    const exportButton = page.locator("#toolExportButton");

    await sourceInput.fill("starter value");
    await sourceInput.fill("");
    await expect(exportButton).toBeDisabled();
    await expect(page.locator("#sourceValidationMessage")).toContainText("Input is required");
  });

  test("status log clear behavior works after primary action", async ({ page }) => {
    await page.locator("#sourceInput").fill("starter value");
    await page.locator("#toolExportButton").click();
    await expect(page.locator("#statusLog")).toHaveValue(/Processed source value/);

    await page.locator("#clearStatusButton").click();
    await expect(page.locator("#statusLog")).toHaveValue("");
  });
});
