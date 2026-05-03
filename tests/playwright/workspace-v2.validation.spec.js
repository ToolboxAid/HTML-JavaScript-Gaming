import { test, expect } from "@playwright/test";
import { startRepoServer } from "../helpers/playwrightRepoServer.mjs";
import { ctrlTapClick } from "../helpers/playwrightCtrlTapClick.mjs";

async function importManifestFromObject(page, manifest) {
  const jsonText = JSON.stringify(manifest, null, 2);
  await page.locator("#workspaceV2ImportFile").setInputFiles({
    name: "workspace-v2-import.json",
    mimeType: "application/json",
    buffer: Buffer.from(jsonText, "utf8")
  });
  return jsonText;
}

async function exportManifestFromTextarea(page) {
  await page.getByRole("button", { name: "Export Workspace Tool State JSON" }).click();
  const exportedText = await page.locator("#workspaceV2ImportJson").inputValue();
  return JSON.parse(exportedText);
}

test.describe("Workspace V2 validation coverage", () => {
  test("producer tool selection excludes palette-manager-v2 and asset-manager load/create actions work", async ({ page }) => {
    const server = await startRepoServer();
    try {
      await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);
      await ctrlTapClick(page, page.getByRole("button", { name: "Full Reset" }));

      await expect(page.locator("#workspaceV2ToolSelect option[value='palette-manager-v2']")).toHaveCount(0);
      await expect(page.locator("#workspaceV2ToolSelect")).not.toHaveValue("palette-manager-v2");

      await page.locator("#workspaceV2ToolSelect").selectOption("asset-manager-v2");
      await page.locator("#workspaceV2LoadFixtureButton").click();
      await expect(page).toHaveURL(/\/tools\/asset-manager-v2\/index\.html/);
      await page.goBack();
      await expect(page).toHaveURL(/\/tools\/workspace-v2\/index\.html/);

      await page.locator("#workspaceV2ToolStateName").fill("asset-manager-v2-create-open-001");
      await ctrlTapClick(page, page.getByRole("button", { name: "Create & Open Tool State" }));
      await expect(page).toHaveURL(/\/tools\/asset-manager-v2\/index\.html/);

      await ctrlTapClick(page, page.getByRole("button", { name: /Back to Workspace V2/ }));
      await expect(page).toHaveURL(/\/tools\/workspace-v2\/index\.html/);
    } finally {
      await server.close();
    }
  });

  test("workspace lifecycle reset -> valid import -> export -> import success", async ({ page }) => {
    const server = await startRepoServer();
    try {
      await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);
      await ctrlTapClick(page, page.getByRole("button", { name: "Full Reset" }));
      await expect(page.locator("#workspaceV2ToolSelect option[value='palette-manager-v2']")).toHaveCount(0);
      await expect(page.locator("#workspaceV2WorkspaceToolsSummary")).toContainText("palette-browser");
      await expect(page.locator("#workspaceV2WorkspaceToolsSummary")).not.toContainText("workspace-v2");

      const baselineManifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      expect(baselineManifest.documentKind).toBe("workspace-manifest");
      expect(baselineManifest.tools?.["palette-browser"]).toBeTruthy();
      expect(baselineManifest.tools?.["workspace-v2"]).toBeTruthy();

      await importManifestFromObject(page, baselineManifest);
      await expect(page.locator("#workspaceV2ImportExportStatus")).toHaveText("Workspace tool state imported.");

      const exportedManifest = await exportManifestFromTextarea(page);
      expect(exportedManifest.documentKind).toBe("workspace-manifest");

      await importManifestFromObject(page, exportedManifest);
      await expect(page.locator("#workspaceV2ImportExportStatus")).toHaveText("Workspace tool state imported.");
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
      await expect(page.locator("#workspaceV2ToolStateHistoryEmptyState")).toHaveText("No recent tool states.");

      await importManifestFromObject(page, {
        schema: "html-js-gaming.project",
        version: 1,
        id: "bad-manifest",
        name: "Bad Manifest",
        tools: {}
      });
      await expect(page.locator("#workspaceV2ImportExportStatus")).toContainText("Import error:");
      await expect(page.locator("#workspaceV2ToolStateHistoryEmptyState")).toHaveText("No recent tool states.");

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
            schema: "html-js-gaming.workspace-v2-tool-state/1",
            game: {
              id: "game-bad",
              name: "Bad Game"
            },
            defaultToolId: "asset-manager-v2",
            activeToolId: "asset-manager-v2",
            activeHostContextId: "asset-manager-v2-bad-0001",
            activeToolState: {
              version: "v2",
              toolId: "asset-manager-v2",
              payloadJson: null
            },
            savedToolStates: {}
          }
        }
      };
      await importManifestFromObject(page, invalidPayloadManifest);
      await expect(page.locator("#workspaceV2ImportExportStatus")).toContainText("Import error:");
      await expect(page.locator("#workspaceV2ToolStateHistoryEmptyState")).toHaveText("No recent tool states.");
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
      await page.locator("#workspaceV2ToolStateName").fill("asset-manager-v2-roundtrip-001");
      await ctrlTapClick(page, page.getByRole("button", { name: "Load Tool State" }));
      await expect(page).toHaveURL(/\/tools\/asset-manager-v2\/index\.html/);
      await page.goBack();
      await expect(page).toHaveURL(/\/tools\/workspace-v2\/index\.html/);

      const loadedManifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      const exportedManifest = await exportManifestFromTextarea(page);
      expect(exportedManifest).toEqual(loadedManifest);

      await importManifestFromObject(page, exportedManifest);
      await expect(page.locator("#workspaceV2ImportExportStatus")).toHaveText("Workspace tool state imported.");
      const postImportManifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      expect(postImportManifest).toEqual(exportedManifest);
    } finally {
      await server.close();
    }
  });

  test("tool switching keeps activeToolState consistent with selected fixture tool", async ({ page }) => {
    const server = await startRepoServer();
    try {
      await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);
      await ctrlTapClick(page, page.getByRole("button", { name: "Full Reset" }));

      await page.locator("#workspaceV2ToolSelect").selectOption("tilemap-studio-v2");
      await page.locator("#workspaceV2ToolStateName").fill("tilemap-studio-v2-switch-001");
      await page.locator("#workspaceV2LoadFixtureButton").click();
      await expect(page).toHaveURL(/\/tools\/tilemap-studio-v2\/index\.html/);
      await page.goBack();
      await expect(page).toHaveURL(/\/tools\/workspace-v2\/index\.html/);
      let manifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      expect(manifest.tools?.["workspace-v2"]?.activeToolId).toBe("tilemap-studio-v2");
      expect(manifest.tools?.["workspace-v2"]?.activeToolState?.toolId).toBe("tilemap-studio-v2");
      expect(Object.prototype.hasOwnProperty.call(manifest.tools || {}, "tilemap-studio-v2")).toBe(false);

      await page.locator("#workspaceV2ToolSelect").selectOption("vector-map-editor-v2");
      await page.locator("#workspaceV2ToolStateName").fill("vector-map-editor-v2-switch-001");
      await page.locator("#workspaceV2LoadFixtureButton").click();
      await expect(page).toHaveURL(/\/tools\/vector-map-editor-v2\/index\.html/);
      await page.goBack();
      await expect(page).toHaveURL(/\/tools\/workspace-v2\/index\.html/);
      manifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      expect(manifest.tools?.["workspace-v2"]?.activeToolId).toBe("vector-map-editor-v2");
      expect(manifest.tools?.["workspace-v2"]?.activeToolState?.toolId).toBe("vector-map-editor-v2");
      expect(Object.prototype.hasOwnProperty.call(manifest.tools || {}, "vector-map-editor-v2")).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("direct publish and promote to tools stay explicit for active and saved tool states", async ({ page }) => {
    const server = await startRepoServer();
    try {
      await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);
      await ctrlTapClick(page, page.getByRole("button", { name: "Full Reset" }));

      await page.locator("#workspaceV2ToolSelect").selectOption("tilemap-studio-v2");
      await page.locator("#workspaceV2ToolStateName").fill("tilemap-studio-v2-direct-001");
      await page.locator("#workspaceV2LoadFixtureButton").click();
      await expect(page).toHaveURL(/\/tools\/tilemap-studio-v2\/index\.html/);
      await page.goBack();
      await expect(page).toHaveURL(/\/tools\/workspace-v2\/index\.html/);
      await expect(page.locator("#workspaceV2ActiveToolStatePublishStatus")).toHaveText("Active in Workspace only");

      let manifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      expect(manifest.tools?.["workspace-v2"]?.savedToolStates?.["tilemap-studio-v2-direct-001"]).toBeTruthy();
      expect(Object.prototype.hasOwnProperty.call(manifest.tools || {}, "tilemap-studio-v2")).toBe(false);

      await page.getByRole("button", { name: "Create Direct Tools Entry" }).click();
      manifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      expect(manifest.tools?.["tilemap-studio-v2"]?.tileMapDocument).toBeTruthy();
      await expect(page.locator("#workspaceV2ActiveToolStatePublishStatus")).toHaveText("Promoted to tools.tilemap-studio-v2");
      await expect(page.locator("#workspaceV2WorkspaceToolsSummary")).toContainText("palette-browser");
      await expect(page.locator("#workspaceV2WorkspaceToolsSummary")).toContainText("tilemap-studio-v2");
      await expect(page.locator("#workspaceV2WorkspaceToolsSummary")).not.toContainText("workspace-v2");
      await page.getByRole("button", { name: "Copy to Tool State" }).first().click();
      await expect(page.locator("#workspaceV2LibraryStatus")).toContainText("copied to saved tool state");

      await page.locator("#workspaceV2ToolSelect").selectOption("vector-map-editor-v2");
      await page.locator("#workspaceV2ToolStateName").fill("vector-map-editor-v2-direct-001");
      await page.locator("#workspaceV2LoadFixtureButton").click();
      await expect(page).toHaveURL(/\/tools\/vector-map-editor-v2\/index\.html/);
      await page.goBack();
      await expect(page).toHaveURL(/\/tools\/workspace-v2\/index\.html/);
      manifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      expect(Object.prototype.hasOwnProperty.call(manifest.tools || {}, "vector-map-editor-v2")).toBe(false);

      await page.getByRole("button", { name: "Promote to Tools" }).first().click();
      manifest = JSON.parse(await page.locator("#workspaceV2ImportJson").inputValue());
      expect(manifest.tools?.["tilemap-studio-v2"]?.tileMapDocument).toBeTruthy();
      expect(Object.prototype.hasOwnProperty.call(manifest.tools || {}, "vector-map-editor-v2")).toBe(false);
    } finally {
      await server.close();
    }
  });
});
