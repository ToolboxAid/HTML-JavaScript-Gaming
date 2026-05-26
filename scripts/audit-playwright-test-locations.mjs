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
const defaultReportPath = "docs/dev/reports/playwright_structure_audit.md";
const defaultDiscoveryReportPath = "docs/dev/reports/playwright_discovery_ownership_report.md";
const playwrightRoot = "tests/playwright";
const sharedHelpersDir = "tests/helpers";

const laneDirs = Object.freeze({
  engine: "tests/playwright/engine",
  games: "tests/playwright/games",
  integration: "tests/playwright/integration",
  tools: "tests/playwright/tools"
});
const toolOwnershipNames = Object.freeze([
  "AssetManagerV2",
  "AudioSfxPlaygroundV2",
  "CollisionInspectorV2",
  "InputMappingV2",
  "ObjectVectorStudioV2",
  "PaletteManagerV2",
  "PreviewGeneratorV2",
  "StorageInspectorV2",
  "TextToSpeechV2",
  "WorkspaceManagerV2",
  "WorldVectorStudioV2"
].map((name) => ({ name, normalized: normalizeName(name) })));
const integrationOwnershipMarkers = Object.freeze([
  "GameIndex",
  "Handoff",
  "ManifestResolution",
  "WorkspaceIntegration"
].map((name) => ({ name, normalized: normalizeName(name) })));

const documentedToolGameFixtures = new Map([
  ["AssetManagerV2.spec.mjs", "Tool runtime validation uses repo/game manifests as explicit asset payload fixtures."],
  ["CollisionInspectorV2.spec.mjs", "Tool runtime validation uses game manifests as explicit collision payload fixtures."],
  ["PreviewGeneratorV2Baseline.spec.mjs", "Tool runtime validation uses repo game paths as explicit preview output fixtures."],
  ["WorkspaceManagerV2.spec.mjs", "Workspace contract validation uses game manifests as explicit launch/toolState fixtures."]
]);

const documentedIntegrationGameFixtures = new Map([
  ["GameIndexPreviewManifestResolution.spec.mjs", "Integration validation uses Pong as an explicit cross-surface manifest handoff fixture."]
]);

