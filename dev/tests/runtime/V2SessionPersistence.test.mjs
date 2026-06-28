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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-persistence-results.json");

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

function hostContextIdFromUrl(urlPath) {
  const parsedUrl = new URL(urlPath, "http://localhost/");
  const rawHostContextId = parsedUrl.searchParams.get("hostContextId");
  return typeof rawHostContextId === "string" ? rawHostContextId.trim() : "";
}

function classifyToolState(toolId, hostContextId, sessionContext) {
  if (!hostContextId || !hostContextId.trim()) {
    return "EMPTY";
  }
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
    return "EMPTY";
  }

  if (toolId === "asset-manager-v2") {
    const catalog = sessionContext?.payloadJson?.assetCatalog;
    if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) return "INVALID";
    if (typeof catalog.name !== "string" || !catalog.name.trim()) return "INVALID";
    if (!Array.isArray(catalog.entries)) return "INVALID";
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
    )) return "INVALID";
    return "VALID";
  }

  if (toolId === "palette-manager-v2") {
    const palette = sessionContext?.paletteJson;
    if (!palette || typeof palette !== "object" || Array.isArray(palette)) return "INVALID";
    if (typeof palette.name !== "string" || !palette.name.trim()) return "INVALID";
    if (!Array.isArray(palette.colors)) return "INVALID";
    for (const colorEntry of palette.colors) {
      let colorValue = "";
      if (typeof colorEntry === "string") colorValue = colorEntry.trim().toUpperCase();
      if (colorEntry && typeof colorEntry === "object" && !Array.isArray(colorEntry) && typeof colorEntry.hex === "string") colorValue = colorEntry.hex.trim().toUpperCase();
      if (colorEntry && typeof colorEntry === "object" && !Array.isArray(colorEntry) && typeof colorEntry.color === "string") colorValue = colorEntry.color.trim().toUpperCase();
      if (!/^#([0-9A-F]{6}|[0-9A-F]{8})$/.test(colorValue)) return "INVALID";
    }
    return "VALID";
  }

  if (toolId === "svg-asset-studio-v2") {
    const vectorAsset = sessionContext?.payloadJson?.vectorAssetDocument;
    if (!vectorAsset || typeof vectorAsset !== "object" || Array.isArray(vectorAsset)) return "INVALID";
    if (typeof vectorAsset.sourceName !== "string" || !vectorAsset.sourceName.trim()) return "INVALID";
    if (typeof vectorAsset.svgText !== "string" || !/^\s*<svg[\s>]/i.test(vectorAsset.svgText)) return "INVALID";
    return "VALID";
  }

  if (toolId === "tilemap-studio-v2") {
    const tileMap = sessionContext?.payloadJson?.tileMapDocument;
    if (!tileMap || typeof tileMap !== "object" || Array.isArray(tileMap)) return "INVALID";
    if (!tileMap.map || typeof tileMap.map !== "object" || Array.isArray(tileMap.map)) return "INVALID";
    if (typeof tileMap.map.name !== "string" || !tileMap.map.name.trim()) return "INVALID";
    if (!Number.isFinite(Number(tileMap.map.width)) || Number(tileMap.map.width) <= 0) return "INVALID";
    if (!Number.isFinite(Number(tileMap.map.height)) || Number(tileMap.map.height) <= 0) return "INVALID";
    if (!Array.isArray(tileMap.layers)) return "INVALID";
    if (tileMap.layers.some((entry) =>
      !entry ||
      typeof entry !== "object" ||
      Array.isArray(entry) ||
      typeof entry.name !== "string" ||
      !entry.name.trim() ||
      typeof entry.kind !== "string" ||
      !entry.kind.trim() ||
      !Array.isArray(entry.data)
    )) return "INVALID";
    return "VALID";
  }

  if (toolId === "vector-map-editor-v2") {
    const map = sessionContext?.payloadJson?.vectorMapDocument;
    if (!map || typeof map !== "object" || Array.isArray(map)) return "INVALID";
    if (typeof map.name !== "string" || !map.name.trim()) return "INVALID";
    if (!Number.isFinite(Number(map.width)) || Number(map.width) <= 0) return "INVALID";
    if (!Number.isFinite(Number(map.height)) || Number(map.height) <= 0) return "INVALID";
    if (typeof map.background !== "string" || !map.background.trim()) return "INVALID";
    if (!Array.isArray(map.objects)) return "INVALID";
    if (map.objects.some((entry) =>
      !entry ||
      typeof entry !== "object" ||
      Array.isArray(entry) ||
      typeof entry.name !== "string" ||
      !entry.name.trim() ||
      typeof entry.kind !== "string" ||
      !entry.kind.trim() ||
      !entry.style ||
      typeof entry.style !== "object" ||
      Array.isArray(entry.style) ||
      typeof entry.style.stroke !== "string" ||
      !entry.style.stroke.trim() ||
      !Number.isFinite(Number(entry.style.lineWidth)) ||
      Number(entry.style.lineWidth) <= 0 ||
      !Array.isArray(entry.points) ||
      entry.points.length === 0 ||
      entry.points.some((point) =>
        !point ||
        typeof point !== "object" ||
        Array.isArray(point) ||
        !Number.isFinite(Number(point.x)) ||
        !Number.isFinite(Number(point.y))
      )
    )) return "INVALID";
    return "VALID";
  }

  return "INVALID";
}

