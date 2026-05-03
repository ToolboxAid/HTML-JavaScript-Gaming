import { test, expect } from "@playwright/test";
import { ctrlTapClick } from "../helpers/playwrightCtrlTapClick.mjs";
import { startRepoServer } from "../helpers/playwrightRepoServer.mjs";

test("workspace v2 launches asset manager and add/remove is reflected in export", async ({ page }) => {
  const server = await startRepoServer();
  try {
    // 1) Workspace V2 startup baseline
    await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);
    await ctrlTapClick(page, page.getByRole("button", { name: "Full Reset" }));
    await expect(page.locator("#workspaceV2WorkspaceToolsSummary")).toContainText("palette-browser");
    await expect(page.locator("#workspaceV2WorkspaceToolsSummary")).toContainText("workspace-v2");

    // 2) Producer launch to Asset Manager V2
    await page.locator("#workspaceV2ToolSelect").selectOption("asset-manager-v2");
    await ctrlTapClick(page, page.getByRole("button", { name: "Load Tool State" }));
    await ctrlTapClick(page, page.getByRole("button", { name: "Create & Open Tool State" }));
    await expect(page).toHaveURL(/\/tools\/asset-manager-v2\/index\.html/);
    await expect(page).toHaveTitle("Asset Manager V2");
    await expect(page.locator("#assetBrowserV2ContractReadout")).toContainText("payloadJson.assetCatalog valid");
    await expect(page.getByRole("button", { name: /Player Ship/ })).toBeVisible();

    // 3) Add valid asset
    await page.locator("#assetManagerV2AddId").fill("asset-002");
    await page.locator("#assetManagerV2AddLabel").fill("Enemy Ship");
    await page.locator("#assetManagerV2AddKind").fill("svg");
    await page.locator("#assetManagerV2AddPath").fill("assets/vectors/enemy-ship.svg");
    await ctrlTapClick(page, page.getByRole("button", { name: "Add Asset" }));
    await expect(page.getByRole("button", { name: /Enemy Ship/ })).toBeVisible();
    await expect(page.locator("#assetManagerV2ActionStatus")).toHaveText("Asset 'asset-002' added.");

    // 4) Reject duplicate id
    await page.locator("#assetManagerV2AddId").fill("asset-002");
    await page.locator("#assetManagerV2AddLabel").fill("Enemy Ship Duplicate");
    await page.locator("#assetManagerV2AddKind").fill("svg");
    await page.locator("#assetManagerV2AddPath").fill("assets/vectors/enemy-ship-duplicate.svg");
    await ctrlTapClick(page, page.getByRole("button", { name: "Add Asset" }));
    await expect(page.locator("#assetManagerV2ActionStatus")).toHaveText("Add blocked. Asset id 'asset-002' already exists.");
    await expect(page.locator("#assetBrowserV2List").getByRole("button", { name: /Enemy Ship/ })).toHaveCount(1);

    // 5) Reject blank fields
    await page.locator("#assetManagerV2AddId").fill("   ");
    await page.locator("#assetManagerV2AddLabel").fill("   ");
    await page.locator("#assetManagerV2AddKind").fill("   ");
    await page.locator("#assetManagerV2AddPath").fill("   ");
    await ctrlTapClick(page, page.getByRole("button", { name: "Add Asset" }));
    await expect(page.locator("#assetManagerV2ActionStatus")).toContainText("Missing required field(s):");
    await expect(page.locator("#assetManagerV2ActionStatus")).toContainText("id");
    await expect(page.locator("#assetManagerV2ActionStatus")).toContainText("label");
    await expect(page.locator("#assetManagerV2ActionStatus")).toContainText("kind");
    await expect(page.locator("#assetManagerV2ActionStatus")).toContainText("path");
    await expect(page.locator("#assetBrowserV2List").getByRole("button", { name: /Enemy Ship/ })).toHaveCount(1);

    // 6) Select asset/details
    await ctrlTapClick(page, page.locator("#assetBrowserV2List").getByRole("button", { name: /Player Ship/ }));
    await expect(page.locator("#assetBrowserV2DetailId")).toHaveText("asset-001");
    await expect(page.locator("#assetBrowserV2DetailLabel")).toHaveText("Player Ship");
    await expect(page.locator("#assetBrowserV2DetailKind")).toHaveText("svg");
    await expect(page.locator("#assetBrowserV2DetailPath")).toHaveText("assets/vectors/player-ship.svg");

    // 7) Remove asset
    await ctrlTapClick(page, page.getByRole("button", { name: "Remove asset-002" }));
    await expect(page.getByRole("button", { name: /Enemy Ship/ })).toHaveCount(0);
    await expect(page.locator("#assetManagerV2ActionStatus")).toHaveText("Asset 'asset-002' removed.");

    // 8) Export validation
    await ctrlTapClick(page, page.getByRole("button", { name: /Back to Workspace V2/ }));
    await expect(page).toHaveURL(/\/tools\/workspace-v2\/index\.html/);
    await ctrlTapClick(page, page.getByRole("button", { name: "Export Workspace Tool State JSON" }));
    const manifestBeforePromoteText = await page.locator("#workspaceV2ImportJson").inputValue();
    const manifestBeforePromote = JSON.parse(manifestBeforePromoteText);
    expect(Object.prototype.hasOwnProperty.call(manifestBeforePromote.tools || {}, "asset-manager-v2")).toBe(false);
    await ctrlTapClick(page, page.getByRole("button", { name: "Promote Active Tool State to Tools" }));
    await expect(page.locator("#workspaceV2Status")).toContainText("promoted to tools.asset-manager-v2");
    await ctrlTapClick(page, page.getByRole("button", { name: "Export Workspace Tool State JSON" }));
    const exportedJsonText = await page.locator("#workspaceV2ImportJson").inputValue();
    const exported = JSON.parse(exportedJsonText);
    const entries = exported?.tools?.["workspace-v2"]?.activeToolState?.payloadJson?.assetCatalog?.entries;
    if (!Array.isArray(entries)) {
      throw new Error("Exported manifest is missing tools.workspace-v2.activeToolState.payloadJson.assetCatalog.entries.");
    }
    expect(exported.documentKind).toBe("workspace-manifest");
    expect(exported.tools?.["palette-browser"]).toBeTruthy();
    expect(exported.tools?.["workspace-v2"]).toBeTruthy();
    expect(exported.tools?.["workspace-v2"]?.activeToolState?.toolId).toBe("asset-manager-v2");
    expect(entries.some((entry) => entry?.id === "asset-001")).toBe(true);
    expect(entries.some((entry) => entry?.id === "asset-002")).toBe(false);
    const promotedEntries = exported?.tools?.["asset-manager-v2"]?.assetCatalog?.entries;
    if (!Array.isArray(promotedEntries)) {
      throw new Error("Exported manifest is missing tools.asset-manager-v2.assetCatalog.entries after promotion.");
    }
    expect(promotedEntries.some((entry) => entry?.id === "asset-001")).toBe(true);
    expect(promotedEntries.some((entry) => entry?.id === "asset-002")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(exported, "workspaceSession")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(exported, "games")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(exported.tools || {}, "asset-manager-v2")).toBe(true);
    const exportedString = JSON.stringify(exported);
    expect(exportedString.includes("selectedAssetId")).toBe(false);
    expect(exportedString.includes("assetBrowserV2Detail")).toBe(false);

    // 9) Import/export round trip
    const importFileChooserPromise = page.waitForEvent("filechooser");
    await ctrlTapClick(page, page.getByRole("button", { name: "Import Workspace Tool State JSON" }));
    const importFileChooser = await importFileChooserPromise;
    await importFileChooser.setFiles({
      name: "workspace-v2-roundtrip.json",
      mimeType: "application/json",
      buffer: Buffer.from(exportedJsonText, "utf8")
    });
    await expect(page.locator("#workspaceV2ImportExportStatus")).toHaveText("Workspace tool state imported.");
    await ctrlTapClick(page, page.getByRole("button", { name: /Open Asset Manager V2/ }));
    await expect(page).toHaveURL(/\/tools\/asset-manager-v2\/index\.html/);
    await expect(page.getByRole("button", { name: /Player Ship/ })).toBeVisible();
    await expect(page.locator("#assetBrowserV2InvalidState")).toBeHidden();
  } finally {
    await server.close();
  }
});
