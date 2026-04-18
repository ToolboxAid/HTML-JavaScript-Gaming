import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  TOOL_NAME_SUFFIX_PATTERN,
  getToolRegistry,
  getToolById,
  getVisibleActiveToolRegistry
} from "../tools/toolRegistry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const toolsRoot = path.join(repoRoot, "tools");
const REQUIRED_SCAN_TARGETS = [
  "tools/index.html",
  "tools/renderToolsIndex.js",
  "tools/shared/platformShell.js",
  "tools/shared/platformShell.css",
  "tools/shared/assetUsageIntegration.js"
];
const OPTIONAL_SCAN_TARGETS = [
  "docs/pr/BUILD_PR_VECTOR_SHOWCASE_AND_GEOMETRY_RUNTIME_FINAL.md",
  "docs/specs/asset_usage_contract.md",
  "docs/dev/commit_comment.txt",
  "docs/dev/reports/tool_registry_validation.txt"
];

const NAVIGATION_SURFACE_TARGETS = [
  "tools/index.html",
  "tools/renderToolsIndex.js"
];

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readText(targetPath) {
  return fs.readFile(path.join(repoRoot, targetPath), "utf8");
}

async function main() {
  const issues = [];
  const toolRegistry = getToolRegistry();
  const visibleActiveTools = getVisibleActiveToolRegistry();
  const activeNames = visibleActiveTools.map((tool) => tool.displayName);

  if (visibleActiveTools.length === 0) {
    issues.push("Visible active tool registry must not be empty.");
  }

  for (const tool of visibleActiveTools) {
    const folderPath = path.join(repoRoot, "tools", tool.folderName);
    const entryPointPath = path.join(repoRoot, "tools", tool.entryPoint);
    if (!(await pathExists(folderPath))) {
      issues.push(`Missing active tool folder: tools/${tool.folderName}`);
    }
    if (!(await pathExists(entryPointPath))) {
      issues.push(`Missing active tool entry point: tools/${tool.entryPoint}`);
    }
    if (TOOL_NAME_SUFFIX_PATTERN.test(tool.displayName) || TOOL_NAME_SUFFIX_PATTERN.test(tool.folderName)) {
      issues.push(`Disallowed active naming suffix detected for ${tool.displayName} (${tool.folderName}).`);
    }
    const sampleEntryPoints = Array.isArray(tool.sampleEntryPoints) ? tool.sampleEntryPoints : [];
    for (const sampleEntry of sampleEntryPoints) {
      const samplePath = path.resolve(toolsRoot, sampleEntry.path);
      if (!(await pathExists(samplePath))) {
        issues.push(`Missing showcase sample/help entry point for ${tool.displayName}: ${sampleEntry.path}`);
      }
    }
  }

  const visibleLegacyTools = toolRegistry.filter((tool) => tool.legacy === true && tool.visibleInToolsList === true);
  if (visibleLegacyTools.length > 0) {
    issues.push(`Legacy tools appear in active navigation: ${visibleLegacyTools.map((tool) => tool.displayName).join(", ")}`);
  }

  const preservedSpriteTool = getToolById("sprite-editor");
  if (preservedSpriteTool?.active !== true || preservedSpriteTool?.visibleInToolsList !== true) {
    issues.push("Sprite Editor must be active and visible in the first-class tool surface.");
  }

  const legacySpriteTool = getToolById("sprite-editor-old-keep");
  if (legacySpriteTool?.active === true || legacySpriteTool?.visibleInToolsList === true) {
    issues.push("SpriteEditor_old_keep must stay hidden from the first-class tool surface.");
  }

  for (const target of REQUIRED_SCAN_TARGETS) {
    if (!(await pathExists(path.join(repoRoot, target)))) {
      issues.push(`Missing required validation target: ${target}`);
      continue;
    }
    const text = await readText(target);
    if (/Sprite Editor V3|tools\/Sprite Editor V3|tools\\Sprite Editor V3/.test(text)) {
      issues.push(`Stale Sprite Editor V3 reference detected in ${target}`);
    }
  }
  for (const target of OPTIONAL_SCAN_TARGETS) {
    if (!(await pathExists(path.join(repoRoot, target)))) {
      continue;
    }
    const text = await readText(target);
    if (/Sprite Editor V3|tools\/Sprite Editor V3|tools\\Sprite Editor V3/.test(text)) {
      issues.push(`Stale Sprite Editor V3 reference detected in optional target ${target}`);
    }
  }

  const assetUsageIntegration = await readText("tools/shared/assetUsageIntegration.js");
  for (const label of ["Browse Assets", "Import Assets", "Browse Palettes", "Manage Palettes"]) {
    if (!assetUsageIntegration.includes(label)) {
      issues.push(`Shared asset usage action label missing from assetUsageIntegration.js: ${label}`);
    }
  }
  if (!assetUsageIntegration.includes("toolboxaid.shared.assetHandoff")) {
    issues.push("Shared asset handoff storage key missing from assetUsageIntegration.js");
  }
  if (!assetUsageIntegration.includes("toolboxaid.shared.paletteHandoff")) {
    issues.push("Shared palette handoff storage key missing from assetUsageIntegration.js");
  }

  for (const target of NAVIGATION_SURFACE_TARGETS) {
    const text = await readText(target);
    if (/SpriteEditor_old_keep|Sprite Editor Legacy/.test(text)) {
      issues.push(`Legacy tool appears in active navigation/report surface: ${target}`);
    }
  }

  for (const tool of visibleActiveTools) {
    const target = `tools/${tool.entryPoint}`;
    const text = await readText(target);
    if (!text.includes("../../src/engine/ui/hubCommon.css")) {
      issues.push(`Engine theme stylesheet missing from active tool page: ${target}`);
    }
    if (!text.includes("../shared/platformShell.css")) {
      issues.push(`Shared platform shell stylesheet missing from active tool page: ${target}`);
    }
    if (!text.includes("../shared/platformShell.js")) {
      issues.push(`Shared platform shell module missing from active tool page: ${target}`);
    }
  }

  const toolsLandingPage = await readText("tools/index.html");
  if (/Asset Browser \/ Import Helper/.test(toolsLandingPage)) {
    issues.push('Stale "Asset Browser / Import Helper" placeholder remains on tools landing page.');
  }
  if (/Palette Browser \/ Manager/.test(toolsLandingPage)) {
    issues.push('Palette Browser / Manager should be registry-rendered, not left behind as a static placeholder card.');
  }
  if (/Asset Browser \/ Import Hub/.test(toolsLandingPage)) {
    issues.push('Asset Browser / Import Hub should be registry-rendered, not left behind as a static placeholder card.');
  }
  if (!toolsLandingPage.includes("../src/engine/ui/hubCommon.css")) {
    issues.push("Engine theme stylesheet missing from tools landing page.");
  }
  if (!toolsLandingPage.includes("./shared/platformShell.css")) {
    issues.push("Shared platform shell stylesheet missing from tools landing page.");
  }
  if (!toolsLandingPage.includes("./shared/platformShell.js")) {
    issues.push("Shared platform shell module missing from tools landing page.");
  }

  if (issues.length > 0) {
    console.error("ACTIVE_TOOLS_SURFACE_INVALID");
    issues.forEach((issue) => console.error(`- ${issue}`));
    process.exitCode = 1;
    return;
  }

  console.log("ACTIVE_TOOLS_SURFACE_VALID");
  visibleActiveTools.forEach((tool) => {
    console.log(`- ${tool.displayName} -> tools/${tool.entryPoint}`);
  });
}

await main();
