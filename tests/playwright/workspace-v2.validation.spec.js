import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { ctrlTapClick } from "../helpers/playwrightCtrlTapClick.mjs";

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

async function importManifestFromObject(page, manifest) {
  const chooserPromise = page.waitForEvent("filechooser");
  await ctrlTapClick(page, page.getByRole("button", { name: "Import Workspace Session JSON" }));
  const chooser = await chooserPromise;
  const jsonText = JSON.stringify(manifest, null, 2);
  await chooser.setFiles({
    name: "workspace-v2-import.json",
    mimeType: "application/json",
    buffer: Buffer.from(jsonText, "utf8")
  });
  return jsonText;
}

async function exportManifestFromTextarea(page) {
  await ctrlTapClick(page, page.getByRole("button", { name: "Export Workspace Session JSON" }));
  const exportedText = await page.locator("#workspaceV2ImportJson").inputValue();
  return JSON.parse(exportedText);
}

test.describe("Workspace V2 validation coverage", () => {
  test("workspace lifecycle reset -> valid import -> export -> import success", async ({ page }) => {
    const server = await startRepoServer();
    try {
      await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);
      await ctrlTapClick(page, page.getByRole("button", { name: "Full Reset" }));
      await expect(page.locator("#workspaceV2WorkspaceToolsSummary")).toContainText("palette-browser");
      await expect(page.locator("#workspaceV2WorkspaceToolsSummary")).toContainText("workspace-v2");

      const baselineManifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      expect(baselineManifest.documentKind).toBe("workspace-manifest");
      expect(baselineManifest.tools?.["palette-browser"]).toBeTruthy();
      expect(baselineManifest.tools?.["workspace-v2"]).toBeTruthy();

      await importManifestFromObject(page, baselineManifest);
      await expect(page.locator("#workspaceV2ImportExportStatus")).toHaveText("Workspace session imported.");

      const exportedManifest = await exportManifestFromTextarea(page);
      expect(exportedManifest.documentKind).toBe("workspace-manifest");

      await importManifestFromObject(page, exportedManifest);
      await expect(page.locator("#workspaceV2ImportExportStatus")).toHaveText("Workspace session imported.");
    } finally {
      await server.close();
    }
  });

  test("palette contract: palette-browser exists, swatches empty, one palette entry", async ({ page }) => {
    const server = await startRepoServer();
    try {
      await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);
      await ctrlTapClick(page, page.getByRole("button", { name: "Full Reset" }));

      const manifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      expect(manifest.tools?.["palette-browser"]).toBeTruthy();
      expect(Array.isArray(manifest.tools["palette-browser"].swatches)).toBe(true);
      expect(manifest.tools["palette-browser"].swatches).toEqual([]);
      expect(Object.prototype.hasOwnProperty.call(manifest.tools, "palettes")).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(manifest.tools, "palette")).toBe(false);
      expect(Object.keys(manifest.tools).filter((key) => key === "palette-browser")).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("validation rejection: invalid workspace JSON and invalid payloadJson are rejected", async ({ page }) => {
    const server = await startRepoServer();
    try {
      await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);
      await ctrlTapClick(page, page.getByRole("button", { name: "Full Reset" }));
      await expect(page.locator("#workspaceV2SessionHistoryEmptyState")).toHaveText("No recent sessions.");

      await importManifestFromObject(page, {
        schema: "html-js-gaming.project",
        version: 1,
        id: "bad-manifest",
        name: "Bad Manifest",
        tools: {}
      });
      await expect(page.locator("#workspaceV2ImportExportStatus")).toContainText("Import error:");
      await expect(page.locator("#workspaceV2SessionHistoryEmptyState")).toHaveText("No recent sessions.");

      const invalidPayloadManifest = {
        documentKind: "workspace-manifest",
        schema: "html-js-gaming.project",
        version: 1,
        id: "bad-payload",
        name: "Bad Payload",
        tools: {
          "palette-browser": {
            schema: "html-js-gaming.palette",
            version: 1,
            name: "Workspace Active Palette",
            swatches: []
          },
          "workspace-v2": {
            schema: "html-js-gaming.workspace-v2-session/1",
            game: {
              id: "game-bad",
              name: "Bad Game"
            },
            defaultToolId: "asset-manager-v2",
            activeToolId: "asset-manager-v2",
            activeHostContextId: "asset-manager-v2-bad-0001",
            activeSession: {
              version: "v2",
              toolId: "asset-manager-v2",
              payloadJson: null
            },
            savedSessions: {}
          }
        }
      };
      await importManifestFromObject(page, invalidPayloadManifest);
      await expect(page.locator("#workspaceV2ImportExportStatus")).toContainText("Import error:");
      await expect(page.locator("#workspaceV2SessionHistoryEmptyState")).toHaveText("No recent sessions.");
      await expect(page).toHaveURL(/\/tools\/workspace-v2\/index\.html/);
    } finally {
      await server.close();
    }
  });

  test("roundtrip integrity: load -> export -> import preserves JSON", async ({ page }) => {
    const server = await startRepoServer();
    try {
      await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);
      await ctrlTapClick(page, page.getByRole("button", { name: "Full Reset" }));
      await page.locator("#workspaceV2ToolSelect").selectOption("asset-manager-v2");
      await ctrlTapClick(page, page.getByRole("button", { name: "Load Fixture" }));

      const loadedManifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      const exportedManifest = await exportManifestFromTextarea(page);
      expect(exportedManifest).toEqual(loadedManifest);

      await importManifestFromObject(page, exportedManifest);
      await expect(page.locator("#workspaceV2ImportExportStatus")).toHaveText("Workspace session imported.");
      const postImportManifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      expect(postImportManifest).toEqual(exportedManifest);
    } finally {
      await server.close();
    }
  });

  test("tool switching keeps activeSession consistent with selected fixture tool", async ({ page }) => {
    const server = await startRepoServer();
    try {
      await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);
      await ctrlTapClick(page, page.getByRole("button", { name: "Full Reset" }));

      await page.locator("#workspaceV2ToolSelect").selectOption("tilemap-studio-v2");
      await ctrlTapClick(page, page.getByRole("button", { name: "Load Fixture" }));
      let exportedManifest = await exportManifestFromTextarea(page);
      expect(exportedManifest.tools?.["workspace-v2"]?.activeToolId).toBe("tilemap-studio-v2");
      expect(exportedManifest.tools?.["workspace-v2"]?.activeSession?.toolId).toBe("tilemap-studio-v2");

      await page.locator("#workspaceV2ToolSelect").selectOption("vector-map-editor-v2");
      await ctrlTapClick(page, page.getByRole("button", { name: "Load Fixture" }));
      exportedManifest = await exportManifestFromTextarea(page);
      expect(exportedManifest.tools?.["workspace-v2"]?.activeToolId).toBe("vector-map-editor-v2");
      expect(exportedManifest.tools?.["workspace-v2"]?.activeSession?.toolId).toBe("vector-map-editor-v2");
    } finally {
      await server.close();
    }
  });
});
