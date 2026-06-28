import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const fixturesRoot = path.join(repoRoot, "tests", "fixtures", "v2-tools");
const toolsRoot = path.join(repoRoot, "www", "toolbox");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-tool-action-results.json");

const FLOWS = [
  {
    sourceToolId: "asset-manager-v2",
    targetToolId: "svg-asset-studio-v2",
    buttonId: "assetBrowserV2OpenSvgAssetStudioV2Button",
    targetUrlSnippet: "../svg-asset-studio-v2/index.html"
  },
  {
    sourceToolId: "palette-manager-v2",
    targetToolId: "vector-map-editor-v2",
    buttonId: "paletteManagerOpenVectorMapEditorV2Button",
    targetUrlSnippet: "../vector-map-editor-v2/index.html"
  },
  {
    sourceToolId: "tilemap-studio-v2",
    targetToolId: "asset-manager-v2",
    buttonId: "tilemapV2OpenAssetBrowserV2Button",
    targetUrlSnippet: "../asset-manager-v2/index.html"
  }
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

function generateHostContextId(sourceToolId) {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${sourceToolId}-action-${Date.now()}-${randomPart}`;
}

function validateFlow(flow) {
  const sourceFixturePath = path.join(fixturesRoot, `${flow.sourceToolId}.json`);
  const sourceHtmlPath = path.join(toolsRoot, flow.sourceToolId, "index.html");
  const sourceJsPath = path.join(toolsRoot, flow.sourceToolId, "index.js");
  const targetHtmlPath = path.join(toolsRoot, flow.targetToolId, "index.html");
  const targetJsPath = path.join(toolsRoot, flow.targetToolId, "index.js");
  const failures = [];

  const sourceFixtureExists = fs.existsSync(sourceFixturePath);
  const sourceHtmlExists = fs.existsSync(sourceHtmlPath);
  const sourceJsExists = fs.existsSync(sourceJsPath);
  const targetHtmlExists = fs.existsSync(targetHtmlPath);
  const targetJsExists = fs.existsSync(targetJsPath);

  let fixtureValid = false;
  let sourceSessionContext = null;
  if (!sourceFixtureExists) {
    failures.push("Source fixture is missing.");
  } else {
    try {
      const fixture = readJson(sourceFixturePath);
      fixtureValid = true;
      sourceSessionContext = fixture.sessionContext;
    } catch {
      fixtureValid = false;
    }
    if (!fixtureValid) failures.push("Source fixture JSON is invalid.");
    if (fixtureValid && (!sourceSessionContext || typeof sourceSessionContext !== "object" || Array.isArray(sourceSessionContext))) {
      failures.push("Source fixture sessionContext is missing or invalid.");
    }
  }

  const hostContextId = generateHostContextId(flow.sourceToolId);
  const sessionStorageLike = new MemorySessionStorage();
  if (sourceSessionContext) {
    sessionStorageLike.setItem(hostContextId, JSON.stringify(sourceSessionContext));
  }

  const actionUrl = new URL(`toolbox/${flow.targetToolId}/index.html`, "http://localhost/");
  actionUrl.searchParams.set("hostContextId", hostContextId);
  const builtUrl = actionUrl.pathname.slice(1) + actionUrl.search;
  const parsedHostContextId = actionUrl.searchParams.get("hostContextId");
  const storedValue = sessionStorageLike.getItem(hostContextId);
  const expectedStoredValue = sourceSessionContext ? JSON.stringify(sourceSessionContext) : "";

  const sourceHtmlText = sourceHtmlExists ? readText(sourceHtmlPath) : "";
  const sourceJsText = sourceJsExists ? readText(sourceJsPath) : "";
  const { syntaxValid: sourceSyntaxValid, syntaxError: sourceSyntaxError } = checkJsSyntax(sourceJsPath);
  const { syntaxValid: targetSyntaxValid, syntaxError: targetSyntaxError } = checkJsSyntax(targetJsPath);

  if (!sourceHtmlExists) failures.push("Source tool index.html is missing.");
  if (!sourceJsExists) failures.push("Source tool index.js is missing.");
  if (!targetHtmlExists) failures.push("Target tool index.html is missing.");
  if (!targetJsExists) failures.push("Target tool index.js is missing.");
  if (!sourceHtmlText.includes(`id="${flow.buttonId}"`)) failures.push("Required launch action control is missing in source tool HTML.");
  if (!sourceJsText.includes(flow.targetUrlSnippet)) failures.push("Source tool JS does not construct the required target route.");
  if (!sourceJsText.includes('searchParams.set("hostContextId", this.urlState.hostContextId);')) failures.push("Source tool JS does not preserve hostContextId in action URL.");
  if (!builtUrl.startsWith(`toolbox/${flow.targetToolId}/index.html?hostContextId=`)) failures.push("Built action URL does not target required V2 route.");
  if (parsedHostContextId !== hostContextId) failures.push("Action URL hostContextId was not preserved.");
  if (!storedValue) failures.push("Session storage entry for hostContextId is missing in simulated action flow.");
  if (storedValue !== expectedStoredValue) failures.push("Session payload was mutated during simulated action flow.");
  if (!sourceSyntaxValid) failures.push("Source tool index.js failed syntax check.");
  if (!targetSyntaxValid) failures.push("Target tool index.js failed syntax check.");

  return {
    sourceTool: flow.sourceToolId,
    targetTool: flow.targetToolId,
    buttonId: flow.buttonId,
    sourceFixturePath: path.relative(repoRoot, sourceFixturePath).replace(/\\/g, "/"),
    sourceHtmlPath: path.relative(repoRoot, sourceHtmlPath).replace(/\\/g, "/"),
    sourceJsPath: path.relative(repoRoot, sourceJsPath).replace(/\\/g, "/"),
    targetHtmlPath: path.relative(repoRoot, targetHtmlPath).replace(/\\/g, "/"),
    targetJsPath: path.relative(repoRoot, targetJsPath).replace(/\\/g, "/"),
    sourceFixtureExists,
    fixtureValid,
    hostContextId,
    builtUrl,
    parsedHostContextId,
    storageEntryExists: Boolean(storedValue),
    sourceSyntaxValid,
    sourceSyntaxError,
    targetSyntaxValid,
    targetSyntaxError,
    failures
  };
}

export function run() {
  const rows = FLOWS.map(validateFlow);
  const failures = rows.flatMap((row) => row.failures.map((entry) => `${row.sourceTool}->${row.targetTool}: ${entry}`));

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    flowCount: rows.length,
    failures,
    rows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 tool action results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 tool action failures: ${failures.join(" | ")}`);
  return { flowCount: rows.length, failures, rows };
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
