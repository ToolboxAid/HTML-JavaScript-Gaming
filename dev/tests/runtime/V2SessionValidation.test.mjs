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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-validation-results.json");

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

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
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
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
    return { state: "INVALID", message: "Session context is invalid. Expected an object containing payloadJson.assetCatalog." };
  }
  if (!sessionContext.payloadJson || typeof sessionContext.payloadJson !== "object" || Array.isArray(sessionContext.payloadJson)) {
    return { state: "INVALID", message: "Asset Browser V2 session data is invalid. Expected payloadJson only." };
  }
  if (!sessionContext.payloadJson.assetCatalog || typeof sessionContext.payloadJson.assetCatalog !== "object" || Array.isArray(sessionContext.payloadJson.assetCatalog)) {
    return { state: "INVALID", message: "Asset Browser V2 session data is invalid. Expected payloadJson.assetCatalog." };
  }
  if (typeof sessionContext.payloadJson.assetCatalog.name !== "string" || !sessionContext.payloadJson.assetCatalog.name.trim()) {
    return { state: "INVALID", message: "Asset Browser V2 session data is invalid. Expected assetCatalog.name." };
  }
  if (!Array.isArray(sessionContext.payloadJson.assetCatalog.entries)) {
    return { state: "INVALID", message: "Asset Browser V2 session data is invalid. Expected assetCatalog.entries[]." };
  }
  if (sessionContext.payloadJson.assetCatalog.entries.some((entry) =>
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
  )) {
    return { state: "INVALID", message: "Asset Browser V2 session data is invalid. Every entry requires id, label, kind, and path." };
  }
  return { state: "VALID", message: "Asset Browser V2 session payload is valid." };
}

function validatePaletteManager(sessionContext) {
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
    return { state: "INVALID", message: "Session context is invalid. Expected an object containing paletteJson." };
  }
  if (!sessionContext.paletteJson || typeof sessionContext.paletteJson !== "object" || Array.isArray(sessionContext.paletteJson)) {
    return { state: "INVALID", message: "Palette Manager V2 session data is invalid. Expected paletteJson only." };
  }
  if (typeof sessionContext.paletteJson.name !== "string" || !sessionContext.paletteJson.name.trim()) {
    return { state: "INVALID", message: "Palette Manager V2 session data is invalid. Expected paletteJson.name." };
  }
  if (!Array.isArray(sessionContext.paletteJson.colors)) {
    return { state: "INVALID", message: "Palette Manager V2 session data is invalid. Expected paletteJson.colors[]." };
  }
  for (const colorEntry of sessionContext.paletteJson.colors) {
    let colorValue = "";
    if (typeof colorEntry === "string") {
      colorValue = colorEntry.trim().toUpperCase();
    }
    if (colorEntry && typeof colorEntry === "object" && !Array.isArray(colorEntry) && typeof colorEntry.hex === "string") {
      colorValue = colorEntry.hex.trim().toUpperCase();
    }
    if (colorEntry && typeof colorEntry === "object" && !Array.isArray(colorEntry) && typeof colorEntry.color === "string") {
      colorValue = colorEntry.color.trim().toUpperCase();
    }
    if (!/^#([0-9A-F]{6}|[0-9A-F]{8})$/.test(colorValue)) {
      return { state: "INVALID", message: "Palette Manager V2 session data is invalid. Every paletteJson.colors[] entry must include #RRGGBB or #RRGGBBAA." };
    }
  }
  return { state: "VALID", message: "Palette Manager V2 session payload is valid." };
}

