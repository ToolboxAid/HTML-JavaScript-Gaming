import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const workspaceHtmlPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.html");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-reset-state-results.json");

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    if (!this.values.has(String(key))) {
      return null;
    }
    return this.values.get(String(key));
  }

  setItem(key, value) {
    this.values.set(String(key), String(value));
  }

  removeItem(key) {
    this.values.delete(String(key));
  }

  clear() {
    this.values.clear();
  }

  keys() {
    return Array.from(this.values.keys()).sort((left, right) => left.localeCompare(right));
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

function diagnosticsActiveState(currentUrl, currentHostContextId, currentSessionPayload, sessionStorageLike) {
  const params = new URL(currentUrl).searchParams;
  const urlHostContextId = typeof params.get("hostContextId") === "string" ? params.get("hostContextId").trim() : "";
  const activeHostContextId = urlHostContextId || (typeof currentHostContextId === "string" ? currentHostContextId.trim() : "");
  if (activeHostContextId) {
    const stored = sessionStorageLike.getItem(activeHostContextId);
    if (!stored) {
      return "EMPTY";
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return "VALID";
      }
      return "INVALID";
    } catch {
      return "INVALID";
    }
  }
  if (currentSessionPayload && typeof currentSessionPayload === "object" && !Array.isArray(currentSessionPayload)) {
    return "VALID";
  }
  return "EMPTY";
}

