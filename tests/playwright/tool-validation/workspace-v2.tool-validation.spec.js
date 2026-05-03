import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { ctrlTapClick } from "../../helpers/playwrightCtrlTapClick.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const auditPath = path.join(repoRoot, "docs", "dev", "reports", "tool_completion_audit.md");
const fixtureRoot = path.join(repoRoot, "tests", "fixtures", "v2-tools");

function parseAuditToolList() {
  const auditText = fs.readFileSync(auditPath, "utf8");
  const toolMatches = [...auditText.matchAll(/-\s+`([^`]+)`/g)]
    .map((match) => match[1].trim())
    .filter((value) => /^[a-z0-9-]+-v2$/.test(value));
  const uniqueTools = [];
  toolMatches.forEach((toolId) => {
    if (!uniqueTools.includes(toolId)) {
      uniqueTools.push(toolId);
    }
  });
  return uniqueTools;
}

function readFixtureSession(toolId) {
  const fixturePath = path.join(fixtureRoot, `${toolId}.json`);
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  return {
    hostContextId: typeof fixture.hostContextId === "string" ? fixture.hostContextId.trim() : `${toolId}-fixture`,
    toolStateContext: fixture.toolStateContext
  };
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildWorkspaceManifest(toolStateContext, hostContextId) {
  return {
    documentKind: "workspace-manifest",
    schema: "html-js-gaming.project",
    version: 1,
    id: "workspace-v2-tool-validation",
    name: "Workspace V2 Tool Validation",
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
          id: "workspace-v2-tool-validation-game",
          name: "Workspace V2 Tool Validation"
        },
        defaultToolId: "asset-manager-v2",
        activeToolId: typeof toolStateContext.toolId === "string" ? toolStateContext.toolId : "asset-manager-v2",
        activeHostContextId: hostContextId,
        activeToolState: cloneJson(toolStateContext),
        savedToolStates: {}
      }
    }
  };
}

async function importWorkspaceManifest(page, manifest) {
  const chooserPromise = page.waitForEvent("filechooser");
  await ctrlTapClick(page, page.getByRole("button", { name: "Import Workspace Tool State JSON" }));
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: "workspace-v2-tool-validation-import.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(manifest, null, 2), "utf8")
  });
}

async function seedSessionAndOpenTool(page, baseUrl, toolId, hostContextId, toolStateContext) {
  await page.goto(`${baseUrl}/tools/workspace-v2/index.html`);
  await page.evaluate(({ hostContextId: id, toolStateContext: payload }) => {
    window.sessionStorage.setItem(id, JSON.stringify(payload));
  }, { hostContextId, toolStateContext });
  await page.goto(`${baseUrl}/tools/${toolId}/index.html?hostContextId=${encodeURIComponent(hostContextId)}`);
}

const toolSelectors = {
  "asset-manager-v2": {
    valid: "#assetBrowserV2ValidState",
    invalid: "#assetBrowserV2InvalidState",
    readout: "#assetBrowserV2ContractReadout",
    validToken: "payloadJson.assetCatalog valid",
    invalidToken: "payloadJson.assetCatalog invalid"
  },
  "palette-manager-v2": {
    valid: "#paletteManagerValidState",
    invalid: "#paletteManagerInvalidState",
    readout: "#paletteManagerContractReadout",
    validToken: "payloadJson.paletteDocument valid",
    invalidToken: "payloadJson.paletteDocument invalid"
  },
  "svg-asset-studio-v2": {
    valid: "#svgV2ValidState",
    invalid: "#svgV2InvalidState",
    readout: "#svgV2ToolReadout",
    validToken: "payloadJson.vectorAssetDocument valid",
    invalidToken: "payloadJson.vectorAssetDocument invalid"
  },
  "tilemap-studio-v2": {
    valid: "#tilemapV2ValidState",
    invalid: "#tilemapV2InvalidState",
    readout: "#tilemapV2ContractReadout",
    validToken: "payloadJson.tileMapDocument valid",
    invalidToken: "payloadJson.tileMapDocument invalid"
  },
  "vector-map-editor-v2": {
    valid: "#vectorMapV2ValidState",
    invalid: "#vectorMapV2InvalidState",
    readout: "#vectorMapV2ContractReadout",
    validToken: "payloadJson.vectorMapDocument valid",
    invalidToken: "payloadJson.vectorMapDocument invalid"
  }
};

const auditTools = parseAuditToolList();
const toolIds = auditTools.filter((toolId) => toolId !== "workspace-v2");

test("@workspace-v2 tool validation list includes all audited tools", async () => {
  expect(auditTools).toEqual([
    "workspace-v2",
    "asset-manager-v2",
    "palette-manager-v2",
    "svg-asset-studio-v2",
    "tilemap-studio-v2",
    "vector-map-editor-v2"
  ]);
});

test("@workspace-v2 valid workspace manifest payloadJson imports", async ({ page }) => {
  const server = await startRepoServer();
  try {
    const fixture = readFixtureSession("asset-manager-v2");
    const manifest = buildWorkspaceManifest(fixture.toolStateContext, `${fixture.hostContextId}-workspace-valid`);
    await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);
    await importWorkspaceManifest(page, manifest);
    await expect(page.locator("#workspaceV2ImportExportStatus")).toHaveText("Workspace tool state imported.");
  } finally {
    await server.close();
  }
});

test("@workspace-v2 invalid workspace manifest payloadJson is rejected", async ({ page }) => {
  const server = await startRepoServer();
  try {
    const fixture = readFixtureSession("asset-manager-v2");
    const manifest = buildWorkspaceManifest(fixture.toolStateContext, `${fixture.hostContextId}-workspace-invalid`);
    manifest.tools["workspace-v2"].activeToolState.payloadJson = null;
    await page.goto(`${server.baseUrl}/tools/workspace-v2/index.html`);
    await importWorkspaceManifest(page, manifest);
    await expect(page.locator("#workspaceV2ImportExportStatus")).toContainText("Import error:");
  } finally {
    await server.close();
  }
});

for (const toolId of toolIds) {
  const selectors = toolSelectors[toolId];
  if (!selectors) {
    continue;
  }

  test(`@${toolId} valid payloadJson renders`, async ({ page }) => {
    const server = await startRepoServer();
    try {
      const fixture = readFixtureSession(toolId);
      await seedSessionAndOpenTool(
        page,
        server.baseUrl,
        toolId,
        `${fixture.hostContextId}-valid`,
        fixture.toolStateContext
      );
      await expect(page.locator(selectors.valid)).toBeVisible();
      await expect(page.locator(selectors.invalid)).toBeHidden();
      await expect(page.locator(selectors.readout)).toContainText(selectors.validToken);
    } finally {
      await server.close();
    }
  });

  test(`@${toolId} invalid payloadJson is rejected without partial render`, async ({ page }) => {
    const server = await startRepoServer();
    try {
      const fixture = readFixtureSession(toolId);
      const invalidToolState = cloneJson(fixture.toolStateContext);
      invalidToolState.payloadJson = null;
      await seedSessionAndOpenTool(
        page,
        server.baseUrl,
        toolId,
        `${fixture.hostContextId}-invalid`,
        invalidToolState
      );
      await expect(page.locator(selectors.invalid)).toBeVisible();
      await expect(page.locator(selectors.valid)).toBeHidden();
      await expect(page.locator(selectors.readout)).toContainText(selectors.invalidToken);
    } finally {
      await server.close();
    }
  });
}
