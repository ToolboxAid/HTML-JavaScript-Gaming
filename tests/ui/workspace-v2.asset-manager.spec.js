import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

function contentTypeForPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js" || extension === ".mjs") return "text/javascript; charset=utf-8";
  if (extension === ".json") return "application/json; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function startRepoServer() {
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
      const decodedPath = decodeURIComponent(requestUrl.pathname);
      const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
      const absolutePath = path.resolve(repoRoot, `.${normalizedPath}`);
      if (!absolutePath.startsWith(repoRoot)) {
        response.statusCode = 403;
        response.end("Forbidden");
        return;
      }
      let targetPath = absolutePath;
      const stat = await fs.stat(targetPath).catch(() => null);
      if (stat && stat.isDirectory()) {
        targetPath = path.join(targetPath, "index.html");
      }
      const fileContents = await fs.readFile(targetPath);
      response.statusCode = 200;
      response.setHeader("Content-Type", contentTypeForPath(targetPath));
      response.end(fileContents);
    } catch {
      response.statusCode = 404;
      response.end("Not Found");
    }
  });
  await new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => resolve());
    server.on("error", reject);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to start UI test server.");
  }
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: async () => {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  };
}

test("workspace v2 launches asset manager and add/remove is reflected in export", async ({ page }) => {
  const server = await startRepoServer();
  try {
    await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);

    await page.getByRole("button", { name: "Full Reset" }).click();
    await page.locator("#workspaceV2ToolSelect").selectOption("asset-manager-v2");
    await page.getByRole("button", { name: "Load Fixture" }).click();
    await page.getByRole("button", { name: "Create Session + Launch" }).click();

    await expect(page).toHaveURL(/\/tools\/asset-manager-v2\/index\.html/);
    await expect(page).toHaveTitle("Asset Manager V2");
    await expect(page.getByRole("button", { name: /Player Ship/ })).toBeVisible();

    await page.locator("#assetManagerV2AddId").fill("asset-002");
    await page.locator("#assetManagerV2AddLabel").fill("Enemy Ship");
    await page.locator("#assetManagerV2AddKind").fill("svg");
    await page.locator("#assetManagerV2AddPath").fill("assets/vectors/enemy-ship.svg");
    await page.getByRole("button", { name: "Add Asset" }).click();

    await expect(page.getByRole("button", { name: /Enemy Ship/ })).toBeVisible();
    await page.getByRole("button", { name: "Remove asset-002" }).click();
    await expect(page.getByRole("button", { name: /Enemy Ship/ })).toHaveCount(0);

    await page.getByRole("button", { name: /Back to Workspace V2/ }).click();
    await expect(page).toHaveURL(/\/tools\/workspace-v2\/index\.html/);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export Workspace Session JSON" }).click();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    if (!downloadPath) {
      throw new Error("Workspace export did not produce a downloadable file.");
    }
    const exportedJsonText = await fs.readFile(downloadPath, "utf8");
    const exported = JSON.parse(exportedJsonText);
    const entries = exported?.tools?.["workspace-v2"]?.activeSession?.payloadJson?.assetCatalog?.entries;
    if (!Array.isArray(entries)) {
      throw new Error("Exported manifest is missing tools.workspace-v2.activeSession.payloadJson.assetCatalog.entries.");
    }
    expect(entries.some((entry) => entry?.id === "asset-001")).toBe(true);
    expect(entries.some((entry) => entry?.id === "asset-002")).toBe(false);
  } finally {
    await server.close();
  }
});
