/*
Toolbox Aid
David Quesenberry
05/26/2026
audit-playwright-test-locations.mjs
*/
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const defaultReportPath = "docs/dev/reports/test_location_audit_report.md";
const playwrightToolsDir = "tests/playwright/tools";
const playwrightGamesDir = "tests/playwright/games";
const sharedHelpersDir = "tests/helpers";

const documentedToolGameFixtures = new Map([
  ["AssetManagerV2.spec.mjs", "Tool runtime validation uses repo/game manifests as explicit asset payload fixtures."],
  ["CollisionInspectorV2.spec.mjs", "Tool runtime validation uses game manifests as explicit collision payload fixtures."],
  ["PreviewGeneratorV2Baseline.spec.mjs", "Tool runtime validation uses repo game paths as explicit preview output fixtures."],
  ["WorkspaceManagerV2.spec.mjs", "Workspace contract validation uses game manifests as explicit launch/toolState fixtures."]
]);

const relocatedGameSpecs = [
  {
    from: "tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs",
    to: "tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs"
  },
  {
    from: "tests/playwright/tools/AsteroidsBeatTiming.spec.mjs",
    to: "tests/playwright/games/AsteroidsBeatTiming.spec.mjs"
  },
  {
    from: "tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs",
    to: "tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs"
  },
  {
    from: "tests/playwright/tools/AsteroidsShipStateVisuals.spec.mjs",
    to: "tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs"
  }
];

const intentionallySharedHelpers = [
  {
    path: "tests/helpers/playwrightRepoServer.mjs",
    reason: "Shared HTTP repo fixture used by tool, game, and integration Playwright suites."
  },
  {
    path: "tests/helpers/playwrightStorageIsolation.mjs",
    reason: "Shared localStorage/sessionStorage cleanup helper used before targeted Playwright tests."
  },
  {
    path: "tests/helpers/workspaceV2CoverageReporter.mjs",
    reason: "Shared V8 coverage collection for Workspace V2 and impacted browser runtime suites."
  }
];

function parseArgs(argv) {
  const options = {
    reportPath: defaultReportPath
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--report") {
      options.reportPath = argv[index + 1] || defaultReportPath;
      index += 1;
    } else if (argument.startsWith("--report=")) {
      options.reportPath = argument.slice("--report=".length);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
}

function normalizeName(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function listFiles(relativeDir, predicate = () => true) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.posix.join(relativeDir, entry.name).replace(/\\/g, "/"))
    .filter(predicate)
    .sort((a, b) => a.localeCompare(b));
}

async function listGameNames() {
  const absoluteGamesDir = path.join(repoRoot, "games");
  const entries = await fs.readdir(absoluteGamesDir, { withFileTypes: true });
  const gameDirectories = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const gameNames = [];
  for (const entry of gameDirectories) {
    const manifestPath = path.join(absoluteGamesDir, entry.name, "game.manifest.json");
    try {
      await fs.access(manifestPath);
      gameNames.push({
        name: entry.name,
        normalized: normalizeName(entry.name)
      });
    } catch {
      // Directories without a game manifest are shared support folders, not game fixtures.
    }
  }
  return gameNames.filter((entry) => entry.normalized.length > 0);
}

async function readText(relativePath) {
  return fs.readFile(path.join(repoRoot, relativePath), "utf8");
}

function referencedGamesForContent(content, gameNames) {
  return gameNames
    .filter((game) => content.includes(`games/${game.name}/`) || content.includes(`/games/${game.name}/`))
    .map((game) => game.name);
}

function reportCell(value) {
  return String(value || "").replace(/\r?\n/g, " ");
}

function finding(severity, file, message, action) {
  return { action, file, message, severity };
}

