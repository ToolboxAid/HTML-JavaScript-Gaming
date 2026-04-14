import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const GAMES_ROOT = path.join(repoRoot, "games");
const REPORT_PATH = path.join(repoRoot, "docs/dev/reports/games_template_contract_validation.txt");
const MANAGED_CANONICAL_GAMES = ["PacmanLite", "SpaceInvaders"];
const REQUIRED_DIRS = ["assets", "game", "entities", "systems", "ui", "debug"];
const TEMPLATE_REQUIRED_ASSET_DIRS = [
  "audio",
  "fonts",
  "images",
  "palettes",
  "parallax",
  "parallax/data",
  "sprites",
  "sprites/data",
  "tilemaps",
  "tilemaps/data",
  "tilesets",
  "vectors",
  "vectors/data"
];
const TEMPLATE_REQUIRED_ASSET_FILES = [
  ".gitkeep",
  "tools.manifest.json",
  "parallax/data/.gitkeep",
  "sprites/data/.gitkeep",
  "tilemaps/data/.gitkeep",
  "vectors/data/.gitkeep"
];
const REQUIRED_INDEX_PATTERNS = [
  { id: "canvas", test: (text) => /<canvas\b/i.test(text), message: "index.html must include a <canvas> element." },
  {
    id: "base-layout",
    test: (text) => /\/src\/engine\/ui\/baseLayout\.css/i.test(text),
    message: "index.html must include /src/engine/ui/baseLayout.css."
  }
];
const SOURCE_FILE_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".html"]);

function toRepoRelative(targetPath) {
  return path.relative(repoRoot, targetPath).replace(/\\/g, "/");
}

async function pathExistsWithType(targetPath, expectedType) {
  try {
    const stat = await fs.stat(targetPath);
    if (expectedType === "directory") {
      return stat.isDirectory();
    }
    if (expectedType === "file") {
      return stat.isFile();
    }
    return false;
  } catch {
    return false;
  }
}

async function resolveContractTargets() {
  const entries = await fs.readdir(GAMES_ROOT, { withFileTypes: true });
  const entryNames = new Set(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name));
  const targets = [];
  const requiredStaticTargets = ["_template", ...MANAGED_CANONICAL_GAMES];

  for (const requiredTarget of requiredStaticTargets) {
    if (!entryNames.has(requiredTarget)) {
      throw new Error(`Required contract target is missing: games/${requiredTarget}`);
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const gameName = entry.name;
    const gameRoot = path.join(GAMES_ROOT, gameName);
    const gameEntries = await fs.readdir(gameRoot, { withFileTypes: true });
    const inScope = (
      gameName === "_template"
      || gameName.endsWith("_next")
      || MANAGED_CANONICAL_GAMES.includes(gameName)
    );
    if (inScope) {
      targets.push({
        gameName,
        gameRoot,
        gameEntries
      });
    }
  }

  return targets.sort((a, b) => a.gameName.localeCompare(b.gameName));
}

async function listFilesRecursively(rootPath) {
  const output = [];
  const queue = [rootPath];

  while (queue.length > 0) {
    const current = queue.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(fullPath);
        continue;
      }
      output.push(fullPath);
    }
  }

  return output;
}

function collectQuotedGamePathViolations({ gameName, repoRelativePath, text }) {
  const issues = [];
  const matches = text.matchAll(/["'`](\/games\/([^\/"'`]+)\/[^"'`]*)["'`]/g);
  for (const match of matches) {
    const referencedGame = match[2];
    const referencedPath = match[1];
    if (referencedGame !== gameName) {
      issues.push(
        `${repoRelativePath} references another game path (${referencedPath}).`
      );
    }
  }
  return issues;
}

async function validateTarget(target) {
  const issues = [];
  const notes = [];
  const entryNames = new Set(target.gameEntries.map((entry) => entry.name));

  for (const requiredDir of REQUIRED_DIRS) {
    if (!entryNames.has(requiredDir)) {
      issues.push(`${target.gameName}: missing required directory ${requiredDir}/.`);
    }
  }

  if (target.gameName === "_template") {
    const templateAssetsRoot = path.join(target.gameRoot, "assets");
    for (const requiredDir of TEMPLATE_REQUIRED_ASSET_DIRS) {
      const dirPath = path.join(templateAssetsRoot, requiredDir);
      if (!(await pathExistsWithType(dirPath, "directory"))) {
        issues.push(`${target.gameName}: missing required directory assets/${requiredDir}/.`);
      }
    }

    for (const requiredFile of TEMPLATE_REQUIRED_ASSET_FILES) {
      const filePath = path.join(templateAssetsRoot, requiredFile);
      if (!(await pathExistsWithType(filePath, "file"))) {
        issues.push(`${target.gameName}: missing required file assets/${requiredFile}.`);
      }
    }
  }

  if (!entryNames.has("index.html")) {
    issues.push(`${target.gameName}: missing required index.html.`);
  } else {
    const indexPath = path.join(target.gameRoot, "index.html");
    const indexText = await fs.readFile(indexPath, "utf8");
    for (const pattern of REQUIRED_INDEX_PATTERNS) {
      if (!pattern.test(indexText)) {
        issues.push(`${target.gameName}: ${pattern.message}`);
      }
    }
  }

  const files = await listFilesRecursively(target.gameRoot);
  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase();
    if (!SOURCE_FILE_EXTENSIONS.has(ext)) {
      continue;
    }
    const text = await fs.readFile(filePath, "utf8");
    const repoRelativePath = toRepoRelative(filePath);
    const pathIssues = collectQuotedGamePathViolations({
      gameName: target.gameName,
      repoRelativePath,
      text
    });
    issues.push(...pathIssues);
  }

  if (issues.length === 0) {
    notes.push(`${target.gameName}: structure and shell contract checks passed.`);
  }

  return { issues, notes };
}

export async function validateGamesTemplateContract({ emitLogs = true } = {}) {
  const issues = [];
  const notes = [];

  const targets = await resolveContractTargets();
  if (targets.length === 0) {
    issues.push("No contract-managed game targets found under games/.");
  }

  for (const target of targets) {
    const result = await validateTarget(target);
    issues.push(...result.issues);
    notes.push(...result.notes);
  }

  const reportLines = [
    "BUILD_PR_GAMES_TEMPLATE_CONTRACT_ENFORCEMENT validation report",
    "",
    issues.length === 0 ? "STATUS: PASS" : "STATUS: FAIL",
    "",
    "Targets:",
    ...targets.map((target) => `- games/${target.gameName}`),
    "",
    "Checks:",
    ...notes.map((note) => `- ${note}`),
    "",
    "Issues:",
    ...(issues.length > 0 ? issues.map((issue) => `- ${issue}`) : ["- none"])
  ];

  await fs.writeFile(REPORT_PATH, `${reportLines.join("\n")}\n`, "utf8");

  if (issues.length > 0) {
    if (emitLogs) {
      console.error("GAMES_TEMPLATE_CONTRACT_INVALID");
      issues.forEach((issue) => console.error(`- ${issue}`));
    }
    return {
      status: "invalid",
      issues,
      notes,
      targets,
      reportPath: toRepoRelative(REPORT_PATH)
    };
  }

  if (emitLogs) {
    console.log("GAMES_TEMPLATE_CONTRACT_VALID");
    console.log(`Report: ${toRepoRelative(REPORT_PATH)}`);
  }

  return {
    status: "valid",
    issues,
    notes,
    targets,
    reportPath: toRepoRelative(REPORT_PATH)
  };
}

async function main() {
  const result = await validateGamesTemplateContract({ emitLogs: true });
  if (result.status !== "valid") {
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  await main();
}
