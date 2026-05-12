import { expect, test } from "@playwright/test";
import { createServer } from "node:http";
import { extname, join, normalize, relative, resolve } from "node:path";
import { readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(new URL("../../../..", import.meta.url)));
const CONTENT_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"]
]);

let server;
let toolUrl;

async function startStaticServer() {
  server = createServer(async (request, response) => {
    try {
      const requestPath = request.url === "/" ? "/tools/object-vector-studio-v2/index.html" : new URL(request.url, "http://127.0.0.1").pathname;
      const filePath = normalize(join(REPO_ROOT, decodeURIComponent(requestPath)));
      const relativePath = relative(REPO_ROOT, filePath);
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
  toolUrl = `http://127.0.0.1:${address.port}/tools/object-vector-studio-v2/index.html`;
}

test.describe("Object Vector Studio V2", () => {
  test.beforeAll(async () => {
    await startStaticServer();
  });

  test.afterAll(async () => {
    await new Promise((resolveServer) => server.close(resolveServer));
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(toolUrl);
  });

  test("launches the layout shell with schema-only empty state", async ({ page }) => {
    await expect(page.locator("body.tools-platform-tool-page[data-tool-id='object-vector-studio-v2']")).toBeVisible();
    await expect(page.locator("[data-tool-starter-header]")).toContainText("Object Vector Studio V2");
    await expect(page.locator("[data-launch-mode-nav='tool']")).toBeVisible();
    await expect(page.locator("#objectVectorStudioV2ImportJsonButton")).toHaveText("Import");
    await expect(page.locator("#objectVectorStudioV2CopyJsonButton")).toBeDisabled();
    await expect(page.locator("#objectVectorStudioV2ExportJsonButton")).toBeDisabled();
    await expect(page.locator("#objectVectorStudioV2PaletteGate")).toHaveValue("Required before render");
    await expect(page.locator("#objectVectorStudioV2ObjectCount")).toHaveValue("0 objects");
    await expect(page.locator("#objectVectorStudioV2ObjectTiles")).toContainText("No objects loaded");
    await expect(page.locator("#objectVectorStudioV2RenameObjectButton")).toBeDisabled();
    await expect(page.locator("#objectVectorStudioV2DeleteObjectButton")).toBeDisabled();
    await expect(page.locator("#objectVectorStudioV2FlattenObjectButton")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Object" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Shape/Tools" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Objects" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Palette" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Object Details" })).toBeVisible();
    await expect(page.getByRole("button", { name: "JSON Details" })).toBeVisible();
    await expect(page.locator("#statusLog")).toHaveValue(/Object Vector Studio V2 layout shell ready\./);
  });

  test("imports only schema-valid payloads with a palette", async ({ page }, testInfo) => {
    const invalidPayloadPath = testInfo.outputPath("object-vector-invalid.json");
    await writeFile(invalidPayloadPath, JSON.stringify({ objects: [] }, null, 2), "utf8");
    await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(invalidPayloadPath);
    await expect(page.locator("#statusLog")).toHaveValue(/FAIL Object Vector Studio V2 schema validation failed from import:object-vector-invalid\.json: root\.palette is required\./);
    await expect(page.locator("#objectVectorStudioV2ObjectTiles")).toContainText("No objects loaded");

    const validPayloadPath = testInfo.outputPath("object-vector-valid.json");
    await writeFile(validPayloadPath, JSON.stringify({
      palette: {
        id: "arcade-primary",
        swatches: [
          { id: "ship-white", value: "#ffffff" }
        ]
      },
      objects: [
        { id: "ship", name: "Asteroids Ship", shapes: [], type: "ship" },
        { id: "pickup", name: "Energy Pickup", shapes: [], type: "pickup" }
      ]
    }, null, 2), "utf8");
    await page.locator("#objectVectorStudioV2ImportJsonInput").setInputFiles(validPayloadPath);

    await expect(page.locator("#objectVectorStudioV2PaletteGate")).toHaveValue("Palette loaded");
    await expect(page.locator("#objectVectorStudioV2PaletteSummary")).toContainText("Palette arcade-primary: 1 swatches.");
    await expect(page.locator("#objectVectorStudioV2ObjectTiles .object-vector-studio-v2__object-tile")).toHaveCount(2);
    await expect(page.locator("#objectVectorStudioV2ObjectDetails")).toContainText("Asteroids Ship");
    await expect(page.locator("#objectVectorStudioV2SelectedItemVisibility")).toContainText("Selected item visible: Asteroids Ship");
    await expect(page.locator("#objectVectorStudioV2CopyJsonButton")).toBeEnabled();
    await expect(page.locator("#objectVectorStudioV2ExportJsonButton")).toBeEnabled();

    await page.locator("#objectVectorStudioV2ObjectNameInput").fill("Local Object");
    await page.locator("#objectVectorStudioV2AddObjectButton").click();
    await expect(page.locator("#objectVectorStudioV2ObjectCount")).toHaveValue("3 objects");
    await expect(page.locator('[data-object-id="local-object"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#objectVectorStudioV2JsonDetails")).toContainText('"name": "Local Object"');

    await page.locator('[data-shape-tool="rectangle"]').click();
    await expect(page.locator("#objectVectorStudioV2ShapeCount")).toHaveValue("1 shape");
    await expect(page.locator("#objectVectorStudioV2RenderSurface [data-shape-id='rectangle-1']")).toHaveClass(/is-selected/);
    await expect(page.locator("#statusLog")).toHaveValue(/OK Created rectangle shape rectangle-1 on Local Object\./);

    await page.locator("#objectVectorStudioV2DeleteObjectButton").click();
    await expect(page.locator("#objectVectorStudioV2ObjectCount")).toHaveValue("2 objects");
    await expect(page.locator('[data-object-id="local-object"]')).toHaveCount(0);
  });

  test("workspace launch shows Return to Workspace only", async ({ page }) => {
    await page.goto(`${toolUrl}?launch=workspace&fromTool=workspace-manager-v2&hostContextId=object-vector-local&workspaceMode=uat`);

    await expect(page.locator("[data-launch-mode-nav='tool']")).toBeHidden();
    await expect(page.locator("[data-launch-mode-nav='workspace']")).toBeVisible();
    await expect(page.locator("#returnToWorkspaceButton")).toHaveText("Return to Workspace");
    await expect(page.locator("#statusLog")).toHaveValue(/FAIL Schema-only workspace loading blocked: workspace\.tools\.object-vector-studio-v2 is missing/);
  });

  test("accordion sections collapse and fullscreen shell preserves work area", async ({ page }) => {
    await expect(page.locator("#objectVectorStudioV2ShapeToolsContent")).toBeVisible();
    await page.getByRole("button", { name: "Shape/Tools" }).click();
    await expect(page.locator("#objectVectorStudioV2ShapeToolsContent")).toBeHidden();

    await page.locator("[data-tool-starter-summary]").click();
    await page.evaluate(() => {
      window.__objectVectorStudioV2App.shell.applyFullscreenState(true);
      window.__objectVectorStudioV2App.shell.updateSummary();
    });
    await expect(page.locator("body")).toHaveClass(/tools-platform-fullscreen-active/);
    await expect(page.locator("#objectVectorStudioV2WorkArea")).toBeVisible();
  });
});
