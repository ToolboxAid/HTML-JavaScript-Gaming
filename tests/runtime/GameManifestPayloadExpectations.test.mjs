import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const gamesRoot = path.join(repoRoot, "games");
const summaryPath = path.join(repoRoot, "tmp", "manifest-payload-expectations-results.json");

const DISALLOWED_ROOT_KEYS = new Set(["lineage", "sources", "assets", "palette", "palettes"]);
const LEGACY_PATH_MARKERS = ["workspace.asset-catalog.json", "tools.manifest.json"];

function isObjectRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function collectManifestPaths() {
  const paths = [];
  const entries = fs.readdirSync(gamesRoot, { withFileTypes: true });
  entries
    .filter((entry) => entry.isDirectory())
    .forEach((entry) => {
      const manifestPath = path.join(gamesRoot, entry.name, "game.manifest.json");
      if (fs.existsSync(manifestPath)) {
        paths.push(manifestPath);
      }
    });
  return paths;
}

function normalizeGameFolderFromPath(manifestPath) {
  return path.basename(path.dirname(manifestPath));
}

function getToolDataCount(toolSection, key) {
  const value = toolSection?.[key];
  if (Array.isArray(value)) {
    return value.length;
  }
  if (isObjectRecord(value)) {
    return Object.keys(value).length;
  }
  return 0;
}

