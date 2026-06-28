import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-undo-enable-state-actual-availability-results.json");

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

function computeUndoAvailability(lastMergedHostContextId, recent, sessionStorageMap) {
  const mergedHostContextId = typeof lastMergedHostContextId === "string" ? lastMergedHostContextId.trim() : "";
  if (!mergedHostContextId) {
    return { enabled: false, cleared: true, reason: "missing-lastMergedHostContextId", nextLastMergedHostContextId: "" };
  }
  const existsInRecent = recent.some((entry) => entry.hostContextId === mergedHostContextId);
  const existsInSessionStorage = Object.prototype.hasOwnProperty.call(sessionStorageMap, mergedHostContextId);
  const enabled = Boolean(mergedHostContextId && existsInRecent && existsInSessionStorage);
  if (!enabled) {
    return {
      enabled: false,
      cleared: true,
      reason: "stale-lastMergedHostContextId",
      nextLastMergedHostContextId: "",
      diagnostics: { existsInRecent, existsInSessionStorage }
    };
  }
  return { enabled: true, cleared: false, reason: "available", nextLastMergedHostContextId: mergedHostContextId };
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2UndoEnableStateActualAvailability.test.mjs"));

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2UndoEnableStateActualAvailability.test.mjs failed syntax check.");

  const requiredTokens = [
    "const existsInRecent = history.some((entry) => entry.hostContextId === mergedHostContextId);",
    "const existsInSessionStorage = typeof sessionStorage.getItem(mergedHostContextId) === \"string\";",
    "console.debug(\"[WorkspaceV2UndoLastMerge] stale_last_merged_context\", {",
    "this.writeLastMergedHostContextId(\"\");",
    "this.undoLastMergeButton.disabled = !hasRecentMerged;"
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing undo-availability token/text: ${token}`);
  });

  const mergedId = "asset-manager-v2-merged-1777777777777-abcd1234";
  const recent = [{ hostContextId: mergedId }, { hostContextId: "asset-manager-v2-regular" }];
  const storageMap = {
    [mergedId]: "{\"version\":\"v2\",\"toolId\":\"asset-manager-v2\"}",
    "asset-manager-v2-regular": "{\"version\":\"v2\",\"toolId\":\"asset-manager-v2\"}"
  };

  const initialLoad = computeUndoAvailability("", recent, storageMap);
  if (initialLoad.enabled) failures.push("Undo must be disabled on initial load with no last merge.");

  const afterApply = computeUndoAvailability(mergedId, recent, storageMap);
  if (!afterApply.enabled) failures.push("Undo must be enabled immediately after apply when recent+storage are present.");

  const afterUndo = computeUndoAvailability("", recent.filter((entry) => entry.hostContextId !== mergedId), {
    "asset-manager-v2-regular": "{\"version\":\"v2\",\"toolId\":\"asset-manager-v2\"}"
  });
  if (afterUndo.enabled) failures.push("Undo must be disabled immediately after undo clears last merge.");

  const manualDelete = computeUndoAvailability(mergedId, recent.filter((entry) => entry.hostContextId !== mergedId), storageMap);
  if (manualDelete.enabled) failures.push("Undo must be disabled if merged recent session is deleted.");
  if (manualDelete.nextLastMergedHostContextId !== "") failures.push("Stale last merged id should be cleared when recent entry is missing.");

  const staleStorage = computeUndoAvailability(mergedId, recent, {
    "asset-manager-v2-regular": "{\"version\":\"v2\",\"toolId\":\"asset-manager-v2\"}"
  });
  if (staleStorage.enabled) failures.push("Undo must be disabled if merged session payload is missing from sessionStorage.");
  if (staleStorage.nextLastMergedHostContextId !== "") failures.push("Stale last merged id should be cleared when storage entry is missing.");

  const refreshRecompute = computeUndoAvailability(staleStorage.nextLastMergedHostContextId, recent, storageMap);
  if (refreshRecompute.enabled) failures.push("Undo must remain disabled on refresh after stale id clear.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { jsExists, jsSyntax, testSyntax },
    scenarios: { initialLoad, afterApply, afterUndo, manualDelete, staleStorage, refreshRecompute }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 undo-enable-state-actual-availability results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 undo-enable-state-actual-availability failures: ${failures.join(" | ")}`);
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
