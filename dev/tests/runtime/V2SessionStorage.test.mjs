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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-storage-results.json");

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

function hostContextIdFromUrl(urlPath) {
  const parsedUrl = new URL(urlPath, "http://localhost/");
  const hostContextId = parsedUrl.searchParams.get("hostContextId");
  return typeof hostContextId === "string" ? hostContextId.trim() : "";
}

function hasValidPayload(toolId, sessionContext) {
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
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
    )) return false;
    return true;
  }

  return false;
}

function classifyFromStorage(toolId, urlPath, sessionStorageLike) {
  const hostContextId = hostContextIdFromUrl(urlPath);
  if (!hostContextId) {
    return "EMPTY";
  }

  const serializedSession = sessionStorageLike.getItem(hostContextId);
  if (!serializedSession) {
    return "EMPTY";
  }

  try {
    const sessionContext = JSON.parse(serializedSession);
    return hasValidPayload(toolId, sessionContext) ? "VALID" : "INVALID";
  } catch {
    return "INVALID";
  }
}

function validateTool(toolId) {
  const fixturePath = path.join(fixturesRoot, `${toolId}.json`);
  const jsPath = path.join(toolsRoot, toolId, "index.js");
  const htmlPath = path.join(toolsRoot, toolId, "index.html");
  const fixtureExists = fs.existsSync(fixturePath);
  const jsExists = fs.existsSync(jsPath);
  const htmlExists = fs.existsSync(htmlPath);
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

  const sessionStorageLike = new MemorySessionStorage();
  if (hostContextId && sessionContext) {
    sessionStorageLike.setItem(hostContextId, JSON.stringify(sessionContext));
  }

  const validUrl = `toolbox/${toolId}/index.html?hostContextId=${encodeURIComponent(hostContextId || "missing")}`;
  const validState = classifyFromStorage(toolId, validUrl, sessionStorageLike);

  const missingUrl = `toolbox/${toolId}/index.html?hostContextId=${encodeURIComponent(`${toolId}-missing`)}`;
  const missingState = classifyFromStorage(toolId, missingUrl, sessionStorageLike);

  const invalidHostContextId = `${toolId}-invalid`;
  sessionStorageLike.setItem(invalidHostContextId, "{invalid-json");
  const invalidUrl = `toolbox/${toolId}/index.html?hostContextId=${encodeURIComponent(invalidHostContextId)}`;
  const invalidState = classifyFromStorage(toolId, invalidUrl, sessionStorageLike);

  const jsText = jsExists ? readText(jsPath) : "";
  const usesDirectStorageKey = jsText.includes("sessionStorage.getItem(\n          this.urlState.hostContextId\n        )") || jsText.includes('sessionStorage.getItem(this.urlState.hostContextId)');
  const hasLegacyPrefixedStorageKey = jsText.includes("toolboxaid.toolHost.context.");
  const { syntaxValid, syntaxError } = checkJsSyntax(jsPath);

  if (!htmlExists) failures.push("Missing tool index.html.");
  if (!jsExists) failures.push("Missing tool index.js.");
  if (validState !== "VALID") failures.push(`Expected VALID with fixture-backed storage, got ${validState}.`);
  if (missingState !== "EMPTY") failures.push(`Expected EMPTY with missing storage key, got ${missingState}.`);
  if (invalidState !== "INVALID") failures.push(`Expected INVALID with malformed JSON storage value, got ${invalidState}.`);
  if (!usesDirectStorageKey) failures.push("Tool JS is not reading sessionStorage with hostContextId as the direct key.");
  if (hasLegacyPrefixedStorageKey) failures.push("Tool JS still contains legacy prefixed sessionStorage key usage.");
  if (!syntaxValid) failures.push("Tool JS failed syntax check.");

  return {
    tool: toolId,
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    routePath: path.relative(repoRoot, htmlPath).replace(/\\/g, "/"),
    jsPath: path.relative(repoRoot, jsPath).replace(/\\/g, "/"),
    fixtureExists,
    fixtureValid,
    hostContextId,
    validUrl,
    missingUrl,
    invalidUrl,
    validState,
    missingState,
    invalidState,
    usesDirectStorageKey,
    hasLegacyPrefixedStorageKey,
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

  console.log(`v2 session storage results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session storage failures: ${failures.join(" | ")}`);
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