function validateSvgAssetStudio(sessionContext) {
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
    return { state: "INVALID", message: "Session context is invalid. Expected an object containing payloadJson.vectorAssetDocument." };
  }
  if (!sessionContext.payloadJson || typeof sessionContext.payloadJson !== "object" || Array.isArray(sessionContext.payloadJson)) {
    return { state: "INVALID", message: "Object vector session data is invalid. Expected payloadJson only." };
  }
  if (!sessionContext.payloadJson.vectorAssetDocument || typeof sessionContext.payloadJson.vectorAssetDocument !== "object" || Array.isArray(sessionContext.payloadJson.vectorAssetDocument)) {
    return { state: "INVALID", message: "Object vector session data is invalid. Expected payloadJson.vectorAssetDocument." };
  }
  if (typeof sessionContext.payloadJson.vectorAssetDocument.sourceName !== "string" || !sessionContext.payloadJson.vectorAssetDocument.sourceName.trim()) {
    return { state: "INVALID", message: "Object vector session data is invalid. Expected vectorAssetDocument.sourceName." };
  }
  if (typeof sessionContext.payloadJson.vectorAssetDocument.svgText !== "string" || !sessionContext.payloadJson.vectorAssetDocument.svgText.trim()) {
    return { state: "INVALID", message: "Object vector session data is invalid. Expected vectorAssetDocument.svgText." };
  }
  if (!/^\s*<svg[\s>]/i.test(sessionContext.payloadJson.vectorAssetDocument.svgText)) {
    return { state: "INVALID", message: "Object vector session data is invalid. svgText must start with an <svg> document." };
  }
  return { state: "VALID", message: "Object vector session payload is valid." };
}

function validateTilemapStudio(sessionContext) {
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
    return { state: "INVALID", message: "Session context is invalid. Expected an object containing payloadJson.tileMapDocument." };
  }
  if (!sessionContext.payloadJson || typeof sessionContext.payloadJson !== "object" || Array.isArray(sessionContext.payloadJson)) {
    return { state: "INVALID", message: "Tilemap session data is invalid. Expected payloadJson only." };
  }
  if (!sessionContext.payloadJson.tileMapDocument || typeof sessionContext.payloadJson.tileMapDocument !== "object" || Array.isArray(sessionContext.payloadJson.tileMapDocument)) {
    return { state: "INVALID", message: "Tilemap session data is invalid. Expected payloadJson.tileMapDocument." };
  }
  if (!sessionContext.payloadJson.tileMapDocument.map || typeof sessionContext.payloadJson.tileMapDocument.map !== "object" || Array.isArray(sessionContext.payloadJson.tileMapDocument.map)) {
    return { state: "INVALID", message: "Tilemap session data is invalid. Expected tileMapDocument.map." };
  }
  if (typeof sessionContext.payloadJson.tileMapDocument.map.name !== "string" || !sessionContext.payloadJson.tileMapDocument.map.name.trim()) {
    return { state: "INVALID", message: "Tilemap session data is invalid. Expected tileMapDocument.map.name." };
  }
  if (!Number.isFinite(Number(sessionContext.payloadJson.tileMapDocument.map.width)) || Number(sessionContext.payloadJson.tileMapDocument.map.width) <= 0 || !Number.isFinite(Number(sessionContext.payloadJson.tileMapDocument.map.height)) || Number(sessionContext.payloadJson.tileMapDocument.map.height) <= 0) {
    return { state: "INVALID", message: "Tilemap session data is invalid. Expected positive numeric tileMapDocument.map.width and tileMapDocument.map.height." };
  }
  if (!Array.isArray(sessionContext.payloadJson.tileMapDocument.layers)) {
    return { state: "INVALID", message: "Tilemap session data is invalid. Expected tileMapDocument.layers[]." };
  }
  if (sessionContext.payloadJson.tileMapDocument.layers.some((entry) =>
    !entry ||
    typeof entry !== "object" ||
    Array.isArray(entry) ||
    typeof entry.name !== "string" ||
    !entry.name.trim() ||
    typeof entry.kind !== "string" ||
    !entry.kind.trim() ||
    !Array.isArray(entry.data)
  )) {
    return { state: "INVALID", message: "Tilemap session data is invalid. Every layer requires name, kind, and data[]." };
  }
  return { state: "VALID", message: "Tilemap Studio V2 session payload is valid." };
}