function findSourcePathKeys(value, currentPath = "$") {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => findSourcePathKeys(entry, `${currentPath}[${index}]`));
  }
  if (!isObjectRecord(value)) {
    return [];
  }
  const hits = [];
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${currentPath}.${key}`;
    if (key === "sourcePath") {
      hits.push(childPath);
    }
    hits.push(...findSourcePathKeys(child, childPath));
  }
  return hits;
}

function findLegacyRefs(value, currentPath = "$") {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => findLegacyRefs(entry, `${currentPath}[${index}]`));
  }
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    return LEGACY_PATH_MARKERS.some((marker) => lower.includes(marker.toLowerCase()))
      ? [currentPath]
      : [];
  }
  if (!isObjectRecord(value)) {
    return [];
  }
  const hits = [];
  for (const [key, child] of Object.entries(value)) {
    hits.push(...findLegacyRefs(child, `${currentPath}.${key}`));
  }
  return hits;
}

function validateToolMetadata(tools, gameId) {
  const failures = [];
  if (!isObjectRecord(tools)) {
    failures.push(`Game ${gameId}: tools must be an object.`);
    return failures;
  }
  for (const [toolId, section] of Object.entries(tools)) {
    if (!isObjectRecord(section)) {
      failures.push(`Game ${gameId}: tools.${toolId} must be an object.`);
      continue;
    }
    if (typeof section.schema !== "string" || !section.schema.trim()) {
      failures.push(`Game ${gameId}: tools.${toolId}.schema is required.`);
    }
    if (!Number.isFinite(Number(section.version))) {
      failures.push(`Game ${gameId}: tools.${toolId}.version is required.`);
    }
    if (typeof section.name !== "string" || !section.name.trim()) {
      failures.push(`Game ${gameId}: tools.${toolId}.name is required.`);
    }
    if (typeof section.source !== "string" || !section.source.trim()) {
      failures.push(`Game ${gameId}: tools.${toolId}.source is required.`);
    }
    if (toolId !== "palette-browser") {
      if (Object.prototype.hasOwnProperty.call(section, "palette")) {
        failures.push(`Game ${gameId}: tools.${toolId}.palette is not allowed (singleton belongs to tools.palette-browser.palette).`);
      }
      if (Object.prototype.hasOwnProperty.call(section, "palettes")) {
        failures.push(`Game ${gameId}: tools.${toolId}.palettes is not allowed (singleton belongs to tools.palette-browser.palette).`);
      }
    }
  }
  return failures;
}

export async function run() {
  const manifestPaths = collectManifestPaths();
  assert.ok(manifestPaths.length > 0, "No game.manifest.json files were discovered.");

  const failures = [];
  const rows = [];

  for (const manifestPath of manifestPaths) {
    const gameFolder = normalizeGameFolderFromPath(manifestPath);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const text = JSON.stringify(manifest);
    const rootKeys = Object.keys(manifest);

    const row = {
      gameFolder,
      manifestPath: path.relative(repoRoot, manifestPath).replace(/\\/g, "/"),
      rootKeys,
      tools: Object.keys(manifest.tools || {}),
      sourcePathHits: 0,
      legacyRefHits: 0,
      hasPaletteBrowserSingleton: false
    };

    for (const disallowedKey of DISALLOWED_ROOT_KEYS) {
      if (Object.prototype.hasOwnProperty.call(manifest, disallowedKey)) {
        failures.push(`Game ${gameFolder}: root key "${disallowedKey}" is not allowed.`);
      }
    }

    const sourcePathHits = findSourcePathKeys(manifest);
    row.sourcePathHits = sourcePathHits.length;
    sourcePathHits.forEach((hit) => failures.push(`Game ${gameFolder}: sourcePath key found at ${hit}.`));

    const legacyRefHits = findLegacyRefs(manifest);
    row.legacyRefHits = legacyRefHits.length;
    legacyRefHits.forEach((hit) => failures.push(`Game ${gameFolder}: legacy catalog/tools manifest reference found at ${hit}.`));

    failures.push(...validateToolMetadata(manifest.tools, gameFolder));

    const paletteSingleton = manifest?.tools?.["palette-browser"]?.palette;
    if (!isObjectRecord(paletteSingleton)) {
      failures.push(`Game ${gameFolder}: tools["palette-browser"].palette is required.`);
    } else {
      const swatches = paletteSingleton.swatches;
      if (!Array.isArray(swatches) || swatches.length === 0) {
        failures.push(`Game ${gameFolder}: tools["palette-browser"].palette.swatches must contain at least one swatch.`);
      }
      row.hasPaletteBrowserSingleton = true;
    }

    if (gameFolder.toLowerCase() === "asteroids") {
      const vectors = manifest?.tools?.["vector-asset-studio"]?.vectors;
      const vectorCount = Array.isArray(vectors)
        ? vectors.length
        : (isObjectRecord(vectors) ? Object.keys(vectors).length : 0);
      row.asteroidsVectorCount = vectorCount;
      if (vectorCount <= 0) {
        failures.push("Asteroids: tools[\"vector-asset-studio\"].vectors must contain actual vector assets.");
      }
      if (Object.prototype.hasOwnProperty.call(manifest.tools || {}, "sprite-editor")) {
        failures.push("Asteroids: tools[\"sprite-editor\"] must be removed when no sprite payload exists.");
      }
      if (Object.prototype.hasOwnProperty.call(manifest.tools || {}, "tile-map-editor")) {
        failures.push("Asteroids: tools[\"tile-map-editor\"] must be removed when no tilemap payload exists.");
      }
      if (Object.prototype.hasOwnProperty.call(manifest.tools || {}, "parallax-editor")) {
        failures.push("Asteroids: tools[\"parallax-editor\"] must be removed when no parallax payload exists.");
      }
      if (Object.prototype.hasOwnProperty.call(manifest?.tools?.["vector-asset-studio"] || {}, "libraries")) {
        failures.push("Asteroids: tools[\"vector-asset-studio\"].libraries must be removed when only reference/index metadata exists.");
      }
    }

    if (gameFolder.toLowerCase() === "bouncing-ball") {
      const skinsCount = getToolDataCount(manifest?.tools?.["primitive-skin-editor"], "skins");
      row.bouncingBallSkinCount = skinsCount;
      if (skinsCount <= 0) {
        failures.push("Bouncing-ball: tools[\"primitive-skin-editor\"].skins must contain at least one skin payload.");
      }
      if (/assets\/palettes\/.*\.json/i.test(text) || /assets\/skins\/.*\.json/i.test(text)) {
        failures.push("Bouncing-ball: stale external palette/skin JSON path references must be removed.");
      }
      if (Object.prototype.hasOwnProperty.call(manifest, "lineage")
        || Object.prototype.hasOwnProperty.call(manifest, "sources")
        || Object.prototype.hasOwnProperty.call(manifest, "assets")) {
        failures.push("Bouncing-ball: root lineage/sources/assets must be removed.");
      }
    }

    rows.push(row);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    manifestsChecked: rows.length,
    failures,
    rows
  };

  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(`manifest payload report: ${summaryPath}`);

  assert.equal(failures.length, 0, `Manifest payload expectations failed: ${failures.join(" | ")}`);
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run()
    .then((summary) => {
      console.log(JSON.stringify(summary, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
