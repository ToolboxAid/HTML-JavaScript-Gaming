import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const toolsRoot = path.join(repoRoot, "www", "toolbox");
const workspaceHtmlPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.html");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-snapshot-results.json");

const TOOLS = [
  "asset-manager-v2",
  "palette-manager-v2",
  "svg-asset-studio-v2",
  "tilemap-studio-v2",
  "vector-map-editor-v2"
];

class MemorySessionStorage {
  constructor() {
    this.values = new Map();
  }

  setItem(key, value) {
    this.values.set(String(key), String(value));
  }

  getItem(key) {
    if (!this.values.has(String(key))) return null;
    return this.values.get(String(key));
  }
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function checkJsSyntax(jsPath) {
  try {
    execFileSync(process.execPath, ["--check", jsPath], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { syntaxValid: true, syntaxError: "" };
  } catch (error) {
    return {
      syntaxValid: false,
      syntaxError: (error?.stderr || error?.stdout || error?.message || "").toString().trim()
    };
  }
}

function buildToolSnapshot(toolId, url, hostContextId, sessionStorageLike) {
  const serializedSession = hostContextId ? sessionStorageLike.getItem(hostContextId) : null;
  let parsedSession = null;
  let sessionError = "";
  if (typeof serializedSession === "string") {
    try {
      parsedSession = JSON.parse(serializedSession);
    } catch (error) {
      sessionError = error instanceof Error ? error.message : "unknown error";
    }
  }
  return {
    tool: toolId,
    url,
    hostContextId,
    session: parsedSession,
    sessionError
  };
}

function buildWorkspaceSnapshot(url, sessionStorageLike) {
  const params = new URL(url).searchParams;
  const hostContextId = typeof params.get("hostContextId") === "string" ? params.get("hostContextId").trim() : "";
  let parsedSession = null;
  if (hostContextId) {
    const raw = sessionStorageLike.getItem(hostContextId);
    if (typeof raw === "string") {
      try {
        parsedSession = JSON.parse(raw);
      } catch {
        parsedSession = null;
      }
    }
  }
  return {
    tool: "workspace-v2",
    url,
    hostContextId,
    session: parsedSession
  };
}

function validateToolHook(toolId) {
  const jsPath = path.join(toolsRoot, toolId, "index.js");
  const jsExists = fs.existsSync(jsPath);
  const jsText = jsExists ? readText(jsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(jsPath);
  const failures = [];

  const hasBuildSnapshot = jsText.includes("buildRuntimeSnapshot()");
  const hasRegisterHook = jsText.includes("registerSnapshotHook()");
  const hasWindowHook = jsText.includes("window.__v2RuntimeSnapshot = () => this.buildRuntimeSnapshot();");
  const hasToolField = jsText.includes(`tool: "${toolId}"`);
  const hasUrlField = jsText.includes("url: window.location.href");
  const hasHostContextIdField = jsText.includes("hostContextId: this.urlState.hostContextId");
  const hasSessionField = jsText.includes("session: parsedSession");

  if (!jsExists) failures.push("Missing tool index.js.");
  if (!syntaxValid) failures.push("Tool index.js failed syntax check.");
  if (!hasBuildSnapshot) failures.push("Missing buildRuntimeSnapshot() hook.");
  if (!hasRegisterHook) failures.push("Missing registerSnapshotHook() hook.");
  if (!hasWindowHook) failures.push("Missing window.__v2RuntimeSnapshot registration.");
  if (!hasToolField) failures.push("Snapshot is missing tool field.");
  if (!hasUrlField) failures.push("Snapshot is missing url field.");
  if (!hasHostContextIdField) failures.push("Snapshot is missing hostContextId field.");
  if (!hasSessionField) failures.push("Snapshot is missing session field.");

  return {
    tool: toolId,
    jsPath: path.relative(repoRoot, jsPath).replace(/\\/g, "/"),
    jsExists,
    syntaxValid,
    syntaxError,
    hasBuildSnapshot,
    hasRegisterHook,
    hasWindowHook,
    hasToolField,
    hasUrlField,
    hasHostContextIdField,
    hasSessionField,
    failures
  };
}

export function run() {
  const failures = [];
  const sessionStorageLike = new MemorySessionStorage();
  const sampleHostContextId = "snapshot-host-1";
  const sampleSession = {
    version: "v2",
    toolId: "tilemap-studio-v2",
    payloadJson: {
      tileMapDocument: {
        map: { name: "Snapshot Fixture", width: 2, height: 2 },
        layers: [{ name: "Ground", kind: "tiles", data: [[1, 1], [1, 1]] }]
      }
    }
  };
  sessionStorageLike.setItem(sampleHostContextId, JSON.stringify(sampleSession));

  const toolUrl = `https://example.test/toolbox/tilemap-studio-v2/index.html?hostContextId=${encodeURIComponent(sampleHostContextId)}&view=debug`;
  const toolSnapshot = buildToolSnapshot("tilemap-studio-v2", toolUrl, sampleHostContextId, sessionStorageLike);
  const workspaceUrl = `https://example.test/toolbox/workspace-v2/index.html?hostContextId=${encodeURIComponent(sampleHostContextId)}`;
  const workspaceSnapshot = buildWorkspaceSnapshot(workspaceUrl, sessionStorageLike);

  if (toolSnapshot.tool !== "tilemap-studio-v2") failures.push("Tool snapshot missing correct tool id.");
  if (!toolSnapshot.url.includes("hostContextId=")) failures.push("Tool snapshot missing full URL.");
  if (toolSnapshot.hostContextId !== sampleHostContextId) failures.push("Tool snapshot hostContextId mismatch.");
  if (JSON.stringify(toolSnapshot.session) !== JSON.stringify(sampleSession)) failures.push("Tool snapshot session payload mismatch.");
  if (workspaceSnapshot.tool !== "workspace-v2") failures.push("Workspace snapshot missing workspace-v2 tool id.");
  if (workspaceSnapshot.hostContextId !== sampleHostContextId) failures.push("Workspace snapshot hostContextId mismatch.");
  if (JSON.stringify(workspaceSnapshot.session) !== JSON.stringify(sampleSession)) failures.push("Workspace snapshot session payload mismatch.");

  const malformedHostContextId = "snapshot-host-malformed";
  sessionStorageLike.setItem(malformedHostContextId, "{bad-json");
  const malformedSnapshot = buildToolSnapshot("asset-manager-v2", `https://example.test/toolbox/asset-manager-v2/index.html?hostContextId=${malformedHostContextId}`, malformedHostContextId, sessionStorageLike);
  if (!malformedSnapshot.sessionError) failures.push("Malformed snapshot should include sessionError.");

  const toolRows = TOOLS.map(validateToolHook);
  toolRows.forEach((row) => {
    row.failures.forEach((entry) => failures.push(`${row.tool}: ${entry}`));
  });

  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceHtmlText = workspaceHtmlExists ? readText(workspaceHtmlPath) : "";
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const workspaceSyntax = checkJsSyntax(workspaceJsPath);
  const workspaceHasButton = workspaceHtmlText.includes("workspaceV2ExportSnapshotButton");
  const workspaceHasOutput = workspaceHtmlText.includes("workspaceV2SnapshotOutput");
  const workspaceHasBuild = workspaceJsText.includes("buildRuntimeSnapshot()");
  const workspaceHasExport = workspaceJsText.includes("exportRuntimeSnapshot()");
  const workspaceHasWindowHook = workspaceJsText.includes("window.__v2RuntimeSnapshot = () => this.buildRuntimeSnapshot();");

  if (!workspaceHtmlExists) failures.push("Missing workspace-v2/index.html.");
  if (!workspaceJsExists) failures.push("Missing workspace-v2/index.js.");
  if (!workspaceSyntax.syntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  if (!workspaceHasButton) failures.push("Workspace missing Export Runtime Snapshot button.");
  if (!workspaceHasOutput) failures.push("Workspace missing snapshot output region.");
  if (!workspaceHasBuild) failures.push("Workspace missing buildRuntimeSnapshot().");
  if (!workspaceHasExport) failures.push("Workspace missing exportRuntimeSnapshot().");
  if (!workspaceHasWindowHook) failures.push("Workspace missing snapshot hook registration.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    snapshots: {
      toolSnapshot,
      workspaceSnapshot,
      malformedSnapshot
    },
    toolRows,
    workspaceChecks: {
      workspaceHtmlExists,
      workspaceJsExists,
      syntaxValid: workspaceSyntax.syntaxValid,
      syntaxError: workspaceSyntax.syntaxError,
      workspaceHasButton,
      workspaceHasOutput,
      workspaceHasBuild,
      workspaceHasExport,
      workspaceHasWindowHook
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 snapshot results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 snapshot failures: ${failures.join(" | ")}`);
  return { failures, toolSnapshot, workspaceSnapshot };
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
