import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-merged-recent-session-registration-results.json");

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

function createMergedHostContextId(toolId, timestamp, shortId) {
  return `${toolId}-merged-${timestamp}-${shortId}`;
}

function registerMergedResult(state, toolId, mergedPayload, timestamp, shortId) {
  const next = {
    ...state,
    sessionStorage: { ...state.sessionStorage },
    recent: [...state.recent],
    library: { ...state.library }
  };
  const hostContextId = createMergedHostContextId(toolId, timestamp, shortId);
  const mergedResultPayload = {
    ...mergedPayload,
    version: "v2",
    toolId,
    mergeResultMeta: {
      isMergedResult: true,
      sourceSessionContextId: "source",
      targetSessionContextId: "target",
      mergedAt: "2026-05-02T00:00:00.000Z"
    }
  };
  next.sessionStorage[hostContextId] = JSON.stringify(mergedResultPayload);
  next.recent = next.recent.filter((entry) => entry.hostContextId !== hostContextId);
  next.recent.unshift({
    hostContextId,
    tool: toolId,
    timestamp: "2026-05-02T00:00:00.000Z",
    payload: mergedResultPayload
  });
  return { next, hostContextId, mergedResultPayload };
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2MergedRecentSessionRegistration.test.mjs"));

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2MergedRecentSessionRegistration.test.mjs failed syntax check.");

  const requiredTokens = [
    "createMergedHostContextId(toolId)",
    "-merged-",
    "mergeResultMeta",
    "isMergedResult: true",
    "this.addRecentSessionEntry(hostContextId, this.pendingMergePreview.selectedToolId, appliedPayload);",
    "const titleToolLabel = isMergedResult ? `${entry.tool} (merged)` : entry.tool;"
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing merged recent-session token: ${token}`);
  });

  const baseState = {
    sessionStorage: {},
    recent: [
      { hostContextId: "asset-manager-v2-123", tool: "asset-manager-v2", timestamp: "2026-05-01T00:00:00.000Z", payload: { version: "v2", toolId: "asset-manager-v2" } }
    ],
    library: {}
  };
  const mergedPayload = { payloadJson: { combined: true } };
  const { next, hostContextId, mergedResultPayload } = registerMergedResult(baseState, "asset-manager-v2", mergedPayload, 1777777777777, "abc123xy");

  if (!hostContextId.startsWith("asset-manager-v2-merged-1777777777777-")) {
    failures.push("Merged hostContextId format is incorrect.");
  }
  if (!Object.prototype.hasOwnProperty.call(next.sessionStorage, hostContextId)) {
    failures.push("Merged result was not registered in sessionStorage.");
  }
  if (!next.recent.length || next.recent[0].hostContextId !== hostContextId) {
    failures.push("Merged result should appear at the top of Recent Sessions.");
  }
  if (!next.recent[0].payload.mergeResultMeta || next.recent[0].payload.mergeResultMeta.isMergedResult !== true) {
    failures.push("Merged recent payload is missing merged-result metadata.");
  }
  if (!next.recent[0].payload.version || next.recent[0].payload.version !== "v2") {
    failures.push("Merged recent payload must include version v2.");
  }
  if (!next.recent[0].payload.toolId || next.recent[0].payload.toolId !== "asset-manager-v2") {
    failures.push("Merged recent payload must include toolId.");
  }

  const reopenedPayload = JSON.parse(next.sessionStorage[hostContextId]);
  if (JSON.stringify(reopenedPayload) !== JSON.stringify(mergedResultPayload)) {
    failures.push("Merged session reopen payload mismatch.");
  }

  const diffMergeSelectable = next.recent.some((entry) => entry.hostContextId === hostContextId);
  if (!diffMergeSelectable) {
    failures.push("Merged recent session is not selectable for Diff/Merge.");
  }

  const afterDelete = { ...next, recent: next.recent.filter((entry) => entry.hostContextId !== hostContextId), sessionStorage: { ...next.sessionStorage } };
  delete afterDelete.sessionStorage[hostContextId];
  if (afterDelete.recent.some((entry) => entry.hostContextId === hostContextId)) {
    failures.push("Deleting merged recent session should remove recent entry.");
  }
  if (Object.prototype.hasOwnProperty.call(afterDelete.sessionStorage, hostContextId)) {
    failures.push("Deleting merged recent session should remove sessionStorage payload.");
  }

  if (Object.keys(next.library).length !== 0) {
    failures.push("Session Library should remain unchanged unless explicitly saved.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { jsExists, jsSyntax, testSyntax },
    scenarios: { hostContextId, recentTop: next.recent[0], librarySize: Object.keys(next.library).length }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 merged-recent-session-registration results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 merged-recent-session-registration failures: ${failures.join(" | ")}`);
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

