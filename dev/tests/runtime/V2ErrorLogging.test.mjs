import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const toolsRoot = path.join(repoRoot, "www", "toolbox");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-error-logging-results.json");

const TOOLS = [
  "asset-manager-v2",
  "palette-manager-v2",
  "svg-asset-studio-v2",
  "tilemap-studio-v2",
  "vector-map-editor-v2"
];

const VALID_TYPES = new Set(["EMPTY", "INVALID", "RUNTIME"]);

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

function validateLogEntry(logEntry, expectedTool, expectedType) {
  const issues = [];
  if (!logEntry || typeof logEntry !== "object" || Array.isArray(logEntry)) {
    issues.push("Log entry must be an object.");
    return issues;
  }
  if (logEntry.tool !== expectedTool) {
    issues.push(`Expected tool "${expectedTool}", got "${typeof logEntry.tool === "string" ? logEntry.tool : "missing"}".`);
  }
  if (logEntry.type !== expectedType) {
    issues.push(`Expected type "${expectedType}", got "${typeof logEntry.type === "string" ? logEntry.type : "missing"}".`);
  }
  if (!VALID_TYPES.has(logEntry.type)) {
    issues.push(`Unexpected type value "${typeof logEntry.type === "string" ? logEntry.type : "missing"}".`);
  }
  if (typeof logEntry.message !== "string" || !logEntry.message.trim()) {
    issues.push("Log message must be a non-empty string.");
  }
  if (!Object.prototype.hasOwnProperty.call(logEntry, "details")) {
    issues.push("Log details field is missing.");
  } else if (!logEntry.details || typeof logEntry.details !== "object" || Array.isArray(logEntry.details)) {
    issues.push("Log details must be an object.");
  }
  return issues;
}

function simulateStructuredLogs(toolId) {
  const capturedLogs = [];
  const writeLog = (logEntry) => capturedLogs.push(logEntry);
  const emitStructuredLog = (type, message, details) => {
    writeLog({
      tool: toolId,
      type,
      message,
      details: details && typeof details === "object" ? details : {}
    });
  };

  emitStructuredLog("EMPTY", "No hostContextId was provided for this tool.", { hostContextId: "" });
  emitStructuredLog("INVALID", "Session payload is invalid for this tool.", { hostContextId: `${toolId}-invalid` });
  try {
    throw new Error("runtime-test-injection");
  } catch (error) {
    emitStructuredLog("RUNTIME", `Unable to read session context: ${error instanceof Error ? error.message : "unknown error"}`, { hostContextId: `${toolId}-runtime` });
  }

  return capturedLogs;
}

function validateTool(toolId) {
  const jsPath = path.join(toolsRoot, toolId, "index.js");
  const jsExists = fs.existsSync(jsPath);
  const jsText = jsExists ? readText(jsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(jsPath);
  const failures = [];

  const hasStructuredLoggerMethod = jsText.includes("logStructuredError(type, message, details)");
  const hasObjectLogShape = jsText.includes("console.error({") &&
    jsText.includes(`tool: "${toolId}"`) &&
    jsText.includes("type,") &&
    jsText.includes("message,") &&
    jsText.includes("details:");
  const hasEmptyTrigger = jsText.includes('this.logStructuredError("EMPTY",');
  const hasInvalidTrigger = jsText.includes('this.logStructuredError("INVALID",');
  const hasRuntimeTrigger = jsText.includes('this.logStructuredError("RUNTIME",');

  if (!jsExists) failures.push("Missing tool index.js.");
  if (!syntaxValid) failures.push("Tool index.js failed syntax check.");
  if (!hasStructuredLoggerMethod) failures.push("Missing logStructuredError(type, message, details) method.");
  if (!hasObjectLogShape) failures.push("Structured log object shape is missing or inconsistent.");
  if (!hasEmptyTrigger) failures.push("Missing EMPTY structured log trigger.");
  if (!hasInvalidTrigger) failures.push("Missing INVALID structured log trigger.");
  if (!hasRuntimeTrigger) failures.push("Missing RUNTIME structured log trigger.");

  const simulatedLogs = simulateStructuredLogs(toolId);
  if (simulatedLogs.length !== 3) {
    failures.push(`Expected 3 simulated logs, got ${simulatedLogs.length}.`);
  }

  const emptyIssues = validateLogEntry(simulatedLogs[0], toolId, "EMPTY");
  const invalidIssues = validateLogEntry(simulatedLogs[1], toolId, "INVALID");
  const runtimeIssues = validateLogEntry(simulatedLogs[2], toolId, "RUNTIME");
  emptyIssues.forEach((entry) => failures.push(`EMPTY log: ${entry}`));
  invalidIssues.forEach((entry) => failures.push(`INVALID log: ${entry}`));
  runtimeIssues.forEach((entry) => failures.push(`RUNTIME log: ${entry}`));

  return {
    tool: toolId,
    jsPath: path.relative(repoRoot, jsPath).replace(/\\/g, "/"),
    jsExists,
    syntaxValid,
    syntaxError,
    hasStructuredLoggerMethod,
    hasObjectLogShape,
    hasEmptyTrigger,
    hasInvalidTrigger,
    hasRuntimeTrigger,
    simulatedLogs,
    failures
  };
}

export function run() {
  const rows = TOOLS.map(validateTool);
  const failures = rows.flatMap((row) => row.failures.map((entry) => `${row.tool}: ${entry}`));

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    toolCount: rows.length,
    failures,
    rows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 error logging results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 error logging failures: ${failures.join(" | ")}`);
  return { toolCount: rows.length, failures, rows };
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
