import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const fixturePath = path.join(repoRoot, "tests", "fixtures", "v2-tools", "asset-manager-v2.json");
const workspaceHtmlPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.html");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-import-export-results.json");

class MemorySessionStorage {
  constructor() {
    this.values = new Map();
  }

  setItem(key, value) {
    this.values.set(String(key), String(value));
  }

  getItem(key) {
    if (!this.values.has(String(key))) {
      return null;
    }
    return this.values.get(String(key));
  }
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
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

function generateHostContextId(toolId) {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${toolId}-import-export-${Date.now()}-${randomPart}`;
}

function simulateImport(toolId, rawJson, sessionStorageLike) {
  const parsed = JSON.parse(rawJson);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Imported JSON is invalid. Expected an object session payload.");
  }
  const hostContextId = generateHostContextId(toolId);
  sessionStorageLike.setItem(hostContextId, JSON.stringify(parsed));
  return { hostContextId, parsed };
}

function simulateExport(currentSessionPayload) {
  return JSON.stringify(currentSessionPayload, null, 2);
}

export function run() {
  const failures = [];
  const fixtureExists = fs.existsSync(fixturePath);
  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceHtml = workspaceHtmlExists ? readText(workspaceHtmlPath) : "";
  const workspaceJs = workspaceJsExists ? readText(workspaceJsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  if (!fixtureExists) {
    failures.push("Fixture file missing.");
  }
  if (!workspaceHtmlExists) {
    failures.push("workspace-v2/index.html missing.");
  }
  if (!workspaceJsExists) {
    failures.push("workspace-v2/index.js missing.");
  }

  let fixture = null;
  let fixtureSessionContext = null;
  let fixtureRawSessionJson = "";
  if (fixtureExists) {
    try {
      fixture = readJson(fixturePath);
      fixtureSessionContext = fixture.sessionContext;
      fixtureRawSessionJson = JSON.stringify(fixtureSessionContext, null, 2);
    } catch {
      failures.push("Fixture JSON failed to parse.");
    }
  }

  if (!fixtureSessionContext || typeof fixtureSessionContext !== "object" || Array.isArray(fixtureSessionContext)) {
    failures.push("Fixture sessionContext missing/invalid.");
  }

  const sessionStorageLike = new MemorySessionStorage();
  let importResult = null;
  try {
    importResult = simulateImport("asset-manager-v2", fixtureRawSessionJson, sessionStorageLike);
  } catch (error) {
    failures.push(`Import simulation failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  let exportedJson = "";
  let exportedParsed = null;
  if (importResult) {
    exportedJson = simulateExport(importResult.parsed);
    try {
      exportedParsed = JSON.parse(exportedJson);
    } catch {
      failures.push("Exported JSON failed to parse.");
    }
  }

  const storedPayload = importResult ? sessionStorageLike.getItem(importResult.hostContextId) : null;
  const storedParsed = storedPayload ? JSON.parse(storedPayload) : null;
  const importHostContextAssigned = Boolean(importResult && typeof importResult.hostContextId === "string" && importResult.hostContextId.trim());
  const storageEntryCreated = Boolean(storedPayload);
  const exportMatchesInput = Boolean(exportedParsed && fixtureSessionContext && JSON.stringify(exportedParsed) === JSON.stringify(fixtureSessionContext));

  if (!importHostContextAssigned) {
    failures.push("Import did not assign hostContextId.");
  }
  if (!storageEntryCreated) {
    failures.push("Import did not create sessionStorage entry.");
  }
  if (storedParsed && fixtureSessionContext && JSON.stringify(storedParsed) !== JSON.stringify(fixtureSessionContext)) {
    failures.push("Stored session payload does not match imported JSON.");
  }
  if (!exportMatchesInput) {
    failures.push("Exported JSON does not match imported input payload.");
  }

  if (!workspaceHtml.includes('id="workspaceV2ImportJson"')) {
    failures.push("Import textarea is missing in workspace-v2 HTML.");
  }
  if (!workspaceHtml.includes('id="workspaceV2ImportButton"')) {
    failures.push("Import button is missing in workspace-v2 HTML.");
  }
  if (!workspaceHtml.includes('id="workspaceV2ExportButton"')) {
    failures.push("Export button is missing in workspace-v2 HTML.");
  }
  if (!workspaceJs.includes("importSessionJson()")) {
    failures.push("workspace-v2 JS does not expose importSessionJson handler.");
  }
  if (!workspaceJs.includes("exportCurrentSessionJson()")) {
    failures.push("workspace-v2 JS does not expose exportCurrentSessionJson handler.");
  }
  if (!workspaceJs.includes("JSON.parse(rawJson)")) {
    failures.push("workspace-v2 JS does not parse imported JSON.");
  }
  if (!workspaceJs.includes("sessionStorage.setItem(hostContextId, JSON.stringify(parsed));")) {
    failures.push("workspace-v2 JS does not store imported payload by generated hostContextId.");
  }
  if (!workspaceJs.includes("Imported JSON is invalid")) {
    failures.push("workspace-v2 JS does not expose explicit invalid JSON error messaging.");
  }
  if (!syntaxValid) {
    failures.push("workspace-v2/index.js failed syntax check.");
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    workspaceHtmlPath: path.relative(repoRoot, workspaceHtmlPath).replace(/\\/g, "/"),
    workspaceJsPath: path.relative(repoRoot, workspaceJsPath).replace(/\\/g, "/"),
    fixtureExists,
    workspaceHtmlExists,
    workspaceJsExists,
    importHostContextAssigned,
    storageEntryCreated,
    exportMatchesInput,
    syntaxValid,
    syntaxError,
    hostContextId: importResult ? importResult.hostContextId : "",
    failures
  };

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`v2 import/export results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 import/export failures: ${failures.join(" | ")}`);
  return summary;
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