const expectedPlacementCorrections = [
  {
    from: "tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs",
    reason: "Asteroids runtime/background behavior is game-owned.",
    to: "tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs"
  },
  {
    from: "tests/playwright/tools/AsteroidsBeatTiming.spec.mjs",
    reason: "Asteroids beat cadence behavior is game-owned.",
    to: "tests/playwright/games/AsteroidsBeatTiming.spec.mjs"
  },
  {
    from: "tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs",
    reason: "Asteroids scene diagnostics behavior is game-owned.",
    to: "tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs"
  },
  {
    from: "tests/playwright/tools/AsteroidsShipStateVisuals.spec.mjs",
    reason: "Asteroids ship visual runtime behavior is game-owned.",
    to: "tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs"
  },
  {
    from: "tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs",
    reason: "Game index and page manifest handoff is integration-owned.",
    to: "tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs"
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
    discoveryReportPath: defaultDiscoveryReportPath,
    reportPath: defaultReportPath
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--report") {
      options.reportPath = argv[index + 1] || defaultReportPath;
      index += 1;
    } else if (argument.startsWith("--report=")) {
      options.reportPath = argument.slice("--report=".length);
    } else if (argument === "--discovery-report") {
      options.discoveryReportPath = argv[index + 1] || defaultDiscoveryReportPath;
      index += 1;
    } else if (argument.startsWith("--discovery-report=")) {
      options.discoveryReportPath = argument.slice("--discovery-report=".length);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
}

function normalizeName(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function reportCell(value) {
  return String(value || "").replace(/\r?\n/g, " ");
}

function finding(severity, file, message, action) {
  return { action, file, message, severity };
}

async function pathExists(relativePath) {
  try {
    await fs.access(path.join(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function listFiles(relativeDir, predicate = () => true) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  let entries = [];
  try {
    entries = await fs.readdir(absoluteDir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return [];
    }
    throw error;
  }
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.posix.join(relativeDir, entry.name).replace(/\\/g, "/"))
    .filter(predicate)
    .sort((a, b) => a.localeCompare(b));
}

async function listTopLevelPlaywrightDirs() {
  const entries = await fs.readdir(path.join(repoRoot, playwrightRoot), { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.posix.join(playwrightRoot, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

async function listGameNames() {
  const absoluteGamesDir = path.join(repoRoot, "games");
  const entries = await fs.readdir(absoluteGamesDir, { withFileTypes: true });
  const gameNames = [];
  for (const entry of entries.filter((item) => item.isDirectory() && !item.name.startsWith("_"))) {
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
  return gameNames
    .filter((entry) => entry.normalized.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function readText(relativePath) {
  return fs.readFile(path.join(repoRoot, relativePath), "utf8");
}

function referencedGamesForContent(content, gameNames) {
  return gameNames
    .filter((game) => content.includes(`games/${game.name}/`) || content.includes(`/games/${game.name}/`))
    .map((game) => game.name);
}

function gameNamesInFileName(filePath, gameNames) {
  const normalizedBase = normalizeName(path.basename(filePath).replace(/\.spec\.mjs$/i, ""));
  return gameNames
    .filter((game) => normalizedBase.includes(game.normalized))
    .map((game) => game.name);
}

function toolNamesInFileName(filePath) {
  const normalizedBase = normalizeName(path.basename(filePath).replace(/\.spec\.mjs$/i, ""));
  return toolOwnershipNames
    .filter((tool) => normalizedBase.includes(tool.normalized))
    .map((tool) => tool.name);
}

function integrationMarkersInFileName(filePath) {
  const normalizedBase = normalizeName(path.basename(filePath).replace(/\.spec\.mjs$/i, ""));
  return integrationOwnershipMarkers
    .filter((marker) => normalizedBase.includes(marker.normalized))
    .map((marker) => marker.name);
}

function laneFromPlaywrightPath(filePath) {
  const normalizedPath = String(filePath || "").replace(/\\/g, "/");
  if (normalizedPath.startsWith(`${laneDirs.tools}/`)) {
    return "tools";
  }
  if (normalizedPath.startsWith(`${laneDirs.games}/`)) {
    return "games";
  }
  if (normalizedPath.startsWith(`${laneDirs.integration}/`)) {
    return "integration";
  }
  if (normalizedPath.startsWith(`${laneDirs.engine}/`)) {
    return "engine";
  }
  return "unknown";
}

function expectedLocationForOwnership(ownership) {
  return laneDirs[ownership] || "tests/playwright/<known-lane>";
}

function detectedSpecOwnership(filePath, gameNames) {
  const actualLane = laneFromPlaywrightPath(filePath);
  const gameMatches = gameNamesInFileName(filePath, gameNames);
  const toolMatches = toolNamesInFileName(filePath);
  const integrationMatches = integrationMarkersInFileName(filePath);
  if (gameMatches.length > 0) {
    return {
      ownership: "games",
      signals: `game-specific filename: ${gameMatches.join(", ")}`
    };
  }
  if (toolMatches.length > 0) {
    return {
      ownership: "tools",
      signals: `tool-specific filename: ${toolMatches.join(", ")}`
    };
  }
  if (integrationMatches.length > 0) {
    return {
      ownership: "integration",
      signals: `integration filename marker: ${integrationMatches.join(", ")}`
    };
  }
  if (actualLane === "engine") {
    return {
      ownership: "engine",
      signals: "engine lane location"
    };
  }
  return {
    ownership: actualLane,
    signals: `${actualLane} lane location`
  };
}

function isIntentionallySharedHelper(helperPath) {
  return intentionallySharedHelpers.some((entry) => entry.path === helperPath);
}

function startsWithGameName(filePath, gameNames) {
  const normalizedBase = normalizeName(path.basename(filePath).replace(/\.spec\.mjs$/i, ""));
  return gameNames.some((game) => normalizedBase.startsWith(game.normalized));
}

function extractImports(content) {
  const imports = [];
  const staticImportPattern = /import\s+(?:[^'"]+\s+from\s+)?["']([^"']+)["']/g;
  const dynamicImportPattern = /import\(\s*["']([^"']+)["']\s*\)/g;
  for (const pattern of [staticImportPattern, dynamicImportPattern]) {
    let match = pattern.exec(content);
    while (match) {
      imports.push(match[1]);
      match = pattern.exec(content);
    }
  }
  return imports;
}

async function resolveRelativeImport(importerPath, specifier) {
  if (!specifier.startsWith(".")) {
    return true;
  }
  const importerDir = path.dirname(path.join(repoRoot, importerPath));
  const absoluteTarget = path.resolve(importerDir, specifier);
  const candidates = [
    absoluteTarget,
    `${absoluteTarget}.mjs`,
    `${absoluteTarget}.js`,
    `${absoluteTarget}.json`,
    path.join(absoluteTarget, "index.mjs"),
    path.join(absoluteTarget, "index.js")
  ];
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return true;
    } catch {
      // Keep checking candidates.
    }
  }
  return false;
}

async function auditImports(files, findings) {
  const rows = [];
  for (const file of files) {
    const content = await readText(file);
    const imports = extractImports(content).filter((specifier) => specifier.startsWith("."));
    const missing = [];
    for (const specifier of imports) {
      if (!(await resolveRelativeImport(file, specifier))) {
        missing.push(specifier);
      }
    }
    rows.push({
      file,
      missing: missing.join(", ") || "none",
      status: missing.length === 0 ? "PASS" : "FAIL"
    });
    missing.forEach((specifier) => {
      findings.push(finding(
        "FAIL",
        file,
        `Missing relative import target: ${specifier}.`,
        "Fix the import path before running Playwright lanes."
      ));
    });
  }
  return rows;
}

async function audit() {
  const gameNames = await listGameNames();
  const toolSpecs = await listFiles(laneDirs.tools, (file) => file.endsWith(".spec.mjs"));
  const gameSpecs = await listFiles(laneDirs.games, (file) => file.endsWith(".spec.mjs"));
  const integrationSpecs = await listFiles(laneDirs.integration, (file) => file.endsWith(".spec.mjs"));
  const engineSpecs = await listFiles(laneDirs.engine, (file) => file.endsWith(".spec.mjs"));
  const helperFiles = await listFiles(sharedHelpersDir, (file) => file.endsWith(".mjs"));

  const findings = [];
  const discoveryRows = [];
  const documentedGameFixtureUses = [];
  const helperOwnershipRows = [];
  const placementRows = [];
  const laneDirectoryRows = [];

  const allowedDirs = new Set(Object.values(laneDirs));
  const topLevelDirs = await listTopLevelPlaywrightDirs();
  topLevelDirs.forEach((directory) => {
    const status = allowedDirs.has(directory) ? "PASS" : "FAIL";
    laneDirectoryRows.push({
      directory,
      reason: status === "PASS"
        ? "Directory is an allowed Playwright lane ownership bucket."
        : "Directory is not an allowed Playwright lane ownership bucket.",
      status
    });
    if (status === "FAIL") {
      findings.push(finding(
        "FAIL",
        directory,
        "Unexpected Playwright lane directory.",
        `Move specs under one of: ${Array.from(allowedDirs).join(", ")}.`
      ));
    }
  });

  for (const directory of Object.values(laneDirs)) {
    if (!topLevelDirs.includes(directory)) {
      laneDirectoryRows.push({
        directory,
        reason: directory === laneDirs.engine
          ? "No engine Playwright specs are currently present; engine lane may be empty."
          : "Expected Playwright lane directory is missing.",
        status: directory === laneDirs.engine ? "SKIP" : "FAIL"
      });
      if (directory !== laneDirs.engine) {
        findings.push(finding(
          "FAIL",
          directory,
          "Required Playwright lane directory is missing.",
          "Create the lane directory or restore the moved specs before running Playwright lanes."
        ));
      }
    }
  }

  for (const toolSpec of toolSpecs) {
    const detected = detectedSpecOwnership(toolSpec, gameNames);
    const actualLane = laneFromPlaywrightPath(toolSpec);
    const expectedLocation = expectedLocationForOwnership(detected.ownership);
    const status = actualLane === detected.ownership ? "PASS" : "FAIL";
    discoveryRows.push({
      detectedOwnership: detected.ownership,
      expectedLocation,
      file: toolSpec,
      laneBlocked: status === "FAIL" ? actualLane : "none",
      laneRequested: actualLane,
      reason: detected.signals,
      status
    });
    if (status === "FAIL") {
      findings.push(finding(
        "FAIL",
        toolSpec,
        `Discovery ownership mismatch: detected ${detected.ownership}, but file is under ${actualLane}.`,
        `Move the file to ${expectedLocation}/ before scheduling the ${actualLane} lane.`
      ));
    }

    const baseName = path.basename(toolSpec);
    const gameNameMatches = gameNamesInFileName(toolSpec, gameNames);
    if (gameNameMatches.length > 0) {
      findings.push(finding(
        "FAIL",
        toolSpec,
        `Game-specific filename appears under ${laneDirs.tools}: ${gameNameMatches.join(", ")}.`,
        `Move the spec to ${laneDirs.games}/ or rename it if it is truly generic tool coverage.`
      ));
    }

    const referencedGames = referencedGamesForContent(await readText(toolSpec), gameNames);
    if (referencedGames.length > 0) {
      const fixtureReason = documentedToolGameFixtures.get(baseName);
      if (!fixtureReason) {
        findings.push(finding(
          "FAIL",
          toolSpec,
          `Undocumented game fixture reference in tool-owned test: ${referencedGames.join(", ")}.`,
          "Document why the game fixture validates tool behavior, or move the test to the games/integration Playwright lane."
        ));
      } else {
        documentedGameFixtureUses.push({
          file: toolSpec,
          games: referencedGames.join(", "),
          lane: "tools",
          reason: fixtureReason
        });
      }
    }
  }

  for (const gameSpec of gameSpecs) {
    const detected = detectedSpecOwnership(gameSpec, gameNames);
    const actualLane = laneFromPlaywrightPath(gameSpec);
    const expectedLocation = expectedLocationForOwnership(detected.ownership);
    const status = actualLane === detected.ownership ? "PASS" : "FAIL";
    discoveryRows.push({
      detectedOwnership: detected.ownership,
      expectedLocation,
      file: gameSpec,
      laneBlocked: status === "FAIL" ? actualLane : "none",
      laneRequested: actualLane,
      reason: detected.signals,
      status
    });
    if (status === "FAIL") {
      findings.push(finding(
        "FAIL",
        gameSpec,
        `Discovery ownership mismatch: detected ${detected.ownership}, but file is under ${actualLane}.`,
        `Move the file to ${expectedLocation}/ before scheduling the ${actualLane} lane.`
      ));
    }

    if (!startsWithGameName(gameSpec, gameNames)) {
      findings.push(finding(
        "FAIL",
        gameSpec,
        `Game lane spec does not start with a known game name.`,
        `Move cross-surface coverage to ${laneDirs.integration}/ or rename game-specific specs with the game name.`
      ));
    }
  }

  for (const integrationSpec of integrationSpecs) {
    const detected = detectedSpecOwnership(integrationSpec, gameNames);
    const actualLane = laneFromPlaywrightPath(integrationSpec);
    const expectedLocation = expectedLocationForOwnership(detected.ownership);
    const status = actualLane === detected.ownership ? "PASS" : "FAIL";
    discoveryRows.push({
      detectedOwnership: detected.ownership,
      expectedLocation,
      file: integrationSpec,
      laneBlocked: status === "FAIL" ? actualLane : "none",
      laneRequested: actualLane,
      reason: detected.signals,
      status
    });
    if (status === "FAIL") {
      findings.push(finding(
        "FAIL",
        integrationSpec,
        `Discovery ownership mismatch: detected ${detected.ownership}, but file is under ${actualLane}.`,
        `Move the file to ${expectedLocation}/ before scheduling the ${actualLane} lane.`
      ));
    }

    const baseName = path.basename(integrationSpec);
    const gameNameMatches = gameNamesInFileName(integrationSpec, gameNames);
    if (gameNameMatches.length > 0) {
      findings.push(finding(
        "FAIL",
        integrationSpec,
        `Integration lane filename is game-specific: ${gameNameMatches.join(", ")}.`,
        `Move game-specific coverage to ${laneDirs.games}/.`
      ));
    }

    const referencedGames = referencedGamesForContent(await readText(integrationSpec), gameNames);
    if (referencedGames.length > 0) {
      const fixtureReason = documentedIntegrationGameFixtures.get(baseName);
      if (!fixtureReason) {
        findings.push(finding(
          "FAIL",
          integrationSpec,
          `Undocumented game fixture reference in integration test: ${referencedGames.join(", ")}.`,
          "Document why the fixture validates integration behavior."
        ));
      } else {
        documentedGameFixtureUses.push({
          file: integrationSpec,
          games: referencedGames.join(", "),
          lane: "integration",
          reason: fixtureReason
        });
      }
    }
  }

  for (const engineSpec of engineSpecs) {
    const detected = detectedSpecOwnership(engineSpec, gameNames);
    const actualLane = laneFromPlaywrightPath(engineSpec);
    const expectedLocation = expectedLocationForOwnership(detected.ownership);
    const status = actualLane === detected.ownership ? "PASS" : "FAIL";
    discoveryRows.push({
      detectedOwnership: detected.ownership,
      expectedLocation,
      file: engineSpec,
      laneBlocked: status === "FAIL" ? actualLane : "none",
      laneRequested: actualLane,
      reason: detected.signals,
      status
    });
    if (status === "FAIL") {
      findings.push(finding(
        "FAIL",
        engineSpec,
        `Discovery ownership mismatch: detected ${detected.ownership}, but file is under ${actualLane}.`,
        `Move the file to ${expectedLocation}/ before scheduling the ${actualLane} lane.`
      ));
    }

    const gameNameMatches = gameNamesInFileName(engineSpec, gameNames);
    if (gameNameMatches.length > 0) {
      findings.push(finding(
        "FAIL",
        engineSpec,
        `Engine lane filename is game-specific: ${gameNameMatches.join(", ")}.`,
        `Move game-specific coverage to ${laneDirs.games}/.`
      ));
    }
  }

  for (const helperFile of helperFiles) {
    const normalizedBase = normalizeName(path.basename(helperFile, ".mjs"));
    const gameNameMatches = gameNames
      .filter((game) => normalizedBase.includes(game.normalized))
      .map((game) => game.name);
    const toolNameMatches = toolNamesInFileName(helperFile);
    const intentionallyShared = isIntentionallySharedHelper(helperFile);
    const helperSignals = [
      gameNameMatches.length > 0 ? `game-specific helper name: ${gameNameMatches.join(", ")}` : "",
      toolNameMatches.length > 0 ? `tool-specific helper name: ${toolNameMatches.join(", ")}` : ""
    ].filter(Boolean);
    const helperStatus = helperSignals.length === 0 || intentionallyShared ? "PASS" : "FAIL";
    const expectedLocation = gameNameMatches.length > 0
      ? laneDirs.games
      : (toolNameMatches.length > 0 ? laneDirs.tools : sharedHelpersDir);
    helperOwnershipRows.push({
      detectedOwnership: helperSignals.length === 0 ? "shared" : (gameNameMatches.length > 0 ? "games" : "tools"),
      expectedLocation,
      file: helperFile,
      reason: intentionallyShared
        ? "Intentionally shared helper is documented."
        : (helperSignals.join("; ") || "Generic shared helper name."),
      status: helperStatus
    });
    if (helperStatus === "FAIL" && gameNameMatches.length > 0) {
      findings.push(finding(
        "FAIL",
        helperFile,
        `Shared helper filename contains game-specific name: ${gameNameMatches.join(", ")}.`,
        "Move game-specific helper code under the games test area, or rename reusable helpers to generic names."
      ));
    }
    if (helperStatus === "FAIL" && toolNameMatches.length > 0) {
      findings.push(finding(
        "FAIL",
        helperFile,
        `Shared helper filename contains tool-specific name: ${toolNameMatches.join(", ")}.`,
        "Move tool-specific helper code under the tools test area, or rename reusable helpers to generic names."
      ));
    }
  }

  for (const correction of expectedPlacementCorrections) {
    const fromExists = await pathExists(correction.from);
    const toExists = await pathExists(correction.to);
    const status = !fromExists && toExists ? "PASS" : "FAIL";
    placementRows.push({
      from: correction.from,
      reason: correction.reason,
      status,
      to: correction.to
    });
    if (status === "FAIL") {
      findings.push(finding(
        "FAIL",
        correction.to,
        "Expected placement correction is incomplete.",
        `Ensure ${correction.from} is absent and ${correction.to} exists.`
      ));
    }
  }

  const importRows = await auditImports([
    ...toolSpecs,
    ...gameSpecs,
    ...integrationSpecs,
    ...engineSpecs,
    ...helperFiles
  ], findings);

  return {
    discoveryRows,
    documentedGameFixtureUses,
    findings,
    helperOwnershipRows,
    importRows,
    laneDirectoryRows,
    placementRows
  };
}

function makeReport(result) {
  const blockingFindings = result.findings.filter((entry) => entry.severity === "FAIL");
  const lines = [
    "# Playwright Structure Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${blockingFindings.length === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Lane Directories",
    "",
    "| Directory | Status | Reason |",
    "| --- | --- | --- |"
  ];

  result.laneDirectoryRows.forEach((row) => {
    lines.push(`| ${row.directory} | ${row.status} | ${reportCell(row.reason)} |`);
  });

  lines.push("", "## Blocking Findings", "");
  if (blockingFindings.length === 0) {
    lines.push("No blocking structural findings.");
  } else {
    lines.push("| Severity | File | Finding | Action |");
    lines.push("| --- | --- | --- | --- |");
    blockingFindings.forEach((entry) => {
      lines.push(`| ${entry.severity} | ${entry.file} | ${reportCell(entry.message)} | ${reportCell(entry.action)} |`);
    });
  }

  lines.push(
    "",
    "## Placement Corrections",
    "",
    "| Previous Path | Current Path | Status | Reason |",
    "| --- | --- | --- | --- |"
  );
  result.placementRows.forEach((row) => {
    lines.push(`| ${row.from} | ${row.to} | ${row.status} | ${reportCell(row.reason)} |`);
  });

  lines.push(
    "",
    "## Documented Game Fixtures",
    "",
    "| Lane | File | Referenced Game Fixture(s) | Reason |",
    "| --- | --- | --- | --- |"
  );
  if (result.documentedGameFixtureUses.length === 0) {
    lines.push("| none | none | none | No Playwright lane uses game fixtures. |");
  } else {
    result.documentedGameFixtureUses.forEach((entry) => {
      lines.push(`| ${entry.lane} | ${entry.file} | ${entry.games} | ${reportCell(entry.reason)} |`);
    });
  }

  lines.push(
    "",
    "## Import Targets",
    "",
    "| File | Status | Missing Relative Imports |",
    "| --- | --- | --- |"
  );
  result.importRows.forEach((row) => {
    lines.push(`| ${row.file} | ${row.status} | ${row.missing} |`);
  });

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
    "## Fast-Fail Rules Checked",
    "",
    "- Playwright specs must live under tools, games, integration, or engine lane directories.",
    "- Game-specific specs are prohibited under tests/playwright/tools.",
    "- Cross-surface tests belong under tests/playwright/integration.",
    "- Shared helper filenames must not use game-specific names.",
    "- Relative imports must resolve before browser lanes execute.",
    "- Lane execution should stop before expensive Playwright runs when this audit reports blocking findings."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeDiscoveryOwnershipReport(result) {
  const blockingFindings = result.findings.filter((entry) => entry.severity === "FAIL");
  const lines = [
    "# Playwright Discovery Ownership Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${blockingFindings.length === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Discovery-Time Ownership",
    "",
    "| File | Lane Requested | Detected Ownership | Expected Location | Lane Blocked | Status | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- |"
  ];

  result.discoveryRows.forEach((row) => {
    lines.push([
      `| ${row.file}`,
      row.laneRequested,
      row.detectedOwnership,
      row.expectedLocation,
      row.laneBlocked,
      row.status,
      `${reportCell(row.reason)} |`
    ].join(" | "));
  });

  lines.push(
    "",
    "## Shared Helper Naming",
    "",
    "| File | Detected Ownership | Expected Location | Status | Reason |",
    "| --- | --- | --- | --- | --- |"
  );
  result.helperOwnershipRows.forEach((row) => {
    lines.push([
      `| ${row.file}`,
      row.detectedOwnership,
      row.expectedLocation,
      row.status,
      `${reportCell(row.reason)} |`
    ].join(" | "));
  });

  lines.push("", "## Blocking Findings", "");
  if (blockingFindings.length === 0) {
    lines.push("No discovery ownership blockers. Targeted Playwright lanes may be scheduled.");
  } else {
    lines.push("| File | Detected Ownership | Expected Location | Lane Blocked | Action |");
    lines.push("| --- | --- | --- | --- | --- |");
    blockingFindings.forEach((entry) => {
      const discoveryRow = result.discoveryRows.find((row) => row.file === entry.file)
        || result.helperOwnershipRows.find((row) => row.file === entry.file);
      lines.push([
        `| ${entry.file}`,
        discoveryRow?.detectedOwnership || "unknown",
        discoveryRow?.expectedLocation || "unknown",
        discoveryRow?.laneBlocked || "preflight",
        `${reportCell(entry.action)} |`
      ].join(" | "));
    });
  }

  lines.push(
    "",
    "## Execution Guard",
    "",
    "- Discovery ownership validation runs before lane scheduling and browser startup.",
    "- Tool lanes reject game-owned, integration-owned, and engine-owned Playwright files.",
    "- Game lanes reject tool-owned, integration-owned, and engine-owned Playwright files.",
    "- Integration-only files are blocked from targeted tool/game lanes.",
    "- Engine/src Playwright files are blocked from tool/game lanes unless the lane explicitly owns them.",
    "- Ownership failures do not trigger fallback lanes or broad reruns."
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
await writeReport(options.discoveryReportPath, makeDiscoveryOwnershipReport(result));

const failures = result.findings.filter((entry) => entry.severity === "FAIL");
if (failures.length > 0) {
  console.error("Playwright structure audit failed:");
  failures.forEach((entry) => {
    console.error(`- ${entry.file}: ${entry.message} ${entry.action}`);
  });
  process.exit(1);
}

console.log("Playwright structure audit passed.");
