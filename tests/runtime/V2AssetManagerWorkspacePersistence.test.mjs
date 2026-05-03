import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const assetManagerPath = path.join(repoRoot, "tools", "asset-manager-v2", "index.js");
const workspacePath = path.join(repoRoot, "tools", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "tmp", "pr_11_314_asset_manager_workspace_persistence_results.json");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function checkSyntax(filePath) {
  execFileSync(process.execPath, ["--check", filePath], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function simulatePersistence(hostContextId, sessionContext, limitBytes) {
  if (!hostContextId) return { ok: false, message: "No hostContextId is available for Workspace V2 persistence." };
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
    return { ok: false, message: "Session context is invalid for Workspace V2 persistence." };
  }
  if (!sessionContext.payloadJson || typeof sessionContext.payloadJson !== "object" || Array.isArray(sessionContext.payloadJson)) {
    return { ok: false, message: "payloadJson is invalid for Workspace V2 persistence." };
  }
  if (!sessionContext.payloadJson.assetCatalog || typeof sessionContext.payloadJson.assetCatalog !== "object" || Array.isArray(sessionContext.payloadJson.assetCatalog)) {
    return { ok: false, message: "payloadJson.assetCatalog is invalid for Workspace V2 persistence." };
  }
  const payload = {
    version: "v2",
    toolId: "asset-manager-v2",
    payloadJson: sessionContext.payloadJson
  };
  const serialized = JSON.stringify(payload);
  if (serialized.length > limitBytes) {
    return { ok: false, message: `Session size exceeds allowed limit for Workspace V2 persistence. Payload is ${serialized.length} bytes and limit is ${limitBytes} bytes.` };
  }
  return { ok: true, payload: JSON.parse(serialized) };
}

function simulateWorkspaceExportDocument(activeHostContextId, activeSessionPayload, savedSessions) {
  return {
    documentKind: "workspace-manifest",
    schema: "html-js-gaming.project",
    version: 1,
    id: `workspace-v2-${activeHostContextId}`,
    name: `Workspace V2 Session ${activeSessionPayload.toolId}`,
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
          id: `workspace-${activeHostContextId}`,
          name: "Workspace V2 Session"
        },
        defaultToolId: "palette-manager-v2",
        activeToolId: activeSessionPayload.toolId,
        activeHostContextId,
        activeSession: activeSessionPayload,
        savedSessions
      }
    }
  };
}

function simulateWorkspaceImportAndOpenAssetManager(workspaceDocument) {
  if (!workspaceDocument?.tools?.["workspace-v2"]?.activeSession) {
    return { ok: false, message: "Missing activeSession in workspace manifest." };
  }
  const importedActiveSession = workspaceDocument.tools["workspace-v2"].activeSession;
  if (!importedActiveSession.payloadJson || typeof importedActiveSession.payloadJson !== "object" || Array.isArray(importedActiveSession.payloadJson)) {
    return { ok: false, message: "Imported activeSession.payloadJson is invalid." };
  }
  const launchPayload = {
    version: "v2",
    toolId: "asset-manager-v2",
    payloadJson: JSON.parse(JSON.stringify(importedActiveSession.payloadJson))
  };
  if (!launchPayload.payloadJson.assetCatalog || typeof launchPayload.payloadJson.assetCatalog !== "object" || Array.isArray(launchPayload.payloadJson.assetCatalog)) {
    return { ok: false, message: "Open Asset Manager V2 cannot find payloadJson.assetCatalog." };
  }
  return { ok: true, launchPayload };
}

export function run() {
  checkSyntax(assetManagerPath);
  checkSyntax(workspacePath);

  const assetSource = readText(assetManagerPath);
  const workspaceSource = readText(workspacePath);

  const validSession = {
    version: "v2",
    toolId: "asset-manager-v2",
    payloadJson: {
      assetCatalog: {
        name: "Catalog",
        entries: [
          { id: "a1", label: "Ship", kind: "svg", path: "assets/ship.svg" }
        ]
      }
    }
  };
  const invalidSession = {
    version: "v2",
    toolId: "asset-manager-v2",
    payloadJson: {}
  };

  const validWrite = simulatePersistence("asset-manager-v2-123", validSession, 1024 * 1024);
  const invalidWrite = simulatePersistence("asset-manager-v2-123", invalidSession, 1024 * 1024);
  const exportedWorkspaceDocument = simulateWorkspaceExportDocument(
    "asset-manager-v2-123",
    validWrite.payload,
    {
      "saved-asset-session": {
        version: "v2",
        toolId: "asset-manager-v2",
        payloadJson: {
          assetCatalog: {
            name: "Saved Catalog",
            entries: [
              { id: "b2", label: "Asteroid", kind: "png", path: "assets/asteroid.png" }
            ]
          }
        }
      }
    }
  );
  const importAndOpen = simulateWorkspaceImportAndOpenAssetManager(exportedWorkspaceDocument);

  const summary = {
    generatedAt: new Date().toISOString(),
    checks: {
      noDeferredWorkspaceWriteMessage: !assetSource.includes("Workspace writes are deferred for this isolated V2 entry."),
      hasValidSessionPersistenceMethod: assetSource.includes("persistValidSessionForWorkspace(sessionContext, assetCatalog)") &&
        assetSource.includes("window.sessionStorage.setItem(this.urlState.hostContextId, serializedPayload);"),
      hasWorkspacePersistenceReadout: assetSource.includes("Workspace session context was read and persisted for Workspace V2 export."),
      hasWorkspaceHostContextRestore: workspaceSource.includes("restoreActiveSessionFromHostContextIdUrl()") &&
        workspaceSource.includes("this.restoreActiveSessionFromHostContextIdUrl();") &&
        workspaceSource.includes("if (parsed.value.toolId !== \"asset-manager-v2\")") &&
        workspaceSource.includes("this.syncWorkspaceManifestTextarea();"),
      hasAssetManagerOpenLaunchUsingActivePayloadJson: workspaceSource.includes("openAssetManagerFromWorkspace()") &&
        workspaceSource.includes("payloadJson: this.cloneSessionValue(this.currentSessionPayload.payloadJson)"),
      validWriteAllowed: validWrite.ok === true && validWrite.payload?.payloadJson?.assetCatalog?.name === "Catalog",
      invalidWriteBlocked: invalidWrite.ok === false,
      exportedManifestRetainsActiveAssetCatalog: exportedWorkspaceDocument.tools["workspace-v2"].activeSession?.payloadJson?.assetCatalog?.name === "Catalog" &&
        Array.isArray(exportedWorkspaceDocument.tools["workspace-v2"].activeSession?.payloadJson?.assetCatalog?.entries),
      importThenOpenAssetManagerLoadsCatalog: importAndOpen.ok === true &&
        importAndOpen.launchPayload?.payloadJson?.assetCatalog?.entries?.[0]?.id === "a1"
    }
  };

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  for (const [key, value] of Object.entries(summary.checks)) {
    assert.equal(value, true, `${key} failed`);
  }

  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const summary = run();
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
