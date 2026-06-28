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
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-producer-render-results.json");

const TOOLS = [
  {
    toolId: "asset-manager-v2",
    validStateId: "assetBrowserV2ValidState",
    emptyStateId: "assetBrowserV2EmptyState",
    invalidStateId: "assetBrowserV2InvalidState"
  },
  {
    toolId: "palette-manager-v2",
    validStateId: "paletteManagerValidState",
    emptyStateId: "paletteManagerEmptyState",
    invalidStateId: "paletteManagerInvalidState"
  },
  {
    toolId: "svg-asset-studio-v2",
    validStateId: "svgV2ValidState",
    emptyStateId: "svgV2EmptyState",
    invalidStateId: "svgV2InvalidState"
  },
  {
    toolId: "tilemap-studio-v2",
    validStateId: "tilemapV2ValidState",
    emptyStateId: "tilemapV2EmptyState",
    invalidStateId: "tilemapV2InvalidState"
  },
  {
    toolId: "vector-map-editor-v2",
    validStateId: "vectorMapV2ValidState",
    emptyStateId: "vectorMapV2EmptyState",
    invalidStateId: "vectorMapV2InvalidState"
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

function generateHostContextId(toolId) {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${toolId}-producer-render-${Date.now()}-${randomPart}`;
}

function buildLaunchUrl(toolId, hostContextId) {
  return `toolbox/${toolId}/index.html?hostContextId=${encodeURIComponent(hostContextId)}`;
}

function readHostContextIdFromUrl(launchUrl) {
  const parsedUrl = new URL(launchUrl, "http://localhost/");
  return parsedUrl.searchParams.get("hostContextId") || "";
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

function classifyToolLoad(toolId, launchUrl, sessionStorageLike) {
  const hostContextId = readHostContextIdFromUrl(launchUrl);
  if (!hostContextId) return "EMPTY";
  const serialized = sessionStorageLike.getItem(hostContextId);
  if (!serialized) return "EMPTY";
  try {
    const sessionContext = JSON.parse(serialized);
    return hasValidPayload(toolId, sessionContext) ? "VALID" : "INVALID";
  } catch {
    return "INVALID";
  }
}

function validateTool(tool) {
  const fixturePath = path.join(fixturesRoot, `${tool.toolId}.json`);
  const toolHtmlPath = path.join(toolsRoot, tool.toolId, "index.html");
  const toolJsPath = path.join(toolsRoot, tool.toolId, "index.js");
  const failures = [];
  const fixtureExists = fs.existsSync(fixturePath);
  const toolHtmlExists = fs.existsSync(toolHtmlPath);
  const toolJsExists = fs.existsSync(toolJsPath);
  const toolHtmlText = toolHtmlExists ? readText(toolHtmlPath) : "";
  const toolJsText = toolJsExists ? readText(toolJsPath) : "";

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

  const sessionStorageLike = new MemorySessionStorage();
  const hostContextId = generateHostContextId(tool.toolId);
  if (fixtureSessionContext) {
    sessionStorageLike.setItem(hostContextId, JSON.stringify(fixtureSessionContext));
  }
  const launchUrl = buildLaunchUrl(tool.toolId, hostContextId);
  const parsedHostContextId = readHostContextIdFromUrl(launchUrl);
  const storageEntry = sessionStorageLike.getItem(hostContextId);
  const state = classifyToolLoad(tool.toolId, launchUrl, sessionStorageLike);
  const { syntaxValid, syntaxError } = checkJsSyntax(toolJsPath);

  const hasValidRegion = toolHtmlText.includes(`id="${tool.validStateId}"`);
  const hasEmptyRegion = toolHtmlText.includes(`id="${tool.emptyStateId}"`);
  const hasInvalidRegion = toolHtmlText.includes(`id="${tool.invalidStateId}"`);
  const togglesValidVisible = toolJsText.includes(`getElementById("${tool.validStateId}").hidden = false`);
  const togglesEmptyHidden = toolJsText.includes(`getElementById("${tool.emptyStateId}").hidden = true`);
  const togglesInvalidHidden = toolJsText.includes(`getElementById("${tool.invalidStateId}").hidden = true`);
  const readsStorageByHostContextId = toolJsText.includes("sessionStorage.getItem(\n          this.urlState.hostContextId\n        )") || toolJsText.includes("sessionStorage.getItem(this.urlState.hostContextId)");

  if (!toolHtmlExists) failures.push("Tool index.html is missing.");
  if (!toolJsExists) failures.push("Tool index.js is missing.");
  if (!hasValidRegion) failures.push("Tool is missing VALID render region.");
  if (!hasEmptyRegion) failures.push("Tool is missing EMPTY render region.");
  if (!hasInvalidRegion) failures.push("Tool is missing INVALID render region.");
  if (!togglesValidVisible) failures.push("Tool JS does not reveal VALID region in valid path.");
  if (!togglesEmptyHidden) failures.push("Tool JS does not hide EMPTY region in valid path.");
  if (!togglesInvalidHidden) failures.push("Tool JS does not hide INVALID region in valid path.");
  if (!readsStorageByHostContextId) failures.push("Tool JS does not read session by URL hostContextId key.");
  if (!storageEntry) failures.push("Producer simulation did not create sessionStorage entry.");
  if (parsedHostContextId !== hostContextId) failures.push("Launch URL hostContextId mismatch.");
  if (state !== "VALID") failures.push(`Expected VALID render state, got ${state}.`);
  if (!syntaxValid) failures.push("Tool JS failed syntax check.");

  return {
    tool: tool.toolId,
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    toolHtmlPath: path.relative(repoRoot, toolHtmlPath).replace(/\\/g, "/"),
    toolJsPath: path.relative(repoRoot, toolJsPath).replace(/\\/g, "/"),
    fixtureExists,
    fixtureValid,
    hostContextId,
    launchUrl,
    parsedHostContextId,
    storageEntryExists: Boolean(storageEntry),
    state,
    hasValidRegion,
    hasEmptyRegion,
    hasInvalidRegion,
    togglesValidVisible,
    togglesEmptyHidden,
    togglesInvalidHidden,
    readsStorageByHostContextId,
    syntaxValid,
    syntaxError,
    failures
  };
}

export function run() {
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const { syntaxValid: workspaceSyntaxValid, syntaxError: workspaceSyntaxError } = checkJsSyntax(workspaceJsPath);
  const producerChecks = {
    workspaceJsExists,
    createsHostContextId: workspaceJsText.includes("createHostContextId("),
    writesSessionStorage: workspaceJsText.includes("sessionStorage.setItem(hostContextId, JSON.stringify(payload));"),
    appendsHostContextId: workspaceJsText.includes('searchParams.set("hostContextId", hostContextId);'),
    workspaceSyntaxValid,
    workspaceSyntaxError
  };

  const rows = TOOLS.map(validateTool);
  const failures = [];
  if (!producerChecks.workspaceJsExists) failures.push("workspace-v2/index.js is missing.");
  if (!producerChecks.createsHostContextId) failures.push("workspace-v2 producer does not create hostContextId.");
  if (!producerChecks.writesSessionStorage) failures.push("workspace-v2 producer does not write sessionStorage.");
  if (!producerChecks.appendsHostContextId) failures.push("workspace-v2 producer does not append hostContextId to launch URL.");
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

  console.log(`v2 producer render results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 producer render failures: ${failures.join(" | ")}`);
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