async function audit() {
  const gameNames = await listGameNames();
  const toolSpecs = await listFiles(playwrightToolsDir, (file) => file.endsWith(".spec.mjs"));
  const gameSpecs = await listFiles(playwrightGamesDir, (file) => file.endsWith(".spec.mjs"));
  const helperFiles = await listFiles(sharedHelpersDir, (file) => file.endsWith(".mjs"));

  const findings = [];
  const documentedSharedUses = [];
  const relocatedGameSpecRows = [];

  for (const toolSpec of toolSpecs) {
    const baseName = path.basename(toolSpec);
    const normalizedBase = normalizeName(baseName.replace(/\.spec\.mjs$/i, ""));
    const gameNameMatches = gameNames
      .filter((game) => normalizedBase.startsWith(game.normalized))
      .map((game) => game.name);
    if (gameNameMatches.length > 0) {
      findings.push(finding(
        "FAIL",
        toolSpec,
        `Game-owned filename appears under ${playwrightToolsDir}: ${gameNameMatches.join(", ")}.`,
        `Move the spec to ${playwrightGamesDir}/ or rename it if it is truly generic tool coverage.`
      ));
    }

    const content = await readText(toolSpec);
    const referencedGames = referencedGamesForContent(content, gameNames);
    if (referencedGames.length > 0) {
      const fixtureReason = documentedToolGameFixtures.get(baseName);
      if (!fixtureReason) {
        findings.push(finding(
          "FAIL",
          toolSpec,
          `Undocumented game fixture reference in tool-owned test: ${referencedGames.join(", ")}.`,
          "Document why the game fixture validates tool behavior, or move the test to the games Playwright lane."
        ));
      } else {
        documentedSharedUses.push({
          file: toolSpec,
          games: referencedGames.join(", "),
          reason: fixtureReason
        });
      }
    }
  }

  for (const helperFile of helperFiles) {
    const normalizedBase = normalizeName(path.basename(helperFile, ".mjs"));
    const gameNameMatches = gameNames
      .filter((game) => normalizedBase.includes(game.normalized))
      .map((game) => game.name);
    if (gameNameMatches.length > 0) {
      findings.push(finding(
        "FAIL",
        helperFile,
        `Shared helper filename contains game-specific name: ${gameNameMatches.join(", ")}.`,
        "Move game-specific helper code under the games test area, or rename reusable helpers to generic names."
      ));
    }
  }

  for (const specMove of relocatedGameSpecs) {
    const exists = gameSpecs.includes(specMove.to);
    relocatedGameSpecRows.push({
      from: specMove.from,
      status: exists ? "PASS" : "FAIL",
      to: specMove.to,
      reason: exists
        ? "Game-owned Asteroids Playwright spec is under tests/playwright/games."
        : "Expected relocated game-owned spec is missing from tests/playwright/games."
    });
    if (!exists) {
      findings.push(finding(
        "FAIL",
        specMove.to,
        "Expected relocated game-owned Playwright spec is missing.",
        "Restore the spec under tests/playwright/games or update the audit if ownership changed."
      ));
    }
  }

  return {
    documentedSharedUses,
    findings,
    gameSpecs,
    helperFiles,
    relocatedGameSpecRows,
    toolSpecs
  };
}

function makeReport(result) {
  const blockingFindings = result.findings.filter((entry) => entry.severity === "FAIL");
  const lines = [
    "# Test Location Audit Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${blockingFindings.length === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Scope",
    "",
    `- Tool Playwright specs: ${playwrightToolsDir}`,
    `- Game Playwright specs: ${playwrightGamesDir}`,
    `- Shared helpers: ${sharedHelpersDir}`,
    "",
    "## Blocking Findings",
    ""
  ];

  if (blockingFindings.length === 0) {
    lines.push("No blocking test location findings.");
  } else {
    lines.push("| Severity | File | Finding | Action |");
    lines.push("| --- | --- | --- | --- |");
    blockingFindings.forEach((entry) => {
      lines.push(`| ${entry.severity} | ${entry.file} | ${reportCell(entry.message)} | ${reportCell(entry.action)} |`);
    });
  }

  lines.push(
    "",
    "## Relocated Game-Owned Specs",
    "",
    "| Previous Path | Current Path | Status | Reason |",
    "| --- | --- | --- | --- |"
  );
  result.relocatedGameSpecRows.forEach((row) => {
    lines.push(`| ${row.from} | ${row.to} | ${row.status} | ${reportCell(row.reason)} |`);
  });

  lines.push(
    "",
    "## Documented Tool Tests With Game Fixtures",
    "",
    "| File | Referenced Game Fixture(s) | Reason |",
    "| --- | --- | --- |"
  );
  if (result.documentedSharedUses.length === 0) {
    lines.push("| none | none | No tool-owned test uses a game fixture. |");
  } else {
    result.documentedSharedUses.forEach((entry) => {
      lines.push(`| ${entry.file} | ${entry.games} | ${reportCell(entry.reason)} |`);
    });
  }

  lines.push(
    "",
    "## Intentionally Shared Helpers",
    "",
    "| File | Reason |",
    "| --- | --- |"
  );
  intentionallySharedHelpers.forEach((entry) => {
    lines.push(`| ${entry.path} | ${reportCell(entry.reason)} |`);
  });

  lines.push(
    "",
    "## Ownership Rules Checked",
    "",
    "- Game-specific Playwright tests must live under tests/playwright/games.",
    "- Tool Playwright tests may use game manifests only as explicit, documented fixtures for tool behavior.",
    "- Shared helper filenames must not include game-specific names.",
    "- Lane execution should stop before expensive Playwright runs when this audit reports blocking findings."
  );

  return `${lines.join("\n").trim()}\n`;
}

async function writeReport(reportPath, text) {
  const absoluteReportPath = path.resolve(repoRoot, reportPath);
  await fs.mkdir(path.dirname(absoluteReportPath), { recursive: true });
  await fs.writeFile(absoluteReportPath, text, "utf8");
  console.log(`Wrote ${absoluteReportPath}`);
}

const options = parseArgs(process.argv.slice(2));
const result = await audit();
await writeReport(options.reportPath, makeReport(result));

const failures = result.findings.filter((entry) => entry.severity === "FAIL");
if (failures.length > 0) {
  console.error("Test location audit failed:");
  failures.forEach((entry) => {
    console.error(`- ${entry.file}: ${entry.message} ${entry.action}`);
  });
  process.exit(1);
}

console.log("Test location audit passed.");
