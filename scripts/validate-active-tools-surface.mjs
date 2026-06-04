import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const toolboxRoot = path.join(repoRoot, "toolbox");

const ACTIVE_NAV_TARGETS = [
  "assets/theme-v2/partials/header-nav.html",
  "assets/theme-v2/js/gamefoundry-partials.js",
  "toolbox/index.html",
  "toolbox/tools-page-accordions.js"
];

const RETIRED_ACTIVE_PATTERNS = [
  /toolbox\/(?:builder|game-builder)\//i,
  /\btool-builder\b/i,
  /\bgame-builder\b/i,
  /\bGame Builder\b/,
  /\bTool Builder\b/,
  /archive\/v1-v2\//i,
  /toolbox\/(?:configuration-admin|creator)(?:\/|$)/i,
  /toolbox\/(?:shared|dev|schemas)(?:\/|$)/i,
  /toolbox\\(?:shared|dev|schemas)(?:\\|$)/i
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

async function activeToolFolders() {
  const entries = await fs.readdir(toolboxRoot, { withFileTypes: true });
  const folders = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) {
      continue;
    }
    const entryPoint = path.join(toolboxRoot, entry.name, "index.html");
    if (await pathExists(entryPoint)) {
      folders.push(entry.name);
    }
  }
  return folders.sort((left, right) => left.localeCompare(right));
}

function routeForTool(folderName) {
  return `toolbox/${folderName}/index.html`;
}

function accordionRouteForTool(folderName) {
  return `../toolbox/${folderName}/index.html`;
}

async function main() {
  const issues = [];
  const activeTools = await activeToolFolders();

  if (!activeTools.length) {
    issues.push("Active toolbox folders must not be empty.");
  }

  for (const retiredFolder of ["builder", "game-builder", "configuration-admin", "creator", "shared", "dev", "schemas"]) {
    if (await pathExists(path.join(toolboxRoot, retiredFolder))) {
      issues.push(`Retired toolbox folder still present in active toolbox: toolbox/${retiredFolder}`);
    }
  }

  const headerNav = await readText("assets/theme-v2/partials/header-nav.html");
  const partials = await readText("assets/theme-v2/js/gamefoundry-partials.js");
  const toolboxIndex = await readText("toolbox/index.html");
  const toolsAccordions = await readText("toolbox/tools-page-accordions.js");

  for (const folderName of activeTools) {
    const route = routeForTool(folderName);
    const accordionRoute = accordionRouteForTool(folderName);
    if (!headerNav.includes(route)) {
      issues.push(`Active toolbox page missing from header navigation: ${route}`);
    }
    if (!partials.includes(route)) {
      issues.push(`Active toolbox page missing from partial route map: ${route}`);
    }
    if (!toolsAccordions.includes(accordionRoute) && !toolsAccordions.includes(route)) {
      issues.push(`Active toolbox page missing from toolbox index grouping: ${route}`);
    }
  }

  const activeNavigationText = [
    headerNav,
    partials,
    toolboxIndex,
    toolsAccordions
  ].join("\n");

  for (const pattern of RETIRED_ACTIVE_PATTERNS) {
    const match = activeNavigationText.match(pattern);
    if (match) {
      issues.push(`Retired or archived surface exposed in active toolbox wiring: ${match[0]}`);
    }
  }

  if (/title:\s*["']Marketplace["']|href:\s*["'][^"']*marketplace\/index\.html|>\s*Marketplace\s*</i.test(toolboxIndex + "\n" + toolsAccordions)) {
    issues.push("Marketplace must not appear as an active toolbox tile or toolbox index link.");
  }

  if (issues.length > 0) {
    console.error("ACTIVE_TOOLS_SURFACE_INVALID");
    issues.forEach((issue) => console.error(`- ${issue}`));
    process.exitCode = 1;
    return;
  }

  console.log("ACTIVE_TOOLS_SURFACE_VALID");
  console.log(`count=${activeTools.length}`);
  activeTools.forEach((tool) => {
    console.log(`- ${tool} -> ${routeForTool(tool)}`);
  });
}

await main();
