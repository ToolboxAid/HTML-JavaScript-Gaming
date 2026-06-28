import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const toolsRoot = path.join(repoRoot, "www", "toolbox");
const fixturesRoot = path.join(repoRoot, "tests", "fixtures", "v2-tools");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-version-results.json");

const TOOLS = [
  "asset-manager-v2",
  "palette-manager-v2",
  "svg-asset-studio-v2",
  "tilemap-studio-v2",
  "vector-map-editor-v2"
];

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

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasValidPayload(toolId, sessionContext) {
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
    return false;
  }
  if (sessionContext.version !== "v2") {
    return false;
  }

  if (toolId === "asset-manager-v2") {
    const catalog = sessionContext?.payloadJson?.assetCatalog;
    if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) return false;
    if (typeof catalog.name !== "string" || !catalog.name.trim()) return false;
    if (!Array.isArray(catalog.entries)) return false;
    if (catalog.entries.some((entry) =>
      !entry ||
      typeof entry !== "object" ||
      Array.isArray(entry) ||
      typeof entry.id !== "string" ||
      !entry.id.trim() ||
      typeof entry.label !== "string" ||
      !entry.label.trim() ||
      typeof entry.kind !== "string" ||
      !entry.kind.trim() ||
      typeof entry.path !== "string" ||
      !entry.path.trim()
    )) return false;
    return true;
  }

  if (toolId === "palette-manager-v2") {
    const palette = sessionContext?.paletteJson;
    if (!palette || typeof palette !== "object" || Array.isArray(palette)) return false;
    if (typeof palette.name !== "string" || !palette.name.trim()) return false;
    if (!Array.isArray(palette.colors)) return false;
    for (const colorEntry of palette.colors) {
      let colorValue = "";
      if (typeof colorEntry === "string") colorValue = colorEntry.trim().toUpperCase();
      if (colorEntry && typeof colorEntry === "object" && !Array.isArray(colorEntry) && typeof colorEntry.hex === "string") colorValue = colorEntry.hex.trim().toUpperCase();
      if (colorEntry && typeof colorEntry === "object" && !Array.isArray(colorEntry) && typeof colorEntry.color === "string") colorValue = colorEntry.color.trim().toUpperCase();
      if (!/^#([0-9A-F]{6}|[0-9A-F]{8})$/.test(colorValue)) return false;
    }
    return true;
  }

  if (toolId === "svg-asset-studio-v2") {
    const vectorAsset = sessionContext?.payloadJson?.vectorAssetDocument;
    if (!vectorAsset || typeof vectorAsset !== "object" || Array.isArray(vectorAsset)) return false;
    if (typeof vectorAsset.sourceName !== "string" || !vectorAsset.sourceName.trim()) return false;
    if (typeof vectorAsset.svgText !== "string" || !/^\s*<svg[\s>]/i.test(vectorAsset.svgText)) return false;
    return true;
  }

  if (toolId === "tilemap-studio-v2") {
    const tileMap = sessionContext?.payloadJson?.tileMapDocument;
    if (!tileMap || typeof tileMap !== "object" || Array.isArray(tileMap)) return false;
    if (!tileMap.map || typeof tileMap.map !== "object" || Array.isArray(tileMap.map)) return false;
    if (typeof tileMap.map.name !== "string" || !tileMap.map.name.trim()) return false;
    if (!Number.isFinite(Number(tileMap.map.width)) || Number(tileMap.map.width) <= 0) return false;
    if (!Number.isFinite(Number(tileMap.map.height)) || Number(tileMap.map.height) <= 0) return false;
    if (!Array.isArray(tileMap.layers)) return false;
    if (tileMap.layers.some((entry) =>
      !entry ||
      typeof entry !== "object" ||
      Array.isArray(entry) ||
      typeof entry.name !== "string" ||
      !entry.name.trim() ||
      typeof entry.kind !== "string" ||
      !entry.kind.trim() ||
      !Array.isArray(entry.data)
    )) return false;
    return true;
  }

  if (toolId === "vector-map-editor-v2") {
    const map = sessionContext?.payloadJson?.vectorMapDocument;
    if (!map || typeof map !== "object" || Array.isArray(map)) return false;
    if (typeof map.name !== "string" || !map.name.trim()) return false;
    if (!Number.isFinite(Number(map.width)) || Number(map.width) <= 0) return false;
    if (!Number.isFinite(Number(map.height)) || Number(map.height) <= 0) return false;
    if (typeof map.background !== "string" || !map.background.trim()) return false;
    if (!Array.isArray(map.objects)) return false;
    return true;
  }

  return false;
}

