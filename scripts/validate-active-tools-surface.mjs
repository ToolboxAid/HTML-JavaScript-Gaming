import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  TOOL_NAME_SUFFIX_PATTERN,
  getToolRegistry,
  getVisibleActiveToolRegistry
} from "../tools/toolRegistry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const REQUIRED_ACTIVE_TOOL_NAMES = [
  "Vector Map Editor",
  "Vector Asset Studio",
  "Tile Map Editor",
  "Parallax Editor",
  "Sprite Editor"
];

const SCAN_TARGETS = [
  "tools/index.html",
  "tools/renderToolsIndex.js",
  "docs/pr/BUILD_PR_TOOLS_REGISTRY_AND_SPRITE_RENAME.md",
  "docs/dev/reports/validation_checklist.txt",
  "docs/dev/reports/change_summary.txt",
  "docs/dev/reports/file_tree.txt",
  "docs/dev/commit_comment.txt"
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

  if (JSON.stringify(activeNames) !== JSON.stringify(REQUIRED_ACTIVE_TOOL_NAMES)) {
    issues.push(`Active tool names do not match the approved list. Found: ${activeNames.join(", ")}`);
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
  }

  const visibleLegacyTools = toolRegistry.filter((tool) => tool.status === "legacy" && tool.visibleInToolsList === true);
  if (visibleLegacyTools.length > 0) {
    issues.push(`Legacy tools appear in active navigation: ${visibleLegacyTools.map((tool) => tool.displayName).join(", ")}`);
  }

  for (const target of SCAN_TARGETS) {
    const text = await readText(target);
    if (/Sprite Editor V3|tools\/Sprite Editor V3|tools\\Sprite Editor V3/.test(text)) {
      issues.push(`Stale Sprite Editor V3 reference detected in ${target}`);
    }
  }

  for (const target of NAVIGATION_SURFACE_TARGETS) {
    const text = await readText(target);
    if (/SpriteEditor_old_keep/.test(text)) {
      issues.push(`Legacy tool appears in active navigation/report surface: ${target}`);
    }
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
