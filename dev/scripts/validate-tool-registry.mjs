import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getToolRegistry, getVisibleActiveToolRegistry } from "../../www/toolbox/toolRegistry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const toolboxRoot = path.join(repoRoot, "www", "toolbox");
const reportPath = path.join(repoRoot, "dev", "reports", "tool_registry_validation.txt");

const IGNORED_DIRECTORIES = new Set([
  "learn",
  "users",
  "environments",
  "game-migration",
  "platform-settings"
]);

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

async function listActiveToolDirectories() {
  const entries = await fs.readdir(toolboxRoot, { withFileTypes: true });
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
  const visibleActiveEntries = getVisibleActiveToolRegistry();
  const activeToolDirectories = await listActiveToolDirectories();
  const registryFolders = registryEntries.map((entry) => normalizeText(entry.folderName || entry.path));
  const activeToolboxIndexSource = await fs.readFile(path.join(toolboxRoot, "tools-page-accordions.js"), "utf8");

  issues.push(...collectDuplicates(registryEntries.map((entry) => entry.id), "id"));
  issues.push(...collectDuplicates(registryEntries.map((entry) => entry.name || entry.displayName), "name"));
  issues.push(...collectDuplicates(registryFolders, "folder"));

  if (registryEntries.some((entry) => entry.legacy === true || entry.active !== true)) {
    issues.push("toolRegistry.js must contain active toolbox entries only.");
  }
  if (registryEntries.some((entry) => normalizeText(entry.path || entry.entryPoint).includes("archive/v1-v2"))) {
    issues.push("toolRegistry.js must not contain archive/v1-v2 paths.");
  }

  for (const entry of registryEntries) {
    const folderName = normalizeText(entry.folderName || entry.path);
    const entryPoint = normalizeText(entry.entryPoint);
    if (!entry.id) {
      issues.push("Registry entry is missing id.");
    }
    if (!entry.displayName) {
      issues.push(`Registry entry ${entry.id || "(missing id)"} is missing displayName.`);
    }
    if (!folderName) {
      issues.push(`Registry entry ${entry.id || "(missing id)"} is missing folderName.`);
      continue;
    }
    if (entryPoint !== `${folderName}/index.html`) {
      issues.push(`Registry entry ${entry.id} entryPoint must be ${folderName}/index.html.`);
    }
    if (!(await pathExists(path.join(toolboxRoot, folderName, "index.html")))) {
      issues.push(`Registry entry ${entry.id} points to missing toolbox/${folderName}/index.html.`);
    }
  }

  for (const entry of visibleActiveEntries) {
    if (!entry.visibleInToolsList) {
      issues.push(`Visible registry entry ${entry.id} is not marked visibleInToolsList.`);
    }
  }

  if (!activeToolboxIndexSource.includes("getActiveToolRegistry()") || !activeToolboxIndexSource.includes("getToolRoute(registryTool)")) {
    issues.push("toolbox/tools-page-accordions.js must render Toolbox cards from registry routes instead of duplicated literal routes.");
  }

  for (const directory of activeToolDirectories) {
    if (!registryFolders.includes(directory)) {
      issues.push(`Filesystem directory toolbox/${directory} is missing from active toolRegistry.js.`);
    }
  }

  if (visibleActiveEntries.length === 0) {
    issues.push("Visible active tool registry is empty.");
  }

  const reportLines = [
    "TOOL_REGISTRY_VALIDATION",
    `status=${issues.length === 0 ? "PASS" : "FAIL"}`,
    `active=${visibleActiveEntries.map((entry) => normalizeText(entry.displayName)).join(", ")}`,
    formatSection("Filesystem Active Tool Directories", activeToolDirectories),
    formatSection("Registry Folders", registryFolders),
    formatSection("Issues", issues.length > 0 ? issues : ["none"]),
    formatSection("Notes", notes.length > 0 ? notes : ["registry, toolbox folders, and registry-driven toolbox index routes are aligned"])
  ].join("\n");

  await fs.writeFile(reportPath, `${reportLines}\n`, "utf8");

  if (issues.length > 0) {
    console.error("TOOL_REGISTRY_INVALID");
    issues.forEach((issue) => console.error(`- ${issue}`));
    process.exitCode = 1;
    return;
  }

  console.log("TOOL_REGISTRY_VALID");
  visibleActiveEntries.forEach((entry) => console.log(`- ACTIVE ${entry.displayName}`));
  console.log(`- REPORT dev/reports/${path.basename(reportPath)}`);
}

await main();
