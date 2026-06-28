import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const fixturesRoot = path.join(repoRoot, "tests", "fixtures", "v2-tools");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-producer-results.json");

const TOOLS = [
  "asset-manager-v2",
  "palette-manager-v2",
  "svg-asset-studio-v2",
  "tilemap-studio-v2",
  "vector-map-editor-v2"
];

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
  return `${toolId}-producer-${Date.now()}-${randomPart}`;
}

function buildToolUrl(toolId, hostContextId) {
  return `toolbox/${toolId}/index.html?hostContextId=${encodeURIComponent(hostContextId)}`;
}

function validateTool(toolId) {
  const fixturePath = path.join(fixturesRoot, `${toolId}.json`);
  const toolJsPath = path.join(repoRoot, "www", "toolbox", toolId, "index.js");
  const toolHtmlPath = path.join(repoRoot, "www", "toolbox", toolId, "index.html");
  const failures = [];
  const fixtureExists = fs.existsSync(fixturePath);
  const toolJsExists = fs.existsSync(toolJsPath);
  const toolHtmlExists = fs.existsSync(toolHtmlPath);
  let fixtureValid = false;
  let fixtureSessionContext = null;

  if (!fixtureExists) {
    failures.push("Fixture file is missing.");
  } else {
    try {
      const fixture = readJson(fixturePath);
      fixtureValid = true;
      fixtureSessionContext = fixture.sessionContext;
    } catch {
      fixtureValid = false;
    }
    if (!fixtureValid) failures.push("Fixture JSON is invalid.");
    if (fixtureValid && (!fixtureSessionContext || typeof fixtureSessionContext !== "object" || Array.isArray(fixtureSessionContext))) {
      failures.push("Fixture sessionContext is missing or invalid.");
    }
  }

  const hostContextId = generateHostContextId(toolId);
  const sessionStorageLike = new MemorySessionStorage();
  if (fixtureSessionContext) {
    sessionStorageLike.setItem(hostContextId, JSON.stringify(fixtureSessionContext));
  }

  const launchUrl = buildToolUrl(toolId, hostContextId);
  const parsedLaunchUrl = new URL(launchUrl, "http://localhost/");
  const parsedHostContextId = parsedLaunchUrl.searchParams.get("hostContextId");
  const storedValue = sessionStorageLike.getItem(hostContextId);
  const storedPayloadParseable = (() => {
    if (!storedValue) return false;
    try {
      const parsed = JSON.parse(storedValue);
      return Boolean(parsed && typeof parsed === "object" && !Array.isArray(parsed));
    } catch {
      return false;
    }
  })();

  const { syntaxValid: toolSyntaxValid, syntaxError: toolSyntaxError } = checkJsSyntax(toolJsPath);

  if (!toolHtmlExists) failures.push("Target tool index.html is missing.");
  if (!toolJsExists) failures.push("Target tool index.js is missing.");
  if (!launchUrl.includes(`toolbox/${toolId}/index.html?hostContextId=`)) failures.push("Launch URL does not match expected V2 path format.");
  if (parsedHostContextId !== hostContextId) failures.push("Launch URL hostContextId does not match generated value.");
  if (!storedValue) failures.push("Session storage entry was not written.");
  if (!storedPayloadParseable) failures.push("Session storage entry is not valid serialized JSON payload.");
  if (!toolSyntaxValid) failures.push("Target tool index.js failed syntax check.");

  return {
    tool: toolId,
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    toolHtmlPath: path.relative(repoRoot, toolHtmlPath).replace(/\\/g, "/"),
    toolJsPath: path.relative(repoRoot, toolJsPath).replace(/\\/g, "/"),
    fixtureExists,
    fixtureValid,
    hostContextId,
    launchUrl,
    parsedHostContextId,
    storageEntryExists: Boolean(storedValue),
    storedPayloadParseable,
    toolSyntaxValid,
    toolSyntaxError,
    failures
  };
}

export function run() {
  const workspaceJsText = fs.existsSync(workspaceJsPath) ? readText(workspaceJsPath) : "";
  const { syntaxValid: workspaceSyntaxValid, syntaxError: workspaceSyntaxError } = checkJsSyntax(workspaceJsPath);
  const producerChecks = {
    workspaceJsExists: fs.existsSync(workspaceJsPath),
    usesSessionStorageSetItem: workspaceJsText.includes("sessionStorage.setItem(hostContextId, JSON.stringify(payload));"),
    setsHostContextIdInUrl: workspaceJsText.includes('toolUrl.searchParams.set("hostContextId", hostContextId);'),
    hasFixtureLoaderPath: workspaceJsText.includes("../../tests/fixtures/v2-tools/"),
    workspaceSyntaxValid,
    workspaceSyntaxError
  };

  const rows = TOOLS.map(validateTool);
  const failures = [];
  if (!producerChecks.workspaceJsExists) failures.push("workspace-v2/index.js is missing.");
  if (!producerChecks.usesSessionStorageSetItem) failures.push("workspace-v2/index.js does not write session storage with hostContextId key.");
  if (!producerChecks.setsHostContextIdInUrl) failures.push("workspace-v2/index.js does not add hostContextId query parameter.");
  if (!producerChecks.hasFixtureLoaderPath) failures.push("workspace-v2/index.js does not reference v2 fixture path.");
  if (!producerChecks.workspaceSyntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  rows.forEach((row) => {
    row.failures.forEach((entry) => failures.push(`${row.tool}: ${entry}`));
  });

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    toolCount: rows.length,
    producerChecks,
    failures,
    rows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session producer results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session producer failures: ${failures.join(" | ")}`);
  return { toolCount: rows.length, producerChecks, failures, rows };
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
