import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const toolsRoot = path.join(repoRoot, "www", "toolbox");
const fixturesRoot = path.join(repoRoot, "tests", "fixtures", "v2-tools");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-performance-results.json");

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

function validateAssetBrowser(sessionContext) {
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

function validatePaletteManager(sessionContext) {
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

function validateSvgAssetStudio(sessionContext) {
  const documentBlock = sessionContext?.payloadJson?.vectorAssetDocument;
  if (!documentBlock || typeof documentBlock !== "object" || Array.isArray(documentBlock)) return false;
  if (typeof documentBlock.sourceName !== "string" || !documentBlock.sourceName.trim()) return false;
  if (typeof documentBlock.svgText !== "string" || !documentBlock.svgText.trim()) return false;
  if (!/^\s*<svg[\s>]/i.test(documentBlock.svgText)) return false;
  return true;
}

function validateTilemapStudio(sessionContext) {
  const documentBlock = sessionContext?.payloadJson?.tileMapDocument;
  if (!documentBlock || typeof documentBlock !== "object" || Array.isArray(documentBlock)) return false;
  if (!documentBlock.map || typeof documentBlock.map !== "object" || Array.isArray(documentBlock.map)) return false;
  if (typeof documentBlock.map.name !== "string" || !documentBlock.map.name.trim()) return false;
  if (!Number.isFinite(Number(documentBlock.map.width)) || Number(documentBlock.map.width) <= 0) return false;
  if (!Number.isFinite(Number(documentBlock.map.height)) || Number(documentBlock.map.height) <= 0) return false;
  if (!Array.isArray(documentBlock.layers)) return false;
  if (documentBlock.layers.some((entry) =>
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

function validateVectorMapEditor(sessionContext) {
  const documentBlock = sessionContext?.payloadJson?.vectorMapDocument;
  if (!documentBlock || typeof documentBlock !== "object" || Array.isArray(documentBlock)) return false;
  if (typeof documentBlock.name !== "string" || !documentBlock.name.trim()) return false;
  if (!Number.isFinite(Number(documentBlock.width)) || Number(documentBlock.width) <= 0) return false;
  if (!Number.isFinite(Number(documentBlock.height)) || Number(documentBlock.height) <= 0) return false;
  if (typeof documentBlock.background !== "string" || !documentBlock.background.trim()) return false;
  if (!Array.isArray(documentBlock.objects)) return false;
  if (documentBlock.objects.some((entry) =>
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
  if (documentBlock.objects.some((entry) =>
    (entry.kind === "polygon" || entry.closed === true) &&
    (typeof entry.style.fill !== "string" || !entry.style.fill.trim())
  )) return false;
  return true;
}

function validateByTool(toolId, sessionContext) {
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) return false;
  if (toolId === "asset-manager-v2") return validateAssetBrowser(sessionContext);
  if (toolId === "palette-manager-v2") return validatePaletteManager(sessionContext);
  if (toolId === "svg-asset-studio-v2") return validateSvgAssetStudio(sessionContext);
  if (toolId === "tilemap-studio-v2") return validateTilemapStudio(sessionContext);
  if (toolId === "vector-map-editor-v2") return validateVectorMapEditor(sessionContext);
  return false;
}

function simulateRenderAssetBrowser(sessionContext) {
  const entries = sessionContext.payloadJson.assetCatalog.entries;
  const rows = [];
  entries.forEach((entry) => {
    rows.push(`${entry.id.trim()}:${entry.label.trim()}:${entry.kind.trim()}:${entry.path.trim()}`);
  });
  return rows.length;
}

function simulateRenderPaletteManager(sessionContext) {
  const colors = sessionContext.paletteJson.colors;
  const normalized = [];
  colors.forEach((entry) => {
    if (typeof entry === "string") {
      normalized.push(entry.trim().toUpperCase());
      return;
    }
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      if (typeof entry.hex === "string") normalized.push(entry.hex.trim().toUpperCase());
      if (typeof entry.color === "string") normalized.push(entry.color.trim().toUpperCase());
    }
  });
  return normalized.length;
}

function simulateRenderSvgAssetStudio(sessionContext) {
  const svgText = sessionContext.payloadJson.vectorAssetDocument.svgText;
  const compact = svgText.replace(/\s+/g, " ").trim();
  return compact.length;
}

function simulateRenderTilemapStudio(sessionContext) {
  const layers = sessionContext.payloadJson.tileMapDocument.layers;
  let rowCount = 0;
  layers.forEach((layer) => {
    rowCount += layer.data.length;
    JSON.stringify({ name: layer.name, kind: layer.kind, rows: layer.data.length });
  });
  return rowCount;
}

function simulateRenderVectorMapEditor(sessionContext) {
  const objects = sessionContext.payloadJson.vectorMapDocument.objects;
  let pointCount = 0;
  objects.forEach((entry) => {
    let pointsText = "";
    entry.points.forEach((point, index) => {
      pointCount += 1;
      pointsText = `${pointsText}${index === 0 ? "" : " "}${Number(point.x)},${Number(point.y)}`;
    });
    if (entry.kind === "polygon" || entry.closed === true) {
      JSON.stringify({ polygon: pointsText, fill: entry.style.fill });
      return;
    }
    JSON.stringify({ polyline: pointsText, stroke: entry.style.stroke });
  });
  return pointCount;
}

function simulateRenderByTool(toolId, sessionContext) {
  if (toolId === "asset-manager-v2") return simulateRenderAssetBrowser(sessionContext);
  if (toolId === "palette-manager-v2") return simulateRenderPaletteManager(sessionContext);
  if (toolId === "svg-asset-studio-v2") return simulateRenderSvgAssetStudio(sessionContext);
  if (toolId === "tilemap-studio-v2") return simulateRenderTilemapStudio(sessionContext);
  if (toolId === "vector-map-editor-v2") return simulateRenderVectorMapEditor(sessionContext);
  return 0;
}

function round(value) {
  return Number(value.toFixed(3));
}

function measureTool(toolId) {
  const fixturePath = path.join(fixturesRoot, `${toolId}.json`);
  const jsPath = path.join(toolsRoot, toolId, "index.js");
  const htmlPath = path.join(toolsRoot, toolId, "index.html");
  const failures = [];

  const fixtureExists = fs.existsSync(fixturePath);
  const jsExists = fs.existsSync(jsPath);
  const htmlExists = fs.existsSync(htmlPath);
  const { syntaxValid, syntaxError } = checkJsSyntax(jsPath);

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

  const t0 = performance.now();
  let scriptBytes = 0;
  if (jsExists) {
    scriptBytes = readText(jsPath).length;
  }
  const tScriptReady = performance.now();

  const sessionStorageLike = new MemorySessionStorage();
  if (fixtureValid && hostContextId && sessionContext) {
    sessionStorageLike.setItem(hostContextId, JSON.stringify(sessionContext));
  }

  const tSessionStart = performance.now();
  const serializedSession = hostContextId ? sessionStorageLike.getItem(hostContextId) : null;
  let resolvedState = "EMPTY";
  let parsedSessionContext = null;
  if (serializedSession) {
    try {
      parsedSessionContext = JSON.parse(serializedSession);
      resolvedState = validateByTool(toolId, parsedSessionContext) ? "VALID" : "INVALID";
    } catch {
      resolvedState = "INVALID";
    }
  }
  const t1 = performance.now();

  const tRenderStart = performance.now();
  let renderUnits = 0;
  if (resolvedState === "VALID" && parsedSessionContext) {
    renderUnits = simulateRenderByTool(toolId, parsedSessionContext);
  }
  const t2 = performance.now();

  if (!htmlExists) failures.push("Missing tool index.html.");
  if (!jsExists) failures.push("Missing tool index.js.");
  if (!syntaxValid) failures.push("Tool index.js failed syntax check.");
  if (resolvedState !== "VALID") failures.push(`Expected VALID resolved state from fixture, got ${resolvedState}.`);

  return {
    tool: toolId,
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    htmlPath: path.relative(repoRoot, htmlPath).replace(/\\/g, "/"),
    jsPath: path.relative(repoRoot, jsPath).replace(/\\/g, "/"),
    fixtureExists,
    fixtureValid,
    htmlExists,
    jsExists,
    syntaxValid,
    syntaxError,
    hostContextId,
    resolvedState,
    scriptBytes,
    renderUnits,
    timingsMs: {
      loadStartToScriptReady: round(tScriptReady - t0),
      sessionResolve: round(t1 - tSessionStart),
      renderValidState: round(t2 - tRenderStart),
      total: round(t2 - t0)
    },
    failures
  };
}

function average(rows, fieldName) {
  if (!rows.length) return 0;
  const total = rows.reduce((sum, row) => sum + row.timingsMs[fieldName], 0);
  return round(total / rows.length);
}

function buildOutliers(rows, averageTotal) {
  if (averageTotal <= 0) return [];
  const threshold = averageTotal * 1.5;
  return rows
    .filter((row) => row.timingsMs.total > threshold)
    .map((row) => ({
      tool: row.tool,
      totalMs: row.timingsMs.total,
      thresholdMs: round(threshold)
    }));
}

export function run() {
  const rows = TOOLS.map(measureTool);
  const failures = rows.flatMap((row) => row.failures.map((entry) => `${row.tool}: ${entry}`));
  const averages = {
    loadStartToScriptReady: average(rows, "loadStartToScriptReady"),
    sessionResolve: average(rows, "sessionResolve"),
    renderValidState: average(rows, "renderValidState"),
    total: average(rows, "total")
  };
  const outliers = buildOutliers(rows, averages.total);

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    toolCount: rows.length,
    failures,
    averagesMs: averages,
    outliers,
    rows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 performance results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 performance failures: ${failures.join(" | ")}`);
  return { toolCount: rows.length, failures, averages, outliers, rows };
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
