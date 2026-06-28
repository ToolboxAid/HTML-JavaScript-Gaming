import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const toolboxRoot = path.join(repoRoot, "www", "toolbox");
const NON_TOOLBOX_PAGE_FOLDERS = new Set([
  "learn",
  "users",
  "environments",
  "game-migration",
  "platform-settings"
]);

const ACTIVE_NAV_TARGETS = [
  "www/assets/theme-v2/partials/header-nav.html",
  "www/assets/theme-v2/js/gamefoundry-partials.js",
  "www/toolbox/index.html",
  "www/toolbox/tools-page-accordions.js"
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
    if (!entry.isDirectory() || entry.name.startsWith("_") || NON_TOOLBOX_PAGE_FOLDERS.has(entry.name)) {
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

  const headerNav = await readText("www/assets/theme-v2/partials/header-nav.html");
  const partials = await readText("www/assets/theme-v2/js/gamefoundry-partials.js");
  const toolboxIndex = await readText("www/toolbox/index.html");
  const toolsAccordions = await readText("www/toolbox/tools-page-accordions.js");
  const toolRegistry = await readText("www/toolbox/toolRegistry.js");

  for (const folderName of activeTools) {
    const route = routeForTool(folderName);
    const accordionRoute = accordionRouteForTool(folderName);
    if (!headerNav.includes(route)) {
      issues.push(`Active toolbox page missing from header navigation: ${route}`);
    }
    if (!partials.includes(route)) {
      issues.push(`Active toolbox page missing from partial route map: ${route}`);
    }
  }

  if (!toolsAccordions.includes("getActiveToolRegistry()") || !toolsAccordions.includes("getToolRoute(registryTool)")) {
    issues.push("Toolbox index grouping must be registry-driven through active tool registry routes.");
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

  if (/>\s*Arcade\s*</i.test(toolboxIndex) || /title:\s*["']Arcade["']/i.test(toolsAccordions)) {
    issues.push("Arcade must not appear as an active toolbox tile or toolbox index label.");
  }

  if (/<button[^>]+data-tools-view="progress"[^>]*>\s*Progress\s*<\/button>/i.test(toolboxIndex)) {
    issues.push("Toolbox index must not expose the removed Game Progress view mode control.");
  }
  if (!/<button[^>]+data-tools-view="build-path"[^>]*>\s*Build Path\s*<\/button>/i.test(toolboxIndex)) {
    issues.push("Toolbox index is missing the Build Path view mode control.");
  }
  if (!/data-tools-count/.test(toolboxIndex) || !/Tool Count:/.test(toolboxIndex + "\n" + toolsAccordions)) {
    issues.push("Toolbox index must expose a visible Tool Count control tied to current role filtering.");
  }
  if (!/GUEST VIEW/.test(toolboxIndex + "\n" + toolsAccordions) || !/"guest"/.test(toolsAccordions)) {
    issues.push("Toolbox role simulation must support an explicit Guest view.");
  }
  for (const groupName of ["Create", "Build", "Content", "Media", "Test", "Share", "Account"]) {
    if (!toolRegistry.includes(`"toolboxGroup": "${groupName}"`) || !headerNav.includes(`${groupName} &#9656;`)) {
      issues.push(`Toolbox creator-goal group is missing from active wiring: ${groupName}.`);
    }
  }
  if (/"toolboxGroup": "(?:Planning|Media & Audio|Build & Test|Share & Community|Hidden Capability|Admin Tools)"/.test(toolRegistry)) {
    issues.push("Toolbox index must use creator-goal groups instead of legacy technical grouping labels.");
  }
  if (/data-toolbox-admin-nav-group/.test(headerNav + "\n" + toolsAccordions) || /<a[^>]*data-toolbox-menu-group-label[^>]*>\s*Admin\s*&#9656;/.test(headerNav)) {
    issues.push("Admin must not appear as a Toolbox group.");
  }
  if (!/<a[^>]+data-route="admin"[^>]+href="admin\/site-settings\.html"[^>]*>Admin &#9662;<\/a>/.test(headerNav)) {
    issues.push("One top-level Admin navigation area must remain.");
  }
  if (!/<a[^>]+data-route="learn"[^>]+href="learn\/index\.html"[^>]*>Learn<\/a>/.test(headerNav)) {
    issues.push("Learn must remain a top-level navigation item.");
  }
  if (/toolbox\/learn\/index\.html|data-route="tool-learn"|Creator Learning/.test(headerNav + "\n" + partials + "\n" + toolsAccordions)) {
    issues.push("Learn must not be exposed as a Toolbox tool.");
  }
  if (!/"id": "assets"[\s\S]*"toolboxGroup": "Content"/.test(toolRegistry)) {
    issues.push("Assets must belong to the Content Toolbox group in the registry.");
  }
  if (!/Planned world types/.test(toolRegistry) || !/Vector/.test(toolRegistry) || !/Tilemap/.test(toolRegistry) || !/Isometric/.test(toolRegistry) || !/Hex/.test(toolRegistry)) {
    issues.push("Worlds must preserve planned world-type child capabilities: Vector, Tilemap, Isometric, and Hex.");
  }
  if (!/Planned object types/.test(toolRegistry) || !/Vector/.test(toolRegistry) || !/Sprite/.test(toolRegistry) || !/Character/.test(toolRegistry) || !/Enemy/.test(toolRegistry) || !/Interactive/.test(toolRegistry)) {
    issues.push("Objects must preserve planned object-type child capabilities: Vector, Sprite, Character, Enemy, and Interactive.");
  }
  if (!/dataset\.childCapabilities/.test(toolsAccordions) || !/"childCapabilities"/.test(toolRegistry)) {
    issues.push("Toolbox child capabilities must render as visible child lists under their parent tool tiles.");
  }
  if (!/container callout/.test(toolboxIndex)) {
    issues.push("Toolbox role banner container must use an existing Theme V2 background panel class.");
  }
  if (/Object Vector|World Vector|Input Mapping|Collision Inspector|Storage Inspector|Save Data/.test(toolsAccordions + "\n" + headerNav)) {
    issues.push("Toolbox must use current creator-facing tool labels for Objects, Worlds, Controls, Hitboxes, and Saved Data.");
  }
  if (!/card-media-link/.test(toolsAccordions)) {
    issues.push("Toolbox preview images must be linked through the shared card media link pattern.");
  }
  if (/group\.className = "kicker"/.test(toolsAccordions)) {
    issues.push("Toolbox tool cards must not render a duplicate category kicker.");
  }
  if (/data-tools-view="(?:progress|build-path)"[^>]*aria-disabled="true"/.test(toolboxIndex)) {
    issues.push("Progress and Build Path view mode controls must render as normal reviewable controls, not disabled controls.");
  }
  if (/data-toolbox-wireframe|Progress Wireframe|Build Path Wireframe|id="(?:progress|build-path)-wireframe"/.test(toolboxIndex + "\n" + toolsAccordions)) {
    issues.push("Progress and Build Path must not be represented as extra wireframe sections, tool cards, or accordions.");
  }
  if (/title:\s*["'](?:Progress|Build Path)["']|data-tools-accordion=['"](?:Progress|Build Path)['"]/i.test(toolsAccordions)) {
    issues.push("Progress and Build Path must remain view modes, not active toolbox tools or accordion groups.");
  }
  for (const readiness of ["Ready", "Wireframe", "Under Construction", "Planned", "Hidden", "Deprecated"]) {
    if (!toolRegistry.includes(`"${readiness}"`)) {
      issues.push(`Toolbox registry status source is missing status model label: ${readiness}.`);
    }
  }
  if (!/getActiveToolRegistry/.test(toolsAccordions) || !/"requires"/.test(toolRegistry)) {
    issues.push("Progress view must hydrate requires metadata from the Toolbox registry source.");
  }
  if (!/dataset\.toolboxReadiness/.test(toolsAccordions)) {
    issues.push("Progress view must render readiness labels on the existing tool tiles.");
  }
  if (!/const buildPathGroups = \[/.test(toolsAccordions) || !/function getBuildPathRows/.test(toolsAccordions)) {
    issues.push("Build Path view must use the existing toolbox renderer and existing tool tile data.");
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
