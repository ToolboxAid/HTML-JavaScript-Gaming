import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-save-library-from-recent-session-results.json");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

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

function isValidPayload(payload) {
  return Boolean(payload && typeof payload === "object" && !Array.isArray(payload));
}

function resolvePayloadFromRecentSessionId(sessionId, history, storage, activePayload) {
  const id = typeof sessionId === "string" ? sessionId.trim() : "";
  if (id) {
    const recent = history.find((entry) => entry.hostContextId === id);
    if (recent) {
      const raw = storage[id];
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          if (isValidPayload(parsed)) {
            return parsed;
          }
        } catch {
          return null;
        }
      }
      if (isValidPayload(recent.payload)) {
        return recent.payload;
      }
      return null;
    }
  }
  if (isValidPayload(activePayload)) {
    return activePayload;
  }
  return null;
}

function simulateSave(overwrite, inputId, library, history, storage, activePayload) {
  const sessionId = typeof inputId === "string" ? inputId.trim() : "";
  const nextLibrary = { ...library };
  if (!sessionId) {
    return { message: overwrite ? "Enter a session ID before overwriting." : "Enter a session ID before saving.", library: nextLibrary };
  }
  const payload = resolvePayloadFromRecentSessionId(sessionId, history, storage, activePayload);
  if (!isValidPayload(payload)) {
    return { message: "Session ID does not resolve to a valid Workspace V2 session.", library: nextLibrary };
  }
  const exists = Object.prototype.hasOwnProperty.call(nextLibrary, sessionId);
  if (!overwrite && exists) {
    return { message: "Saved session already exists. Use Overwrite Session.", library: nextLibrary };
  }
  if (overwrite && !exists) {
    return { message: "Saved session not found. Use Save Session to create it first.", library: nextLibrary };
  }
  nextLibrary[sessionId] = payload;
  return { message: overwrite ? "Saved session overwritten." : "Saved session created.", library: nextLibrary };
}

function simulateLoad(inputId, library) {
  const sessionId = typeof inputId === "string" ? inputId.trim() : "";
  if (!sessionId) {
    return { message: "Enter a saved session ID before loading.", loaded: false };
  }
  if (!Object.prototype.hasOwnProperty.call(library, sessionId)) {
    return { message: "Saved session not found.", loaded: false };
  }
  return { message: "Saved session loaded.", loaded: true, payload: library[sessionId] };
}

