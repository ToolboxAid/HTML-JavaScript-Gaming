import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-error-viewer-results.json");

const LOG_STORAGE_KEY = "v2-error-logs";
const VALID_TYPES = new Set(["EMPTY", "INVALID", "RUNTIME"]);

class MemoryLocalStorage {
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

function isValidErrorLogEntry(errorLogEntry) {
  if (!errorLogEntry || typeof errorLogEntry !== "object" || Array.isArray(errorLogEntry)) {
    return false;
  }
  if (typeof errorLogEntry.tool !== "string" || !errorLogEntry.tool.trim()) {
    return false;
  }
  if (!VALID_TYPES.has(errorLogEntry.type)) {
    return false;
  }
  if (typeof errorLogEntry.message !== "string" || !errorLogEntry.message.trim()) {
    return false;
  }
  if (!errorLogEntry.details || typeof errorLogEntry.details !== "object" || Array.isArray(errorLogEntry.details)) {
    return false;
  }
  if (typeof errorLogEntry.timestamp !== "string" || !errorLogEntry.timestamp.trim()) {
    return false;
  }
  return true;
}

function readErrorLogsFromStorage(localStorageLike, warnings) {
  const rawErrorLogs = localStorageLike.getItem(LOG_STORAGE_KEY);
  if (!rawErrorLogs) {
    return [];
  }
  let parsedErrorLogs = null;
  try {
    parsedErrorLogs = JSON.parse(rawErrorLogs);
  } catch (error) {
    warnings.push(`Ignoring invalid v2-error-logs JSON: ${error instanceof Error ? error.message : "unknown error"}`);
    return [];
  }
  if (!Array.isArray(parsedErrorLogs)) {
    warnings.push("Ignoring invalid v2-error-logs value: expected array.");
    return [];
  }
  const validErrorLogs = [];
  let invalidCount = 0;
  parsedErrorLogs.forEach((errorLogEntry) => {
    if (isValidErrorLogEntry(errorLogEntry)) {
      validErrorLogs.push(errorLogEntry);
      return;
    }
    invalidCount += 1;
  });
  if (invalidCount > 0) {
    warnings.push(`Ignored ${invalidCount} invalid error log entr${invalidCount === 1 ? "y" : "ies"}.`);
  }
  return validErrorLogs;
}

function groupErrorLogsByTool(errorLogs) {
  const grouped = {};
  errorLogs.forEach((errorLogEntry) => {
    if (!Object.prototype.hasOwnProperty.call(grouped, errorLogEntry.tool)) {
      grouped[errorLogEntry.tool] = [];
    }
    grouped[errorLogEntry.tool].push(errorLogEntry);
  });
  return grouped;
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const hasErrorStorageKey = workspaceJsText.includes('this.errorLogsStorageKey = "v2-error-logs"');
  const hasReadMethod = workspaceJsText.includes("readErrorLogs()");
  const hasGroupMethod = workspaceJsText.includes("groupErrorLogsByTool(errorLogs)");
  const hasClearMethod = workspaceJsText.includes("clearErrorLogs()");
  const hasIgnoreInvalidWarning = workspaceJsText.includes("[WorkspaceV2ErrorViewer] Ignored");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!syntaxValid) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!hasErrorStorageKey) failures.push("Workspace V2 missing v2-error-logs storage key wiring.");
  if (!hasReadMethod) failures.push("Workspace V2 missing readErrorLogs() method.");
  if (!hasGroupMethod) failures.push("Workspace V2 missing groupErrorLogsByTool(errorLogs) method.");
  if (!hasClearMethod) failures.push("Workspace V2 missing clearErrorLogs() method.");
  if (!hasIgnoreInvalidWarning) failures.push("Workspace V2 missing invalid entry warning path.");

  const localStorageLike = new MemoryLocalStorage();
  const now = new Date().toISOString();
  const mockLogs = [
    {
      tool: "asset-manager-v2",
      type: "EMPTY",
      message: "No hostContextId was provided.",
      details: { hostContextId: "" },
      timestamp: now
    },
    {
      tool: "tilemap-studio-v2",
      type: "INVALID",
      message: "Expected payloadJson.tileMapDocument.",
      details: { hostContextId: "tilemap-invalid-1" },
      timestamp: now
    },
    {
      tool: "tilemap-studio-v2",
      type: "RUNTIME",
      message: "Unable to read session context: runtime-test-injection",
      details: { hostContextId: "tilemap-runtime-1" },
      timestamp: now
    },
    {
      tool: "",
      type: "INVALID",
      message: "Bad row",
      details: {},
      timestamp: now
    },
    {
      type: "EMPTY",
      message: "Missing tool field",
      details: {},
      timestamp: now
    }
  ];

  localStorageLike.setItem(LOG_STORAGE_KEY, JSON.stringify(mockLogs));
  const warnings = [];
  const validErrorLogs = readErrorLogsFromStorage(localStorageLike, warnings);
  const groupedErrorLogs = groupErrorLogsByTool(validErrorLogs);

  if (validErrorLogs.length !== 3) failures.push(`Expected 3 valid logs after filtering, got ${validErrorLogs.length}.`);
  if (!warnings.some((entry) => entry.includes("Ignored 2 invalid error log entries."))) {
    failures.push("Expected warning for ignored invalid entries.");
  }
  if (!Object.prototype.hasOwnProperty.call(groupedErrorLogs, "asset-manager-v2")) {
    failures.push("Grouped logs missing asset-manager-v2 bucket.");
  }
  if (!Object.prototype.hasOwnProperty.call(groupedErrorLogs, "tilemap-studio-v2")) {
    failures.push("Grouped logs missing tilemap-studio-v2 bucket.");
  }
  if ((groupedErrorLogs["tilemap-studio-v2"] || []).length !== 2) {
    failures.push(`Expected 2 tilemap-studio-v2 logs, got ${(groupedErrorLogs["tilemap-studio-v2"] || []).length}.`);
  }

  localStorageLike.setItem(LOG_STORAGE_KEY, "[]");
  const warningsAfterClear = [];
  const logsAfterClear = readErrorLogsFromStorage(localStorageLike, warningsAfterClear);
  if (logsAfterClear.length !== 0) {
    failures.push(`Expected 0 logs after clear, got ${logsAfterClear.length}.`);
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    workspaceChecks: {
      workspaceJsExists,
      syntaxValid,
      syntaxError,
      hasErrorStorageKey,
      hasReadMethod,
      hasGroupMethod,
      hasClearMethod,
      hasIgnoreInvalidWarning
    },
    localStorageScenario: {
      insertedCount: mockLogs.length,
      validCount: validErrorLogs.length,
      warnings,
      groupedCounts: Object.keys(groupedErrorLogs).sort().map((toolId) => ({
        tool: toolId,
        count: groupedErrorLogs[toolId].length
      })),
      clearedCount: logsAfterClear.length
    },
    sampleLogs: validErrorLogs
  }, null, 2)}\n`, "utf8");

  console.log(`v2 error viewer results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 error viewer failures: ${failures.join(" | ")}`);
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
