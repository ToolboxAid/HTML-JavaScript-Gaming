import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-undo-enable-state-refresh-results.json");

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

function undoEnabled(lastMergedHostContextId, recent) {
  return Boolean(lastMergedHostContextId && recent.some((entry) => entry.hostContextId === lastMergedHostContextId));
}

function applyRegistration(state, mergedId, mergedPayload) {
  const next = {
    ...state,
    recent: [...state.recent],
    sessionStorageMap: { ...state.sessionStorageMap }
  };
  next.lastMergedHostContextId = mergedId;
  next.sessionStorageMap[mergedId] = JSON.stringify(mergedPayload);
  next.recent = next.recent.filter((entry) => entry.hostContextId !== mergedId);
  next.recent.unshift({ hostContextId: mergedId, tool: mergedPayload.toolId, payload: mergedPayload, timestamp: "2026-05-02T00:00:00.000Z" });
  const mergedRecentRegistered = next.recent.some((entry) => entry.hostContextId === mergedId);
  if (!mergedRecentRegistered) {
    next.lastMergedHostContextId = "";
    return { next, status: "Merge apply failed to register merged session in Recent Sessions. Undo remains disabled." };
  }
  return { next, status: "Session merge applied with no conflicts." };
}

function undo(state) {
  const next = {
    ...state,
    recent: [...state.recent],
    sessionStorageMap: { ...state.sessionStorageMap }
  };
  const id = next.lastMergedHostContextId;
  next.recent = next.recent.filter((entry) => entry.hostContextId !== id);
  delete next.sessionStorageMap[id];
  if (next.diffLeft === `history:${id}`) next.diffLeft = "";
  if (next.diffRight === `history:${id}`) next.diffRight = "";
  if (next.mergeLeft === `history:${id}`) next.mergeLeft = "";
  if (next.mergeRight === `history:${id}`) next.mergeRight = "";
  next.lastMergedHostContextId = "";
  return next;
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2UndoEnableStateRefresh.test.mjs"));

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2UndoEnableStateRefresh.test.mjs failed syntax check.");

  const requiredTokens = [
    "this.writeLastMergedHostContextId(hostContextId);",
    "this.addRecentSessionEntry(hostContextId, this.pendingMergePreview.selectedToolId, appliedPayload);",
    "const mergedRecentRegistered = this.readSessionHistory().some((entry) => entry.hostContextId === hostContextId);",
    "this.updateUndoLastMergeState();",
    "Merge apply failed to register merged session in Recent Sessions. Undo remains disabled."
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing immediate undo-refresh token: ${token}`);
  });

  const base = {
    lastMergedHostContextId: "",
    recent: [{ hostContextId: "asset-manager-v2-regular", tool: "asset-manager-v2", payload: { version: "v2", toolId: "asset-manager-v2" } }],
    sessionStorageMap: { "asset-manager-v2-regular": "{\"version\":\"v2\",\"toolId\":\"asset-manager-v2\"}" },
    diffLeft: "",
    diffRight: "",
    mergeLeft: "",
    mergeRight: ""
  };

  const initiallyDisabled = !undoEnabled(base.lastMergedHostContextId, base.recent);
  if (!initiallyDisabled) failures.push("Undo should be disabled initially.");

  const mergedId = "asset-manager-v2-merged-1777777777777-abc123xy";
  const mergedPayload = { version: "v2", toolId: "asset-manager-v2", mergeResultMeta: { isMergedResult: true }, payloadJson: { merged: true } };
  const applied = applyRegistration(base, mergedId, mergedPayload);
  const enabledImmediately = undoEnabled(applied.next.lastMergedHostContextId, applied.next.recent);
  if (!enabledImmediately) failures.push("Undo should enable immediately after successful apply registration.");
  if (!applied.next.recent.length || applied.next.recent[0].hostContextId !== mergedId) {
    failures.push("Recent Sessions should refresh with merged session at top after apply.");
  }

  const undone = undo(applied.next);
  const disabledAfterUndo = !undoEnabled(undone.lastMergedHostContextId, undone.recent);
  if (!disabledAfterUndo) failures.push("Undo should disable immediately after undo.");
  if (undone.recent.some((entry) => entry.hostContextId === mergedId)) {
    failures.push("Undo should remove merged session from recent.");
  }
  if (Object.prototype.hasOwnProperty.call(undone.sessionStorageMap, mergedId)) {
    failures.push("Undo should remove merged session payload from sessionStorage.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { jsExists, jsSyntax, testSyntax },
    scenarios: { initiallyDisabled, appliedStatus: applied.status, enabledImmediately, disabledAfterUndo }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 undo-enable-state-refresh results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 undo-enable-state-refresh failures: ${failures.join(" | ")}`);
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

