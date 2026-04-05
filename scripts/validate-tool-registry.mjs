import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getToolRegistry } from "../tools/toolRegistry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const toolsRoot = path.join(repoRoot, "tools");
const reportPath = path.join(repoRoot, "docs", "dev", "reports", "tool_registry_validation.txt");

const EXPECTED_ACTIVE_NAMES = [
  "Vector Map Editor",
  "Vector Asset Studio",
  "Tilemap Studio",
  "Parallax Scene Studio",
  "Sprite Editor"
];

const EXPECTED_LEGACY_NAMES = [
  "SpriteEditor_old_keep"
];

const IGNORED_DIRECTORIES = new Set(["shared"]);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function collectDuplicates(values, label) {
  const seen = new Map();
  const duplicates = [];
  values.forEach((value) => {
    const key = normalizeText(value);
    if (!key) {
      return;
    }
    seen.set(key, (seen.get(key) || 0) + 1);
  });
  for (const [key, count] of seen.entries()) {
    if (count > 1) {
      duplicates.push(`${label} duplicate: ${key}`);
    }
  }
  return duplicates;
}

async function listToolDirectories() {
  const entries = await fs.readdir(toolsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !IGNORED_DIRECTORIES.has(name))
    .sort();
}

function formatSection(title, lines) {
  return [
    title,
    ...lines.map((line) => `- ${line}`)
  ].join("\n");
}

async function main() {
  const issues = [];
  const notes = [];
  const registryEntries = getToolRegistry();
  const toolDirectories = await listToolDirectories();
  const registryPaths = registryEntries.map((entry) => normalizeText(entry.path || entry.folderName));
  const activeEntries = registryEntries.filter((entry) => entry.active === true);
  const activeNames = activeEntries.map((entry) => normalizeText(entry.name || entry.displayName));
  const legacyEntries = registryEntries.filter((entry) => entry.legacy === true);

  issues.push(...collectDuplicates(registryEntries.map((entry) => entry.id), "id"));
  issues.push(...collectDuplicates(registryEntries.map((entry) => entry.name || entry.displayName), "name"));
  issues.push(...collectDuplicates(registryPaths, "path"));

  for (const entry of registryEntries) {
    const folderName = normalizeText(entry.path || entry.folderName);
    const entryPoint = normalizeText(entry.entryPoint);
    if (!folderName) {
      issues.push(`Registry entry ${entry.id} is missing a folder path.`);
      continue;
    }
    if (!(await pathExists(path.join(toolsRoot, folderName)))) {
      issues.push(`Registry entry ${entry.id} points to missing folder tools/${folderName}`);
    }
    if (entryPoint && !(await pathExists(path.join(toolsRoot, entryPoint)))) {
      issues.push(`Registry entry ${entry.id} points to missing entry file tools/${entryPoint}`);
    }
  }

  for (const directory of toolDirectories) {
    if (!registryPaths.includes(directory)) {
      issues.push(`Filesystem directory tools/${directory} is missing from toolRegistry.js`);
    }
  }

  for (const expectedName of EXPECTED_ACTIVE_NAMES) {
    if (!activeNames.includes(expectedName)) {
      issues.push(`Expected active tool missing or inactive: ${expectedName}`);
    }
  }

  const spriteEditor = registryEntries.find((entry) => normalizeText(entry.name || entry.displayName) === "Sprite Editor");
  if (!spriteEditor) {
    issues.push("Sprite Editor is missing from toolRegistry.js");
  } else {
    if (spriteEditor.active !== true) {
      issues.push("Sprite Editor must be active === true.");
    }
    if (spriteEditor.legacy === true) {
      issues.push("Sprite Editor must not be legacy.");
    }
  }

  const legacySprite = registryEntries.find((entry) => normalizeText(entry.path || entry.folderName) === "SpriteEditor_old_keep");
  if (!legacySprite) {
    issues.push("SpriteEditor_old_keep is missing from toolRegistry.js");
  } else {
    if (legacySprite.active === true) {
      issues.push("SpriteEditor_old_keep must not be active.");
    }
    if (legacySprite.legacy !== true) {
      issues.push("SpriteEditor_old_keep must be marked legacy === true.");
    }
  }

  for (const expectedLegacyName of EXPECTED_LEGACY_NAMES) {
    if (!legacyEntries.some((entry) => normalizeText(entry.name || entry.displayName) === expectedLegacyName)) {
      issues.push(`Expected legacy tool missing or not marked legacy: ${expectedLegacyName}`);
    }
  }

  if (activeEntries.some((entry) => normalizeText(entry.path || entry.folderName) === "SpriteEditor_old_keep")) {
    issues.push("Active registry entries must not include SpriteEditor_old_keep.");
  }

  const reportLines = [
    "TOOL_REGISTRY_VALIDATION",
    `status=${issues.length === 0 ? "PASS" : "FAIL"}`,
    `active=${activeNames.join(", ")}`,
    `legacy=${legacyEntries.map((entry) => normalizeText(entry.name || entry.displayName)).join(", ")}`,
    formatSection("Filesystem Directories", toolDirectories),
    formatSection("Registry Paths", registryPaths),
    formatSection("Issues", issues.length > 0 ? issues : ["none"]),
    formatSection("Notes", notes.length > 0 ? notes : ["registry and filesystem are aligned"])
  ].join("\n");

  await fs.writeFile(reportPath, `${reportLines}\n`, "utf8");

  if (issues.length > 0) {
    console.error("TOOL_REGISTRY_INVALID");
    issues.forEach((issue) => console.error(`- ${issue}`));
    process.exitCode = 1;
    return;
  }

  console.log("TOOL_REGISTRY_VALID");
  activeNames.forEach((name) => console.log(`- ACTIVE ${name}`));
  console.log(`- REPORT docs/dev/reports/${path.basename(reportPath)}`);
}

await main();
