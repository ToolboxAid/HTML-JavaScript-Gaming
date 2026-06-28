import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-merge-state-ssot-results.json");

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

function resolveAuthoritativeLastMergedHostContextId(lastMergedHostContextId, history, sessionStorageMap) {
  if (!lastMergedHostContextId) {
    return "";
  }
  const mergedRecentEntry = history.find((entry) => entry.hostContextId === lastMergedHostContextId);
  const existsInRecent = Boolean(mergedRecentEntry);
  const existsInSessionStorage = Object.prototype.hasOwnProperty.call(sessionStorageMap, lastMergedHostContextId);
  const existsAsMergedRecent = Boolean(
    mergedRecentEntry &&
    mergedRecentEntry.payload &&
    typeof mergedRecentEntry.payload === "object" &&
    !Array.isArray(mergedRecentEntry.payload) &&
    mergedRecentEntry.payload.mergeResultMeta &&
    typeof mergedRecentEntry.payload.mergeResultMeta === "object" &&
    mergedRecentEntry.payload.mergeResultMeta.isMergedResult === true
  );
  return existsInRecent && existsInSessionStorage && existsAsMergedRecent ? lastMergedHostContextId : "";
}

function undoEnabled(lastMergedHostContextId, history, sessionStorageMap) {
  return Boolean(resolveAuthoritativeLastMergedHostContextId(lastMergedHostContextId, history, sessionStorageMap));
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2MergeStateSingleSourceOfTruth.test.mjs"));

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2MergeStateSingleSourceOfTruth.test.mjs failed syntax check.");

  const requiredTokens = [
    "resolveAuthoritativeLastMergedHostContextId()",
    "const mergedHostContextId = this.resolveAuthoritativeLastMergedHostContextId();",
    "existsAsMergedRecent",
    "this.writeLastMergedHostContextId(\"\");",
    "console.debug(\"[WorkspaceV2UndoLastMerge] stale_authoritative_merge_record\", {",
    "const lastMergedId = this.resolveAuthoritativeLastMergedHostContextId();"
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing merge-state SSoT token/text: ${token}`);
  });

  const mergedId = "asset-manager-v2-merged-1777777777777-abcd1234";
  const validMergedPayload = {
    version: "v2",
    toolId: "asset-manager-v2",
    mergeResultMeta: { isMergedResult: true }
  };

  const initialHistory = [{ hostContextId: "asset-manager-v2-regular", payload: { version: "v2", toolId: "asset-manager-v2" } }];
  const initialStorage = { "asset-manager-v2-regular": "{\"version\":\"v2\",\"toolId\":\"asset-manager-v2\"}" };
  if (undoEnabled("", initialHistory, initialStorage)) failures.push("Undo must be disabled on initial load.");

  const applyHistory = [
    { hostContextId: mergedId, payload: validMergedPayload },
    ...initialHistory
  ];
  const applyStorage = {
    ...initialStorage,
    [mergedId]: JSON.stringify(validMergedPayload)
  };
  if (!undoEnabled(mergedId, applyHistory, applyStorage)) failures.push("Undo must be enabled immediately after successful merge apply.");

  const undoHistory = initialHistory;
  const undoStorage = initialStorage;
  if (undoEnabled("", undoHistory, undoStorage)) failures.push("Undo must be disabled immediately after undo clears authoritative record.");

  const deletedMergedHistory = initialHistory;
  const deletedMergedStorage = applyStorage;
  if (undoEnabled(mergedId, deletedMergedHistory, deletedMergedStorage)) failures.push("Undo must be disabled if merged recent entry is deleted.");

  const staleStorageHistory = applyHistory;
  const staleStorage = initialStorage;
  if (undoEnabled(mergedId, staleStorageHistory, staleStorage)) failures.push("Undo must be disabled if merged session storage entry is missing.");

  const staleMetaHistory = [
    { hostContextId: mergedId, payload: { version: "v2", toolId: "asset-manager-v2" } },
    ...initialHistory
  ];
  if (undoEnabled(mergedId, staleMetaHistory, applyStorage)) failures.push("Undo must be disabled if authoritative recent entry is not a merged result.");

  const refreshRecompute = resolveAuthoritativeLastMergedHostContextId(mergedId, deletedMergedHistory, deletedMergedStorage);
  if (refreshRecompute !== "") failures.push("Refresh recompute should clear stale authoritative merge record.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { jsExists, jsSyntax, testSyntax },
    scenarios: {
      initialUndoEnabled: undoEnabled("", initialHistory, initialStorage),
      applyUndoEnabled: undoEnabled(mergedId, applyHistory, applyStorage),
      postUndoUndoEnabled: undoEnabled("", undoHistory, undoStorage),
      deletedMergedUndoEnabled: undoEnabled(mergedId, deletedMergedHistory, deletedMergedStorage),
      staleStorageUndoEnabled: undoEnabled(mergedId, staleStorageHistory, staleStorage),
      staleMetaUndoEnabled: undoEnabled(mergedId, staleMetaHistory, applyStorage),
      refreshRecompute
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 merge-state-ssot results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 merge-state-ssot failures: ${failures.join(" | ")}`);
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
