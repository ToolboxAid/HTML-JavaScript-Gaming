import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const STRATEGY_PATH = "docs/specs/asset_ownership_strategy.md";
const REGISTRY_PATH = "docs/specs/shared_asset_promotion_registry.json";
const ASTEROIDS_MANIFEST_PATH = "games/Asteroids/assets/tools.manifest.json";
const TEMPLATE_MANIFEST_PATH = "games/_template/assets/tools.manifest.json";
const SAMPLE_ASSET_BROWSER_SCENE_PATH = "samples/phase-15/1505/AssetBrowserScene.js";
const TOOL_DEMO_PROJECT_ASSETS_PATH = "tools/shared/samples/project-asset-registry-demo/project.assets.json";
const REPORT_PATH = "docs/dev/reports/asset_ownership_strategy_validation.txt";

function toRepoPath(value) {
  return String(value || "").replace(/\\/g, "/");
}

function toAbsolutePath(repoPath) {
  return path.resolve(repoRoot, repoPath);
}

async function readJson(repoPath) {
  const content = await fs.readFile(toAbsolutePath(repoPath), "utf8");
  return JSON.parse(content);
}

async function pathExists(repoPath) {
  try {
    await fs.access(toAbsolutePath(repoPath));
    return true;
  } catch {
    return false;
  }
}

function ownerPrefixForPath(repoPath) {
  const normalized = toRepoPath(repoPath);
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length < 2) {
    return "";
  }
  if (segments[0] === "games" && segments.length >= 2) {
    return `games/${segments[1]}`;
  }
  if (segments[0] === "samples" && segments.length >= 3) {
    return `samples/${segments[1]}/${segments[2]}`;
  }
  if (segments[0] === "tools" && segments.length >= 2) {
    // keep demo ownership under the tool/demo root path depth
    if (segments[1] === "shared" && segments.length >= 5 && segments[2] === "samples") {
      return `tools/shared/samples/${segments[3]}`;
    }
    return `tools/${segments[1]}`;
  }
  return "";
}

function isLocalOrPromotedAssetPath(assetPath, ownerPrefix, promotedSet) {
  const normalized = toRepoPath(assetPath);
  if (!normalized) {
    return false;
  }
  return normalized.startsWith(`${ownerPrefix}/`) || promotedSet.has(normalized);
}

function collectSampleAssetPaths(sceneSource) {
  const paths = [];
  const assetEntryPattern = /path:\s*['"]([^'"]+)['"]/g;
  let match = assetEntryPattern.exec(sceneSource);
  while (match) {
    paths.push(match[1]);
    match = assetEntryPattern.exec(sceneSource);
  }
  return paths;
}

function collectProjectAssetEntries(projectAssets) {
  const buckets = ["sprites", "tilesets", "images", "parallaxSources"];
  const entries = [];
  for (const bucket of buckets) {
    const records = Array.isArray(projectAssets?.[bucket]) ? projectAssets[bucket] : [];
    for (const record of records) {
      entries.push({
        bucket,
        id: record?.id || "",
        path: toRepoPath(record?.path || "")
      });
    }
  }
  return entries;
}

function validateAsteroidsManifest(asteroidsManifest, issues) {
  const domains = asteroidsManifest?.domains || {};
  for (const [domain, entries] of Object.entries(domains)) {
    if (!Array.isArray(entries)) {
      issues.push(`Asteroids manifest domain is not an array: ${domain}`);
      continue;
    }
    for (const entry of entries) {
      const runtimePath = toRepoPath(entry?.runtimePath || "");
      const toolDataPath = toRepoPath(entry?.toolDataPath || "");
      if (!runtimePath.startsWith("games/Asteroids/assets/")) {
        issues.push(`Asteroids runtime path is not game-local: ${runtimePath}`);
      }
      if (!toolDataPath.startsWith("games/Asteroids/assets/")) {
        issues.push(`Asteroids tool-data path is not game-local: ${toolDataPath}`);
      }
      if (runtimePath.includes("/data/")) {
        issues.push(`Asteroids runtime path should not reference /data/: ${runtimePath}`);
      }
    }
  }
}

function validateTemplateManifest(templateManifest, issues) {
  if (templateManifest?.gameId !== "_template") {
    issues.push("Template manifest gameId must be _template.");
  }
  const domains = templateManifest?.domains || {};
  for (const required of ["sprites", "tilemaps", "parallax", "vectors"]) {
    if (!Array.isArray(domains?.[required])) {
      issues.push(`Template manifest missing domain array: ${required}`);
    }
  }
}

