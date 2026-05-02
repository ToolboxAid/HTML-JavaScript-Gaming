import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const workspaceHtmlPath = path.join(repoRoot, "tools", "workspace-v2", "index.html");
const workspaceJsPath = path.join(repoRoot, "tools", "workspace-v2", "index.js");
const testPath = path.join(repoRoot, "tests", "runtime", "V2CurrentSessionExport.test.mjs");
const resultsPath = path.join(repoRoot, "tmp", "v2-current-session-export-results.json");

function checkSyntax(filePath) {
  try {
    execFileSync(process.execPath, ["--check", filePath], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ok: true, error: "" };
  } catch (error) {
    return { ok: false, error: (error?.stderr || error?.stdout || error?.message || "").toString().trim() };
  }
}

function simulateToolModeExport(activePayload, currentHostContextId) {
  if (!activePayload || typeof activePayload !== "object" || Array.isArray(activePayload)) {
    return {
      ok: false,
      status: "No active Workspace V2 session is available to export.",
      filename: "",
      serialized: ""
    };
  }
  const payloadToolId = typeof activePayload.toolId === "string" ? activePayload.toolId.trim() : "";
  const toolIdForFile = payloadToolId || "workspace-v2";
  const sessionIdForFile = typeof currentHostContextId === "string" && currentHostContextId.trim()
    ? currentHostContextId.trim()
    : "session";
  return {
    ok: true,
    status: "Exported current workspace session JSON.",
    filename: `${toolIdForFile}-${sessionIdForFile}.json`,
    serialized: JSON.stringify(activePayload, null, 2)
  };
}

function simulateWorkspaceModeExport(activePayload, currentHostContextId, library) {
  if (!activePayload || typeof activePayload !== "object" || Array.isArray(activePayload)) {
    return {
      ok: false,
      status: "No active Workspace V2 session is available to export.",
      filename: "",
      serialized: ""
    };
  }
  const activeToolId = typeof activePayload.toolId === "string" && activePayload.toolId.trim()
    ? activePayload.toolId.trim()
    : "workspace-v2";
  const activeHostContextId = typeof currentHostContextId === "string" && currentHostContextId.trim()
    ? currentHostContextId.trim()
    : "";
  const toolSessions = {};
  if (activeHostContextId) {
    toolSessions[activeToolId] = {
      [activeHostContextId]: activePayload
    };
  }
  Object.keys(library).forEach((sessionId) => {
    const payload = library[sessionId];
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return;
    }
    const payloadToolId = typeof payload.toolId === "string" && payload.toolId.trim()
      ? payload.toolId.trim()
      : activeToolId;
    if (!Object.prototype.hasOwnProperty.call(toolSessions, payloadToolId)) {
      toolSessions[payloadToolId] = {};
    }
    toolSessions[payloadToolId][sessionId] = payload;
  });
  const container = {
    version: "v2",
    toolId: "workspace-v2",
    workspaceSession: {
      workspaceToolId: "workspace-v2",
      workspaceSessionId: activeHostContextId,
      defaultToolId: "palette-manager-v2",
      activeToolId,
      activeHostContextId,
      toolSessions,
      savedSessions: library,
      exportedAt: "2026-05-02T00:00:00.000Z"
    }
  };
  return {
    ok: true,
    status: "Exported current workspace session JSON.",
    filename: `workspace-v2-${activeToolId}-${activeHostContextId || "session"}.json`,
    serialized: JSON.stringify(container, null, 2)
  };
}

