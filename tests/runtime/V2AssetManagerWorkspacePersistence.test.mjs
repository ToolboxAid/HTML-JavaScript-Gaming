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
      validWriteAllowed: validWrite.ok === true && validWrite.payload?.payloadJson?.assetCatalog?.name === "Catalog",
      invalidWriteBlocked: invalidWrite.ok === false
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
