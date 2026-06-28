/*
Toolbox Aid
David Quesenberry
05/26/2026
audit-playwright-test-locations.mjs
*/
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const defaultReportPath = "dev/reports/playwright_structure_audit.md";
const defaultDiscoveryReportPath = "dev/reports/playwright_discovery_ownership_report.md";
const defaultDiscoveryScopeReportPath = "dev/reports/playwright_discovery_scope_report.md";
const defaultFilesystemScanReportPath = "dev/reports/filesystem_scan_reduction_report.md";
const playwrightRoot = "dev/tests/playwright";
const sharedHelpersDir = "dev/tests/helpers";
const textCache = new Map();

const laneDirs = Object.freeze({
  account: "dev/tests/playwright/account",
  engine: "dev/tests/playwright/engine",
  games: "dev/tests/playwright/games",
  integration: "dev/tests/playwright/integration",
  tools: "dev/tests/playwright/tools"
});
const toolOwnershipNames = Object.freeze([
  "RootToolsFutureState"
].map((name) => ({ name, normalized: normalizeName(name) })));
const integrationOwnershipMarkers = Object.freeze([
  "GameIndex",
  "Handoff",
  "ManifestResolution",
  "WorkspaceIntegration"
].map((name) => ({ name, normalized: normalizeName(name) })));

const documentedToolGameFixtures = new Map();

const documentedIntegrationGameFixtures = new Map();

const expectedPlacementCorrections = [
  {
    from: "dev/tests/playwright/tools/AsteroidsBackgroundAssetResolution.spec.mjs",
    reason: "Asteroids runtime/background behavior is game-owned.",
    to: "dev/tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs"
  },
  {
    from: "dev/tests/playwright/tools/AsteroidsBeatTiming.spec.mjs",
    reason: "Asteroids beat cadence behavior is game-owned.",
    to: "dev/tests/playwright/games/AsteroidsBeatTiming.spec.mjs"
  },
  {
    from: "dev/tests/playwright/tools/AsteroidsGameSceneCleanup.spec.mjs",
    reason: "Asteroids scene diagnostics behavior is game-owned.",
    to: "dev/tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs"
  },
  {
    from: "dev/tests/playwright/tools/AsteroidsShipStateVisuals.spec.mjs",
    reason: "Asteroids ship visual runtime behavior is game-owned.",
    to: "dev/tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs"
  }
];

const intentionallySharedHelpers = [
  {
    path: "dev/tests/helpers/playwrightRepoServer.mjs",
    reason: "Shared HTTP repo fixture used by tool, game, and integration Playwright suites."
  },
  {
    path: "dev/tests/helpers/playwrightStorageIsolation.mjs",
    reason: "Shared localStorage/sessionStorage cleanup helper used before targeted Playwright tests."
  },
  {
    path: "dev/tests/helpers/workspaceV2CoverageReporter.mjs",
    reason: "Shared V8 coverage collection for Workspace V2 and impacted browser runtime suites."
  }
];

