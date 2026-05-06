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

test.describe("First-Class Tool Starter", () => {
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
    await expect(page.locator("body.tools-platform-tool-page[data-tool-id='first-class-tool-starter']")).toBeVisible();
    await expect(page.locator(".is-collapsible")).toBeVisible();
    await expect(page.locator("#shared-theme-header")).toBeAttached();
    await expect(page.locator("[data-tool-starter-header]")).toContainText("First-Class Tool Starter");
    await expect(page.locator("[data-tool-starter-summary]")).toContainText("Hide Header and Details");
    await expect(page.locator("[data-tool-starter-summary]")).toHaveAttribute("data-tools-platform-summary-active", "1");
  });

  test("Hide Header and Details toggles header state", async ({ page }) => {
    const summary = page.locator("[data-tool-starter-summary]");
    const details = page.locator(".is-collapsible");

    await expect(summary).toHaveAttribute("data-tools-platform-summary-state", "expanded");
    await summary.click();
    await expect(details).not.toHaveAttribute("open", "");
    await expect(summary).toHaveAttribute("data-tools-platform-summary-state", "collapsed");
    await expect(summary).toContainText(/First-Class Tool Starter|Show Header and Details/);
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
    const runButton = page.locator("#runToolButton");
    const exportButton = page.locator("#exportToolStateButton");
    const sourceInput = page.locator("#sourceInput");

    await expect(runButton).toBeDisabled();
    await expect(exportButton).toBeDisabled();
    await sourceInput.fill("starter value");
    await expect(runButton).toBeEnabled();
    await expect(exportButton).toBeEnabled();
  });

  test("missing input failure state is visible", async ({ page }) => {
    const sourceInput = page.locator("#sourceInput");
    const runButton = page.locator("#runToolButton");

    await sourceInput.fill("starter value");
    await sourceInput.fill("");
    await expect(runButton).toBeDisabled();
    await expect(page.locator("#sourceValidationMessage")).toContainText("Input is required");
  });

  test("status log clear behavior works after primary action", async ({ page }) => {
    await page.locator("#sourceInput").fill("starter value");
    await page.locator("#runToolButton").click();
    await expect(page.locator("#statusLog")).toHaveValue(/Processed source value/);

    await page.locator("#clearStatusButton").click();
    await expect(page.locator("#statusLog")).toHaveValue("");
  });
});
