/*
Toolbox Aid
David Quesenberry
04/25/2026

sync-tool-hints-from-workspace-manager.mjs

How to run:
1) npm run sync:tool-hints
   - Sync toolHints into games/metadata/games.index.metadata.json from per-game manifests
2) node ./scripts/sync-tool-hints-from-workspace-manager.mjs --dry-run
   - Validate and print what would change without writing
*/

import fs from "node:fs";
import path from "node:path";
import { getToolRegistry } from "../tools/toolRegistry.js";

const ROOT = process.cwd();
const METADATA_PATH = path.join(ROOT, "games", "metadata", "games.index.metadata.json");

const GAME_ASSET_CATALOG_FILENAME = "workspace.asset-catalog.json";
const GAME_ASSET_CATALOG_SCHEMA = "html-js-gaming.game-asset-catalog";
const GAME_ASSET_CATALOG_VERSION = 1;

const GAME_TOOLS_MANIFEST_FILENAME = "tools.manifest.json";
const GAME_TOOLS_MANIFEST_SCHEMA = "html-js-gaming.game-asset-manifest";
const GAME_TOOLS_MANIFEST_VERSION = 1;

const KIND_TO_TOOL_HINTS = Object.freeze({
  palette: ["palette-browser"],
  skin: ["skin-editor"],
  sprite: ["sprite-editor"],
  tilemap: ["tile-map-editor"],
  parallax: ["parallax-editor"],
  vector: ["vector-asset-studio"],
  image: ["asset-browser"],
  audio: ["asset-browser"],
  video: ["asset-browser"],
  shader: ["asset-browser"],
  data: ["asset-browser"]
});

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeToken(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeToolHints(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const output = [];
  const seen = new Set();
  value.forEach((entry) => {
    const token = normalizeToken(entry);
    if (!token || seen.has(token)) {
      return;
    }
    seen.add(token);
    output.push(token);
  });
  return output;
}

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    throw new Error(`Unknown argument: ${value}`);
  }
  return args;
}

function loadMetadata() {
  if (!fs.existsSync(METADATA_PATH)) {
    throw new Error(`Missing metadata file: ${path.relative(ROOT, METADATA_PATH)}`);
  }
  const metadata = readJson(METADATA_PATH);
  if (!metadata || typeof metadata !== "object" || !Array.isArray(metadata.games)) {
    throw new Error('Metadata must contain a "games" array.');
  }
  return metadata;
}

function normalizeGameHref(value) {
  const href = normalizeText(value).replace(/\\/g, "/");
  if (!href || !href.startsWith("/games/") || href.includes("..")) {
    return "";
  }
  return href;
}

function getGameDirFromHref(gameHref) {
  const href = normalizeGameHref(gameHref);
  if (!href) {
    return "";
  }
  const stripped = href.endsWith("/index.html")
    ? href.slice(0, -"/index.html".length)
    : href.endsWith("/")
      ? href.slice(0, -1)
      : href;
  const relative = stripped.replace(/^\/+/, "");
  if (!relative) {
    return "";
  }
  return path.join(ROOT, relative);
}

function readWorkspaceAssetCatalog(gameDir) {
  if (!gameDir) {
    return { valid: false, reason: "missing-game-dir", kinds: [], assetCount: 0 };
  }

  const catalogPath = path.join(gameDir, "assets", GAME_ASSET_CATALOG_FILENAME);
  if (!fs.existsSync(catalogPath)) {
    return { valid: false, reason: "missing-file", kinds: [], assetCount: 0 };
  }

  try {
    const source = readJson(catalogPath);
    const schema = normalizeText(source?.schema);
    const version = Number(source?.version);
    if (schema !== GAME_ASSET_CATALOG_SCHEMA || version !== GAME_ASSET_CATALOG_VERSION) {
      return { valid: false, reason: "invalid-schema-or-version", kinds: [], assetCount: 0 };
    }

    const assets = source?.assets && typeof source.assets === "object" ? source.assets : {};
    const kinds = [];
    let assetCount = 0;

    Object.values(assets).forEach((entry) => {
      if (!entry || typeof entry !== "object") {
        return;
      }
      const assetPath = normalizeText(entry.path);
      if (!assetPath) {
        return;
      }
      assetCount += 1;
      const kind = normalizeToken(entry.kind);
      if (kind) {
        kinds.push(kind);
      }
    });

    return {
      valid: true,
      reason: "ok",
      kinds: [...new Set(kinds)],
      assetCount
    };
  } catch {
    return { valid: false, reason: "invalid-json", kinds: [], assetCount: 0 };
  }
}

