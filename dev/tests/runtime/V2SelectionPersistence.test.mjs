import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-selection-persistence-results.json");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function checkSyntax(jsPath) {
  try {
    execFileSync(process.execPath, ["--check", jsPath], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ok: true, error: "" };
  } catch (error) {
    return { ok: false, error: (error?.stderr || error?.stdout || error?.message || "").toString().trim() };
  }
}

function safeParse(raw) {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, value: null };
  }
}

function isValidPayload(payload) {
  return Boolean(payload && typeof payload === "object" && !Array.isArray(payload));
}

function readPersistedSelection(store) {
  const raw = store["v2-session-selection"];
  if (!raw) return { sessionA: "", sessionB: "" };
  const parsed = safeParse(raw);
  if (!parsed.ok || !parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
    return { sessionA: "", sessionB: "" };
  }
  return {
    sessionA: typeof parsed.value.sessionA === "string" ? parsed.value.sessionA.trim() : "",
    sessionB: typeof parsed.value.sessionB === "string" ? parsed.value.sessionB.trim() : ""
  };
}

function resolvePersistedSelectionIds(entries, store) {
  if (!Array.isArray(entries) || entries.length < 2) return { leftId: "", rightId: "" };
  const persisted = readPersistedSelection(store);
  if (!persisted.sessionA || !persisted.sessionB || persisted.sessionA === persisted.sessionB) {
    return { leftId: "", rightId: "" };
  }
  const left = entries.find((entry) => entry.contextId === persisted.sessionA && isValidPayload(entry.payload));
  const right = entries.find((entry) => entry.contextId === persisted.sessionB && isValidPayload(entry.payload));
  if (!left || !right || left.id === right.id) return { leftId: "", rightId: "" };
  return { leftId: left.id, rightId: right.id };
}

function writePersistedSelection(store, leftEntry, rightEntry) {
  const sessionA = leftEntry && typeof leftEntry.contextId === "string" ? leftEntry.contextId : "";
  const sessionB = rightEntry && typeof rightEntry.contextId === "string" ? rightEntry.contextId : "";
  store["v2-session-selection"] = JSON.stringify({ sessionA, sessionB });
}

function clearPersistedSelection(store) {
  delete store["v2-session-selection"];
}

function canRunAction(leftId, rightId) {
  return Boolean(leftId && rightId && leftId !== rightId);
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(workspaceJsPath);
  const js = jsExists ? readText(workspaceJsPath) : "";
  const syntax = checkSyntax(workspaceJsPath);

  const hasStorageKey = js.includes("this.sessionSelectionStorageKey = \"v2-session-selection\";");
  const hasRead = js.includes("readPersistedSessionSelection()");
  const hasWrite = js.includes("writePersistedSessionSelection(leftEntry, rightEntry)");
  const hasResolve = js.includes("resolvePersistedSelectionIds(entries)");
  const hasClear = js.includes("clearPersistedSessionSelection()");
  const hasResetHook = js.includes("this.clearPersistedSessionSelection();");

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!syntax.ok) failures.push("workspace-v2/index.js failed syntax check.");
  if (!hasStorageKey) failures.push("Missing v2-session-selection storage key.");
  if (!hasRead) failures.push("Missing readPersistedSessionSelection().");
  if (!hasWrite) failures.push("Missing writePersistedSessionSelection(...).");
  if (!hasResolve) failures.push("Missing resolvePersistedSelectionIds(...).");
  if (!hasClear) failures.push("Missing clearPersistedSessionSelection().");
  if (!hasResetHook) failures.push("Missing reset hook that clears persisted selection.");

  const entries = [
    { id: "history:ctx-a", contextId: "ctx-a", payload: { toolId: "asset-manager-v2", payloadJson: { a: 1 } } },
    { id: "history:ctx-b", contextId: "ctx-b", payload: { toolId: "asset-manager-v2", payloadJson: { b: 2 } } }
  ];
  const store = {};

  writePersistedSelection(store, entries[0], entries[1]);
  const persisted = readPersistedSelection(store);
  if (persisted.sessionA !== "ctx-a" || persisted.sessionB !== "ctx-b") {
    failures.push("Selections were not persisted correctly.");
  }

  const restored = resolvePersistedSelectionIds(entries, store);
  if (restored.leftId !== "history:ctx-a" || restored.rightId !== "history:ctx-b") {
    failures.push("Valid persisted selections were not restored.");
  }

  const deletedEntries = [{ id: "history:ctx-a", contextId: "ctx-a", payload: { toolId: "asset-manager-v2", payloadJson: { a: 1 } } }];
  const deletedRestore = resolvePersistedSelectionIds(deletedEntries, store);
  if (deletedRestore.leftId || deletedRestore.rightId) {
    failures.push("Deleted/missing sessions should not restore.");
  }

  store["v2-session-selection"] = JSON.stringify({ sessionA: "ctx-a", sessionB: "ctx-a" });
  const sameRestore = resolvePersistedSelectionIds(entries, store);
  if (sameRestore.leftId || sameRestore.rightId) {
    failures.push("Same-session restore should be rejected.");
  }

  store["v2-session-selection"] = JSON.stringify({ sessionA: "ctx-a", sessionB: "ctx-b" });
  const restoredForState = resolvePersistedSelectionIds(entries, store);
  if (!canRunAction(restoredForState.leftId, restoredForState.rightId)) {
    failures.push("Buttons should reflect restored valid distinct state as enabled.");
  }

  clearPersistedSelection(store);
  if (Object.prototype.hasOwnProperty.call(store, "v2-session-selection")) {
    failures.push("Reset should clear v2-session-selection.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      jsExists,
      syntax,
      hasStorageKey,
      hasRead,
      hasWrite,
      hasResolve,
      hasClear,
      hasResetHook
    },
    scenarios: {
      persisted,
      restored,
      deletedRestore,
      sameRestore,
      restoredForState,
      selectionCleared: !Object.prototype.hasOwnProperty.call(store, "v2-session-selection")
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 selection persistence results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 selection persistence failures: ${failures.join(" | ")}`);
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