function simulateScenario(toolId, urlPath, sessionByContextId) {
  const classifyFromUrl = () => {
    const hostContextId = hostContextIdFromUrl(urlPath);
    const sessionContext = hostContextId ? sessionByContextId[hostContextId] : null;
    return classifyToolState(toolId, hostContextId, sessionContext);
  };

  const initial = classifyFromUrl();
  const reload = classifyFromUrl();
  const backForward = classifyFromUrl();
  return { initial, reload, backForward };
}

function buildInvalidSession(toolId, sessionContext) {
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
    return {};
  }

  const invalidSessionContext = { ...sessionContext };
  if (toolId === "asset-manager-v2" || toolId === "svg-asset-studio-v2" || toolId === "tilemap-studio-v2" || toolId === "vector-map-editor-v2") {
    invalidSessionContext.payloadJson = {};
  }
  if (toolId === "palette-manager-v2") {
    invalidSessionContext.paletteJson = { name: "", colors: ["not-a-color"] };
  }
  return invalidSessionContext;
}

function validateTool(toolId) {
  const fixturePath = path.join(fixturesRoot, `${toolId}.json`);
  const htmlPath = path.join(toolsRoot, toolId, "index.html");
  const jsPath = path.join(toolsRoot, toolId, "index.js");
  const fixtureExists = fs.existsSync(fixturePath);
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const jsText = jsExists ? readText(jsPath) : "";
  const failures = [];

  let fixtureValid = false;
  let hostContextId = "";
  let sessionContext = null;
  if (!fixtureExists) {
    failures.push("Missing fixture file.");
  } else {
    try {
      const fixture = readJson(fixturePath);
      fixtureValid = true;
      hostContextId = typeof fixture.hostContextId === "string" ? fixture.hostContextId.trim() : "";
      sessionContext = fixture.sessionContext;
    } catch {
      fixtureValid = false;
    }
    if (!fixtureValid) failures.push("Fixture JSON is invalid.");
    if (fixtureValid && !hostContextId) failures.push("Fixture hostContextId is missing.");
  }

  const validUrl = `toolbox/${toolId}/index.html?hostContextId=${encodeURIComponent(hostContextId || "missing-host-context-id")}`;
  const emptyUrl = `toolbox/${toolId}/index.html`;
  const invalidHostContextId = `${toolId}-invalid-host`;
  const invalidUrl = `toolbox/${toolId}/index.html?hostContextId=${encodeURIComponent(invalidHostContextId)}`;
  const invalidSessionContext = buildInvalidSession(toolId, sessionContext);
  const sessionByContextId = {};
  if (hostContextId) {
    sessionByContextId[hostContextId] = sessionContext;
  }
  sessionByContextId[invalidHostContextId] = invalidSessionContext;

  const validScenario = simulateScenario(toolId, validUrl, sessionByContextId);
  const emptyScenario = simulateScenario(toolId, emptyUrl, sessionByContextId);
  const invalidScenario = simulateScenario(toolId, invalidUrl, sessionByContextId);

  if (!(validScenario.initial === validScenario.reload && validScenario.reload === validScenario.backForward)) {
    failures.push("VALID scenario is not stable across initial/reload/back-forward.");
  }
  if (!(emptyScenario.initial === emptyScenario.reload && emptyScenario.reload === emptyScenario.backForward)) {
    failures.push("EMPTY scenario is not stable across initial/reload/back-forward.");
  }
  if (!(invalidScenario.initial === invalidScenario.reload && invalidScenario.reload === invalidScenario.backForward)) {
    failures.push("INVALID scenario is not stable across initial/reload/back-forward.");
  }
  if (validScenario.initial !== "VALID") failures.push(`Expected VALID scenario to classify as VALID, got ${validScenario.initial}.`);
  if (emptyScenario.initial !== "EMPTY") failures.push(`Expected EMPTY scenario to classify as EMPTY, got ${emptyScenario.initial}.`);
  if (invalidScenario.initial !== "INVALID") failures.push(`Expected INVALID scenario to classify as INVALID, got ${invalidScenario.initial}.`);

  const hasPopstateListener = jsText.includes('addEventListener("popstate"');
  const hasPageshowListener = jsText.includes('addEventListener("pageshow"');
  const hasNavigationReread = /handleNavigationState\(\)\s*\{[\s\S]*this\.urlState\s*=\s*this\.readUrlState\(\);[\s\S]*this\.readSession\(\);[\s\S]*\}/.test(jsText);
  if (!htmlExists) failures.push("Tool route is missing index.html.");
  if (!jsExists) failures.push("Tool runtime is missing index.js.");
  if (!hasPopstateListener) failures.push("Tool JS is missing popstate listener for URL/session re-read.");
  if (!hasPageshowListener) failures.push("Tool JS is missing pageshow listener for URL/session re-read.");
  if (!hasNavigationReread) failures.push("Tool JS is missing explicit URL/session re-read in navigation handler.");

  const { syntaxValid, syntaxError } = checkJsSyntax(jsPath);
  if (!syntaxValid) failures.push("Tool index.js failed syntax check.");

  return {
    tool: toolId,
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    routePath: path.relative(repoRoot, htmlPath).replace(/\\/g, "/"),
    jsPath: path.relative(repoRoot, jsPath).replace(/\\/g, "/"),
    fixtureExists,
    fixtureValid,
    htmlExists,
    jsExists,
    hostContextId,
    validUrl,
    emptyUrl,
    invalidUrl,
    validScenario,
    emptyScenario,
    invalidScenario,
    hasPopstateListener,
    hasPageshowListener,
    hasNavigationReread,
    syntaxValid,
    syntaxError,
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

  console.log(`v2 session persistence results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session persistence failures: ${failures.join(" | ")}`);
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