export async function validateAssetOwnershipStrategy({ emitLogs = true } = {}) {
  const issues = [];
  const notes = [];

  if (!(await pathExists(STRATEGY_PATH))) {
    issues.push(`Missing strategy doc: ${STRATEGY_PATH}`);
  } else {
    notes.push(`Strategy doc present: ${STRATEGY_PATH}`);
  }

  let promotedSet = new Set();
  if (!(await pathExists(REGISTRY_PATH))) {
    issues.push(`Missing promotion registry: ${REGISTRY_PATH}`);
  } else {
    const registry = await readJson(REGISTRY_PATH);
    const promoted = Array.isArray(registry?.promotedAssets) ? registry.promotedAssets : [];
    promotedSet = new Set(promoted.map((entry) => toRepoPath(entry?.path || entry)));
    notes.push(`Promotion registry present: ${REGISTRY_PATH}`);
  }

  const asteroidsManifest = await readJson(ASTEROIDS_MANIFEST_PATH);
  validateAsteroidsManifest(asteroidsManifest, issues);
  notes.push(`Validated game ownership manifest: ${ASTEROIDS_MANIFEST_PATH}`);

  const templateManifest = await readJson(TEMPLATE_MANIFEST_PATH);
  validateTemplateManifest(templateManifest, issues);
  notes.push(`Validated template ownership manifest: ${TEMPLATE_MANIFEST_PATH}`);

  const sampleSource = await fs.readFile(toAbsolutePath(SAMPLE_ASSET_BROWSER_SCENE_PATH), "utf8");
  const sampleAssetPaths = collectSampleAssetPaths(sampleSource);
  const sampleOwnerPrefix = "samples/phase-15/1505";
  if (sampleAssetPaths.length === 0) {
    issues.push(`No sample asset paths detected in ${SAMPLE_ASSET_BROWSER_SCENE_PATH}`);
  }
  for (const samplePath of sampleAssetPaths) {
    if (!isLocalOrPromotedAssetPath(samplePath, sampleOwnerPrefix, promotedSet)) {
      issues.push(`Sample asset path is not local or promoted: ${samplePath}`);
    }
    if (!(await pathExists(samplePath))) {
      issues.push(`Sample asset path does not exist: ${samplePath}`);
    }
  }
  notes.push(`Validated sample ownership path: ${SAMPLE_ASSET_BROWSER_SCENE_PATH}`);

  const projectAssets = await readJson(TOOL_DEMO_PROJECT_ASSETS_PATH);
  const toolDemoEntries = collectProjectAssetEntries(projectAssets);
  const toolDemoOwnerPrefix = "tools/shared/samples/project-asset-registry-demo";
  const seenPaths = new Set();
  for (const entry of toolDemoEntries) {
    if (!entry.path) {
      issues.push(`Tool demo asset path is empty: ${entry.bucket}/${entry.id}`);
      continue;
    }
    if (!isLocalOrPromotedAssetPath(entry.path, toolDemoOwnerPrefix, promotedSet)) {
      issues.push(`Tool demo asset path is not local or promoted: ${entry.path}`);
    }
    if (!(await pathExists(entry.path))) {
      issues.push(`Tool demo asset path does not exist: ${entry.path}`);
    }
    if (seenPaths.has(entry.path)) {
      issues.push(`Tool demo duplicates asset path across entries: ${entry.path}`);
    }
    seenPaths.add(entry.path);
  }
  if (toRepoPath(projectAssets?.basePath || "") !== toolDemoOwnerPrefix) {
    issues.push(`Tool demo basePath must match owner root: ${toolDemoOwnerPrefix}`);
  }
  notes.push(`Validated tool demo ownership path: ${TOOL_DEMO_PROJECT_ASSETS_PATH}`);

  const reportLines = [
    "BUILD_PR_LEVEL_10_26 asset ownership strategy validation report",
    "",
    issues.length === 0 ? "STATUS: PASS" : "STATUS: FAIL",
    "",
    "Checks:",
    ...notes.map((note) => `- ${note}`),
    "",
    "Issues:",
    ...(issues.length > 0 ? issues.map((issue) => `- ${issue}`) : ["- none"])
  ];

  await fs.writeFile(toAbsolutePath(REPORT_PATH), `${reportLines.join("\n")}\n`, "utf8");

  if (emitLogs) {
    if (issues.length > 0) {
      console.error("ASSET_OWNERSHIP_STRATEGY_INVALID");
      for (const issue of issues) {
        console.error(`- ${issue}`);
      }
    } else {
      console.log("ASSET_OWNERSHIP_STRATEGY_VALID");
      console.log(`Report: ${REPORT_PATH}`);
    }
  }

  return {
    status: issues.length > 0 ? "invalid" : "valid",
    issues,
    notes,
    reportPath: REPORT_PATH
  };
}

async function main() {
  const result = await validateAssetOwnershipStrategy({ emitLogs: true });
  if (result.status !== "valid") {
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  await main();
}
