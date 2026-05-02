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

const TOOL_IDS = [
  "asset-browser-v2",
  "palette-manager-v2",
  "svg-asset-studio-v2",
  "tilemap-studio-v2",
  "vector-map-editor-v2"
];

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

  const requiredWorkspaceHtmlTokens = [
    'id="workspaceV2ImportJson"',
    'id="workspaceV2ImportButton"',
    'id="workspaceV2ExportButton"',
    "Import Workspace Session JSON",
    "Export Workspace Session JSON"
  ];
  requiredWorkspaceHtmlTokens.forEach((token) => {
    if (!workspaceHtml.includes(token)) {
      failures.push(`Missing required workspace import/export token: ${token}`);
    }
  });

  const forbiddenWorkspaceHtmlTokens = [
    'id="workspaceV2NavModeSelect"',
    'id="workspaceV2NavToolsActions"',
    'id="workspaceV2NavWorkspaceActions"',
    "Tool Mode (navTools)",
    "Import Tool Session JSON",
    "Export Tool Session JSON"
  ];
  forbiddenWorkspaceHtmlTokens.forEach((token) => {
    if (workspaceHtml.includes(token)) {
      failures.push(`Workspace V2 should not expose mode-switch/tool-mode control: ${token}`);
    }
  });

  const requiredWorkspaceJsTokens = [
    "importWorkspaceSessionJson()",
    "exportWorkspaceSessionJson()",
    "buildPortableWorkspaceSessionContainer()",
    "runtime-only fields are not allowed in portable workspace payload",
    "toolSessions",
    "savedSessions"
  ];
  requiredWorkspaceJsTokens.forEach((token) => {
    if (!workspaceJs.includes(token)) {
      failures.push(`Missing required workspace contract JS token: ${token}`);
    }
  });

  TOOL_IDS.forEach((toolId) => {
    const toolHtmlPath = path.join(repoRoot, "tools", toolId, "index.html");
    const toolHtmlExists = fs.existsSync(toolHtmlPath);
    if (!toolHtmlExists) {
      failures.push(`Missing tool page HTML: tools/${toolId}/index.html`);
      return;
    }
    const toolHtml = fs.readFileSync(toolHtmlPath, "utf8");
    const forbiddenToolTokens = [
      'id="workspaceV2ImportJson"',
      'id="workspaceV2ImportButton"',
      'id="workspaceV2ExportButton"',
      "Import Workspace Session JSON",
      "Export Workspace Session JSON"
    ];
    forbiddenToolTokens.forEach((token) => {
      if (toolHtml.includes(token)) {
        failures.push(`Tool page should not expose workspace import/export controls (${toolId}): ${token}`);
      }
    });
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
  const workspaceExport = simulateWorkspaceModeExport(activePayload, "palette-manager-v2-1234567890123-abcd1234", library);
  if (!workspaceExport.ok) failures.push("Workspace export should succeed when active payload exists.");
  const workspaceExportParsed = workspaceExport.serialized ? JSON.parse(workspaceExport.serialized) : null;
  if (!workspaceExportParsed || typeof workspaceExportParsed !== "object" || Array.isArray(workspaceExportParsed)) {
    failures.push("Workspace export should be an object container.");
  } else if (!workspaceExportParsed.workspaceSession || typeof workspaceExportParsed.workspaceSession !== "object") {
    failures.push("Workspace export should include workspaceSession container.");
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
    const activeEntry =
      workspaceExportParsed.workspaceSession.toolSessions?.["palette-manager-v2"]?.["palette-manager-v2-1234567890123-abcd1234"];
    if (JSON.stringify(activeEntry) !== JSON.stringify(activePayload)) {
      failures.push("Workspace export should preserve active payload under toolSessions by tool/session id.");
    }
  }

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
      workspaceExport
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