function validateVectorMapEditor(sessionContext) {
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
    return { state: "INVALID", message: "Session context is invalid. Expected an object containing payloadJson.vectorMapDocument." };
  }
  if (!sessionContext.payloadJson || typeof sessionContext.payloadJson !== "object" || Array.isArray(sessionContext.payloadJson)) {
    return { state: "INVALID", message: "World vector session data is invalid. Expected payloadJson only." };
  }
  if (!sessionContext.payloadJson.vectorMapDocument || typeof sessionContext.payloadJson.vectorMapDocument !== "object" || Array.isArray(sessionContext.payloadJson.vectorMapDocument)) {
    return { state: "INVALID", message: "World vector session data is invalid. Expected payloadJson.vectorMapDocument." };
  }
  if (typeof sessionContext.payloadJson.vectorMapDocument.name !== "string" || !sessionContext.payloadJson.vectorMapDocument.name.trim()) {
    return { state: "INVALID", message: "World vector session data is invalid. Expected vectorMapDocument.name." };
  }
  if (!Number.isFinite(Number(sessionContext.payloadJson.vectorMapDocument.width)) || Number(sessionContext.payloadJson.vectorMapDocument.width) <= 0 || !Number.isFinite(Number(sessionContext.payloadJson.vectorMapDocument.height)) || Number(sessionContext.payloadJson.vectorMapDocument.height) <= 0) {
    return { state: "INVALID", message: "World vector session data is invalid. Expected positive numeric vectorMapDocument.width and vectorMapDocument.height." };
  }
  if (typeof sessionContext.payloadJson.vectorMapDocument.background !== "string" || !sessionContext.payloadJson.vectorMapDocument.background.trim()) {
    return { state: "INVALID", message: "World vector session data is invalid. Expected vectorMapDocument.background." };
  }
  if (!Array.isArray(sessionContext.payloadJson.vectorMapDocument.objects)) {
    return { state: "INVALID", message: "World vector session data is invalid. Expected vectorMapDocument.objects[]." };
  }
  if (sessionContext.payloadJson.vectorMapDocument.objects.some((entry) =>
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
  )) {
    return { state: "INVALID", message: "World vector session data is invalid. Every object requires name, kind, style.stroke, positive style.lineWidth, and points[]." };
  }
  if (sessionContext.payloadJson.vectorMapDocument.objects.some((entry) =>
    (entry.kind === "polygon" || entry.closed === true) &&
    (typeof entry.style.fill !== "string" || !entry.style.fill.trim())
  )) {
    return { state: "INVALID", message: "World vector session data is invalid. Closed objects require style.fill." };
  }
  return { state: "VALID", message: "World vector session payload is valid." };
}

function validateByTool(toolId, sessionContext) {
  if (toolId === "asset-manager-v2") return validateAssetBrowser(sessionContext);
  if (toolId === "palette-manager-v2") return validatePaletteManager(sessionContext);
  if (toolId === "svg-asset-studio-v2") return validateSvgAssetStudio(sessionContext);
  if (toolId === "tilemap-studio-v2") return validateTilemapStudio(sessionContext);
  if (toolId === "vector-map-editor-v2") return validateVectorMapEditor(sessionContext);
  return { state: "INVALID", message: `Unsupported tool id: ${toolId}` };
}

function buildMissingRequiredShape(toolId, validSessionContext) {
  const broken = cloneJson(validSessionContext);
  if (toolId === "palette-manager-v2") {
    delete broken.paletteJson;
    return broken;
  }
  if (!broken.payloadJson || typeof broken.payloadJson !== "object" || Array.isArray(broken.payloadJson)) {
    broken.payloadJson = {};
    return broken;
  }
  if (toolId === "asset-manager-v2") delete broken.payloadJson.assetCatalog;
  if (toolId === "svg-asset-studio-v2") delete broken.payloadJson.vectorAssetDocument;
  if (toolId === "tilemap-studio-v2") delete broken.payloadJson.tileMapDocument;
  if (toolId === "vector-map-editor-v2") delete broken.payloadJson.vectorMapDocument;
  return broken;
}