function simulateDelete(inputId, library, history, storage) {
  const sessionId = typeof inputId === "string" ? inputId.trim() : "";
  const nextLibrary = { ...library };
  const nextHistory = [...history];
  const nextStorage = { ...storage };
  if (!sessionId) {
    return { message: "Enter a saved session ID before deleting.", library: nextLibrary, history: nextHistory, storage: nextStorage };
  }
  const recentMatch = nextHistory.some((entry) => entry.hostContextId === sessionId);
  if (Object.keys(nextLibrary).length === 0) {
    return {
      message: recentMatch
        ? "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions."
        : "No saved sessions exist. Use Delete on Recent Sessions to remove temporary sessions.",
      library: nextLibrary,
      history: nextHistory,
      storage: nextStorage
    };
  }
  if (!Object.prototype.hasOwnProperty.call(nextLibrary, sessionId)) {
    return {
      message: recentMatch
        ? "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions."
        : "Saved session not found.",
      library: nextLibrary,
      history: nextHistory,
      storage: nextStorage
    };
  }
  delete nextLibrary[sessionId];
  return { message: "Saved session deleted.", library: nextLibrary, history: nextHistory, storage: nextStorage };
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? readText(jsPath) : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2SaveLibraryFromRecentSession.test.mjs"));

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2SaveLibraryFromRecentSession.test.mjs failed syntax check.");

  const mustContain = [
    "readSessionPayloadFromRecentSessionId(sessionId)",
    "readSessionPayloadForLibraryWrite(sessionId)",
    "Session ID does not resolve to a valid Workspace V2 session.",
    "Enter a session ID before saving.",
    "Enter a session ID before overwriting.",
    "Enter a saved session ID before loading.",
    "Enter a saved session ID before deleting.",
    "Saved session already exists. Use Overwrite Session.",
    "Saved session overwritten.",
    "Saved session loaded.",
    "Saved session deleted."
  ];
  mustContain.forEach((token) => {
    if (!js.includes(token)) {
      failures.push(`Missing required implementation token/message: ${token}`);
    }
  });

  const history = [
    {
      hostContextId: "asset-manager-v2-1777676088718-3eff5h3y",
      tool: "asset-manager-v2",
      timestamp: "2026-05-01T01:00:00.000Z",
      payload: { version: "v2", toolId: "asset-manager-v2", payloadJson: { source: "history-fallback" } }
    }
  ];
  const storage = {
    "asset-manager-v2-1777676088718-3eff5h3y": JSON.stringify({ version: "v2", toolId: "asset-manager-v2", payloadJson: { source: "storage" } })
  };
  const activePayload = null;
  const initialRecentSnapshot = JSON.stringify(history);
  const initialStorageSnapshot = JSON.stringify(storage);

  const saveEmpty = simulateSave(false, "", {}, history, storage, activePayload);
  const overwriteEmpty = simulateSave(true, "", {}, history, storage, activePayload);
  const loadEmpty = simulateLoad("", {});
  const deleteEmpty = simulateDelete("", {}, history, storage);
  if (saveEmpty.message !== "Enter a session ID before saving.") failures.push("Save empty input message mismatch.");
  if (overwriteEmpty.message !== "Enter a session ID before overwriting.") failures.push("Overwrite empty input message mismatch.");
  if (loadEmpty.message !== "Enter a saved session ID before loading.") failures.push("Load empty input message mismatch.");
  if (deleteEmpty.message !== "Enter a saved session ID before deleting.") failures.push("Delete empty input message mismatch.");

  const saveRecent = simulateSave(false, "asset-manager-v2-1777676088718-3eff5h3y", {}, history, storage, activePayload);
  if (saveRecent.message !== "Saved session created.") failures.push("Save should create from valid recent-session id.");
  if (!Object.prototype.hasOwnProperty.call(saveRecent.library, "asset-manager-v2-1777676088718-3eff5h3y")) {
    failures.push("Save from recent-session id did not create library entry.");
  }

  const duplicateSave = simulateSave(false, "asset-manager-v2-1777676088718-3eff5h3y", saveRecent.library, history, storage, activePayload);
  if (duplicateSave.message !== "Saved session already exists. Use Overwrite Session.") {
    failures.push("Duplicate save should be blocked with overwrite guidance.");
  }

  const overwriteExisting = simulateSave(true, "asset-manager-v2-1777676088718-3eff5h3y", saveRecent.library, history, storage, activePayload);
  if (overwriteExisting.message !== "Saved session overwritten.") {
    failures.push("Overwrite should succeed for existing saved recent-session id.");
  }

  const overwriteMissing = simulateSave(true, "palette-manager-v2-unknown", saveRecent.library, history, storage, activePayload);
  if (overwriteMissing.message !== "Session ID does not resolve to a valid Workspace V2 session.") {
    failures.push("Overwrite unknown id should show does-not-resolve message.");
  }

  const overwriteMissingSavedButResolvable = simulateSave(
    true,
    "asset-manager-v2-1777676088718-3eff5h3y",
    {},
    history,
    storage,
    activePayload
  );
  if (overwriteMissingSavedButResolvable.message !== "Saved session not found. Use Save Session to create it first.") {
    failures.push("Overwrite missing saved entry for resolvable id should show save guidance.");
  }

  const saveUnknown = simulateSave(false, "unknown-id", {}, history, storage, activePayload);
  if (saveUnknown.message !== "Session ID does not resolve to a valid Workspace V2 session.") {
    failures.push("Save unknown id should show does-not-resolve message.");
  }

  const loadMissing = simulateLoad("missing-id", saveRecent.library);
  if (loadMissing.message !== "Saved session not found.") {
    failures.push("Load should remain library-only and block missing entry.");
  }
  const loadExisting = simulateLoad("asset-manager-v2-1777676088718-3eff5h3y", saveRecent.library);
  if (loadExisting.message !== "Saved session loaded." || !loadExisting.loaded) {
    failures.push("Load existing saved entry should succeed.");
  }

  const deleteRecentOnly = simulateDelete("asset-manager-v2-1777676088718-3eff5h3y", {}, history, storage);
  if (deleteRecentOnly.message !== "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions.") {
    failures.push("Delete Saved Session recent-only guidance message mismatch.");
  }
  const deleteSaved = simulateDelete("asset-manager-v2-1777676088718-3eff5h3y", saveRecent.library, history, storage);
  if (deleteSaved.message !== "Saved session deleted.") {
    failures.push("Delete saved entry should succeed.");
  }

  if (JSON.stringify(history) !== initialRecentSnapshot) {
    failures.push("Save/Overwrite/Load/Delete Saved Session must not remove recent sessions.");
  }
  if (JSON.stringify(storage) !== initialStorageSnapshot) {
    failures.push("Save/Overwrite/Load/Delete Saved Session must not remove sessionStorage payloads.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      jsExists,
      jsSyntax,
      testSyntax
    },
    scenarios: {
      saveEmpty,
      overwriteEmpty,
      loadEmpty,
      deleteEmpty,
      saveRecent,
      duplicateSave,
      overwriteExisting,
      overwriteMissing,
      overwriteMissingSavedButResolvable,
      saveUnknown,
      loadMissing,
      loadExisting,
      deleteRecentOnly,
      deleteSaved
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 save-library-from-recent-session results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 save-library-from-recent-session failures: ${failures.join(" | ")}`);
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
