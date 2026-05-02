import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
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

function simulateExport(activePayload, selectedToolId, currentHostContextId) {
  if (!activePayload || typeof activePayload !== "object" || Array.isArray(activePayload)) {
    return {
      ok: false,
      status: "No active Workspace V2 session is available to export.",
      filename: "",
      serialized: ""
    };
  }
  const payloadToolId = typeof activePayload.toolId === "string" ? activePayload.toolId.trim() : "";
  const filenameToolId = payloadToolId || selectedToolId || "workspace-v2";
  const filenameSessionId = typeof currentHostContextId === "string" && currentHostContextId.trim()
    ? currentHostContextId.trim()
    : "session";
  return {
    ok: true,
    status: "Exported current workspace session JSON.",
    filename: `${filenameToolId}-${filenameSessionId}.json`,
    serialized: JSON.stringify(activePayload, null, 2)
  };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceJs = workspaceJsExists ? fs.readFileSync(workspaceJsPath, "utf8") : "";
  const workspaceJsSyntax = checkSyntax(workspaceJsPath);
  const testSyntax = checkSyntax(testPath);

  if (!workspaceJsExists) failures.push("Missing tools/workspace-v2/index.js.");
  if (!workspaceJsSyntax.ok) failures.push("tools/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2CurrentSessionExport.test.mjs failed syntax check.");

  const requiredTokens = [
    "readActiveSessionPayloadForLibraryActions()",
    "No active Workspace V2 session is available to export.",
    "Exported current workspace session JSON.",
    "URL.createObjectURL",
    "downloadLink.download"
  ];
  requiredTokens.forEach((token) => {
    if (!workspaceJs.includes(token)) {
      failures.push(`Missing export token: ${token}`);
    }
  });
  if (workspaceJs.includes("No current session payload to export. Load fixture or import JSON first.")) {
    failures.push("Legacy export-empty message is still present.");
  }

  const activePayload = {
    version: "v2",
    toolId: "palette-manager-v2",
    payloadJson: { swatches: ["#000000", "#ffffff"] }
  };
  const activeResult = simulateExport(activePayload, "asset-browser-v2", "palette-manager-v2-1234567890123-abcd1234");
  if (!activeResult.ok) failures.push("Active session export should be allowed.");
  if (activeResult.status !== "Exported current workspace session JSON.") {
    failures.push("Active session export status mismatch.");
  }
  if (activeResult.filename !== "palette-manager-v2-palette-manager-v2-1234567890123-abcd1234.json") {
    failures.push("Export filename should include tool/session identity.");
  }
  const parsedActive = activeResult.serialized ? JSON.parse(activeResult.serialized) : null;
  if (JSON.stringify(parsedActive) !== JSON.stringify(activePayload)) {
    failures.push("Exported JSON does not preserve active session payload exactly.");
  }

  const noActiveResult = simulateExport(null, "asset-browser-v2", "");
  if (noActiveResult.ok) failures.push("Export should be blocked when no active session exists.");
  if (noActiveResult.status !== "No active Workspace V2 session is available to export.") {
    failures.push("No-active export status mismatch.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      workspaceJsExists,
      workspaceJsSyntax,
      testSyntax
    },
    scenarios: {
      activeResult,
      noActiveResult
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
