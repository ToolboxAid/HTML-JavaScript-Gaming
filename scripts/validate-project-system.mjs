import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getToolById, getVisibleActiveToolRegistry } from "../tools/toolRegistry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const REQUIRED_ACTIVE_TOOL_NAMES = [
  "Vector Map Editor",
  "Vector Asset Studio",
  "Tilemap Studio",
  "Parallax Scene Studio",
  "Sprite Editor",
  "Asset Browser / Import Hub",
  "Palette Browser / Manager"
];

const REQUIRED_SHARED_FILES = [
  "tools/shared/projectManifestContract.js",
  "tools/shared/projectSystem.js",
  "tools/shared/projectSystemAdapters.js",
  "docs/specs/project_manifest_contract.md"
];

const REQUIRED_SHELL_LABELS = [
  "New Project",
  "Open Project",
  "Save Project",
  "Save Project As",
  "Close Project"
];

const TOOL_BOOTSTRAP_CHECKS = [
  {
    file: "tools/Tilemap Studio/main.js",
    pattern: "window.tileMapStudioApp = app;"
  },
  {
    file: "tools/Parallax Scene Studio/main.js",
    pattern: "window.parallaxSceneStudioApp = app;"
  },
  {
    file: "tools/Sprite Editor/main.js",
    pattern: "window.spriteEditorApp ="
  },
  {
    file: "tools/Vector Asset Studio/main.js",
    pattern: "window.vectorAssetStudioApp ="
  },
  {
    file: "tools/Asset Browser/main.js",
    pattern: "window.assetBrowserApp ="
  },
  {
    file: "tools/Palette Browser/main.js",
    pattern: "window.paletteBrowserApp ="
  }
];

const REPORT_PATH = path.join(repoRoot, "docs/dev/reports/project_system_validation.txt");

async function pathExists(targetPath) {
  try {
    await fs.access(path.join(repoRoot, targetPath));
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
  const notes = [];

  for (const filePath of REQUIRED_SHARED_FILES) {
    if (!(await pathExists(filePath))) {
      issues.push(`Missing required shared project-system file: ${filePath}`);
    } else {
      notes.push(`found ${filePath}`);
    }
  }

  const activeTools = getVisibleActiveToolRegistry().map((entry) => entry.displayName);
  if (JSON.stringify(activeTools) !== JSON.stringify(REQUIRED_ACTIVE_TOOL_NAMES)) {
    issues.push(`Visible active tools do not match expected project-system surface. Found: ${activeTools.join(", ")}`);
  } else {
    notes.push(`active tools match expected first-class list (${activeTools.length})`);
  }

  const spriteEditor = getToolById("sprite-editor");
  if (spriteEditor?.active !== true || spriteEditor?.visibleInToolsList !== true) {
    issues.push("Sprite Editor must remain first-class and visible.");
  } else {
    notes.push("Sprite Editor remains first-class and visible");
  }

  const legacySprite = getToolById("sprite-editor-old-keep");
  if (legacySprite?.active === true || legacySprite?.visibleInToolsList === true) {
    issues.push("SpriteEditor_old_keep must remain hidden legacy.");
  } else {
    notes.push("SpriteEditor_old_keep remains hidden legacy");
  }

  const platformShellText = await readText("tools/shared/platformShell.js");
  for (const label of REQUIRED_SHELL_LABELS) {
    if (!platformShellText.includes(label)) {
      issues.push(`Shared shell is missing project action label: ${label}`);
    }
  }
  if (!platformShellText.includes("createProjectSystemController")) {
    issues.push("Shared shell is not wired to createProjectSystemController.");
  } else {
    notes.push("shared shell is wired to project system controller");
  }

  const toolsIndexText = await readText("tools/index.html");
  if (/samples\//i.test(toolsIndexText)) {
    issues.push("tools/index.html should stay tool-only and sample-free.");
  } else {
    notes.push("tools/index.html remains tool-only");
  }

  for (const check of TOOL_BOOTSTRAP_CHECKS) {
    const text = await readText(check.file);
    if (!text.includes(check.pattern)) {
      issues.push(`Missing project adapter bootstrap in ${check.file}: ${check.pattern}`);
    }
  }

  const reportLines = [
    "BUILD_PR_PROJECT_SYSTEM validation report",
    "",
    issues.length === 0 ? "STATUS: PASS" : "STATUS: FAIL",
    "",
    "Checks:",
    ...notes.map((note) => `- ${note}`),
    "",
    "Issues:",
    ...(issues.length > 0 ? issues.map((issue) => `- ${issue}`) : ["- none"])
  ];

  await fs.writeFile(REPORT_PATH, `${reportLines.join("\n")}\n`, "utf8");

  if (issues.length > 0) {
    console.error("PROJECT_SYSTEM_INVALID");
    issues.forEach((issue) => console.error(`- ${issue}`));
    process.exitCode = 1;
    return;
  }

  console.log("PROJECT_SYSTEM_VALID");
  console.log(`Report: ${path.relative(repoRoot, REPORT_PATH).replace(/\\/g, "/")}`);
}

await main();