function runResetSimulation() {
  const sessionStorageLike = new MemoryStorage();
  const localStorageLike = new MemoryStorage();
  const state = {
    currentUrl: "https://example.test/toolbox/workspace-v2/index.html?hostContextId=reset-host-1&panel=diagnostics",
    currentHostContextId: "reset-host-1",
    currentSessionPayload: {
      toolId: "tilemap-studio-v2",
      payloadJson: {
        tileMapDocument: {
          map: { name: "Reset Fixture", width: 2, height: 2 },
          layers: [{ name: "Ground", kind: "tiles", data: [[1, 1], [1, 1]] }]
        }
      }
    }
  };

  sessionStorageLike.setItem("reset-host-1", JSON.stringify(state.currentSessionPayload));
  sessionStorageLike.setItem("unrelated", "{\"hello\":\"world\"}");
  localStorageLike.setItem("v2-session-library", JSON.stringify({ sample: state.currentSessionPayload }));
  localStorageLike.setItem("v2-error-logs", JSON.stringify([{ tool: "tilemap-studio-v2", type: "INVALID", message: "broken", details: {}, timestamp: new Date().toISOString() }]));
  localStorageLike.setItem("other-key", "leave-me");

  const before = {
    url: state.currentUrl,
    sessionStorageKeys: sessionStorageLike.keys(),
    localStorageKeys: localStorageLike.keys(),
    activeState: diagnosticsActiveState(state.currentUrl, state.currentHostContextId, state.currentSessionPayload, sessionStorageLike)
  };

  const clearSessionStorage = () => {
    sessionStorageLike.clear();
    state.currentHostContextId = "";
  };
  const clearSavedSessions = () => {
    localStorageLike.removeItem("v2-session-library");
  };
  const clearErrorLogs = () => {
    localStorageLike.removeItem("v2-error-logs");
  };
  const resetUrlState = () => {
    const current = new URL(state.currentUrl);
    state.currentUrl = `${current.origin}${current.pathname}${current.hash || ""}`;
    state.currentHostContextId = "";
  };
  const fullReset = () => {
    clearSessionStorage();
    clearSavedSessions();
    clearErrorLogs();
    resetUrlState();
    state.currentSessionPayload = null;
  };

  fullReset();
  const afterFirst = {
    url: state.currentUrl,
    sessionStorageKeys: sessionStorageLike.keys(),
    localStorageKeys: localStorageLike.keys(),
    activeState: diagnosticsActiveState(state.currentUrl, state.currentHostContextId, state.currentSessionPayload, sessionStorageLike)
  };

  fullReset();
  const afterSecond = {
    url: state.currentUrl,
    sessionStorageKeys: sessionStorageLike.keys(),
    localStorageKeys: localStorageLike.keys(),
    activeState: diagnosticsActiveState(state.currentUrl, state.currentHostContextId, state.currentSessionPayload, sessionStorageLike)
  };

  return { before, afterFirst, afterSecond };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const workspaceHtmlText = workspaceHtmlExists ? readText(workspaceHtmlPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const htmlHasResetControls = workspaceHtmlText.includes("workspaceV2ClearSessionStorageButton") &&
    workspaceHtmlText.includes("workspaceV2ClearSavedSessionsButton") &&
    workspaceHtmlText.includes("workspaceV2ResetClearErrorLogsButton") &&
    workspaceHtmlText.includes("workspaceV2FullResetButton");

  const jsHasClearSessionStorage = workspaceJsText.includes("clearSessionStorage(emitStatus = true)");
  const jsHasClearSavedSessions = workspaceJsText.includes("clearSavedSessions(emitStatus = true)");
  const jsHasClearErrorLogs = workspaceJsText.includes("clearErrorLogs(emitStatus = true)");
  const jsHasResetUrlState = workspaceJsText.includes("resetUrlState(emitStatus = true)");
  const jsHasFullReset = workspaceJsText.includes("fullReset()");
  const jsRemovesSessionLibrary = workspaceJsText.includes("localStorage.removeItem(this.libraryStorageKey)");
  const jsRemovesErrorLogs = workspaceJsText.includes("localStorage.removeItem(this.errorLogsStorageKey)");
  const jsClearsSessionStorage = workspaceJsText.includes("sessionStorage.clear()");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!workspaceHtmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!syntaxValid) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!htmlHasResetControls) failures.push("Reset controls markup is missing required buttons.");
  if (!jsHasClearSessionStorage) failures.push("Missing clearSessionStorage(emitStatus = true).");
  if (!jsHasClearSavedSessions) failures.push("Missing clearSavedSessions(emitStatus = true).");
  if (!jsHasClearErrorLogs) failures.push("Missing clearErrorLogs(emitStatus = true).");
  if (!jsHasResetUrlState) failures.push("Missing resetUrlState(emitStatus = true).");
  if (!jsHasFullReset) failures.push("Missing fullReset().");
  if (!jsRemovesSessionLibrary) failures.push("Expected localStorage removal of v2-session-library.");
  if (!jsRemovesErrorLogs) failures.push("Expected localStorage removal of v2-error-logs.");
  if (!jsClearsSessionStorage) failures.push("Expected sessionStorage.clear() usage.");

  const simulation = runResetSimulation();
  if (!simulation.before.url.includes("hostContextId=")) {
    failures.push("Simulation precondition missing hostContextId in URL.");
  }
  if (simulation.afterFirst.sessionStorageKeys.length !== 0) {
    failures.push(`Expected empty sessionStorage after reset, got ${simulation.afterFirst.sessionStorageKeys.length} keys.`);
  }
  if (simulation.afterFirst.localStorageKeys.includes("v2-session-library")) {
    failures.push("v2-session-library was not removed by reset.");
  }
  if (simulation.afterFirst.localStorageKeys.includes("v2-error-logs")) {
    failures.push("v2-error-logs was not removed by reset.");
  }
  if (simulation.afterFirst.url.includes("hostContextId=")) {
    failures.push("URL reset did not remove hostContextId query param.");
  }
  if (simulation.afterFirst.activeState !== "EMPTY") {
    failures.push(`Expected EMPTY state after reset, got ${simulation.afterFirst.activeState}.`);
  }
  if (simulation.afterSecond.activeState !== "EMPTY") {
    failures.push(`Expected EMPTY state after second reset, got ${simulation.afterSecond.activeState}.`);
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    workspaceChecks: {
      workspaceJsExists,
      workspaceHtmlExists,
      syntaxValid,
      syntaxError,
      htmlHasResetControls,
      jsHasClearSessionStorage,
      jsHasClearSavedSessions,
      jsHasClearErrorLogs,
      jsHasResetUrlState,
      jsHasFullReset,
      jsRemovesSessionLibrary,
      jsRemovesErrorLogs,
      jsClearsSessionStorage
    },
    simulation
  }, null, 2)}\n`, "utf8");

  console.log(`v2 reset state results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 reset state failures: ${failures.join(" | ")}`);
  return { failures, simulation };
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
