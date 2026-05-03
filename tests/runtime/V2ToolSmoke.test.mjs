import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const toolsRoot = path.join(repoRoot, "tools");
const fixturesRoot = path.join(repoRoot, "tests", "fixtures", "v2-tools");
const resultsPath = path.join(repoRoot, "tmp", "v2-tool-smoke-results.json");
const REQUIRED_V2_TOOLS = [
  "asset-manager-v2",
  "palette-manager-v2",
  "svg-asset-studio-v2",
  "tilemap-studio-v2",
  "vector-map-editor-v2"
];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function collectV2ToolDirectories() {
  return fs.readdirSync(toolsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.endsWith("-v2"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function parseBodyToolId(htmlText) {
  const bodyMatch = htmlText.match(/<body[^>]*\bdata-tool-id\s*=\s*"([^"]+)"/i);
  return bodyMatch ? bodyMatch[1].trim() : "";
}

function parseTitle(htmlText) {
  const titleMatch = htmlText.match(/<title>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : "";
}

function parseDocumentTitle(jsText) {
  const jsTitleMatch = jsText.match(/document\.title\s*=\s*["']([^"']+)["']/);
  return jsTitleMatch ? jsTitleMatch[1].trim() : "";
}

function countStateRegionIds(htmlText, suffix) {
  const pattern = new RegExp(`id\\s*=\\s*"[^"]*${suffix}"`, "g");
  const matches = htmlText.match(pattern);
  return matches ? matches.length : 0;
}

function validateV2Tool(toolDirName) {
  const toolPath = path.join(toolsRoot, toolDirName);
  const htmlPath = path.join(toolPath, "index.html");
  const jsPath = path.join(toolPath, "index.js");

  const hasIndexHtml = fs.existsSync(htmlPath);
  const hasIndexJs = fs.existsSync(jsPath);
  const htmlText = hasIndexHtml ? readText(htmlPath) : "";
  const jsText = hasIndexJs ? readText(jsPath) : "";
  const bodyToolId = parseBodyToolId(htmlText);
  const htmlTitle = parseTitle(htmlText);
  const jsDocumentTitle = parseDocumentTitle(jsText);

  const checks = {
    hasIndexHtml,
    hasIndexJs,
    hasSharedThemeHeaderNode: htmlText.includes('<div id="shared-theme-header"></div>'),
    hasSharedThemeMountScript: htmlText.includes('../../src/engine/theme/mount-shared-header.js'),
    hasBodyToolIdEndingV2: bodyToolId.endsWith("-v2"),
    hasHtmlTitleEndingV2: /V2$/.test(htmlTitle),
    hasJsTitleEndingV2: /V2$/.test(jsDocumentTitle),
    hasEmptyStateRegion: countStateRegionIds(htmlText, "EmptyState") > 0,
    hasInvalidStateRegion: countStateRegionIds(htmlText, "InvalidState") > 0,
    hasValidStateRegion: countStateRegionIds(htmlText, "ValidState") > 0,
    hasFixtureFile: false,
    hasFixtureValidJson: false,
    hasFixtureHostContextId: false,
    hasFixtureToolPayload: false
  };

  const failures = [];
  if (!checks.hasIndexHtml) failures.push("Missing index.html");
  if (!checks.hasIndexJs) failures.push("Missing index.js");
  if (!checks.hasSharedThemeHeaderNode) failures.push('Missing <div id="shared-theme-header"></div>');
  if (!checks.hasSharedThemeMountScript) failures.push("Missing mount-shared-header.js script import");
  if (!checks.hasBodyToolIdEndingV2) failures.push(`Body data-tool-id must end with -v2 (found: "${bodyToolId || "missing"}")`);
  if (!checks.hasHtmlTitleEndingV2) failures.push(`HTML <title> must end with V2 (found: "${htmlTitle || "missing"}")`);
  if (!checks.hasJsTitleEndingV2) failures.push(`JS document.title must end with V2 (found: "${jsDocumentTitle || "missing"}")`);
  if (!checks.hasEmptyStateRegion) failures.push("Missing visible empty state region id ending with EmptyState");
  if (!checks.hasInvalidStateRegion) failures.push("Missing visible invalid state region id ending with InvalidState");
  if (!checks.hasValidStateRegion) failures.push("Missing visible valid state region id ending with ValidState");

  const fixturePath = path.join(fixturesRoot, `${toolDirName}.json`);
  checks.hasFixtureFile = fs.existsSync(fixturePath);
  let fixtureJson = null;
  if (checks.hasFixtureFile) {
    try {
      fixtureJson = JSON.parse(readText(fixturePath));
      checks.hasFixtureValidJson = true;
    } catch {
      checks.hasFixtureValidJson = false;
    }
  }

  if (!checks.hasFixtureFile) {
    failures.push(`Missing fixture file: tests/fixtures/v2-tools/${toolDirName}.json`);
  }
  if (checks.hasFixtureFile && !checks.hasFixtureValidJson) {
    failures.push(`Fixture JSON is invalid: tests/fixtures/v2-tools/${toolDirName}.json`);
  }

  if (checks.hasFixtureValidJson) {
    const hostContextId = typeof fixtureJson.hostContextId === "string" ? fixtureJson.hostContextId.trim() : "";
    checks.hasFixtureHostContextId = hostContextId.length > 0;
    if (!checks.hasFixtureHostContextId) {
      failures.push("Fixture must contain non-empty hostContextId.");
    }

    const sessionContext = fixtureJson && typeof fixtureJson.sessionContext === "object" && !Array.isArray(fixtureJson.sessionContext)
      ? fixtureJson.sessionContext
      : null;
    if (!sessionContext) {
      failures.push("Fixture must contain sessionContext object.");
    } else {
      if (toolDirName === "asset-manager-v2") {
        const catalog = sessionContext?.payloadJson?.assetCatalog;
        checks.hasFixtureToolPayload =
          catalog &&
          typeof catalog === "object" &&
          !Array.isArray(catalog) &&
          typeof catalog.name === "string" &&
          catalog.name.trim().length > 0 &&
          Array.isArray(catalog.entries) &&
          catalog.entries.length > 0 &&
          catalog.entries.every((entry) =>
            entry &&
            typeof entry === "object" &&
            !Array.isArray(entry) &&
            typeof entry.id === "string" &&
            entry.id.trim().length > 0 &&
            typeof entry.label === "string" &&
            entry.label.trim().length > 0 &&
            typeof entry.kind === "string" &&
            entry.kind.trim().length > 0 &&
            typeof entry.path === "string" &&
            entry.path.trim().length > 0
          );
      }
      if (toolDirName === "palette-manager-v2") {
        const palette = sessionContext?.paletteJson;
        checks.hasFixtureToolPayload =
          palette &&
          typeof palette === "object" &&
          !Array.isArray(palette) &&
          typeof palette.name === "string" &&
          palette.name.trim().length > 0 &&
          Array.isArray(palette.colors) &&
          palette.colors.length > 0;
      }
      if (toolDirName === "svg-asset-studio-v2") {
        const documentPayload = sessionContext?.payloadJson?.vectorAssetDocument;
        checks.hasFixtureToolPayload =
          documentPayload &&
          typeof documentPayload === "object" &&
          !Array.isArray(documentPayload) &&
          typeof documentPayload.sourceName === "string" &&
          documentPayload.sourceName.trim().length > 0 &&
          typeof documentPayload.svgText === "string" &&
          /^\s*<svg[\s>]/i.test(documentPayload.svgText);
      }
      if (toolDirName === "tilemap-studio-v2") {
        const documentPayload = sessionContext?.payloadJson?.tileMapDocument;
        checks.hasFixtureToolPayload =
          documentPayload &&
          typeof documentPayload === "object" &&
          !Array.isArray(documentPayload) &&
          documentPayload.map &&
          typeof documentPayload.map === "object" &&
          !Array.isArray(documentPayload.map) &&
          typeof documentPayload.map.name === "string" &&
          documentPayload.map.name.trim().length > 0 &&
          Number.isFinite(Number(documentPayload.map.width)) &&
          Number(documentPayload.map.width) > 0 &&
          Number.isFinite(Number(documentPayload.map.height)) &&
          Number(documentPayload.map.height) > 0 &&
          Array.isArray(documentPayload.layers) &&
          documentPayload.layers.length > 0 &&
          documentPayload.layers.every((layer) =>
            layer &&
            typeof layer === "object" &&
            !Array.isArray(layer) &&
            typeof layer.name === "string" &&
            layer.name.trim().length > 0 &&
            typeof layer.kind === "string" &&
            layer.kind.trim().length > 0 &&
            Array.isArray(layer.data)
          );
      }
      if (toolDirName === "vector-map-editor-v2") {
        const documentPayload = sessionContext?.payloadJson?.vectorMapDocument;
        checks.hasFixtureToolPayload =
          documentPayload &&
          typeof documentPayload === "object" &&
          !Array.isArray(documentPayload) &&
          typeof documentPayload.name === "string" &&
          documentPayload.name.trim().length > 0 &&
          Number.isFinite(Number(documentPayload.width)) &&
          Number(documentPayload.width) > 0 &&
          Number.isFinite(Number(documentPayload.height)) &&
          Number(documentPayload.height) > 0 &&
          typeof documentPayload.background === "string" &&
          documentPayload.background.trim().length > 0 &&
          Array.isArray(documentPayload.objects) &&
          documentPayload.objects.length > 0 &&
          documentPayload.objects.every((entry) =>
            entry &&
            typeof entry === "object" &&
            !Array.isArray(entry) &&
            typeof entry.name === "string" &&
            entry.name.trim().length > 0 &&
            typeof entry.kind === "string" &&
            entry.kind.trim().length > 0 &&
            entry.style &&
            typeof entry.style === "object" &&
            !Array.isArray(entry.style) &&
            typeof entry.style.stroke === "string" &&
            entry.style.stroke.trim().length > 0 &&
            Number.isFinite(Number(entry.style.lineWidth)) &&
            Number(entry.style.lineWidth) > 0 &&
            Array.isArray(entry.points) &&
            entry.points.length > 0
          );
      }
      if (!checks.hasFixtureToolPayload) {
        failures.push("Fixture is missing required tool-specific payload.");
      }
    }
  }

  return {
    tool: toolDirName,
    htmlPath: path.relative(repoRoot, htmlPath).replace(/\\/g, "/"),
    jsPath: path.relative(repoRoot, jsPath).replace(/\\/g, "/"),
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    bodyToolId,
    htmlTitle,
    jsDocumentTitle,
    checks,
    failures
  };
}

export function run() {
  const v2Tools = collectV2ToolDirectories();
  assert.ok(v2Tools.length > 0, "No V2 tool directories were found under tools/*-v2.");
  assert.deepEqual(v2Tools, REQUIRED_V2_TOOLS, `Unexpected V2 tool directory set. Expected ${REQUIRED_V2_TOOLS.join(", ")} but found ${v2Tools.join(", ")}.`);

  const rows = v2Tools.map(validateV2Tool);
  const failures = rows.flatMap((row) => row.failures.map((message) => `${row.tool}: ${message}`));

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    toolCount: rows.length,
    failures,
    rows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 tool smoke results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 tool smoke failures: ${failures.join(" | ")}`);
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