function validateTool(toolId) {
  const fixturePath = path.join(fixturesRoot, `${toolId}.json`);
  const jsPath = path.join(toolsRoot, toolId, "index.js");
  const failures = [];
  const fixtureExists = fs.existsSync(fixturePath);
  const jsExists = fs.existsSync(jsPath);
  const jsText = jsExists ? readText(jsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(jsPath);

  let fixtureValid = false;
  let validContext = null;
  if (!fixtureExists) {
    failures.push("Missing fixture file.");
  } else {
    try {
      const fixture = readJson(fixturePath);
      fixtureValid = true;
      validContext = fixture.sessionContext;
    } catch {
      fixtureValid = false;
    }
  }
  if (!fixtureValid) {
    failures.push("Fixture is invalid JSON.");
  }

  const hasVersionCheckInTool = jsText.includes('sessionContext.version !== "v2"');
  const hasUnsupportedMessage = jsText.includes("Unsupported session version");
  if (!jsExists) failures.push("Missing tool index.js.");
  if (!syntaxValid) failures.push("Tool index.js failed syntax check.");
  if (!hasVersionCheckInTool) failures.push("Tool is missing explicit sessionContext.version check.");
  if (!hasUnsupportedMessage) failures.push("Tool is missing 'Unsupported session version' message.");

  let validState = "INVALID";
  let missingVersionState = "INVALID";
  let wrongVersionState = "INVALID";
  if (validContext) {
    validState = hasValidPayload(toolId, validContext) ? "VALID" : "INVALID";
    const missingVersionContext = cloneJson(validContext);
    delete missingVersionContext.version;
    missingVersionState = hasValidPayload(toolId, missingVersionContext) ? "VALID" : "INVALID";
    const wrongVersionContext = cloneJson(validContext);
    wrongVersionContext.version = "v3";
    wrongVersionState = hasValidPayload(toolId, wrongVersionContext) ? "VALID" : "INVALID";
  }

  if (validState !== "VALID") failures.push(`Expected VALID with version=v2, got ${validState}.`);
  if (missingVersionState !== "INVALID") failures.push(`Expected INVALID with missing version, got ${missingVersionState}.`);
  if (wrongVersionState !== "INVALID") failures.push(`Expected INVALID with wrong version, got ${wrongVersionState}.`);

  return {
    tool: toolId,
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    jsPath: path.relative(repoRoot, jsPath).replace(/\\/g, "/"),
    fixtureExists,
    fixtureValid,
    syntaxValid,
    syntaxError,
    hasVersionCheckInTool,
    hasUnsupportedMessage,
    cases: {
      validVersion: validState,
      missingVersion: missingVersionState,
      wrongVersion: wrongVersionState
    },
    failures
  };
}

export function run() {
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const workspaceSyntax = checkJsSyntax(workspaceJsPath);
  const workspaceHasVersionTagMethod = workspaceJsText.includes("withSessionVersion(sessionPayload)");
  const workspaceHasVersionTagValue = workspaceJsText.includes('version: "v2"');

  const rows = TOOLS.map(validateTool);
  const failures = rows.flatMap((row) => row.failures.map((entry) => `${row.tool}: ${entry}`));
  if (!workspaceJsExists) failures.push("workspace-v2: Missing index.js.");
  if (!workspaceSyntax.syntaxValid) failures.push("workspace-v2: index.js failed syntax check.");
  if (!workspaceHasVersionTagMethod) failures.push("workspace-v2: Missing withSessionVersion(sessionPayload) producer tag method.");
  if (!workspaceHasVersionTagValue) failures.push("workspace-v2: Missing version='v2' producer tag value.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    workspaceChecks: {
      workspaceJsExists,
      syntaxValid: workspaceSyntax.syntaxValid,
      syntaxError: workspaceSyntax.syntaxError,
      workspaceHasVersionTagMethod,
      workspaceHasVersionTagValue
    },
    rows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session version results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session version failures: ${failures.join(" | ")}`);
  return { failures, rows };
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
