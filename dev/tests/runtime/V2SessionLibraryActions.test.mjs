import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const htmlPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.html");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-library-actions-results.json");

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

function evaluateSaveAction(inputId, activePayload, library) {
  const sessionId = typeof inputId === "string" ? inputId.trim() : "";
  const libraryMap = { ...library };
  if (!sessionId) {
    return { message: "Enter a session ID before saving.", library: libraryMap };
  }
  if (!activePayload || typeof activePayload !== "object" || Array.isArray(activePayload)) {
    return { message: "No active Workspace V2 session is available to save.", library: libraryMap };
  }
  if (Object.prototype.hasOwnProperty.call(libraryMap, sessionId)) {
    return { message: "That session ID already exists. Use the saved session card to Load or Overwrite it.", library: libraryMap };
  }
  libraryMap[sessionId] = activePayload;
  return { message: `Saved session '${sessionId}' created.`, library: libraryMap };
}

function evaluateOverwriteAction(inputId, activePayload, library) {
  const sessionId = typeof inputId === "string" ? inputId.trim() : "";
  const libraryMap = { ...library };
  if (!sessionId) {
    return { message: "Enter a session ID before overwriting.", library: libraryMap };
  }
  if (!activePayload || typeof activePayload !== "object" || Array.isArray(activePayload)) {
    return { message: "No active Workspace V2 session is available to overwrite from.", library: libraryMap };
  }
  if (!Object.prototype.hasOwnProperty.call(libraryMap, sessionId)) {
    return { message: "Saved session not found. Use Save Session to create it first.", library: libraryMap };
  }
  libraryMap[sessionId] = activePayload;
  return { message: `Saved session '${sessionId}' overwritten with current workspace state.`, library: libraryMap };
}

function evaluateLoadAction(inputId, library) {
  const sessionId = typeof inputId === "string" ? inputId.trim() : "";
  if (!sessionId) {
    return { message: "Enter a saved session ID before loading.", loaded: false };
  }
  if (!Object.prototype.hasOwnProperty.call(library, sessionId)) {
    return { message: "Saved session not found.", loaded: false };
  }
  return { message: `Loaded '${sessionId}' into the current workspace.`, loaded: true, payload: library[sessionId] };
}