export function run() {
  const failures = [];
  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceHtml = workspaceHtmlExists ? fs.readFileSync(workspaceHtmlPath, "utf8") : "";
  const workspaceJs = workspaceJsExists ? fs.readFileSync(workspaceJsPath, "utf8") : "";
  const workspaceJsSyntax = checkSyntax(workspaceJsPath);
  const testSyntax = checkSyntax(testPath);

  if (!workspaceHtmlExists) failures.push("Missing tools/workspace-v2/index.html.");
  if (!workspaceJsExists) failures.push("Missing tools/workspace-v2/index.js.");
  if (!workspaceJsSyntax.ok) failures.push("tools/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2CurrentSessionExport.test.mjs failed syntax check.");

  const requiredHtmlTokens = [
    'id="workspaceV2NavModeSelect"',
    'id="workspaceV2NavToolsActions"',
    'id="workspaceV2NavWorkspaceActions"',
    'id="workspaceV2ImportWorkspaceButton"',
    'id="workspaceV2ExportWorkspaceButton"'
  ];
  requiredHtmlTokens.forEach((token) => {
    if (!workspaceHtml.includes(token)) {
      failures.push(`Missing nav mode separation HTML token: ${token}`);
    }
  });

  const requiredJsTokens = [
    "currentNavMode()",
    "renderNavModeActions()",
    "importWorkspaceSessionJson()",
    "exportWorkspaceSessionJson()",
    "buildPortableWorkspaceSessionContainer()",
    "if (!this.inToolsNavMode())",
    "if (!this.inWorkspaceNavMode())",
    "toolSessions",
    "savedSessions",
    "runtime-only fields are not allowed in portable workspace payload"
  ];
  requiredJsTokens.forEach((token) => {
    if (!workspaceJs.includes(token)) {
      failures.push(`Missing nav/export contract JS token: ${token}`);
    }
  });

  const activePayload = {
    version: "v2",
    toolId: "palette-manager-v2",
    payloadJson: { swatches: ["#112233", "#445566"] }
  };
  const library = {
    "asset-browser-v2-saved": {
      version: "v2",
      toolId: "asset-browser-v2",
      payloadJson: { assetCatalog: { entries: [{ id: "asset-1" }] } }
    }
  };

  const toolExport = simulateToolModeExport(activePayload, "palette-manager-v2-1234567890123-abcd1234");
  if (!toolExport.ok) failures.push("Tool mode export should succeed when active payload exists.");
  if (toolExport.filename !== "palette-manager-v2-palette-manager-v2-1234567890123-abcd1234.json") {
    failures.push("Tool mode export filename mismatch.");
  }
  const toolExportParsed = toolExport.serialized ? JSON.parse(toolExport.serialized) : null;
  if (JSON.stringify(toolExportParsed) !== JSON.stringify(activePayload)) {
    failures.push("Tool mode export should preserve active tool payload exactly.");
  }

  const workspaceExport = simulateWorkspaceModeExport(activePayload, "palette-manager-v2-1234567890123-abcd1234", library);
  if (!workspaceExport.ok) failures.push("Workspace mode export should succeed when active payload exists.");
  if (workspaceExport.filename !== "workspace-v2-palette-manager-v2-palette-manager-v2-1234567890123-abcd1234.json") {
    failures.push("Workspace mode export filename mismatch.");
  }
  const workspaceExportParsed = workspaceExport.serialized ? JSON.parse(workspaceExport.serialized) : null;
  if (!workspaceExportParsed || typeof workspaceExportParsed !== "object" || Array.isArray(workspaceExportParsed)) {
    failures.push("Workspace mode export should be an object container.");
  } else if (!workspaceExportParsed.workspaceSession || typeof workspaceExportParsed.workspaceSession !== "object") {
    failures.push("Workspace mode export should include workspaceSession container.");
  } else {
    if (Object.prototype.hasOwnProperty.call(workspaceExportParsed.workspaceSession, "sessionHistory")) {
      failures.push("Workspace export must not include sessionHistory runtime field.");
    }
    if (Object.prototype.hasOwnProperty.call(workspaceExportParsed.workspaceSession, "sessionSelection")) {
      failures.push("Workspace export must not include sessionSelection runtime field.");
    }
    if (Object.prototype.hasOwnProperty.call(workspaceExportParsed.workspaceSession, "mergeAuditLog")) {
      failures.push("Workspace export must not include mergeAuditLog runtime field.");
    }
    if (Object.prototype.hasOwnProperty.call(workspaceExportParsed.workspaceSession, "activeSessionPayload")) {
      failures.push("Workspace export must not include lone activeSessionPayload runtime field.");
    }
    if (JSON.stringify(workspaceExportParsed.workspaceSession.savedSessions) !== JSON.stringify(library)) {
      failures.push("Workspace export should preserve savedSessions payload map.");
    }
    const activeEntry =
      workspaceExportParsed.workspaceSession.toolSessions?.["palette-manager-v2"]?.["palette-manager-v2-1234567890123-abcd1234"];
    if (JSON.stringify(activeEntry) !== JSON.stringify(activePayload)) {
      failures.push("Workspace export should preserve active payload under toolSessions by tool/session id.");
    }
  }

  const noActiveToolExport = simulateToolModeExport(null, "");
  if (noActiveToolExport.ok) failures.push("Tool export should fail when active payload is missing.");
  const noActiveWorkspaceExport = simulateWorkspaceModeExport(null, "", {});
  if (noActiveWorkspaceExport.ok) failures.push("Workspace export should fail when active payload is missing.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      workspaceHtmlExists,
      workspaceJsExists,
      workspaceJsSyntax,
      testSyntax
    },
    scenarios: {
      toolExport,
      workspaceExport,
      noActiveToolExport,
      noActiveWorkspaceExport
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 current-session export results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 current-session export failures: ${failures.join(" | ")}`);
  return { failures };
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