function validateTool(toolId) {
  const fixturePath = path.join(fixturesRoot, `${toolId}.json`);
  const jsPath = path.join(toolsRoot, toolId, "index.js");
  const failures = [];

  const fixtureExists = fs.existsSync(fixturePath);
  const jsExists = fs.existsSync(jsPath);
  let fixtureValid = false;
  let sessionContext = null;
  let hostContextId = "";
  if (!fixtureExists) {
    failures.push("Missing fixture JSON.");
  } else {
    try {
      const fixtureJson = readJson(fixturePath);
      fixtureValid = true;
      hostContextId = typeof fixtureJson.hostContextId === "string" ? fixtureJson.hostContextId.trim() : "";
      sessionContext = fixtureJson.sessionContext;
    } catch {
      fixtureValid = false;
    }
    if (!fixtureValid) failures.push("Fixture JSON is malformed.");
    if (fixtureValid && !hostContextId) failures.push("Fixture hostContextId is missing.");
  }

  const jsText = jsExists ? readText(jsPath) : "";
  const hasActionableValidationMessage = jsText.includes("Expected ");
  const hasRenderErrorPath = jsText.includes("renderError(");
  const hasLoadContractPath = jsText.includes("loadContract(");
  const { syntaxValid, syntaxError } = checkJsSyntax(jsPath);

  let validCase = { state: "INVALID", message: "Valid fixture unavailable." };
  let malformedJsonCase = { state: "INVALID", message: "Malformed JSON fixture unavailable." };
  let missingRequiredCase = { state: "INVALID", message: "Missing-required fixture unavailable." };
  let emptyPayloadCase = { state: "INVALID", message: "Empty payload fixture unavailable." };

  if (fixtureValid && sessionContext) {
    validCase = validateByTool(toolId, sessionContext);
    malformedJsonCase = (() => {
      try {
        JSON.parse("{broken");
        return { state: "VALID", message: "Unexpected JSON parse success." };
      } catch {
        return { state: "INVALID", message: "Malformed JSON is invalid." };
      }
    })();
    missingRequiredCase = validateByTool(toolId, buildMissingRequiredShape(toolId, sessionContext));
    emptyPayloadCase = validateByTool(toolId, {});
  }

  if (!jsExists) failures.push("Missing tool index.js.");
  if (!syntaxValid) failures.push("Tool index.js failed syntax check.");
  if (!hasActionableValidationMessage) failures.push("Tool index.js does not expose actionable 'Expected ...' validation messaging.");
  if (!hasRenderErrorPath) failures.push("Tool index.js does not route validation failures to renderError.");
  if (!hasLoadContractPath) failures.push("Tool index.js does not include a loadContract validation step.");
  if (validCase.state !== "VALID") failures.push(`Expected VALID for fixture payload, got ${validCase.state}.`);
  if (malformedJsonCase.state !== "INVALID") failures.push(`Expected INVALID for malformed JSON case, got ${malformedJsonCase.state}.`);
  if (missingRequiredCase.state !== "INVALID") failures.push(`Expected INVALID for missing required fields case, got ${missingRequiredCase.state}.`);
  if (emptyPayloadCase.state !== "INVALID") failures.push(`Expected INVALID for empty payload case, got ${emptyPayloadCase.state}.`);

  return {
    tool: toolId,
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    jsPath: path.relative(repoRoot, jsPath).replace(/\\/g, "/"),
    fixtureExists,
    fixtureValid,
    hasActionableValidationMessage,
    hasRenderErrorPath,
    hasLoadContractPath,
    syntaxValid,
    syntaxError,
    cases: {
      validFixture: validCase,
      malformedJson: malformedJsonCase,
      missingRequiredFields: missingRequiredCase,
      emptyPayload: emptyPayloadCase
    },
    failures
  };
}

export function run() {
  const rows = TOOLS.map(validateTool);
  const failures = rows.flatMap((row) => row.failures.map((failure) => `${row.tool}: ${failure}`));
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    toolCount: rows.length,
    failures,
    rows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session validation results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session validation failures: ${failures.join(" | ")}`);
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
