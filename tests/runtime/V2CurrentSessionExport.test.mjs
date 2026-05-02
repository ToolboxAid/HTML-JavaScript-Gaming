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
const workspaceSchemaPath = path.join(repoRoot, "tools", "schemas", "workspace.schema.json");
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

function simulateWorkspaceSchemaExport(activePayload, currentHostContextId, library) {
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
  if (!activeHostContextId) {
    return {
      ok: false,
      status: "No active Workspace V2 session is available to export.",
      filename: "",
      serialized: ""
    };
  }
  const games = [
    {
      id: activeHostContextId,
      level: "workspace-v2-active-session",
      tool: activeToolId,
      tools: [activeToolId],
      session: {
        hostContextId: activeHostContextId,
        payload: activePayload
      }
    }
  ];
  Object.keys(library).forEach((sessionId) => {
    const payload = library[sessionId];
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return;
    }
    const payloadToolId = typeof payload.toolId === "string" && payload.toolId.trim()
      ? payload.toolId.trim()
      : "";
    if (!payloadToolId) {
      return;
    }
    games.push({
      id: sessionId,
      level: "workspace-v2-saved-session",
      tool: payloadToolId,
      tools: [payloadToolId],
      session: {
        hostContextId: sessionId,
        payload
      }
    });
  });
  const container = {
    documentKind: "workspace-manifest",
    schema: "html-js-gaming.workspace-v2-session-export/1",
    version: 1,
    games
  };
  return {
    ok: true,
    status: "Exported current workspace session JSON.",
    filename: `workspace-v2-${activeToolId}-${activeHostContextId}.json`,
    serialized: JSON.stringify(container, null, 2)
  };
}

function computeDiffGuard(leftEntry, rightEntry) {
  if (!leftEntry || !rightEntry) {
    return { canCompute: false, message: "Select two different sessions to enable Compute Diff." };
  }
  if (leftEntry.id === rightEntry.id) {
    return { canCompute: false, message: "Select two different sessions to enable Compute Diff." };
  }
  if (leftEntry.toolId !== rightEntry.toolId) {
    return { canCompute: false, message: "Diff requires sessions from the same tool." };
  }
  return { canCompute: true, message: "Compute Diff is enabled." };
}

export function run() {
  const failures = [];
  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceSchemaExists = fs.existsSync(workspaceSchemaPath);
  const workspaceHtml = workspaceHtmlExists ? fs.readFileSync(workspaceHtmlPath, "utf8") : "";
  const workspaceJs = workspaceJsExists ? fs.readFileSync(workspaceJsPath, "utf8") : "";
  const workspaceSchema = workspaceSchemaExists ? JSON.parse(fs.readFileSync(workspaceSchemaPath, "utf8")) : null;
  const workspaceJsSyntax = checkSyntax(workspaceJsPath);
  const testSyntax = checkSyntax(testPath);

  if (!workspaceHtmlExists) failures.push("Missing tools/workspace-v2/index.html.");
  if (!workspaceJsExists) failures.push("Missing tools/workspace-v2/index.js.");
  if (!workspaceSchemaExists) failures.push("Missing tools/schemas/workspace.schema.json.");
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
    "buildWorkspaceSchemaDocument()",
    "validateWorkspaceSchemaDocument(",
    "tools/schemas/workspace.schema.json",
    "Diff requires sessions from the same tool."
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

  if (workspaceSchema && workspaceSchema.properties) {
    const requiredRootKeys = Array.isArray(workspaceSchema.required) ? workspaceSchema.required : [];
    ["documentKind", "schema", "version", "games"].forEach((key) => {
      if (!requiredRootKeys.includes(key)) {
        failures.push(`workspace.schema.json must require root.${key}.`);
      }
    });
    if (!workspaceSchema.properties.games?.items?.properties?.session) {
      failures.push("workspace.schema.json must allow games[].session for Workspace V2 session export/import.");
    }
  }

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
  const workspaceExport = simulateWorkspaceSchemaExport(activePayload, "palette-manager-v2-1234567890123-abcd1234", library);
  if (!workspaceExport.ok) failures.push("Workspace export should succeed when active payload exists.");
  const workspaceExportParsed = workspaceExport.serialized ? JSON.parse(workspaceExport.serialized) : null;
  if (!workspaceExportParsed || typeof workspaceExportParsed !== "object" || Array.isArray(workspaceExportParsed)) {
    failures.push("Workspace export should be an object matching workspace.schema.json.");
  } else {
    const rootKeys = Object.keys(workspaceExportParsed).sort((left, right) => left.localeCompare(right));
    const expectedRootKeys = ["documentKind", "games", "schema", "version"];
    if (JSON.stringify(rootKeys) !== JSON.stringify(expectedRootKeys)) {
      failures.push(`Workspace export root keys mismatch. Expected ${expectedRootKeys.join(", ")} and received ${rootKeys.join(", ")}.`);
    }
    if (!Array.isArray(workspaceExportParsed.games) || workspaceExportParsed.games.length < 1) {
      failures.push("Workspace export must include games array entries.");
    }
    if (Object.prototype.hasOwnProperty.call(workspaceExportParsed, "workspaceSession")) {
      failures.push("Workspace export must not include workspaceSession wrapper.");
    }
    if (Object.prototype.hasOwnProperty.call(workspaceExportParsed, "workspaceV2Session")) {
      failures.push("Workspace export must not include workspaceV2Session wrapper.");
    }
    if (Object.prototype.hasOwnProperty.call(workspaceExportParsed, "toolSessions")) {
      failures.push("Workspace export must not include toolSessions wrapper.");
    }
    if (Object.prototype.hasOwnProperty.call(workspaceExportParsed, "savedSessions")) {
      failures.push("Workspace export must not include savedSessions wrapper.");
    }
    if (Object.prototype.hasOwnProperty.call(workspaceExportParsed, "exportedAt")) {
      failures.push("Workspace export must not include exportedAt root field.");
    }
    const activeEntry = workspaceExportParsed.games.find((entry) => entry.level === "workspace-v2-active-session");
    if (!activeEntry) {
      failures.push("Workspace export must include one active session entry in games.");
    } else {
      if (activeEntry.tool !== "palette-manager-v2") {
        failures.push("Active session games entry must preserve tool id.");
      }
      if (activeEntry.session?.hostContextId !== "palette-manager-v2-1234567890123-abcd1234") {
        failures.push("Active session games entry must preserve hostContextId.");
      }
      if (JSON.stringify(activeEntry.session?.payload) !== JSON.stringify(activePayload)) {
        failures.push("Active session games entry must preserve payload.");
      }
    }
  }

  const diffCrossTool = computeDiffGuard(
    { id: "history:a", toolId: "palette-manager-v2" },
    { id: "history:b", toolId: "asset-browser-v2" }
  );
  if (diffCrossTool.canCompute) {
    failures.push("Cross-tool diff must be blocked.");
  }
  if (diffCrossTool.message !== "Diff requires sessions from the same tool.") {
    failures.push("Cross-tool diff guard must return the exact required message.");
  }

  const diffSameTool = computeDiffGuard(
    { id: "history:a", toolId: "palette-manager-v2" },
    { id: "history:b", toolId: "palette-manager-v2" }
  );
  if (!diffSameTool.canCompute) {
    failures.push("Same-tool diff must remain enabled.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      workspaceHtmlExists,
      workspaceJsExists,
      workspaceSchemaExists,
      workspaceJsSyntax,
      testSyntax
    },
    scenarios: {
      workspaceExport,
      diffCrossTool,
      diffSameTool
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