function readGameToolsManifest(gameDir) {
  if (!gameDir) {
    return { valid: false, reason: "missing-game-dir", hints: [] };
  }

  const manifestPath = path.join(gameDir, "assets", GAME_TOOLS_MANIFEST_FILENAME);
  if (!fs.existsSync(manifestPath)) {
    return { valid: false, reason: "missing-file", hints: [] };
  }

  try {
    const source = readJson(manifestPath);
    const schema = normalizeText(source?.schema);
    const version = Number(source?.version);
    if (schema !== GAME_TOOLS_MANIFEST_SCHEMA || version !== GAME_TOOLS_MANIFEST_VERSION) {
      return { valid: false, reason: "invalid-schema-or-version", hints: [] };
    }

    const domains = source?.domains && typeof source.domains === "object" ? source.domains : {};
    const hints = [];
    let hasDomainRecords = false;

    Object.values(domains).forEach((records) => {
      if (!Array.isArray(records) || records.length === 0) {
        return;
      }
      hasDomainRecords = true;
      records.forEach((record) => {
        const sourceToolId = normalizeToken(record?.sourceToolId);
        if (sourceToolId) {
          hints.push(sourceToolId);
        }
      });
    });

    if (hasDomainRecords) {
      hints.push("asset-pipeline-tool");
    }

    return {
      valid: true,
      reason: "ok",
      hints: normalizeToolHints(hints)
    };
  } catch {
    return { valid: false, reason: "invalid-json", hints: [] };
  }
}

function deriveToolHintsFromManifests(catalogInfo, toolsManifestInfo) {
  const derived = [];

  if (catalogInfo.valid) {
    catalogInfo.kinds.forEach((kind) => {
      const mapped = KIND_TO_TOOL_HINTS[kind] || [];
      mapped.forEach((toolId) => derived.push(toolId));
    });

    if (catalogInfo.assetCount > 0) {
      derived.push("asset-browser");
    }
  }

  if (toolsManifestInfo.valid) {
    toolsManifestInfo.hints.forEach((toolId) => derived.push(toolId));
  }

  return normalizeToolHints(derived);
}

function syncToolHints(metadata) {
  const knownToolIds = new Set(getToolRegistry().map((tool) => normalizeToken(tool?.id)).filter(Boolean));
  let updated = 0;
  const warnings = [];

  for (const game of metadata.games) {
    const gameId = normalizeText(game?.id) || "<unknown>";
    const gameDir = getGameDirFromHref(game?.href);
    const existing = normalizeToolHints(game?.toolHints);

    if (!gameDir) {
      warnings.push(`${gameId}: skipped derivation (missing/invalid href)`);
      continue;
    }

    const catalogInfo = readWorkspaceAssetCatalog(gameDir);
    const toolsManifestInfo = readGameToolsManifest(gameDir);

    const hasAnyValidManifest = catalogInfo.valid || toolsManifestInfo.valid;
    if (!hasAnyValidManifest) {
      warnings.push(`${gameId}: no valid manifest source (${GAME_ASSET_CATALOG_FILENAME} / ${GAME_TOOLS_MANIFEST_FILENAME})`);
      continue;
    }

    const next = deriveToolHintsFromManifests(catalogInfo, toolsManifestInfo);
    const invalid = next.filter((toolId) => !knownToolIds.has(toolId));
    if (invalid.length > 0) {
      throw new Error(`${gameId}: unknown tool id(s): ${invalid.join(", ")}`);
    }

    if (JSON.stringify(existing) !== JSON.stringify(next) || !Array.isArray(game.toolHints)) {
      game.toolHints = next;
      updated += 1;
    }
  }

  return { updated, warnings };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const metadata = loadMetadata();
  const result = syncToolHints(metadata);

  if (!args.dryRun) {
    writeJson(METADATA_PATH, metadata);
  }

  const warningText = result.warnings.length ? ` warnings=${result.warnings.length}` : "";
  console.log(`OK updated=${result.updated}${warningText} dryRun=${args.dryRun ? "true" : "false"}`);
  result.warnings.forEach((warning) => {
    console.log(`WARN ${warning}`);
  });
}

try {
  main();
} catch (error) {
  console.error(`FAIL ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