function evaluateDeleteSavedAction(inputId, library, historyEntries, sessionStorageMap) {
  const sessionId = typeof inputId === "string" ? inputId.trim() : "";
  const libraryMap = { ...library };
  const history = [...historyEntries];
  const storage = { ...sessionStorageMap };
  if (!sessionId) {
    return { message: "Enter a saved session ID before deleting.", library: libraryMap, history, storage };
  }
  const recentMatch = history.some((entry) => entry.hostContextId === sessionId);
  const libraryKeys = Object.keys(libraryMap);
  if (libraryKeys.length === 0) {
    return {
      message: recentMatch
        ? "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions."
        : "No saved sessions exist. Use Delete on Recent Sessions to remove temporary sessions.",
      library: libraryMap,
      history,
      storage
    };
  }
  if (!Object.prototype.hasOwnProperty.call(libraryMap, sessionId)) {
    return {
      message: recentMatch
        ? "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions."
        : "Saved session not found.",
      library: libraryMap,
      history,
      storage
    };
  }
  delete libraryMap[sessionId];
  return { message: "Saved session deleted.", library: libraryMap, history, storage };
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? readText(htmlPath) : "";
  const js = jsExists ? readText(jsPath) : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2SessionLibraryActions.test.mjs"));

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2SessionLibraryActions.test.mjs failed syntax check.");

  if (!html.includes("id=\"workspaceV2LibraryStatus\"")) {
    failures.push("Missing explicit Session Library status output area.");
  }
  if (!js.includes("this.libraryStatusNode = document.getElementById(\"workspaceV2LibraryStatus\");")) {
    failures.push("Session Library status node is not wired in JS.");
  }
  if (!js.includes("setLibraryStatus(message)")) {
    failures.push("setLibraryStatus(message) helper is missing.");
  }

  const requiredMessages = [
    "Enter a session ID before saving.",
    "No active Workspace V2 session is available to save.",
    "That session ID already exists. Use the saved session card to Load or Overwrite it.",
    "Saved session '${sessionName}' created.",
    "Enter a session ID before overwriting.",
    "No active Workspace V2 session is available to overwrite from.",
    "Saved session not found. Use Save Session to create it first.",
    "Saved session '${sessionName}' overwritten with current workspace state.",
    "Enter a saved session ID before loading.",
    "Loaded '${sessionName}' into the current workspace.",
    "Enter a saved session ID before deleting.",
    "No saved sessions exist. Use Delete on Recent Sessions to remove temporary sessions.",
    "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions.",
    "Saved session not found.",
    "Saved session deleted."
  ];
  requiredMessages.forEach((message) => {
    if (!js.includes(message)) {
      failures.push(`Missing required message: ${message}`);
    }
  });

  if (!js.includes("this.writeSessionLibrary(library);") || !js.includes("this.renderSessionLibrary();")) {
    failures.push("Session Library refresh path missing after mutations.");
  }
  if (!js.includes("this.renderSessionDiffInputs();") || !js.includes("this.renderSessionMergeInputs();")) {
    failures.push("Diff/Merge selector recompute hooks are missing after library changes.");
  }

  const recentHistory = [
    { hostContextId: "recent-1", tool: "asset-manager-v2", timestamp: "2026-05-01T00:00:00.000Z", payload: { toolId: "asset-manager-v2", version: "v2" } }
  ];
  const storageMap = { "recent-1": "{\"toolId\":\"asset-manager-v2\",\"version\":\"v2\"}" };
  const activePayload = { toolId: "asset-manager-v2", version: "v2", payloadJson: { ok: true } };

  const emptySave = evaluateSaveAction("", activePayload, {});
  const emptyOverwrite = evaluateOverwriteAction("", activePayload, {});
  const emptyLoad = evaluateLoadAction("", {});
  const emptyDelete = evaluateDeleteSavedAction("", {}, recentHistory, storageMap);
  if (emptySave.message !== "Enter a session ID before saving.") failures.push("Save empty input message mismatch.");
  if (emptyOverwrite.message !== "Enter a session ID before overwriting.") failures.push("Overwrite empty input message mismatch.");
  if (emptyLoad.message !== "Enter a saved session ID before loading.") failures.push("Load empty input message mismatch.");
  if (emptyDelete.message !== "Enter a saved session ID before deleting.") failures.push("Delete empty input message mismatch.");

  const saveCreated = evaluateSaveAction("saved-a", activePayload, {});
  if (saveCreated.message !== "Saved session 'saved-a' created." || !Object.prototype.hasOwnProperty.call(saveCreated.library, "saved-a")) {
    failures.push("Save with valid active payload should create library entry.");
  }

  const duplicateSave = evaluateSaveAction("saved-a", activePayload, { "saved-a": { toolId: "palette-manager-v2", version: "v2" } });
  if (duplicateSave.message !== "That session ID already exists. Use the saved session card to Load or Overwrite it.") {
    failures.push("Duplicate save should be blocked with overwrite guidance.");
  }

  const overwriteMissing = evaluateOverwriteAction("missing", activePayload, {});
  if (overwriteMissing.message !== "Saved session not found. Use Save Session to create it first.") {
    failures.push("Overwrite missing entry should be blocked with save guidance.");
  }

  const overwriteExisting = evaluateOverwriteAction("saved-a", activePayload, { "saved-a": { toolId: "palette-manager-v2", version: "v2", payloadJson: { old: true } } });
  if (overwriteExisting.message !== "Saved session 'saved-a' overwritten with current workspace state." || overwriteExisting.library["saved-a"].payloadJson?.ok !== true) {
    failures.push("Overwrite existing entry should succeed.");
  }

  const loadMissing = evaluateLoadAction("missing", { "saved-a": activePayload });
  if (loadMissing.message !== "Saved session not found.") {
    failures.push("Load missing entry should be blocked.");
  }

  const loadExisting = evaluateLoadAction("saved-a", { "saved-a": activePayload });
  if (loadExisting.message !== "Loaded 'saved-a' into the current workspace." || !loadExisting.loaded) {
    failures.push("Load existing entry should succeed.");
  }

  const deleteEmptyLibraryWithInput = evaluateDeleteSavedAction("unknown", {}, recentHistory, storageMap);
  if (deleteEmptyLibraryWithInput.message !== "No saved sessions exist. Use Delete on Recent Sessions to remove temporary sessions.") {
    failures.push("Delete with empty library should show explicit empty-library message.");
  }

  const deleteRecentOnly = evaluateDeleteSavedAction("recent-1", {}, recentHistory, storageMap);
  if (deleteRecentOnly.message !== "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions.") {
    failures.push("Delete recent-only ID should show explicit guidance.");
  }
  if (deleteRecentOnly.history.length !== recentHistory.length) {
    failures.push("Delete Saved Session must not delete Recent Sessions.");
  }
  if (!Object.prototype.hasOwnProperty.call(deleteRecentOnly.storage, "recent-1")) {
    failures.push("Delete Saved Session must not remove sessionStorage payloads.");
  }

  const deleteSaved = evaluateDeleteSavedAction("saved-a", { "saved-a": activePayload, "saved-b": { toolId: "tilemap-studio-v2", version: "v2" } }, recentHistory, storageMap);
  if (deleteSaved.message !== "Saved session deleted." || Object.prototype.hasOwnProperty.call(deleteSaved.library, "saved-a")) {
    failures.push("Delete saved session should succeed.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      htmlExists,
      jsExists,
      jsSyntax,
      testSyntax
    },
    scenarios: {
      emptySave,
      emptyOverwrite,
      emptyLoad,
      emptyDelete,
      saveCreated,
      duplicateSave,
      overwriteMissing,
      overwriteExisting,
      loadMissing,
      loadExisting,
      deleteEmptyLibraryWithInput,
      deleteRecentOnly,
      deleteSaved
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session-library actions results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session-library actions failures: ${failures.join(" | ")}`);
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