function parseArgs(argv) {
  const options = {
    discoveryScopeReportPath: defaultDiscoveryScopeReportPath,
    discoveryReportPath: defaultDiscoveryReportPath,
    fixtureFiles: [],
    helperFiles: [],
    lanes: [],
    reportPath: defaultReportPath,
    filesystemScanReportPath: defaultFilesystemScanReportPath,
    targetFiles: []
  };

  function appendCsvValues(key, value) {
    String(value || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => options[key].push(entry));
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--discovery-report") {
      options.discoveryReportPath = argv[index + 1] || defaultDiscoveryReportPath;
      index += 1;
    } else if (argument.startsWith("--discovery-report=")) {
      options.discoveryReportPath = argument.slice("--discovery-report=".length);
    } else if (argument === "--fixture") {
      appendCsvValues("fixtureFiles", argv[index + 1]);
      index += 1;
    } else if (argument.startsWith("--fixture=")) {
      appendCsvValues("fixtureFiles", argument.slice("--fixture=".length));
    } else if (argument === "--fixtures") {
      appendCsvValues("fixtureFiles", argv[index + 1]);
      index += 1;
    } else if (argument.startsWith("--fixtures=")) {
      appendCsvValues("fixtureFiles", argument.slice("--fixtures=".length));
    } else if (argument === "--helper") {
      appendCsvValues("helperFiles", argv[index + 1]);
      index += 1;
    } else if (argument.startsWith("--helper=")) {
      appendCsvValues("helperFiles", argument.slice("--helper=".length));
    } else if (argument === "--helpers") {
      appendCsvValues("helperFiles", argv[index + 1]);
      index += 1;
    } else if (argument.startsWith("--helpers=")) {
      appendCsvValues("helperFiles", argument.slice("--helpers=".length));
    } else if (argument === "--lanes") {
      appendCsvValues("lanes", argv[index + 1]);
      index += 1;
    } else if (argument.startsWith("--lanes=")) {
      appendCsvValues("lanes", argument.slice("--lanes=".length));
    } else if (argument === "--report") {
      options.reportPath = argv[index + 1] || defaultReportPath;
      index += 1;
    } else if (argument.startsWith("--report=")) {
      options.reportPath = argument.slice("--report=".length);
    } else if (argument === "--scan-report") {
      options.filesystemScanReportPath = argv[index + 1] || defaultFilesystemScanReportPath;
      index += 1;
    } else if (argument.startsWith("--scan-report=")) {
      options.filesystemScanReportPath = argument.slice("--scan-report=".length);
    } else if (argument === "--scope-report") {
      options.discoveryScopeReportPath = argv[index + 1] || defaultDiscoveryScopeReportPath;
      index += 1;
    } else if (argument.startsWith("--scope-report=")) {
      options.discoveryScopeReportPath = argument.slice("--scope-report=".length);
    } else if (argument === "--target") {
      appendCsvValues("targetFiles", argv[index + 1]);
      index += 1;
    } else if (argument.startsWith("--target=")) {
      appendCsvValues("targetFiles", argument.slice("--target=".length));
    } else if (argument === "--targets") {
      appendCsvValues("targetFiles", argv[index + 1]);
      index += 1;
    } else if (argument.startsWith("--targets=")) {
      appendCsvValues("targetFiles", argument.slice("--targets=".length));
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  options.fixtureFiles = uniqueRelativePaths(options.fixtureFiles);
  options.helperFiles = uniqueRelativePaths(options.helperFiles);
  options.lanes = [...new Set(options.lanes)];
  options.scopedDiscovery = options.targetFiles.length > 0 || options.helperFiles.length > 0 || options.fixtureFiles.length > 0;
  options.targetFiles = uniqueRelativePaths(options.targetFiles);
  return options;
}

function normalizeRelativePath(relativePath) {
  return String(relativePath || "").replace(/\\/g, "/").replace(/^\.\/+/, "");
}

function uniqueRelativePaths(paths) {
  return [...new Set(paths.map(normalizeRelativePath).filter(Boolean))].sort((a, b) => a.localeCompare(b));
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
  const absoluteGamesDir = path.join(repoRoot, "www", "games");
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
  const normalizedPath = normalizeRelativePath(relativePath);
  if (!textCache.has(normalizedPath)) {
    textCache.set(normalizedPath, fs.readFile(path.join(repoRoot, normalizedPath), "utf8"));
  }
  return textCache.get(normalizedPath);
}

function gameNameHintsFromText(value) {
  const hints = [];
  const pattern = /(?:^|["'`(=\s])\/?games\/([A-Za-z0-9_-]+)\//g;
  let match = pattern.exec(String(value || ""));
  while (match) {
    if (!match[1].startsWith("_") && match[1] !== "shared") {
      hints.push(match[1]);
    }
    match = pattern.exec(String(value || ""));
  }
  return hints;
}

async function listScopedGameNames(scopedFiles) {
  const names = new Set();
  for (const scopedFile of scopedFiles) {
    gameNameHintsFromText(scopedFile).forEach((name) => names.add(name));
    if (await pathExists(scopedFile)) {
      const content = await readText(scopedFile);
      gameNameHintsFromText(content).forEach((name) => names.add(name));
    }
  }
  return [...names]
    .map((name) => ({ name, normalized: normalizeName(name) }))
    .filter((entry) => entry.normalized.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function splitSpecsByLane(targetFiles) {
  const specs = {
    engineSpecs: [],
    gameSpecs: [],
    integrationSpecs: [],
    toolSpecs: []
  };
  targetFiles
    .filter((file) => file.endsWith(".spec.mjs"))
    .forEach((file) => {
      const lane = laneFromPlaywrightPath(file);
      if (lane === "tools") {
        specs.toolSpecs.push(file);
      } else if (lane === "games") {
        specs.gameSpecs.push(file);
      } else if (lane === "integration") {
        specs.integrationSpecs.push(file);
      } else if (lane === "engine") {
        specs.engineSpecs.push(file);
      }
    });
  return specs;
}

function requestedOwnershipsForLanes(lanes) {
  const ownerships = new Set();
  lanes.forEach((lane) => {
    if (lane === "tool-runtime" || lane === "workspace-contract" || lane === "tools") {
      ownerships.add("tools");
    } else if (lane === "integration") {
      ownerships.add("integration");
    } else if (lane === "game-runtime" || lane === "games") {
      ownerships.add("games");
    } else if (lane === "engine-src" || lane === "engine") {
      ownerships.add("engine");
    }
  });
  return ownerships;
}

function makeScopedLaneDirectoryRows(targetFiles, lanes) {
  const requestedOwnerships = requestedOwnershipsForLanes(lanes);
  return Object.entries(laneDirs).map(([ownership, directory]) => {
    const laneTargets = targetFiles.filter((file) => file.startsWith(`${directory}/`));
    if (requestedOwnerships.has(ownership)) {
      return {
        directory,
        reason: laneTargets.length > 0
          ? `Scoped discovery is limited to explicit target file(s): ${laneTargets.join(", ")}.`
          : "Scoped lane selected without Playwright spec targets; no directory enumeration was performed.",
        status: laneTargets.length > 0 ? "PASS" : "SKIP"
      };
    }
    return {
      directory,
      reason: "Lane was not selected, so targeted discovery did not enumerate this directory.",
      status: "SKIP"
    };
  });
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
  if (normalizedPath.startsWith(`${laneDirs.account}/`)) {
    return "account";
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
  return laneDirs[ownership] || "dev/tests/playwright/<known-lane>";
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

async function audit(options = {}) {
  const scopedDiscovery = Boolean(options.scopedDiscovery);
  const allScopedFiles = uniqueRelativePaths([
    ...(options.targetFiles || []),
    ...(options.helperFiles || []),
    ...(options.fixtureFiles || [])
  ]);
  const gameNames = scopedDiscovery
    ? await listScopedGameNames(allScopedFiles)
    : await listGameNames();
  const scopedSpecs = splitSpecsByLane(options.targetFiles || []);
  const toolSpecs = scopedDiscovery
    ? scopedSpecs.toolSpecs
    : await listFiles(laneDirs.tools, (file) => file.endsWith(".spec.mjs"));
  const gameSpecs = scopedDiscovery
    ? scopedSpecs.gameSpecs
    : await listFiles(laneDirs.games, (file) => file.endsWith(".spec.mjs"));
  const integrationSpecs = scopedDiscovery
    ? scopedSpecs.integrationSpecs
    : await listFiles(laneDirs.integration, (file) => file.endsWith(".spec.mjs"));
  const engineSpecs = scopedDiscovery
    ? scopedSpecs.engineSpecs
    : await listFiles(laneDirs.engine, (file) => file.endsWith(".spec.mjs"));
  const helperFiles = scopedDiscovery
    ? uniqueRelativePaths(options.helperFiles || []).filter((file) => file.endsWith(".mjs"))
    : await listFiles(sharedHelpersDir, (file) => file.endsWith(".mjs"));

  const findings = [];
  const discoveryRows = [];
  const documentedGameFixtureUses = [];
  const helperOwnershipRows = [];
  const scopeRows = [];
  const scanRows = [];
  const placementRows = [];
  const laneDirectoryRows = [];

  const allowedDirs = new Set(Object.values(laneDirs));
  if (scopedDiscovery) {
    laneDirectoryRows.push(...makeScopedLaneDirectoryRows(options.targetFiles || [], options.lanes || []));
  } else {
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
          reason: [laneDirs.engine, laneDirs.integration].includes(directory)
            ? "No Playwright specs are currently present; this lane may be empty."
            : "Expected Playwright lane directory is missing.",
          status: [laneDirs.engine, laneDirs.integration].includes(directory) ? "SKIP" : "FAIL"
        });
        if (![laneDirs.engine, laneDirs.integration].includes(directory)) {
          findings.push(finding(
            "FAIL",
            directory,
            "Required Playwright lane directory is missing.",
            "Create the lane directory or restore the moved specs before running Playwright lanes."
          ));
        }
      }
    }
  }

  const requestedOwnerships = requestedOwnershipsForLanes(options.lanes || []);
  for (const targetFile of uniqueRelativePaths(options.targetFiles || [])) {
    const actualLane = laneFromPlaywrightPath(targetFile);
    const isDirectoryTarget = targetFile === playwrightRoot
      || Object.values(laneDirs).includes(targetFile)
      || targetFile.endsWith("/");
    const status = !isDirectoryTarget && (!scopedDiscovery || requestedOwnerships.size === 0 || requestedOwnerships.has(actualLane))
      ? "PASS"
      : "FAIL";
    scopeRows.push({
      file: targetFile,
      reason: isDirectoryTarget
        ? "Directory targets would force broad test enumeration."
        : (status === "PASS" ? "Explicit target is inside the selected discovery lane scope." : `Target belongs to ${actualLane}, outside requested scoped lane ownership.`),
      role: "target spec",
      status
    });
    if (status === "FAIL") {
      findings.push(finding(
        "FAIL",
        targetFile,
        "Scoped discovery target would expand outside the selected lane.",
        "Use explicit spec files owned by the selected targeted lane; do not pass lane directories or unrelated lane files."
      ));
    }
  }

  for (const helperFile of uniqueRelativePaths(options.helperFiles || [])) {
    const status = helperFile.startsWith(`${sharedHelpersDir}/`) && helperFile.endsWith(".mjs") ? "PASS" : "FAIL";
    scopeRows.push({
      file: helperFile,
      reason: status === "PASS"
        ? "Required shared helper was resolved from targeted spec imports."
        : "Helper scope must stay under dev/tests/helpers and use .mjs modules.",
      role: "required shared helper",
      status
    });
    if (status === "FAIL") {
      findings.push(finding(
        "FAIL",
        helperFile,
        "Scoped discovery helper is outside the shared helper area.",
        `Move helper discovery under ${sharedHelpersDir}/ or make the fixture explicit.`
      ));
    }
  }

  for (const fixtureFile of uniqueRelativePaths(options.fixtureFiles || [])) {
    scopeRows.push({
      file: fixtureFile,
      reason: "Explicit fixture was resolved from lane configuration or targeted file references.",
      role: "required fixture",
      status: "PASS"
    });
  }

  if (scopedDiscovery) {
    scanRows.push(
      {
        path: playwrightRoot,
        reason: "Targeted lanes supplied explicit spec files; global Playwright discovery was not used.",
        status: "PREVENTED"
      },
      {
        path: sharedHelpersDir,
        reason: "Helper discovery used the targeted import graph instead of enumerating every helper.",
        status: "SCOPED"
      },
      {
        path: "www/games/",
        reason: "Game fixture discovery used explicit manifest/path references from targeted files.",
        status: "SCOPED"
      }
    );
    Object.entries(laneDirs).forEach(([ownership, directory]) => {
      scanRows.push({
        path: directory,
        reason: requestedOwnerships.has(ownership)
          ? "Selected lane discovery was restricted to explicit target specs."
          : "Unselected lane directory discovery was skipped.",
        status: requestedOwnerships.has(ownership) ? "SCOPED" : "SKIP"
      });
    });
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

    if (gameNames.length > 0 && !startsWithGameName(gameSpec, gameNames)) {
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
    placementRows,
    scanRows,
    scopedDiscovery,
    scopeRows
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
    "- Game-specific specs are prohibited under dev/tests/playwright/tools.",
    "- Cross-surface tests belong under dev/tests/playwright/integration.",
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

function makeDiscoveryScopeReport(result) {
  const blockingFindings = result.findings.filter((entry) => entry.severity === "FAIL");
  const lines = [
    "# Playwright Discovery Scope Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${blockingFindings.length === 0 ? "PASS" : "FAIL"}`,
    `Scoped discovery: ${result.scopedDiscovery ? "Yes" : "No"}`,
    "",
    "## Targeted Discovery Scope",
    "",
    "| Role | File | Status | Reason |",
    "| --- | --- | --- | --- |"
  ];

  if (result.scopeRows.length === 0) {
    lines.push("| none | none | SKIP | No explicit scoped discovery inputs were provided; standalone audit used the broad structural mode. |");
  } else {
    result.scopeRows.forEach((row) => {
      lines.push(`| ${row.role} | ${row.file} | ${row.status} | ${reportCell(row.reason)} |`);
    });
  }

  lines.push(
    "",
    "## Scope Guard",
    "",
    "- Targeted lane discovery must use explicit spec files instead of lane-directory targets.",
    "- Required shared helpers must be resolved from targeted imports.",
    "- Required fixtures must come from lane configuration or targeted file references.",
    "- Unaffected Workspace/global lanes must remain outside targeted discovery scope.",
    "- Ownership failures are deterministic blockers and do not trigger fallback discovery expansion.",
    "",
    "## Blockers",
    ""
  );

  if (blockingFindings.length === 0) {
    lines.push("No scoped discovery blockers.");
  } else {
    lines.push("| File | Finding | Action |");
    lines.push("| --- | --- | --- |");
    blockingFindings.forEach((entry) => {
      lines.push(`| ${entry.file} | ${reportCell(entry.message)} | ${reportCell(entry.action)} |`);
    });
  }

  return `${lines.join("\n").trim()}\n`;
}

function makeFilesystemScanReductionReport(result) {
  const blockingFindings = result.findings.filter((entry) => entry.severity === "FAIL");
  const lines = [
    "# Filesystem Scan Reduction Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${blockingFindings.length === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Scan Enforcement",
    "",
    "| Path | Status | Reason |",
    "| --- | --- | --- |"
  ];

  if (result.scanRows.length === 0) {
    lines.push("| dev/tests/playwright | BROAD | Standalone structural audit intentionally enumerated all Playwright ownership buckets. |");
    lines.push("| dev/tests/helpers | BROAD | Standalone structural audit intentionally checked all shared helper ownership. |");
  } else {
    result.scanRows.forEach((row) => {
      lines.push(`| ${row.path} | ${row.status} | ${reportCell(row.reason)} |`);
    });
  }

  lines.push(
    "",
    "## Runtime Savings Observations",
    "",
    result.scopedDiscovery
      ? "- Scoped discovery prevented broad Playwright lane-directory enumeration for targeted execution."
      : "- Standalone ownership validation used broad mode by design; targeted lane runner supplies scoped discovery inputs.",
    "- Helper and fixture inputs are explicit, allowing the runner to cache the discovery map within one execution cycle.",
    "- Deterministic discovery-scope failures block Playwright launch instead of expanding into fallback lanes.",
    "- Full samples smoke remains outside targeted discovery unless samples scope is explicitly active.",
    "",
    "## Blockers",
    ""
  );

  if (blockingFindings.length === 0) {
    lines.push("No scan-scope blockers.");
  } else {
    lines.push("| File | Finding | Action |");
    lines.push("| --- | --- | --- |");
    blockingFindings.forEach((entry) => {
      lines.push(`| ${entry.file} | ${reportCell(entry.message)} | ${reportCell(entry.action)} |`);
    });
  }

  return `${lines.join("\n").trim()}\n`;
}

async function writeReport(reportPath, text) {
  const absoluteReportPath = path.resolve(repoRoot, reportPath);
  await fs.mkdir(path.dirname(absoluteReportPath), { recursive: true });
  await fs.writeFile(absoluteReportPath, text, "utf8");
  console.log(`Wrote ${absoluteReportPath}`);
}

const options = parseArgs(process.argv.slice(2));
const result = await audit(options);
await writeReport(options.reportPath, makeReport(result));
await writeReport(options.discoveryReportPath, makeDiscoveryOwnershipReport(result));
await writeReport(options.discoveryScopeReportPath, makeDiscoveryScopeReport(result));
await writeReport(options.filesystemScanReportPath, makeFilesystemScanReductionReport(result));

const failures = result.findings.filter((entry) => entry.severity === "FAIL");
if (failures.length > 0) {
  console.error("Playwright structure audit failed:");
  failures.forEach((entry) => {
    console.error(`- ${entry.file}: ${entry.message} ${entry.action}`);
  });
  process.exit(1);
}

console.log("Playwright structure audit passed.");
