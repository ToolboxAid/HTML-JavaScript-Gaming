/*
Toolbox Aid
David Quesenberry
05/26/2026
run-targeted-test-lanes.mjs
*/
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const defaultReportPath = "docs/dev/reports/testing_lane_execution_report.md";
const defaultDependencyGatingReportPath = "docs/dev/reports/dependency_gating_report.md";
const defaultDiscoveryOwnershipReportPath = "docs/dev/reports/playwright_discovery_ownership_report.md";
const defaultDiscoveryScopeReportPath = "docs/dev/reports/playwright_discovery_scope_report.md";
const defaultFilesystemScanReportPath = "docs/dev/reports/filesystem_scan_reduction_report.md";
const defaultIncrementalValidationReportPath = "docs/dev/reports/incremental_validation_report.md";
const defaultLaneInputValidationReportPath = "docs/dev/reports/lane_input_validation_report.md";
const defaultLaneDeduplicationReportPath = "docs/dev/reports/lane_deduplication_report.md";
const defaultLaneCompilationReportPath = "docs/dev/reports/lane_compilation_report.md";
const defaultLaneRuntimeOptimizationReportPath = "docs/dev/reports/lane_runtime_optimization_report.md";
const defaultStaticReportPath = "docs/dev/reports/static_validation_report.md";
const defaultTargetedFileManifestReportPath = "docs/dev/reports/targeted_file_manifest_report.md";
const defaultPersistentLaneManifestReportPath = "docs/dev/reports/persistent_lane_manifest_report.md";
const defaultPersistentLaneManifestDir = "docs/dev/reports/lane_manifests";
const defaultValidationCacheReportPath = "docs/dev/reports/validation_cache_report.md";
const defaultZeroBrowserReportPath = "docs/dev/reports/zero_browser_preflight_report.md";
const locationAuditScript = "scripts/audit-playwright-test-locations.mjs";
const playwrightCli = path.join(
  repoRoot,
  "node_modules",
  "@playwright",
  "test",
  "cli.js"
);
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const persistentLaneManifestVersion = 1;

function nodeCommand(scriptPath, ...args) {
  return {
    args: [scriptPath, ...args],
    command: process.execPath,
    type: "node"
  };
}

function npmCommand(...args) {
  return {
    args,
    command: npmBin,
    type: "npm"
  };
}

function playwrightCommand(...specPaths) {
  return {
    args: [
      playwrightCli,
      "test",
      ...specPaths,
      "--project=playwright",
      "--workers=1",
      "--reporter=list"
    ],
    command: process.execPath,
    type: "playwright"
  };
}

const laneDefinitions = Object.freeze({
  "workspace-contract": {
    affectedSurface: "Workspace Manager V2 contract and lifecycle behavior",
    commands: [
      npmCommand("run", "test:workspace-v2")
    ],
    dependencies: [],
    discoveryTargets: [
      "tests/playwright/tools/WorkspaceManagerV2.spec.mjs"
    ],
    fixtures: [
      "tests/fixtures/workspace-v2/uat.manifest.json",
      "mocked File System Access repo handles",
      "explicit game manifest/toolState payloads"
    ],
    fixturePaths: [
      "tests/fixtures/workspace-v2/uat.manifest.json"
    ],
    ownership: "tools",
    requiresPreflight: true,
    reason: "Workspace V2 contract lane validates launch, manifest handoff, toolState open/save, and lifecycle contracts."
  },
  "tool-runtime": {
    affectedSurface: "First-class tool runtime behavior",
    commands: [
      playwrightCommand(
        "tests/playwright/tools/AssetManagerV2.spec.mjs",
        "--grep",
        "launch guard|temporary UAT context|rejects non-Workspace"
      ),
      playwrightCommand(
        "tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs",
        "tests/playwright/tools/CollisionInspectorV2.spec.mjs"
      )
    ],
    dependencies: [],
    discoveryTargets: [
      "tests/playwright/tools/AssetManagerV2.spec.mjs",
      "tests/playwright/tools/CollisionInspectorV2.spec.mjs",
      "tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs"
    ],
    fixtures: [
      "tool-specific mocked repo/file picker inputs",
      "explicit manifest/toolState launch contexts"
    ],
    fixturePaths: [],
    ownership: "tools",
    playwrightDir: "tests/playwright/tools",
    requiresPreflight: true,
    reason: "Tool runtime lane validates focused tool behavior without treating unrelated stale product assertions as blockers."
  },
  "game-runtime": {
    affectedSurface: "Game-owned Playwright runtime behavior",
    commands: [
      playwrightCommand(
        "tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs",
        "tests/playwright/games/AsteroidsBeatTiming.spec.mjs",
        "tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs",
        "tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs"
      )
    ],
    dependencies: [],
    discoveryTargets: [
      "tests/playwright/games/AsteroidsBackgroundAssetResolution.spec.mjs",
      "tests/playwright/games/AsteroidsBeatTiming.spec.mjs",
      "tests/playwright/games/AsteroidsGameSceneCleanup.spec.mjs",
      "tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs"
    ],
    fixtures: [
      "explicit Asteroids manifest/page fixtures",
      "repo-served browser pages"
    ],
    fixturePaths: [],
    ownership: "games",
    playwrightDir: "tests/playwright/games",
    requiresPreflight: true,
    reason: "Game runtime lane validates explicit game-owned Playwright behavior only."
  },
  integration: {
    affectedSurface: "Workspace, tool, game index, and manifest handoff behavior",
    commands: [
      playwrightCommand("tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs", "--grep", "Pong")
    ],
    dependencies: [],
    discoveryTargets: [
      "tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs"
    ],
    fixtures: [
      "repo game manifests",
      "manifest preview asset roles",
      "repo-served browser pages"
    ],
    fixturePaths: [],
    ownership: "integration",
    playwrightDir: "tests/playwright/integration",
    requiresPreflight: true,
    reason: "Integration lane validates explicit cross-surface handoffs only; broad all-game thumbnail coverage is outside the default targeted lane."
  },
  "engine-src": {
    affectedSurface: "src/ engine and shared runtime capability behavior",
    commands: [
      nodeCommand(
        "scripts/run-node-test-files.mjs",
        "tests/core/EngineCoreBoundaryBaseline.test.mjs",
        "tests/core/FrameClock.test.mjs",
        "tests/core/FixedTicker.test.mjs",
        "tests/assets/AssetLoaderSystem.test.mjs",
        "tests/audio/AudioService.test.mjs",
        "tests/input/InputMap.test.mjs",
        "tests/input/KeyboardState.test.mjs",
        "tests/input/MouseState.test.mjs",
        "tests/input/GamepadInputAdapter.test.mjs",
        "tests/input/GamepadHapticsService.test.mjs",
        "tests/render/Renderer.test.mjs"
      )
    ],
    dependencies: [],
    discoveryTargets: [],
    fixtures: [
      "explicit node unit fixtures",
      "fresh in-memory localStorage/sessionStorage mocks per file"
    ],
    fixturePaths: [],
    ownership: "engine",
    reason: "Engine/src lane validates reusable runtime surfaces through targeted node tests."
  },
  samples: {
    affectedSurface: "Affected samples lane, on request only",
    commands: [
      nodeCommand(
        "scripts/run-node-test-files.mjs",
        "tests/samples/SamplesProgramCombinedPass.test.mjs",
        "tests/samples/FullscreenRuleEnforcement.test.mjs"
      )
    ],
    dependencies: [],
    discoveryTargets: [],
    fixtures: [
      "sample metadata and validation artifacts",
      "sample structure fixtures"
    ],
    fixturePaths: [],
    ownership: "samples",
    reason: "Samples lane is on-request or affected-sample only and is not the full samples smoke test.",
    requiresPreflight: true,
    requiresSamplesFlag: true
  }
});

function parseArgs(argv) {
  const options = {
    dependencyGatingReportPath: defaultDependencyGatingReportPath,
    discoveryOwnershipReportPath: defaultDiscoveryOwnershipReportPath,
    discoveryScopeReportPath: defaultDiscoveryScopeReportPath,
    dryRun: false,
    filesystemScanReportPath: defaultFilesystemScanReportPath,
    includeSamples: false,
    incrementalValidationReportPath: defaultIncrementalValidationReportPath,
    laneInputValidationReportPath: defaultLaneInputValidationReportPath,
    laneCompilationReportPath: defaultLaneCompilationReportPath,
    laneDeduplicationReportPath: defaultLaneDeduplicationReportPath,
    laneRuntimeOptimizationReportPath: defaultLaneRuntimeOptimizationReportPath,
    lanes: [],
    rawLaneRequests: [],
    reportPath: defaultReportPath,
    persistentLaneManifestDir: defaultPersistentLaneManifestDir,
    persistentLaneManifestReportPath: defaultPersistentLaneManifestReportPath,
    skipPreflight: false,
    staticOnly: false,
    staticReportPath: defaultStaticReportPath,
    targetedFileManifestReportPath: defaultTargetedFileManifestReportPath,
    validationCacheReportPath: defaultValidationCacheReportPath,
    zeroBrowserOnly: false,
    zeroBrowserReportPath: defaultZeroBrowserReportPath
  };

  function addLaneRequests(lanes) {
    lanes.forEach((lane) => {
      options.lanes.push(lane);
      options.rawLaneRequests.push(lane);
    });
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--all") {
      addLaneRequests(Object.keys(laneDefinitions));
    } else if (argument === "--discovery-ownership-report") {
      options.discoveryOwnershipReportPath = argv[index + 1] || defaultDiscoveryOwnershipReportPath;
      index += 1;
    } else if (argument.startsWith("--discovery-ownership-report=")) {
      options.discoveryOwnershipReportPath = argument.slice("--discovery-ownership-report=".length);
    } else if (argument === "--discovery-scope-report") {
      options.discoveryScopeReportPath = argv[index + 1] || defaultDiscoveryScopeReportPath;
      index += 1;
    } else if (argument.startsWith("--discovery-scope-report=")) {
      options.discoveryScopeReportPath = argument.slice("--discovery-scope-report=".length);
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--filesystem-scan-report") {
      options.filesystemScanReportPath = argv[index + 1] || defaultFilesystemScanReportPath;
      index += 1;
    } else if (argument.startsWith("--filesystem-scan-report=")) {
      options.filesystemScanReportPath = argument.slice("--filesystem-scan-report=".length);
    } else if (argument === "--include-samples") {
      options.includeSamples = true;
    } else if (argument === "--incremental-validation-report") {
      options.incrementalValidationReportPath = argv[index + 1] || defaultIncrementalValidationReportPath;
      index += 1;
    } else if (argument.startsWith("--incremental-validation-report=")) {
      options.incrementalValidationReportPath = argument.slice("--incremental-validation-report=".length);
    } else if (argument === "--lane-input-report") {
      options.laneInputValidationReportPath = argv[index + 1] || defaultLaneInputValidationReportPath;
      index += 1;
    } else if (argument.startsWith("--lane-input-report=")) {
      options.laneInputValidationReportPath = argument.slice("--lane-input-report=".length);
    } else if (argument === "--skip-preflight") {
      options.skipPreflight = true;
    } else if (argument === "--static-only") {
      options.staticOnly = true;
    } else if (argument === "--zero-browser-only") {
      options.zeroBrowserOnly = true;
    } else if (argument === "--lane") {
      addLaneRequests([argv[index + 1]]);
      index += 1;
    } else if (argument.startsWith("--lane=")) {
      addLaneRequests([argument.slice("--lane=".length)]);
    } else if (argument === "--lanes") {
      addLaneRequests(String(argv[index + 1] || "").split(","));
      index += 1;
    } else if (argument.startsWith("--lanes=")) {
      addLaneRequests(argument.slice("--lanes=".length).split(","));
    } else if (argument === "--report") {
      options.reportPath = argv[index + 1] || defaultReportPath;
      index += 1;
    } else if (argument.startsWith("--report=")) {
      options.reportPath = argument.slice("--report=".length);
    } else if (argument === "--persistent-manifest-dir") {
      options.persistentLaneManifestDir = argv[index + 1] || defaultPersistentLaneManifestDir;
      index += 1;
    } else if (argument.startsWith("--persistent-manifest-dir=")) {
      options.persistentLaneManifestDir = argument.slice("--persistent-manifest-dir=".length);
    } else if (argument === "--persistent-manifest-report") {
      options.persistentLaneManifestReportPath = argv[index + 1] || defaultPersistentLaneManifestReportPath;
      index += 1;
    } else if (argument.startsWith("--persistent-manifest-report=")) {
      options.persistentLaneManifestReportPath = argument.slice("--persistent-manifest-report=".length);
    } else if (argument === "--dependency-report") {
      options.dependencyGatingReportPath = argv[index + 1] || defaultDependencyGatingReportPath;
      index += 1;
    } else if (argument.startsWith("--dependency-report=")) {
      options.dependencyGatingReportPath = argument.slice("--dependency-report=".length);
    } else if (argument === "--static-report") {
      options.staticReportPath = argv[index + 1] || defaultStaticReportPath;
      index += 1;
    } else if (argument.startsWith("--static-report=")) {
      options.staticReportPath = argument.slice("--static-report=".length);
    } else if (argument === "--targeted-file-manifest-report") {
      options.targetedFileManifestReportPath = argv[index + 1] || defaultTargetedFileManifestReportPath;
      index += 1;
    } else if (argument.startsWith("--targeted-file-manifest-report=")) {
      options.targetedFileManifestReportPath = argument.slice("--targeted-file-manifest-report=".length);
    } else if (argument === "--zero-browser-report") {
      options.zeroBrowserReportPath = argv[index + 1] || defaultZeroBrowserReportPath;
      index += 1;
    } else if (argument.startsWith("--zero-browser-report=")) {
      options.zeroBrowserReportPath = argument.slice("--zero-browser-report=".length);
    } else if (argument === "--lane-compilation-report") {
      options.laneCompilationReportPath = argv[index + 1] || defaultLaneCompilationReportPath;
      index += 1;
    } else if (argument.startsWith("--lane-compilation-report=")) {
      options.laneCompilationReportPath = argument.slice("--lane-compilation-report=".length);
    } else if (argument === "--lane-deduplication-report") {
      options.laneDeduplicationReportPath = argv[index + 1] || defaultLaneDeduplicationReportPath;
      index += 1;
    } else if (argument.startsWith("--lane-deduplication-report=")) {
      options.laneDeduplicationReportPath = argument.slice("--lane-deduplication-report=".length);
    } else if (argument === "--lane-runtime-report") {
      options.laneRuntimeOptimizationReportPath = argv[index + 1] || defaultLaneRuntimeOptimizationReportPath;
      index += 1;
    } else if (argument.startsWith("--lane-runtime-report=")) {
      options.laneRuntimeOptimizationReportPath = argument.slice("--lane-runtime-report=".length);
    } else if (argument === "--validation-cache-report") {
      options.validationCacheReportPath = argv[index + 1] || defaultValidationCacheReportPath;
      index += 1;
    } else if (argument.startsWith("--validation-cache-report=")) {
      options.validationCacheReportPath = argument.slice("--validation-cache-report=".length);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  options.rawLaneRequests = options.rawLaneRequests.map((lane) => lane.trim()).filter(Boolean);
  options.lanes = [...new Set(options.rawLaneRequests)];
  if (options.lanes.length === 0) {
    options.lanes = ["workspace-contract", "tool-runtime", "game-runtime", "integration", "engine-src", "samples"];
    options.rawLaneRequests = [...options.lanes];
  }
  return options;
}

function commandArgToString(argument) {
  const value = String(argument);
  return /[\s|&()]/.test(value) ? JSON.stringify(value) : value;
}

function commandToString(commandConfig) {
  return [commandConfig.command, ...commandConfig.args].map(commandArgToString).join(" ");
}

async function runCommand(commandConfig) {
  const displayCommand = commandToString(commandConfig);
  console.log(`\nRUN ${displayCommand}`);
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(commandConfig.command, commandConfig.args, {
      cwd: repoRoot,
      env: process.env,
      shell: process.platform === "win32" && commandConfig.command.endsWith(".cmd"),
      stdio: "inherit"
    });
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
  return { displayCommand, exitCode };
}

function summarize(results) {
  return results.reduce((summary, result) => {
    summary[result.status] = (summary[result.status] || 0) + 1;
    return summary;
  }, { FAIL: 0, PASS: 0, SKIP: 0, WARN: 0 });
}

function reportLine(value) {
  return String(value || "").replace(/\r?\n/g, " ");
}

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function fingerprint(value) {
  return createHash("sha256").update(stableJson(value)).digest("hex").slice(0, 16);
}

function commandFingerprint(commandConfig) {
  return {
    args: commandConfig.args,
    command: commandConfig.command,
    targets: commandTargetFiles(commandConfig),
    type: commandConfig.type
  };
}

function laneDefinitionsFingerprint() {
  const lanes = {};
  for (const [lane, definition] of Object.entries(laneDefinitions)) {
    lanes[lane] = {
      commands: definition.commands.map(commandFingerprint),
      dependencies: definition.dependencies || [],
      discoveryTargets: definition.discoveryTargets || [],
      fixturePaths: definition.fixturePaths || [],
      ownership: definition.ownership || "",
      playwrightDir: definition.playwrightDir || "",
      requiresPreflight: Boolean(definition.requiresPreflight),
      requiresSamplesFlag: Boolean(definition.requiresSamplesFlag)
    };
  }
  return fingerprint(lanes);
}

function createValidationCache() {
  const entries = new Map();
  const events = [];

  function cacheableSuccess(result) {
    if (typeof result === "string") {
      return !result.includes("Status: FAIL");
    }
    if (result?.status) {
      return result.status === "PASS";
    }
    if (Array.isArray(result?.findings)) {
      return result.findings.length === 0;
    }
    return true;
  }

  return {
    events,
    async get(stage, input, invalidationInputs, compute) {
      const inputHash = fingerprint(input);
      const cacheKey = `${stage}:${inputHash}`;
      if (entries.has(cacheKey)) {
        events.push({
          inputHash,
          invalidationInputs,
          reusedBy: stage,
          stage,
          status: "HIT"
        });
        return entries.get(cacheKey);
      }
      const result = await compute();
      const shouldCache = cacheableSuccess(result);
      if (shouldCache) {
        entries.set(cacheKey, result);
      }
      events.push({
        inputHash,
        invalidationInputs,
        reusedBy: "",
        stage,
        status: shouldCache ? "MISS" : "MISS_UNCACHED"
      });
      return result;
    },
    reuse(stage, input, reusedBy) {
      const inputHash = fingerprint(input);
      const cacheKey = `${stage}:${inputHash}`;
      if (entries.has(cacheKey)) {
        events.push({
          inputHash,
          invalidationInputs: [],
          reusedBy,
          stage,
          status: "HIT"
        });
      }
    }
  };
}

async function repoPathExists(relativePath) {
  try {
    await fs.access(path.resolve(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function hashRepoFile(relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath);
  const contents = await fs.readFile(path.resolve(repoRoot, normalizedPath));
  return createHash("sha256").update(contents).digest("hex").slice(0, 16);
}

async function hashRepoFiles(relativePaths) {
  const hashes = {};
  for (const relativePath of uniqueRelativePaths(relativePaths)) {
    const normalizedPath = normalizeRelativePath(relativePath);
    try {
      hashes[normalizedPath] = await hashRepoFile(normalizedPath);
    } catch {
      hashes[normalizedPath] = "missing";
    }
  }
  return hashes;
}

function manifestPathForLane(manifestDir, lane) {
  const safeLane = String(lane || "unknown").replace(/[^A-Za-z0-9_-]/g, "-");
  return normalizeRelativePath(path.posix.join(normalizeRelativePath(manifestDir), `${safeLane}.json`));
}

async function readPersistentManifest(manifestDir, lane) {
  const manifestPath = manifestPathForLane(manifestDir, lane);
  try {
    const manifestText = await fs.readFile(path.resolve(repoRoot, manifestPath), "utf8");
    return {
      manifest: JSON.parse(manifestText),
      manifestPath,
      status: "FOUND"
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {
        manifest: null,
        manifestPath,
        status: "MISSING"
      };
    }
    return {
      error: error?.message || String(error),
      manifest: null,
      manifestPath,
      status: "INVALID"
    };
  }
}

async function writePersistentManifest(manifestDir, manifest) {
  const manifestPath = manifestPathForLane(manifestDir, manifest.lane);
  const absoluteManifestPath = path.resolve(repoRoot, manifestPath);
  await fs.mkdir(path.dirname(absoluteManifestPath), { recursive: true });
  await fs.writeFile(absoluteManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifestPath;
}

function commandTargetFiles(commandConfig) {
  if (commandConfig.type === "playwright") {
    return commandConfig.args.filter((argument) => /\.spec\.mjs$/i.test(String(argument)));
  }
  if (commandConfig.type === "node") {
    return commandConfig.args.slice(1).filter((argument) => /\.(mjs|js|json)$/i.test(String(argument)));
  }
  return [];
}

function normalizeRelativePath(relativePath) {
  return String(relativePath || "").replace(/\\/g, "/").replace(/^\.\/+/, "");
}

function uniqueRelativePaths(paths) {
  return [...new Set(paths.map(normalizeRelativePath).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function isUnderPath(relativePath, parentPath) {
  const normalizedPath = normalizeRelativePath(relativePath);
  const normalizedParent = normalizeRelativePath(parentPath).replace(/\/+$/, "");
  return normalizedPath === normalizedParent || normalizedPath.startsWith(`${normalizedParent}/`);
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

async function readRepoText(relativePath, textCache) {
  const normalizedPath = normalizeRelativePath(relativePath);
  if (!textCache.has(normalizedPath)) {
    textCache.set(normalizedPath, fs.readFile(path.resolve(repoRoot, normalizedPath), "utf8"));
  }
  return textCache.get(normalizedPath);
}

async function resolveRelativeImportPath(importerPath, specifier) {
  if (!specifier.startsWith(".")) {
    return "";
  }
  const importerDir = path.dirname(path.resolve(repoRoot, importerPath));
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
    if (await repoPathExists(path.relative(repoRoot, candidate))) {
      return normalizeRelativePath(path.relative(repoRoot, candidate));
    }
  }
  return "";
}

function referencedFixturePaths(content) {
  const fixtures = new Set();
  const patterns = [
    /\btests\/fixtures\/[A-Za-z0-9_./-]+/g,
    /\bgames\/[A-Za-z0-9_-]+\/game\.manifest\.json\b/g,
    /\/games\/([A-Za-z0-9_-]+)\/game\.manifest\.json\b/g
  ];
  for (const pattern of patterns) {
    let match = pattern.exec(content);
    while (match) {
      if (match[0].startsWith("/games/")) {
        fixtures.add(match[0].slice(1));
      } else {
        fixtures.add(match[0]);
      }
      match = pattern.exec(content);
    }
  }
  return [...fixtures];
}

function laneDiscoveryTargets(lane, definition) {
  const configuredTargets = definition.discoveryTargets || [];
  if (configuredTargets.length > 0) {
    return configuredTargets;
  }
  return definition.commands
    .filter((commandConfig) => commandConfig.type === "playwright")
    .flatMap(commandTargetFiles);
}

function laneManifestTests(lane, definition) {
  const discoveryTargets = laneDiscoveryTargets(lane, definition);
  if (discoveryTargets.length > 0) {
    return discoveryTargets;
  }
  return definition.commands.flatMap(commandTargetFiles);
}

function expectedPrefixesForOwnership(ownership) {
  const prefixes = {
    engine: [
      "tests/assets/",
      "tests/audio/",
      "tests/core/",
      "tests/input/",
      "tests/render/",
      "tests/playwright/engine/"
    ],
    games: [
      "tests/playwright/games/"
    ],
    integration: [
      "tests/playwright/integration/"
    ],
    samples: [
      "tests/samples/"
    ],
    tools: [
      "tests/playwright/tools/"
    ]
  };
  return prefixes[ownership] || [];
}

function fixtureAllowedForOwnership(fixturePath, ownership) {
  const normalizedPath = normalizeRelativePath(fixturePath);
  if (normalizedPath.startsWith("tests/fixtures/")) {
    return true;
  }
  if (/^games\/[^/]+\/game\.manifest\.json$/.test(normalizedPath)) {
    return ownership === "tools" || ownership === "games" || ownership === "integration";
  }
  return false;
}

function helperAllowedForManifest(helperPath) {
  return normalizeRelativePath(helperPath).startsWith("tests/helpers/");
}

function manifestCore({ definition, fileHashes, fixtures, helpers, imports, lane, laneDefinitionHash, tests }) {
  const dependencies = definition.dependencies || [];
  const ownership = definition.ownership || "unknown";
  const commandsHash = fingerprint(definition.commands.map(commandFingerprint));
  const dependencyGraphHash = fingerprint({
    dependencies,
    importHashes: Object.fromEntries(imports.map((importPath) => [importPath, fileHashes[importPath] || "missing"])),
    imports
  });
  const inputHash = fingerprint({
    commandsHash,
    dependencies,
    dependencyGraphHash,
    fileHashes,
    fixtures,
    helpers,
    imports,
    lane,
    laneDefinitionHash,
    ownership,
    tests
  });
  const manifestHash = fingerprint({
    dependencyGraphHash,
    inputHash,
    lane,
    ownership,
    version: persistentLaneManifestVersion
  });
  return {
    commandsHash,
    dependencies,
    dependencyGraphHash,
    fileHashes,
    fixtures,
    helpers,
    imports,
    inputHash,
    lane,
    laneDefinitionHash,
    manifestHash,
    ownership,
    tests,
    version: persistentLaneManifestVersion
  };
}

function persistedManifestSchemaFindings(manifest, lane, definition, laneDefinitionHash) {
  const findings = [];
  if (!manifest || typeof manifest !== "object") {
    return [`Persistent manifest for ${lane} is not a JSON object.`];
  }
  if (manifest.version !== persistentLaneManifestVersion) {
    findings.push(`Persistent manifest version changed for ${lane}.`);
  }
  if (manifest.lane !== lane) {
    findings.push(`Persistent manifest lane metadata is stale for ${lane}.`);
  }
  if (manifest.ownership !== definition.ownership) {
    findings.push(`Persistent manifest ownership metadata is stale for ${lane}: ${manifest.ownership || "missing"} -> ${definition.ownership}.`);
  }
  if (manifest.laneDefinitionHash !== laneDefinitionHash) {
    findings.push(`Persistent manifest lane definition hash changed for ${lane}.`);
  }
  ["tests", "helpers", "fixtures", "imports", "dependencies"].forEach((key) => {
    if (!Array.isArray(manifest[key])) {
      findings.push(`Persistent manifest ${key} list is missing for ${lane}.`);
    }
  });
  if (!manifest.fileHashes || typeof manifest.fileHashes !== "object") {
    findings.push(`Persistent manifest file hash map is missing for ${lane}.`);
  }
  if (!manifest.inputHash || !manifest.dependencyGraphHash || !manifest.manifestHash) {
    findings.push(`Persistent manifest hash metadata is incomplete for ${lane}.`);
  }
  return findings;
}

async function validatePersistentManifest({ definition, lane, laneDefinitionHash, manifest }) {
  const schemaFindings = persistedManifestSchemaFindings(manifest, lane, definition, laneDefinitionHash);
  if (schemaFindings.length > 0) {
    return {
      findings: schemaFindings,
      manifest: null,
      status: "INVALID"
    };
  }

  const tests = uniqueRelativePaths(manifest.tests);
  const helpers = uniqueRelativePaths(manifest.helpers);
  const fixtures = uniqueRelativePaths(manifest.fixtures);
  const imports = uniqueRelativePaths(manifest.imports);
  const fileHashes = await hashRepoFiles([
    ...tests,
    ...helpers,
    ...fixtures,
    ...imports
  ]);
  const missingFiles = Object.entries(fileHashes)
    .filter(([, hash]) => hash === "missing")
    .map(([filePath]) => filePath);
  const rebuilt = manifestCore({
    definition,
    fileHashes,
    fixtures,
    helpers,
    imports,
    lane,
    laneDefinitionHash,
    tests
  });
  const hashFindings = [];
  if (manifest.commandsHash !== rebuilt.commandsHash) {
    hashFindings.push(`Persistent manifest command hash changed for ${lane}.`);
  }
  if (manifest.dependencyGraphHash !== rebuilt.dependencyGraphHash) {
    hashFindings.push(`Persistent manifest dependency graph hash changed for ${lane}.`);
  }
  if (manifest.inputHash !== rebuilt.inputHash) {
    hashFindings.push(`Persistent manifest input hash changed for ${lane}.`);
  }
  if (manifest.manifestHash !== rebuilt.manifestHash) {
    hashFindings.push(`Persistent manifest hash changed for ${lane}.`);
  }
  missingFiles.forEach((filePath) => {
    hashFindings.push(`Persistent manifest file is missing for ${lane}: ${filePath}.`);
  });

  return {
    findings: hashFindings,
    manifest: {
      ...rebuilt,
      generatedAt: manifest.generatedAt,
      manifestPath: manifest.manifestPath || ""
    },
    status: hashFindings.length === 0 ? "REUSED" : "INVALIDATED"
  };
}

async function buildScopedDiscoveryPlan({ includeSamples, laneDefinitionHash, lanes, persistentManifestDir }) {
  const textCache = new Map();
  const helperFiles = new Set();
  const fixtureFiles = new Set();
  const importFiles = new Set();
  const laneManifests = [];
  const persistentManifestEvents = [];
  const scanRows = [];
  const targetFiles = [];
  const selectedLanes = lanes.filter((lane) => laneDefinitions[lane]);

  async function collectGraphForFiles(seedFiles) {
    const laneHelperFiles = new Set();
    const laneFixtureFiles = new Set();
    const laneImportFiles = new Set();
    const helperQueue = [];

    async function collectFromFile(relativePath) {
      const content = await readRepoText(relativePath, textCache);
      referencedFixturePaths(content).forEach((fixturePath) => laneFixtureFiles.add(normalizeRelativePath(fixturePath)));
      for (const specifier of extractImports(content)) {
        const resolvedPath = await resolveRelativeImportPath(relativePath, specifier);
        if (!resolvedPath) {
          continue;
        }
        laneImportFiles.add(resolvedPath);
        if (isUnderPath(resolvedPath, "tests/helpers") && !laneHelperFiles.has(resolvedPath)) {
          laneHelperFiles.add(resolvedPath);
          helperQueue.push(resolvedPath);
        } else if (isUnderPath(resolvedPath, "tests/fixtures")) {
          laneFixtureFiles.add(resolvedPath);
        }
      }
    }

    for (const seedFile of seedFiles) {
      if (await repoPathExists(seedFile)) {
        await collectFromFile(seedFile);
      }
    }
    while (helperQueue.length > 0) {
      const helperFile = helperQueue.shift();
      if (await repoPathExists(helperFile)) {
        await collectFromFile(helperFile);
      }
    }

    return {
      fixtures: uniqueRelativePaths([...laneFixtureFiles]),
      helpers: uniqueRelativePaths([...laneHelperFiles]),
      imports: uniqueRelativePaths([...laneImportFiles])
    };
  }

  for (const lane of selectedLanes) {
    const definition = laneDefinitions[lane];
    const persisted = await readPersistentManifest(persistentManifestDir, lane);
    if (definition.requiresSamplesFlag && !includeSamples) {
      laneManifests.push({
        commandsHash: fingerprint(definition.commands.map(commandFingerprint)),
        dependencies: definition.dependencies || [],
        fixtures: [],
        helpers: [],
        imports: [],
        lane,
        manifestHash: fingerprint({ lane, skipped: true }),
        ownership: definition.ownership || "unknown",
        selected: true,
        status: "SKIP",
        tests: []
      });
      persistentManifestEvents.push({
        invalidationReason: "Samples lane is on-request only and was not included.",
        lane,
        manifestPath: persisted.manifestPath,
        status: "SKIP"
      });
      scanRows.push({
        lane,
        reason: "Samples lane is on-request only and was not included, so no sample discovery scope was built.",
        status: "SKIP"
      });
      continue;
    }

    if (persisted.status === "FOUND") {
      const persistedValidation = await validatePersistentManifest({
        definition,
        lane,
        laneDefinitionHash,
        manifest: persisted.manifest
      });
      if (persistedValidation.status === "REUSED") {
        const manifest = {
          ...persistedValidation.manifest,
          manifestPath: persisted.manifestPath,
          source: "persistent"
        };
        laneManifests.push(manifest);
        manifest.tests.forEach((testFile) => targetFiles.push(testFile));
        manifest.helpers.forEach((helperPath) => helperFiles.add(helperPath));
        manifest.fixtures.forEach((fixturePath) => fixtureFiles.add(fixturePath));
        manifest.imports.forEach((importPath) => importFiles.add(importPath));
        persistentManifestEvents.push({
          inputHash: manifest.inputHash,
          invalidationReason: "Inputs unchanged; persisted lane manifest reused.",
          lane,
          manifestHash: manifest.manifestHash,
          manifestPath: persisted.manifestPath,
          status: "REUSED"
        });
        scanRows.push({
          lane,
          reason: `Persisted lane manifest reused from ${persisted.manifestPath}; helper/fixture discovery was skipped.`,
          status: "REUSED"
        });
        continue;
      }
      persistentManifestEvents.push({
        previousInputHash: persisted.manifest?.inputHash || "unknown",
        invalidationReason: persistedValidation.findings.join("; "),
        lane,
        manifestPath: persisted.manifestPath,
        status: "INVALIDATED"
      });
    } else if (persisted.status === "INVALID") {
      persistentManifestEvents.push({
        invalidationReason: `Persistent manifest could not be parsed: ${persisted.error}`,
        lane,
        manifestPath: persisted.manifestPath,
        status: "INVALIDATED"
      });
    } else {
      persistentManifestEvents.push({
        invalidationReason: "No persisted manifest existed for this lane.",
        lane,
        manifestPath: persisted.manifestPath,
        status: "GENERATED"
      });
    }

    const laneTargets = uniqueRelativePaths(laneManifestTests(lane, definition));
    const graph = await collectGraphForFiles(laneTargets);
    const laneFixtureFiles = uniqueRelativePaths([
      ...(definition.fixturePaths || []),
      ...graph.fixtures
    ]);
    const laneHelpers = graph.helpers;
    const laneImports = graph.imports;
    const fileHashes = await hashRepoFiles([
      ...laneTargets,
      ...laneHelpers,
      ...laneFixtureFiles,
      ...laneImports
    ]);
    const manifest = {
      ...manifestCore({
        definition,
        fileHashes,
        fixtures: laneFixtureFiles,
        helpers: laneHelpers,
        imports: laneImports,
        lane,
        laneDefinitionHash,
        tests: laneTargets
      }),
      generatedAt: new Date().toISOString(),
      source: "generated"
    };
    manifest.manifestPath = await writePersistentManifest(persistentManifestDir, manifest);
    const eventIndex = persistentManifestEvents.findIndex((event) => event.lane === lane && (event.status === "GENERATED" || event.status === "INVALIDATED"));
    if (eventIndex >= 0) {
      persistentManifestEvents[eventIndex] = {
        ...persistentManifestEvents[eventIndex],
        inputHash: manifest.inputHash,
        manifestHash: manifest.manifestHash,
        manifestPath: manifest.manifestPath,
        status: persistentManifestEvents[eventIndex].status === "INVALIDATED" ? "INVALIDATED" : "GENERATED"
      };
    }
    targetFiles.push(...laneTargets);
    laneHelpers.forEach((helperPath) => helperFiles.add(helperPath));
    laneFixtureFiles.forEach((fixturePath) => fixtureFiles.add(fixturePath));
    laneImports.forEach((importPath) => importFiles.add(importPath));
    laneManifests.push({
      ...manifest,
      selected: true,
      status: laneTargets.length > 0 || definition.commands.length > 0 ? "PASS" : "SKIP"
    });
    if (laneTargets.length > 0) {
      scanRows.push({
        lane,
        reason: `Targeted file manifest uses explicit input file(s): ${laneTargets.join(", ")}.`,
        status: "SCOPED"
      });
    } else if (definition.requiresPreflight) {
      scanRows.push({
        lane,
        reason: "No Playwright spec targets were required for this selected lane.",
        status: "SKIP"
      });
    }
  }

  return {
    fixtureFiles: uniqueRelativePaths([...fixtureFiles]),
    helperFiles: uniqueRelativePaths([...helperFiles]),
    importFiles: uniqueRelativePaths([...importFiles]),
    laneManifests,
    persistentManifestDir: normalizeRelativePath(persistentManifestDir),
    persistentManifestEvents,
    scanRows,
    selectedLanes,
    targetFiles: uniqueRelativePaths(targetFiles),
    textReads: textCache.size
  };
}

function validateScopedDiscoveryPlan({ includeSamples, lanes, scopedDiscovery }) {
  const findings = [];
  const selectedLaneSet = new Set(lanes);
  const targetRows = [];
  const laneOwnership = new Map(Object.entries(laneDefinitions).map(([lane, definition]) => [
    lane,
    expectedPrefixesForOwnership(definition.ownership)
  ]));

  for (const lane of lanes.filter((entry) => laneDefinitions[entry])) {
    const definition = laneDefinitions[lane];
    if (definition.requiresSamplesFlag && !includeSamples) {
      continue;
    }
    const laneTargets = scopedDiscovery.targetFiles.filter((targetFile) => (
      (laneOwnership.get(lane) || []).some((prefix) => targetFile.startsWith(prefix))
    ));
    if (definition.requiresPreflight && (laneOwnership.get(lane) || []).length > 0 && laneTargets.length === 0) {
      findings.push(`Lane ${lane} has no scoped manifest target.`);
    }
  }

  for (const targetFile of scopedDiscovery.targetFiles) {
    const matchingLane = [...laneOwnership.entries()]
      .find(([lane, prefixes]) => selectedLaneSet.has(lane) && prefixes.some((prefix) => targetFile.startsWith(prefix)));
    const isDirectoryTarget = targetFile === "tests/playwright"
      || targetFile.endsWith("/")
      || [
        "tests/playwright/tools",
        "tests/playwright/games",
        "tests/playwright/integration",
        "tests/playwright/engine",
        "tests/core",
        "tests/assets",
        "tests/audio",
        "tests/input",
        "tests/render",
        "tests/samples"
      ].includes(targetFile);
    const status = matchingLane && !isDirectoryTarget ? "PASS" : "FAIL";
    targetRows.push({
      file: targetFile,
      lane: matchingLane?.[0] || "unselected",
      reason: status === "PASS"
        ? "Target is explicitly owned by the selected lane."
        : "Target would require broad or unrelated Playwright discovery.",
      status
    });
    if (status === "FAIL") {
      findings.push(`Scoped discovery target is outside selected lane ownership: ${targetFile}.`);
    }
  }

  for (const helperFile of scopedDiscovery.helperFiles) {
    if (!helperFile.startsWith("tests/helpers/")) {
      findings.push(`Scoped helper is outside tests/helpers: ${helperFile}.`);
    }
  }

  return {
    findings: [...new Set(findings)],
    includeSamples,
    lanes,
    status: findings.length > 0 ? "FAIL" : "PASS",
    targetRows
  };
}

async function validateTargetedFileManifests({ includeSamples, lanes, scopedDiscovery }) {
  const findings = [];
  const fileRows = [];
  const manifestRows = [];
  const manifestByLane = new Map(scopedDiscovery.laneManifests.map((manifest) => [manifest.lane, manifest]));
  const expectedTargetFiles = new Set();
  const expectedHelperFiles = new Set();
  const expectedFixtureFiles = new Set();

  for (const lane of lanes.filter((entry) => laneDefinitions[entry])) {
    const definition = laneDefinitions[lane];
    const manifest = manifestByLane.get(lane);
    if (!manifest) {
      findings.push(`Lane ${lane} did not produce a targeted-file manifest.`);
      manifestRows.push({
        fixtures: [],
        helpers: [],
        imports: [],
        lane,
        manifestHash: "missing",
        ownership: definition.ownership || "unknown",
        reason: "No manifest was generated for the selected lane.",
        status: "FAIL",
        tests: []
      });
      continue;
    }

    if (definition.requiresSamplesFlag && !includeSamples) {
      manifestRows.push({
        ...manifest,
        reason: "Samples lane is on-request only and was not included.",
        status: "SKIP"
      });
      continue;
    }

    const expectedPrefixes = expectedPrefixesForOwnership(manifest.ownership);
    const commandTargets = uniqueRelativePaths(definition.commands.flatMap(commandTargetFiles));
    const manifestTests = new Set(manifest.tests);
    const laneFindings = [];

    for (const testFile of manifest.tests) {
      expectedTargetFiles.add(testFile);
      const ownedByLane = expectedPrefixes.some((prefix) => testFile.startsWith(prefix));
      const exists = await repoPathExists(testFile);
      const status = ownedByLane && exists ? "PASS" : "FAIL";
      fileRows.push({
        file: testFile,
        lane,
        reason: status === "PASS"
          ? "Manifest test input is explicit, present, and owned by the lane."
          : "Manifest test input is missing or outside lane ownership.",
        role: "test",
        status
      });
      if (!ownedByLane) {
        laneFindings.push(`Manifest test outside ${manifest.ownership} ownership: ${testFile}.`);
      }
      if (!exists) {
        laneFindings.push(`Manifest test file is missing: ${testFile}.`);
      }
    }

    for (const commandTarget of commandTargets) {
      if (!manifestTests.has(commandTarget)) {
        laneFindings.push(`Runtime command target is not declared in the lane manifest: ${commandTarget}.`);
      }
    }

    for (const helperFile of manifest.helpers) {
      expectedHelperFiles.add(helperFile);
      const helperStatus = helperAllowedForManifest(helperFile) && await repoPathExists(helperFile) ? "PASS" : "FAIL";
      fileRows.push({
        file: helperFile,
        lane,
        reason: helperStatus === "PASS"
          ? "Reusable helper is explicit, present, and shared-helper owned."
          : "Helper is missing or outside tests/helpers.",
        role: "helper",
        status: helperStatus
      });
      if (helperStatus === "FAIL") {
        laneFindings.push(`Invalid manifest helper for ${lane}: ${helperFile}.`);
      }
    }

    for (const fixtureFile of manifest.fixtures) {
      expectedFixtureFiles.add(fixtureFile);
      const fixtureStatus = fixtureAllowedForOwnership(fixtureFile, manifest.ownership) && await repoPathExists(fixtureFile) ? "PASS" : "FAIL";
      fileRows.push({
        file: fixtureFile,
        lane,
        reason: fixtureStatus === "PASS"
          ? "Fixture is explicit, present, and allowed for the lane ownership."
          : "Fixture is missing or not allowed for this lane ownership.",
        role: "fixture",
        status: fixtureStatus
      });
      if (fixtureStatus === "FAIL") {
        laneFindings.push(`Invalid manifest fixture for ${lane}: ${fixtureFile}.`);
      }
    }

    for (const importFile of manifest.imports) {
      const importExists = await repoPathExists(importFile);
      fileRows.push({
        file: importFile,
        lane,
        reason: importExists
          ? "Relative import dependency is resolved and recorded in the manifest."
          : "Relative import dependency is missing.",
        role: "import",
        status: importExists ? "PASS" : "FAIL"
      });
      if (!importExists) {
        laneFindings.push(`Manifest import dependency is missing: ${importFile}.`);
      }
    }

    const rebuiltManifest = manifestCore({
      definition,
      fileHashes: manifest.fileHashes || {},
      fixtures: manifest.fixtures,
      helpers: manifest.helpers,
      imports: manifest.imports,
      lane: manifest.lane,
      laneDefinitionHash: manifest.laneDefinitionHash,
      tests: manifest.tests
    });
    if (rebuiltManifest.dependencyGraphHash !== manifest.dependencyGraphHash) {
      laneFindings.push(`Manifest dependency graph hash changed during validation for lane ${lane}.`);
    }
    if (rebuiltManifest.inputHash !== manifest.inputHash) {
      laneFindings.push(`Manifest input hash changed during validation for lane ${lane}.`);
    }
    if (rebuiltManifest.manifestHash !== manifest.manifestHash) {
      laneFindings.push(`Manifest hash changed during validation for lane ${lane}.`);
    }

    laneFindings.forEach((entry) => findings.push(entry));
    manifestRows.push({
      ...manifest,
      reason: laneFindings.length === 0
        ? "Manifest ownership, helpers, fixtures, imports, and command targets are deterministic before runtime."
        : laneFindings.join("; "),
      status: laneFindings.length === 0 ? "PASS" : "FAIL"
    });
  }

  const expansionFindings = [];
  for (const targetFile of scopedDiscovery.targetFiles) {
    if (!expectedTargetFiles.has(targetFile)) {
      expansionFindings.push(`Scoped discovery target was not declared by any lane manifest: ${targetFile}.`);
    }
  }
  for (const helperFile of scopedDiscovery.helperFiles) {
    if (!expectedHelperFiles.has(helperFile)) {
      expansionFindings.push(`Scoped discovery helper was not declared by any lane manifest: ${helperFile}.`);
    }
  }
  for (const fixtureFile of scopedDiscovery.fixtureFiles) {
    if (!expectedFixtureFiles.has(fixtureFile)) {
      expansionFindings.push(`Scoped discovery fixture was not declared by any lane manifest: ${fixtureFile}.`);
    }
  }
  findings.push(...expansionFindings);

  return {
    fileRows,
    findings: [...new Set(findings)],
    manifestRows,
    preventedDiscoveryExpansion: expansionFindings.length === 0,
    preventedRedundantScans: Math.max(0, scopedDiscovery.textReads - scopedDiscovery.laneManifests.length),
    status: findings.length === 0 ? "PASS" : "FAIL"
  };
}

function grepPatterns(commandConfig) {
  const patterns = [];
  commandConfig.args.forEach((argument, index) => {
    if (argument === "--grep") {
      patterns.push(commandConfig.args[index + 1] || "");
    }
  });
  return patterns;
}

async function validateRunnerPreflight(lanes) {
  const findings = [];
  const notes = [];
  for (const lane of lanes) {
    const definition = laneDefinitions[lane];
    for (const fixturePath of definition.fixturePaths || []) {
      if (!(await repoPathExists(fixturePath))) {
        findings.push(`Lane ${lane} is missing fixture: ${fixturePath}`);
      }
    }

    for (const commandConfig of definition.commands) {
      const displayCommand = commandToString(commandConfig);
      if (commandConfig.type === "playwright") {
        if (commandConfig.command !== process.execPath || commandConfig.args[0] !== playwrightCli) {
          findings.push(`Lane ${lane} must invoke Playwright through the Node CLI entrypoint: ${displayCommand}`);
        }
        if (commandConfig.args[1] !== "test") {
          findings.push(`Lane ${lane} has an invalid Playwright command shape: ${displayCommand}`);
        }
      }

      const targets = commandTargetFiles(commandConfig);
      if (commandConfig.type === "playwright" && targets.length === 0) {
        findings.push(`Lane ${lane} has no explicit Playwright spec target: ${displayCommand}`);
      }

      for (const target of targets) {
        if (!(await repoPathExists(target))) {
          findings.push(`Lane ${lane} targets a missing file: ${target}`);
        }
        if (commandConfig.type === "playwright"
          && definition.playwrightDir
          && !String(target).replace(/\\/g, "/").startsWith(`${definition.playwrightDir}/`)) {
          findings.push(`Lane ${lane} targets ${target}, outside ${definition.playwrightDir}/.`);
        }
      }

      grepPatterns(commandConfig).forEach((pattern) => {
        if (!pattern || String(pattern).startsWith("--")) {
          findings.push(`Lane ${lane} has an invalid empty --grep value: ${displayCommand}`);
        } else if (/[|&<>^]/.test(pattern)) {
          if (commandConfig.command === process.execPath && commandConfig.type === "playwright") {
            notes.push(`Lane ${lane} grep pattern is passed as a literal Node argv value: ${pattern}`);
          } else {
            findings.push(`Lane ${lane} has a Windows shell quoting hazard in --grep: ${pattern}`);
          }
        }
      });
    }
  }
  return { findings, notes };
}

async function validateLaneRegistrations() {
  const findings = [];
  const notes = [];
  const packagePath = path.join(repoRoot, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packagePath, "utf8"));
  const scripts = packageJson.scripts || {};
  const expectedScripts = new Map([
    ["workspace-contract", "test:lane:workspace-contract"],
    ["tool-runtime", "test:lane:tool-runtime"],
    ["game-runtime", "test:lane:game-runtime"],
    ["integration", "test:lane:integration"],
    ["engine-src", "test:lane:engine-src"],
    ["samples", "test:lane:samples"]
  ]);
  const laneScriptEntries = Object.entries(scripts)
    .filter(([scriptName]) => /^test:lane:[^:]+/.test(scriptName));
  const registeredLanes = new Map();

  for (const [scriptName, scriptCommand] of laneScriptEntries) {
    const laneMatch = String(scriptCommand).match(/--lane(?:=|\s+)([^\s]+)/);
    if (!laneMatch) {
      findings.push(`Lane script ${scriptName} does not declare an explicit --lane target.`);
      continue;
    }
    const lane = laneMatch[1].trim();
    if (!laneDefinitions[lane]) {
      findings.push(`Lane script ${scriptName} targets unknown lane: ${lane}.`);
      continue;
    }
    if (!String(scriptCommand).includes("scripts/run-targeted-test-lanes.mjs")) {
      findings.push(`Lane script ${scriptName} must route through scripts/run-targeted-test-lanes.mjs.`);
    }
    const existingScripts = registeredLanes.get(lane) || [];
    existingScripts.push(scriptName);
    registeredLanes.set(lane, existingScripts);
  }

  for (const [lane, scriptNames] of registeredLanes.entries()) {
    if (scriptNames.length > 1) {
      findings.push(`Duplicate npm lane registration for ${lane}: ${scriptNames.join(", ")}.`);
    }
  }

  for (const [lane, scriptName] of expectedScripts.entries()) {
    if (!scripts[scriptName]) {
      findings.push(`Missing npm lane script ${scriptName} for lane ${lane}.`);
    }
  }

  if (findings.length === 0) {
    notes.push("No duplicate or missing npm lane registrations found.");
  }
  return { findings, notes };
}

function compileLanePlan({ includeSamples, lanes, runnerPreflight, unknownLanes }) {
  const findings = [
    ...unknownLanes.map((lane) => `Unknown lane requested: ${lane}`),
    ...runnerPreflight.findings
  ];
  const rows = [];
  const allLanes = Object.keys(laneDefinitions);
  const requestedLaneSet = new Set(lanes);

  for (const lane of allLanes) {
    const definition = laneDefinitions[lane];
    const selected = requestedLaneSet.has(lane);
    const commandTexts = definition.commands.map(commandToString);
    const targetFiles = definition.commands.flatMap(commandTargetFiles);
    const laneFindings = runnerPreflight.findings.filter((entry) => entry.startsWith(`Lane ${lane} `));
    let status = "SKIP";
    let reason = "Lane was not selected.";

    if (selected) {
      if (definition.requiresSamplesFlag && !includeSamples) {
        reason = "Samples lane is on-request only; compilation succeeds but runtime execution is skipped.";
      } else if (laneFindings.length > 0) {
        status = "FAIL";
        reason = laneFindings.join("; ");
      } else {
        status = "PASS";
        reason = "Lane graph, command shape, targets, fixtures, and ownership compile before runtime.";
      }
    }

    rows.push({
      affectedSurface: definition.affectedSurface,
      commands: commandTexts,
      lane,
      reason,
      status,
      targets: targetFiles
    });
  }

  unknownLanes.forEach((lane) => {
    rows.push({
      affectedSurface: "unknown",
      commands: [],
      lane,
      reason: "Requested lane does not exist in laneDefinitions.",
      status: "FAIL",
      targets: []
    });
  });

  return {
    findings,
    rows,
    status: findings.length > 0 ? "FAIL" : "PASS"
  };
}

function collectDependencyCycles() {
  const cycles = [];
  const stack = [];
  const visiting = new Set();
  const visited = new Set();

  function visit(lane) {
    if (visiting.has(lane)) {
      const startIndex = stack.indexOf(lane);
      cycles.push([...stack.slice(startIndex), lane].join(" -> "));
      return;
    }
    if (visited.has(lane)) {
      return;
    }
    visiting.add(lane);
    stack.push(lane);
    const definition = laneDefinitions[lane];
    (definition?.dependencies || [])
      .filter((dependency) => laneDefinitions[dependency])
      .forEach(visit);
    stack.pop();
    visiting.delete(lane);
    visited.add(lane);
  }

  Object.keys(laneDefinitions).forEach(visit);
  return [...new Set(cycles)];
}

function validateDependencyGraph({ includeSamples, laneCompilation, lanes, unknownLanes }) {
  const requestedLaneSet = new Set(lanes);
  const findings = [
    ...unknownLanes.map((lane) => `Unknown lane requested before dependency gating: ${lane}`)
  ];
  const rows = [];

  for (const [lane, definition] of Object.entries(laneDefinitions)) {
    for (const dependency of definition.dependencies || []) {
      if (!laneDefinitions[dependency]) {
        findings.push(`Lane ${lane} declares unknown dependency lane: ${dependency}.`);
      }
    }
  }

  collectDependencyCycles().forEach((cycle) => {
    findings.push(`Lane dependency cycle detected: ${cycle}.`);
  });

  if (laneCompilation.status === "FAIL") {
    findings.push("Lane compilation failed; dependency-gated runtime scheduling is blocked.");
  }

  for (const [lane, definition] of Object.entries(laneDefinitions)) {
    const dependencies = definition.dependencies || [];
    const selected = requestedLaneSet.has(lane);
    const compilationRow = laneCompilation.rows.find((row) => row.lane === lane);
    let reason = "Lane was not selected, so dependency-gated runtime scheduling skipped it.";
    let status = "SKIP";

    if (selected) {
      if (definition.requiresSamplesFlag && !includeSamples) {
        reason = "Samples lane is on-request only and is not added to the runtime schedule without --include-samples.";
      } else if (compilationRow?.status === "FAIL") {
        status = "FAIL";
        reason = "Lane compilation failed before deterministic dependency validation could schedule runtime.";
      } else {
        const missingSelectedDependencies = dependencies.filter((dependency) => !requestedLaneSet.has(dependency));
        if (missingSelectedDependencies.length > 0) {
          status = "FAIL";
          reason = `Required dependency lane(s) were not selected: ${missingSelectedDependencies.join(", ")}.`;
          findings.push(`Lane ${lane} requires unselected dependency lane(s): ${missingSelectedDependencies.join(", ")}.`);
        } else {
          status = "PASS";
          reason = dependencies.length > 0
            ? "Dependency graph resolved before runtime scheduling."
            : "Lane has no lane dependencies and is eligible after preflight and compilation pass.";
        }
      }
    }

    rows.push({
      affectedSurface: definition.affectedSurface,
      dependencies,
      lane,
      reason,
      selected,
      status
    });
  }

  unknownLanes.forEach((lane) => {
    rows.push({
      affectedSurface: "unknown",
      dependencies: [],
      lane,
      reason: "Requested lane does not exist in laneDefinitions.",
      selected: true,
      status: "FAIL"
    });
  });

  return {
    findings: [...new Set(findings)],
    rows,
    status: findings.length > 0 ? "FAIL" : "PASS"
  };
}

function playwrightCommandOptions(commandConfig) {
  const targets = new Set(commandTargetFiles(commandConfig));
  return commandConfig.args
    .slice(2)
    .filter((argument) => !targets.has(argument));
}

function compatiblePlaywrightSignature(commandConfig) {
  if (commandConfig.type !== "playwright") {
    return "";
  }
  return JSON.stringify({
    command: commandConfig.command,
    options: playwrightCommandOptions(commandConfig)
  });
}

function mergeCompatibleCommands(commands) {
  const scheduled = [];
  const groupIndexes = new Map();

  for (const commandConfig of commands) {
    if (commandConfig.type !== "playwright") {
      scheduled.push(commandConfig);
      continue;
    }

    const targets = commandTargetFiles(commandConfig);
    const signature = compatiblePlaywrightSignature(commandConfig);
    if (targets.length === 0 || !signature) {
      scheduled.push(commandConfig);
      continue;
    }

    if (!groupIndexes.has(signature)) {
      groupIndexes.set(signature, scheduled.length);
      scheduled.push(commandConfig);
      continue;
    }

    const groupIndex = groupIndexes.get(signature);
    const existing = scheduled[groupIndex];
    const mergedTargets = [
      ...new Set([
        ...commandTargetFiles(existing),
        ...targets
      ])
    ];
    scheduled[groupIndex] = {
      args: [
        playwrightCli,
        "test",
        ...mergedTargets,
        ...playwrightCommandOptions(existing)
      ],
      command: existing.command,
      type: "playwright"
    };
  }

  return scheduled;
}

function topologicallySortSelectedLanes(selectedLanes) {
  const selectedLaneSet = new Set(selectedLanes);
  const sorted = [];
  const visited = new Set();

  function visit(lane) {
    if (visited.has(lane)) {
      return;
    }
    visited.add(lane);
    const definition = laneDefinitions[lane];
    (definition.dependencies || [])
      .filter((dependency) => selectedLaneSet.has(dependency))
      .forEach(visit);
    sorted.push(lane);
  }

  selectedLanes.forEach(visit);
  return sorted;
}

function estimatePlaywrightLaunchCost(lane) {
  const definition = laneDefinitions[lane];
  if (!definition) {
    return 0;
  }
  return definition.commands.reduce((count, commandConfig) => (
    commandConfig.type === "playwright"
      ? count + Math.max(1, commandTargetFiles(commandConfig).length)
      : count
  ), 0);
}

function buildLaneDeduplication({ includeSamples, rawLaneRequests }) {
  const counts = new Map();
  rawLaneRequests.forEach((lane) => counts.set(lane, (counts.get(lane) || 0) + 1));
  const duplicateRows = [];
  let preventedDuplicateLaneExecutions = 0;
  let preventedDuplicateBrowserLaunches = 0;
  let preventedWorkspaceLaneReruns = 0;

  for (const [lane, count] of counts.entries()) {
    if (count <= 1) {
      continue;
    }
    const duplicateCount = count - 1;
    const definition = laneDefinitions[lane];
    const laneIsExecutable = Boolean(definition && (!definition.requiresSamplesFlag || includeSamples));
    const browserLaunchCost = laneIsExecutable ? estimatePlaywrightLaunchCost(lane) : 0;
    const preventedBrowserLaunches = duplicateCount * browserLaunchCost;
    preventedDuplicateLaneExecutions += duplicateCount;
    preventedDuplicateBrowserLaunches += preventedBrowserLaunches;
    if (lane === "workspace-contract") {
      preventedWorkspaceLaneReruns += duplicateCount;
    }
    duplicateRows.push({
      count,
      duplicateCount,
      lane,
      preventedBrowserLaunches,
      status: laneDefinitions[lane] ? "DEDUPED" : "UNKNOWN"
    });
  }

  return {
    duplicateRows,
    preventedDuplicateBrowserLaunches,
    preventedDuplicateLaneExecutions,
    preventedWorkspaceLaneReruns,
    rawLaneRequests,
    status: "PASS",
    uniqueLaneRequests: [...new Set(rawLaneRequests)]
  };
}

function buildRuntimeSchedule({ dependencyGate, includeSamples, laneCompilation, laneDeduplication, lanes, preRuntimeFindings }) {
  const requestedLaneSet = new Set(lanes);
  const executableLanes = [];
  const lanePlans = [];
  let baselinePlaywrightLaunches = 0;
  let scheduledPlaywrightLaunches = 0;

  if (preRuntimeFindings.length > 0) {
    return {
      baselinePlaywrightLaunches,
      lanePlans,
      orderedLanes: [],
      preventedRedundantBrowserLaunches: laneDeduplication.preventedDuplicateBrowserLaunches,
      preventedRedundantLaneExecutions: laneDeduplication.preventedDuplicateLaneExecutions,
      preRuntimeFindings,
      reusedRuntimeSessions: 0,
      scheduledPlaywrightLaunches,
      status: "SKIP"
    };
  }

  for (const lane of Object.keys(laneDefinitions)) {
    const definition = laneDefinitions[lane];
    const compilationRow = laneCompilation.rows.find((row) => row.lane === lane);
    const dependencyRow = dependencyGate.rows.find((row) => row.lane === lane);
    if (!requestedLaneSet.has(lane)) {
      continue;
    }
    if (definition.requiresSamplesFlag && !includeSamples) {
      continue;
    }
    if (compilationRow?.status !== "PASS" || dependencyRow?.status !== "PASS") {
      continue;
    }
    executableLanes.push(lane);
  }

  const orderedLanes = topologicallySortSelectedLanes(executableLanes);
  for (const lane of orderedLanes) {
    const definition = laneDefinitions[lane];
    const scheduledCommands = mergeCompatibleCommands(definition.commands);
    const laneBaselinePlaywrightLaunches = definition.commands.reduce((count, commandConfig) => (
      commandConfig.type === "playwright"
        ? count + Math.max(1, commandTargetFiles(commandConfig).length)
        : count
    ), 0);
    const laneScheduledPlaywrightLaunches = scheduledCommands.filter((commandConfig) => commandConfig.type === "playwright").length;
    baselinePlaywrightLaunches += laneBaselinePlaywrightLaunches;
    scheduledPlaywrightLaunches += laneScheduledPlaywrightLaunches;
    lanePlans.push({
      affectedSurface: definition.affectedSurface,
      baselinePlaywrightLaunches: laneBaselinePlaywrightLaunches,
      commands: scheduledCommands,
      lane,
      reason: definition.reason,
      scheduledPlaywrightLaunches: laneScheduledPlaywrightLaunches
    });
  }

  const groupedPlaywrightSessions = lanePlans.flatMap((plan) => plan.commands)
    .filter((commandConfig) => commandConfig.type === "playwright" && commandTargetFiles(commandConfig).length > 1)
    .length;
  const skippedLaneCount = Object.keys(laneDefinitions).filter((lane) => {
    if (!requestedLaneSet.has(lane)) {
      return true;
    }
    const definition = laneDefinitions[lane];
    return Boolean(definition.requiresSamplesFlag && !includeSamples);
  }).length;

  return {
    baselinePlaywrightLaunches,
    lanePlans,
    orderedLanes,
    preventedRedundantBrowserLaunches: Math.max(0, baselinePlaywrightLaunches - scheduledPlaywrightLaunches) + laneDeduplication.preventedDuplicateBrowserLaunches,
    preventedRedundantLaneExecutions: skippedLaneCount + laneDeduplication.preventedDuplicateLaneExecutions,
    preRuntimeFindings,
    reusedRuntimeSessions: groupedPlaywrightSessions + (orderedLanes.length > 1 ? 1 : 0),
    scheduledPlaywrightLaunches,
    status: dependencyGate.status === "PASS" && laneCompilation.status === "PASS" ? "PASS" : "SKIP"
  };
}

function makeLaneCompilationReport({ laneCompilation }) {
  const lines = [
    "# Lane Compilation Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${laneCompilation.status}`,
    "",
    "## Lane Graph",
    "",
    "| Lane | Status | Affected Surface | Targets | Commands | Reason |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  laneCompilation.rows.forEach((row) => {
    lines.push([
      `| ${row.lane}`,
      row.status,
      reportLine(row.affectedSurface),
      reportLine(row.targets.join("; ") || "none"),
      reportLine(row.commands.join("; ") || "none"),
      `${reportLine(row.reason)} |`
    ].join(" | "));
  });

  lines.push("", "## Compilation Failures", "");
  if (laneCompilation.findings.length === 0) {
    lines.push("No lane compilation failures.");
  } else {
    laneCompilation.findings.forEach((findingText) => lines.push(`- ${findingText}`));
  }

  lines.push(
    "",
    "## Deterministic Setup Rules",
    "",
    "- Unknown lanes fail before runtime.",
    "- Missing targets or fixtures fail before runtime.",
    "- Playwright targets must stay inside the owning lane directory.",
    "- Shell-sensitive grep values must be passed through the Node CLI argv path.",
    "- Deterministic lane-definition failures do not trigger fallback reruns or full lane escalation."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeDependencyGatingReport({ dependencyGate }) {
  const lines = [
    "# Dependency Gating Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${dependencyGate.status}`,
    "",
    "## Gate Order",
    "",
    "1. Zero-browser preflight must pass.",
    "2. Lane compilation must pass.",
    "3. Deterministic lane dependency validation must pass.",
    "4. Only dependency-eligible targeted lanes may be scheduled.",
    "",
    "## Lane Dependency Graph",
    "",
    "| Lane | Selected | Status | Dependencies | Affected Surface | Reason |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  dependencyGate.rows.forEach((row) => {
    lines.push([
      `| ${row.lane}`,
      row.selected ? "Yes" : "No",
      row.status,
      reportLine(row.dependencies.join(", ") || "none"),
      reportLine(row.affectedSurface),
      `${reportLine(row.reason)} |`
    ].join(" | "));
  });

  lines.push("", "## Dependency Failures Caught Pre-Runtime", "");
  if (dependencyGate.findings.length === 0) {
    lines.push("No deterministic dependency failures were found before runtime.");
  } else {
    dependencyGate.findings.forEach((findingText) => lines.push(`- ${findingText}`));
  }

  lines.push(
    "",
    "## Enforcement Notes",
    "",
    "- Invalid dependency graphs block runtime before Playwright startup.",
    "- Dependency failures do not trigger fallback reruns or unrelated lane execution.",
    "- Workspace V2 is scheduled only when the workspace-contract lane is explicitly selected.",
    "- Samples remain on-request only and are not implicit dependency gates."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeLaneRuntimeOptimizationReport({ runtimeSchedule }) {
  const lines = [
    "# Lane Runtime Optimization Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${runtimeSchedule.status}`,
    "",
    "## Runtime Cost Summary",
    "",
    `Reused runtime sessions: ${runtimeSchedule.reusedRuntimeSessions}`,
    `Prevented redundant browser launches: ${runtimeSchedule.preventedRedundantBrowserLaunches}`,
    `Prevented redundant lane execution: ${runtimeSchedule.preventedRedundantLaneExecutions}`,
    `Baseline Playwright/browser launches: ${runtimeSchedule.baselinePlaywrightLaunches}`,
    `Scheduled Playwright/browser launches: ${runtimeSchedule.scheduledPlaywrightLaunches}`,
    "",
    "## Scheduled Lane Order",
    "",
    runtimeSchedule.orderedLanes.length > 0
      ? runtimeSchedule.orderedLanes.map((lane, index) => `${index + 1}. ${lane}`).join("\n")
      : "No runtime lanes are eligible for scheduling.",
    "",
    "## Scheduling Blockers",
    "",
    runtimeSchedule.preRuntimeFindings.length > 0
      ? runtimeSchedule.preRuntimeFindings.map((findingText) => `- ${findingText}`).join("\n")
      : "No zero-browser, compilation, or dependency blockers were found.",
    "",
    "## Lane Plans",
    "",
    "| Lane | Baseline Browser Launches | Scheduled Browser Launches | Commands | Reason |",
    "| --- | --- | --- | --- | --- |"
  ];

  runtimeSchedule.lanePlans.forEach((plan) => {
    lines.push([
      `| ${plan.lane}`,
      plan.baselinePlaywrightLaunches,
      plan.scheduledPlaywrightLaunches,
      reportLine(plan.commands.map(commandToString).join("; ") || "none"),
      `${reportLine(plan.reason)} |`
    ].join(" | "));
  });

  if (runtimeSchedule.lanePlans.length === 0) {
    lines.push("| none | 0 | 0 | none | No dependency-eligible targeted lanes were scheduled. |");
  }

  lines.push(
    "",
    "## Runtime Savings Observations",
    "",
    "- Zero-browser preflight, lane compilation, and dependency validation run once per targeted runner invocation.",
    "- Compatible Playwright specs with matching options are kept in shared CLI invocations to avoid redundant browser startup.",
    "- Unselected lanes are not scheduled after isolated targeted lane failures.",
    "- Workspace V2 and samples lanes are not escalated unless explicitly selected."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeValidationCacheReport({ validationCache }) {
  const hits = validationCache.events.filter((event) => event.status === "HIT");
  const misses = validationCache.events.filter((event) => event.status === "MISS" || event.status === "MISS_UNCACHED");
  const lines = [
    "# Validation Cache Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "Status: PASS",
    "",
    "## Cache Summary",
    "",
    `Cached validations reused: ${hits.length}`,
    `Validations computed: ${misses.length}`,
    "",
    "## Cache Events",
    "",
    "| Stage | Cache | Input Hash | Reused By | Invalidation Inputs |",
    "| --- | --- | --- | --- | --- |"
  ];

  validationCache.events.forEach((event) => {
    lines.push([
      `| ${event.stage}`,
      event.status,
      event.inputHash,
      reportLine(event.reusedBy || "initial computation"),
      `${reportLine((event.invalidationInputs || []).join("; ") || "unchanged within execution cycle")} |`
    ].join(" | "));
  });

  lines.push(
    "",
    "## Deterministic Invalidation Rules",
    "",
    "- Lane definitions change: lane registration, runner preflight, lane compilation, dependency validation, and scheduling caches invalidate.",
    "- Fixture ownership changes: structural ownership, runner preflight, and affected persisted lane manifests invalidate.",
    "- Helper/import graph changes: structural ownership validation and affected persisted lane manifests invalidate.",
    "- Targeted files change: runner preflight, lane compilation, and owning persisted lane manifests invalidate.",
    "- Dependency graph changes: dependency validation and runtime scheduling caches invalidate.",
    "",
    "## Runtime Savings Observations",
    "",
    "- Structural ownership validation is computed once per runner invocation and reused by static and zero-browser reporting.",
    "- Fresh persistent lane manifests reuse prior helper, fixture, import, and ownership resolution.",
    "- Lane compilation is computed once and reused by dependency gating, runtime scheduling, and reports.",
    "- Dependency validation is computed once and reused by zero-browser preflight, runtime scheduling, and reports.",
    "- No persistent validation cache is written to project JSON, toolState, localStorage, or sessionStorage."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeLaneDeduplicationReport({ laneDeduplication }) {
  const lines = [
    "# Lane Deduplication Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${laneDeduplication.status}`,
    "",
    "## Summary",
    "",
    `Raw lane requests: ${laneDeduplication.rawLaneRequests.join(", ") || "none"}`,
    `Unique scheduled lanes: ${laneDeduplication.uniqueLaneRequests.join(", ") || "none"}`,
    `Prevented duplicate lane executions: ${laneDeduplication.preventedDuplicateLaneExecutions}`,
    `Prevented browser launches: ${laneDeduplication.preventedDuplicateBrowserLaunches}`,
    `Prevented Workspace lane reruns: ${laneDeduplication.preventedWorkspaceLaneReruns}`,
    "",
    "## Duplicate Requests",
    "",
    "| Lane | Request Count | Duplicate Executions Prevented | Browser Launches Prevented | Status |",
    "| --- | --- | --- | --- | --- |"
  ];

  if (laneDeduplication.duplicateRows.length === 0) {
    lines.push("| none | 0 | 0 | 0 | No duplicate lane requests in this run. |");
  } else {
    laneDeduplication.duplicateRows.forEach((row) => {
      lines.push(`| ${row.lane} | ${row.count} | ${row.duplicateCount} | ${row.preventedBrowserLaunches} | ${row.status} |`);
    });
  }

  lines.push(
    "",
    "## Enforcement Notes",
    "",
    "- Duplicate lane requests are collapsed before validation and runtime scheduling.",
    "- Already validated targeted lanes are not executed again in the same run.",
    "- Duplicate Workspace V2 lane requests are counted and suppressed before npm invocation.",
    "- Duplicate dependency chains cannot cause repeated Playwright/browser startup for the same targeted lane."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeTargetedFileManifestReport({ scopedDiscovery, laneInputValidation }) {
  const lines = [
    "# Targeted File Manifest Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${laneInputValidation.status}`,
    "",
    "## Manifest-Generated Lane Inputs",
    "",
    "| Lane | Ownership | Status | Source | Tests | Helpers | Fixtures | Imports / Dependencies | Dependency Graph Hash | Manifest Hash | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"
  ];

  if (laneInputValidation.manifestRows.length === 0) {
    lines.push("| none | none | SKIP | none | none | none | none | none | none | none | No selected lanes produced manifests. |");
  } else {
    laneInputValidation.manifestRows.forEach((row) => {
      lines.push([
        `| ${row.lane}`,
        row.ownership,
        row.status,
        row.source || "generated",
        reportLine(row.tests.join("; ") || "none"),
        reportLine(row.helpers.join("; ") || "none"),
        reportLine(row.fixtures.join("; ") || "none"),
        reportLine(row.imports.join("; ") || "none"),
        row.dependencyGraphHash || "none",
        row.manifestHash,
        `${reportLine(row.reason)} |`
      ].join(" | "));
    });
  }

  lines.push(
    "",
    "## Discovery Expansion Control",
    "",
    `Prevented discovery expansion: ${laneInputValidation.preventedDiscoveryExpansion ? "Yes" : "No"}`,
    `Prevented redundant scans: ${laneInputValidation.preventedRedundantScans}`,
    `Targeted file/helper reads: ${scopedDiscovery.textReads}`,
    "",
    "## Runtime Savings Observations",
    "",
    "- Each selected lane receives one deterministic manifest before runtime scheduling.",
    "- Manifest inputs replace repeated recursive test, helper, and fixture discovery during targeted execution.",
    "- Runtime command targets must be declared by the lane manifest before browser launch.",
    "- Manifest hashes lock lane inputs so runtime lane mutation is detected before execution."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makePersistentLaneManifestReport({ scopedDiscovery }) {
  const events = scopedDiscovery.persistentManifestEvents || [];
  const reused = events.filter((event) => event.status === "REUSED");
  const invalidated = events.filter((event) => event.status === "INVALIDATED");
  const generated = events.filter((event) => event.status === "GENERATED");
  const lines = [
    "# Persistent Lane Manifest Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "Status: PASS",
    `Manifest directory: ${scopedDiscovery.persistentManifestDir || defaultPersistentLaneManifestDir}`,
    "",
    "## Summary",
    "",
    `Reused manifests: ${reused.length}`,
    `Invalidated manifests: ${invalidated.length}`,
    `Generated manifests: ${generated.length}`,
    `Prevented discovery scans: ${reused.length}`,
    "",
    "## Manifest Events",
    "",
    "| Lane | Status | Manifest Path | Input Hash | Manifest Hash | Reason |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  if (events.length === 0) {
    lines.push("| none | SKIP | none | none | none | No persistent manifest events were recorded. |");
  } else {
    events.forEach((event) => {
      lines.push([
        `| ${event.lane}`,
        event.status,
        event.manifestPath || "none",
        event.inputHash || event.previousInputHash || "none",
        event.manifestHash || "none",
        `${reportLine(event.invalidationReason)} |`
      ].join(" | "));
    });
  }

  lines.push(
    "",
    "## Persisted Manifest Files",
    "",
    "| Lane | Ownership | Source | Tests | Helpers | Fixtures | Dependency Graph Hash | Manifest Hash |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |"
  );
  if (!scopedDiscovery.laneManifests || scopedDiscovery.laneManifests.length === 0) {
    lines.push("| none | none | none | none | none | none | none | none |");
  } else {
    scopedDiscovery.laneManifests.forEach((manifest) => {
      lines.push([
        `| ${manifest.lane}`,
        manifest.ownership,
        manifest.source || "generated",
        reportLine(manifest.tests.join("; ") || "none"),
        reportLine(manifest.helpers.join("; ") || "none"),
        reportLine(manifest.fixtures.join("; ") || "none"),
        manifest.dependencyGraphHash || "none",
        `${manifest.manifestHash || "none"} |`
      ].join(" | "));
    });
  }

  lines.push(
    "",
    "## Fast-Fail Enforcement",
    "",
    "- Persisted manifest metadata must match current lane ownership before reuse.",
    "- Lane definition, dependency graph, helper, fixture, import, and targeted-file hashes invalidate stale manifests.",
    "- Invalidated manifests are regenerated deterministically before Playwright/browser launch.",
    "- Persisted manifests never trigger fallback broad discovery."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeIncrementalValidationReport({ scopedDiscovery }) {
  const events = scopedDiscovery.persistentManifestEvents || [];
  const reused = events.filter((event) => event.status === "REUSED");
  const invalidated = events.filter((event) => event.status === "INVALIDATED");
  const generated = events.filter((event) => event.status === "GENERATED");
  const skipped = events.filter((event) => event.status === "SKIP");
  const preventedLaneRegeneration = reused.length;
  const preventedDiscoveryScans = reused.length;
  const preventedHelperResolution = reused.reduce((count, event) => {
    const manifest = (scopedDiscovery.laneManifests || []).find((entry) => entry.lane === event.lane);
    return count + (manifest?.helpers?.length || 0);
  }, 0);
  const preventedFixtureResolution = reused.reduce((count, event) => {
    const manifest = (scopedDiscovery.laneManifests || []).find((entry) => entry.lane === event.lane);
    return count + (manifest?.fixtures?.length || 0);
  }, 0);

  const lines = [
    "# Incremental Validation Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "Status: PASS",
    "",
    "## Reuse Summary",
    "",
    `Reused manifests: ${reused.length}`,
    `Invalidated manifests: ${invalidated.length}`,
    `Generated manifests: ${generated.length}`,
    `Skipped manifests: ${skipped.length}`,
    `Prevented lane regeneration: ${preventedLaneRegeneration}`,
    `Prevented discovery scans: ${preventedDiscoveryScans}`,
    `Prevented helper resolution passes: ${preventedHelperResolution}`,
    `Prevented fixture resolution passes: ${preventedFixtureResolution}`,
    "",
    "## Incremental Decisions",
    "",
    "| Lane | Decision | Invalidated By | Runtime Savings Observation |",
    "| --- | --- | --- | --- |"
  ];

  if (events.length === 0) {
    lines.push("| none | SKIP | none | No incremental validation decisions were recorded. |");
  } else {
    events.forEach((event) => {
      const manifest = (scopedDiscovery.laneManifests || []).find((entry) => entry.lane === event.lane);
      const savings = event.status === "REUSED"
        ? `Reused ${manifest?.tests?.length || 0} test input(s), ${manifest?.helpers?.length || 0} helper(s), and ${manifest?.fixtures?.length || 0} fixture(s).`
        : "Manifest was regenerated or skipped; no reuse savings for this lane.";
      lines.push([
        `| ${event.lane}`,
        event.status,
        reportLine(event.status === "REUSED" ? "unchanged inputs" : event.invalidationReason),
        `${reportLine(savings)} |`
      ].join(" | "));
    });
  }

  lines.push(
    "",
    "## Invalidation Rules",
    "",
    "- Helper ownership or file hash changes invalidate only manifests that list the helper.",
    "- Fixture ownership or file hash changes invalidate only manifests that list the fixture.",
    "- Dependency graph hash changes invalidate the owning lane manifest.",
    "- Lane definition hash changes invalidate persisted lane manifests before runtime.",
    "- Targeted test file hash changes invalidate the owning lane manifest.",
    "",
    "## Runtime Savings Observations",
    "",
    "- Fresh persisted manifests avoid repeated lane graph generation.",
    "- Fresh persisted manifests avoid repeated helper and fixture resolution.",
    "- Fresh persisted manifests avoid repeated ownership scans outside explicit manifest inputs.",
    "- Incremental validation remains deterministic and does not use project JSON, toolState, localStorage, sessionStorage, or repo tmp/."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeLaneInputValidationReport({ laneInputValidation }) {
  const lines = [
    "# Lane Input Validation Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${laneInputValidation.status}`,
    "",
    "## Input Files",
    "",
    "| Lane | Role | File | Status | Reason |",
    "| --- | --- | --- | --- | --- |"
  ];

  if (laneInputValidation.fileRows.length === 0) {
    lines.push("| none | none | none | SKIP | No selected lane inputs were validated. |");
  } else {
    laneInputValidation.fileRows.forEach((row) => {
      lines.push(`| ${row.lane} | ${row.role} | ${row.file} | ${row.status} | ${reportLine(row.reason)} |`);
    });
  }

  lines.push("", "## Ownership Validation Failures", "");
  if (laneInputValidation.findings.length === 0) {
    lines.push("No manifest ownership, helper, fixture, import, or runtime command target failures.");
  } else {
    laneInputValidation.findings.forEach((findingText) => lines.push(`- ${findingText}`));
  }

  lines.push(
    "",
    "## Fast-Fail Enforcement",
    "",
    "- Manifest ownership is validated before Playwright/browser launch.",
    "- Helper ownership is validated before execution.",
    "- Fixture ownership is validated before execution.",
    "- Unexpected discovery expansion outside manifest scope blocks runtime scheduling.",
    "- Deterministic manifest failures do not trigger fallback broad discovery."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeStaticValidationReport({
  dryRun,
  laneInputValidation,
  laneRegistration,
  lanes,
  runnerPreflight,
  scopedDiscovery,
  scopedDiscoveryValidation,
  staticOnly,
  structureAudit,
  unknownLanes
}) {
  const findings = [
    ...unknownLanes.map((lane) => `Unknown lane requested: ${lane}`),
    ...laneRegistration.findings,
    ...runnerPreflight.findings,
    ...scopedDiscoveryValidation.findings,
    ...laneInputValidation.findings,
    ...(structureAudit.status === "FAIL" ? [structureAudit.reason] : [])
  ];
  const status = findings.length > 0 ? "FAIL" : "PASS";
  const preventedLaunches = status === "FAIL"
    ? lanes.filter((lane) => laneDefinitions[lane]?.requiresPreflight).length
    : 0;
  const lines = [
    "# Static Validation Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${status}`,
    `Static only: ${staticOnly ? "Yes" : "No"}`,
    `Dry run: ${dryRun ? "Yes" : "No"}`,
    "",
    "## Requested Lanes",
    "",
    lanes.length > 0 ? lanes.map((lane) => `- ${lane}`).join("\n") : "- none",
    "",
    "## Prevented Launches",
    "",
    `Count: ${preventedLaunches}`,
    `Reason: ${preventedLaunches > 0 ? "Deterministic static validation failure prevented Playwright/browser startup." : "No deterministic static validation failure was found."}`,
    "",
    "## Checks",
    "",
    "| Check | Status | Details |",
    "| --- | --- | --- |",
    `| lane ownership and file placement | ${structureAudit.status} | ${reportLine(structureAudit.reason)} |`,
    `| invalid filename detection | ${structureAudit.status} | Covered by Playwright structure audit. |`,
    `| missing import detection | ${structureAudit.status} | Covered by Playwright structure audit relative import checks. |`,
    `| missing fixture detection | ${runnerPreflight.findings.some((entry) => entry.includes("missing fixture")) ? "FAIL" : "PASS"} | ${runnerPreflight.findings.filter((entry) => entry.includes("missing fixture")).join("; ") || "No missing fixture findings."} |`,
    `| targeted file manifests | ${laneInputValidation.status} | ${laneInputValidation.manifestRows.map((row) => `${row.lane}:${row.manifestHash}`).join("; ") || "No lane manifests generated."} |`,
    `| persistent lane manifests | ${laneInputValidation.status} | ${(scopedDiscovery.persistentManifestEvents || []).map((event) => `${event.lane}:${event.status}`).join("; ") || "No persistent manifest events."} |`,
    `| lane input graph expansion | ${laneInputValidation.preventedDiscoveryExpansion ? "PASS" : "FAIL"} | ${laneInputValidation.preventedDiscoveryExpansion ? "No inputs escaped manifest scope." : "Unexpected input expansion escaped manifest scope."} |`,
    `| scoped discovery targets | ${scopedDiscoveryValidation.status} | ${scopedDiscovery.targetFiles.join("; ") || "No Playwright discovery targets selected."} |`,
    `| broad scan prevention | ${scopedDiscoveryValidation.status} | Discovery map read ${scopedDiscovery.textReads} targeted file(s)/helper(s); lane-directory enumeration is delegated only to standalone broad audit mode. |`,
    `| invalid lane target detection | ${runnerPreflight.findings.some((entry) => entry.includes("targets")) || unknownLanes.length > 0 ? "FAIL" : "PASS"} | ${[...unknownLanes.map((lane) => `Unknown lane ${lane}`), ...runnerPreflight.findings.filter((entry) => entry.includes("targets"))].join("; ") || "No invalid lane target findings."} |`,
    `| Windows quoting hazard detection | ${runnerPreflight.findings.some((entry) => entry.includes("quoting hazard")) ? "FAIL" : "PASS"} | ${runnerPreflight.notes.filter((entry) => entry.includes("grep pattern")).join("; ") || "No shell-sensitive grep hazards found."} |`,
    `| duplicate lane registration detection | ${laneRegistration.findings.some((entry) => entry.includes("Duplicate")) ? "FAIL" : "PASS"} | ${laneRegistration.findings.filter((entry) => entry.includes("Duplicate")).join("; ") || "No duplicate lane registrations found."} |`,
    `| invalid grep pattern detection | ${runnerPreflight.findings.some((entry) => entry.includes("grep")) ? "FAIL" : "PASS"} | ${runnerPreflight.findings.filter((entry) => entry.includes("grep")).join("; ") || "No invalid grep pattern findings."} |`,
    "",
    "## Fast-Fail Reasons",
    ""
  ];

  if (findings.length === 0) {
    lines.push("No fast-fail reasons. Playwright lanes may proceed when selected.");
  } else {
    findings.forEach((findingText) => lines.push(`- ${findingText}`));
  }

  lines.push(
    "",
    "## Runtime Savings Observations",
    "",
    "- Static validation runs before browser launch.",
    "- Structural failures stop Workspace V2, tool-runtime, integration, and sample Playwright lanes before browser startup.",
    "- Combined lane execution can validate multiple selected lanes through one Node runner process.",
    "- Playwright is invoked through the Node CLI entrypoint to avoid shell quoting discovery failures."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeZeroBrowserPreflightReport({
  dependencyGate,
  laneInputValidation,
  laneCompilation,
  laneRegistration,
  runnerPreflight,
  scopedDiscovery,
  scopedDiscoveryValidation,
  structureAudit,
  unknownLanes
}) {
  const findings = [...new Set([
    ...unknownLanes.map((lane) => `Unknown lane requested: ${lane}`),
    ...laneRegistration.findings,
    ...runnerPreflight.findings,
    ...scopedDiscoveryValidation.findings,
    ...laneInputValidation.findings,
    ...laneCompilation.findings,
    ...dependencyGate.findings,
    ...(structureAudit.status === "FAIL" ? [structureAudit.reason] : [])
  ])];
  const status = findings.length > 0 ? "FAIL" : "PASS";
  const preventedLaunches = status === "FAIL"
    ? laneCompilation.rows.filter((row) => row.status === "FAIL" || row.status === "PASS").length
    : 0;
  const lines = [
    "# Zero-Browser Preflight Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${status}`,
    "",
    "## Prevented Browser Launches",
    "",
    `Count: ${preventedLaunches}`,
    `Reason: ${preventedLaunches > 0 ? "Deterministic pre-runtime failures were found." : "No deterministic pre-runtime failures were found."}`,
    "",
    "## Deterministic Failures Caught Pre-Runtime",
    ""
  ];

  if (findings.length === 0) {
    lines.push("No deterministic setup failures.");
  } else {
    findings.forEach((findingText) => lines.push(`- ${findingText}`));
  }

  lines.push(
    "",
    "## Validation Coverage",
    "",
    "| Check | Status | Details |",
    "| --- | --- | --- |",
    `| lane ownership | ${structureAudit.status} | ${reportLine(structureAudit.reason)} |`,
    `| directory placement | ${structureAudit.status} | tools/games/integration/engine ownership checked. |`,
    `| invalid file naming | ${structureAudit.status} | Game-specific filenames are blocked from generic reusable lanes. |`,
    `| duplicate registrations | ${laneRegistration.findings.some((entry) => entry.includes("Duplicate")) ? "FAIL" : "PASS"} | ${laneRegistration.findings.filter((entry) => entry.includes("Duplicate")).join("; ") || "No duplicate lane registrations."} |`,
    `| invalid imports | ${structureAudit.status} | Relative imports checked by Playwright structure audit. |`,
    `| unresolved fixtures | ${runnerPreflight.findings.some((entry) => entry.includes("missing fixture")) ? "FAIL" : "PASS"} | ${runnerPreflight.findings.filter((entry) => entry.includes("missing fixture")).join("; ") || "No unresolved fixture findings."} |`,
    `| unresolved helpers | ${structureAudit.status} | Shared helper imports and naming ownership checked. |`,
    `| targeted file manifests | ${laneInputValidation.status} | ${laneInputValidation.manifestRows.map((row) => `${row.lane}:${row.status}`).join(", ") || "none"} |`,
    `| persistent lane manifests | ${laneInputValidation.status} | ${(scopedDiscovery.persistentManifestEvents || []).map((event) => `${event.lane}:${event.status}`).join(", ") || "none"} |`,
    `| manifest input graph expansion | ${laneInputValidation.preventedDiscoveryExpansion ? "PASS" : "FAIL"} | ${laneInputValidation.preventedDiscoveryExpansion ? "No scoped discovery inputs escaped manifest ownership." : "Unexpected manifest input expansion detected."} |`,
    `| scoped discovery | ${scopedDiscoveryValidation.status} | Targets: ${scopedDiscovery.targetFiles.join(", ") || "none"}; helpers: ${scopedDiscovery.helperFiles.join(", ") || "none"}. |`,
    `| invalid grep patterns | ${runnerPreflight.findings.some((entry) => entry.includes("grep")) ? "FAIL" : "PASS"} | ${runnerPreflight.findings.filter((entry) => entry.includes("grep")).join("; ") || "No invalid grep patterns."} |`,
    `| Windows quoting hazards | ${runnerPreflight.findings.some((entry) => entry.includes("quoting hazard")) ? "FAIL" : "PASS"} | ${runnerPreflight.notes.filter((entry) => entry.includes("grep pattern")).join("; ") || "No shell quoting hazards."} |`,
    `| invalid lane references | ${unknownLanes.length > 0 ? "FAIL" : "PASS"} | ${unknownLanes.join("; ") || "No invalid lane references."} |`,
    `| invalid lane configuration | ${laneCompilation.status} | See docs/dev/reports/lane_compilation_report.md. |`,
    `| deterministic dependency graph | ${dependencyGate.status} | See docs/dev/reports/dependency_gating_report.md. |`,
    `| conflicting reusable helper ownership | ${structureAudit.status} | Shared helper filenames checked against known game names. |`,
    "",
    "## Corrected Ownership Drift",
    "",
    "- Asteroids Playwright runtime specs are enforced under `tests/playwright/games`.",
    "- Game index preview manifest handoff is enforced under `tests/playwright/integration`.",
    "- Tool-owned specs may reference games only as documented explicit fixtures.",
    "",
    "## Runtime Savings Observations",
    "",
    "- This preflight runs through Node-only validation before Playwright CLI startup.",
    "- Browser launch is blocked on deterministic setup failure.",
    "- Workspace V2, broad lane scheduling, and samples smoke are not started by preflight.",
    "- Invalid targeted lane setup cannot escalate into full-lane reruns."
  );

  return `${lines.join("\n").trim()}\n`;
}

async function writeTextReport(reportPath, reportText) {
  const absoluteReportPath = path.resolve(repoRoot, reportPath);
  await fs.mkdir(path.dirname(absoluteReportPath), { recursive: true });
  await fs.writeFile(absoluteReportPath, reportText, "utf8");
  console.log(`\nWrote ${absoluteReportPath}`);
}

function makeReport({
  dependencyGate,
  dryRun,
  fullSamplesSmoke,
  laneInputValidation,
  laneDeduplication,
  preflight,
  results,
  runtimeSchedule,
  scopedDiscovery,
  scopedDiscoveryValidation,
  validationCache
}) {
  const summary = summarize(results);
  const lines = [
    "# Testing Lane Execution Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Dry run: ${dryRun ? "Yes" : "No"}`,
    "",
    "## Summary",
    "",
    `PASS: ${summary.PASS}`,
    `WARN: ${summary.WARN}`,
    `FAIL: ${summary.FAIL}`,
    `SKIP: ${summary.SKIP}`,
    "",
    "## Full Samples Smoke",
    "",
    `Status: ${fullSamplesSmoke.status}`,
    `Reason: ${fullSamplesSmoke.reason}`,
    "",
    "## Preflight",
    "",
    `Status: ${preflight.status}`,
    `Reason: ${preflight.reason}`,
    `Command: ${preflight.command || "not run"}`,
    `Details: ${(preflight.details || []).join("; ") || "none"}`,
    "",
    "## Dependency Gate",
    "",
    `Status: ${dependencyGate?.status || "SKIP"}`,
    `Reason: ${dependencyGate?.findings?.length > 0 ? dependencyGate.findings.join("; ") : "No deterministic dependency failures before runtime."}`,
    "",
    "## Runtime Scheduling",
    "",
    `Status: ${runtimeSchedule?.status || "SKIP"}`,
    `Scheduled lane order: ${runtimeSchedule?.orderedLanes?.join(", ") || "none"}`,
    `Reused runtime sessions: ${runtimeSchedule?.reusedRuntimeSessions ?? 0}`,
    `Prevented redundant browser launches: ${runtimeSchedule?.preventedRedundantBrowserLaunches ?? 0}`,
    `Prevented redundant lane execution: ${runtimeSchedule?.preventedRedundantLaneExecutions ?? 0}`,
    "",
    "## Validation Cache",
    "",
    `Cached validations reused: ${validationCache?.events?.filter((event) => event.status === "HIT").length ?? 0}`,
    `Validation computations: ${validationCache?.events?.filter((event) => event.status === "MISS" || event.status === "MISS_UNCACHED").length ?? 0}`,
    "",
    "## Discovery Scope",
    "",
    `Status: ${scopedDiscoveryValidation?.status || "SKIP"}`,
    `Target files: ${scopedDiscovery?.targetFiles?.join(", ") || "none"}`,
    `Required shared helpers: ${scopedDiscovery?.helperFiles?.join(", ") || "none"}`,
    `Required fixtures: ${scopedDiscovery?.fixtureFiles?.join(", ") || "none"}`,
    `Targeted file/helper reads: ${scopedDiscovery?.textReads ?? 0}`,
    `Cached discovery reuse: ${validationCache?.events?.some((event) => event.stage === "scoped discovery map" && event.status === "HIT") ? "Yes" : "No"}`,
    `Prevented fallback expansion: ${scopedDiscoveryValidation?.status === "PASS" ? "Yes; no ownership or scope blocker widened into broad discovery." : "Blocked before runtime; no fallback lanes scheduled."}`,
    "",
    "## Targeted File Manifests",
    "",
    `Status: ${laneInputValidation?.status || "SKIP"}`,
    `Generated manifests: ${laneInputValidation?.manifestRows?.map((row) => `${row.lane}:${row.status}`).join(", ") || "none"}`,
    `Prevented discovery expansion: ${laneInputValidation?.preventedDiscoveryExpansion ? "Yes" : "No"}`,
    `Prevented redundant scans: ${laneInputValidation?.preventedRedundantScans ?? 0}`,
    `Persistent manifest events: ${scopedDiscovery?.persistentManifestEvents?.map((event) => `${event.lane}:${event.status}`).join(", ") || "none"}`,
    "",
    "## Lane Deduplication",
    "",
    `Prevented duplicate lane executions: ${laneDeduplication?.preventedDuplicateLaneExecutions ?? 0}`,
    `Prevented browser launches from duplicate lane requests: ${laneDeduplication?.preventedDuplicateBrowserLaunches ?? 0}`,
    `Prevented Workspace lane reruns: ${laneDeduplication?.preventedWorkspaceLaneReruns ?? 0}`,
    "",
    "## Lanes",
    "",
    "| Lane | Status | Executed/Skipped Reason | Affected Surface | Fixtures / Inputs |",
    "| --- | --- | --- | --- | --- |"
  ];

  results.forEach((result) => {
    const cells = [
      result.lane,
      result.status,
      reportLine(result.reason),
      reportLine(result.affectedSurface),
      reportLine(result.fixtures.join("; "))
    ];
    lines.push(`| ${cells.join(" | ")} |`);
  });

  lines.push("", "## Commands", "");
  results.forEach((result) => {
    lines.push(`### ${result.lane}`);
    if (result.commands.length === 0) {
      lines.push("- SKIP");
    } else {
      result.commands.forEach((command) => {
        lines.push(`- ${command.status} ${command.command}`);
      });
    }
    lines.push("");
  });

  return `${lines.join("\n").trim()}\n`;
}

async function writeReport(reportPath, reportText) {
  const absoluteReportPath = path.resolve(repoRoot, reportPath);
  await fs.mkdir(path.dirname(absoluteReportPath), { recursive: true });
  await fs.writeFile(absoluteReportPath, reportText, "utf8");
  console.log(`\nWrote ${absoluteReportPath}`);
}

const options = parseArgs(process.argv.slice(2));
const validationCache = createValidationCache();
const laneDefinitionHash = laneDefinitionsFingerprint();
const laneDeduplication = buildLaneDeduplication({
  includeSamples: options.includeSamples,
  rawLaneRequests: options.rawLaneRequests
});
const unknownLanes = options.lanes.filter((lane) => !laneDefinitions[lane]);
const requestedLanes = new Set(options.lanes);
const results = [];
const preflight = {
  command: "",
  details: [],
  reason: "No selected lane requires Playwright test-location preflight.",
  status: "SKIP"
};
const selectedDefinitions = options.lanes
  .filter((lane) => laneDefinitions[lane])
  .map((lane) => laneDefinitions[lane]);
const needsPreflight = selectedDefinitions.some((definition) => definition.requiresPreflight);

const laneRegistrationInput = {
  laneDefinitionHash,
  packageJson: "package.json"
};
const laneRegistration = await validationCache.get(
  "lane registration validation",
  laneRegistrationInput,
  ["lane definitions change", "package.json lane scripts change"],
  validateLaneRegistrations
);
const runnerPreflight = unknownLanes.length > 0
  ? { findings: [], notes: [] }
  : await validationCache.get(
    "runner preflight validation",
    {
      includeSamples: options.includeSamples,
      laneDefinitionHash,
      lanes: options.lanes
    },
    ["lane definitions change", "fixture ownership changes", "targeted files change"],
    () => validateRunnerPreflight(options.lanes)
  );
const scopedDiscoveryInput = {
  includeSamples: options.includeSamples,
  laneDefinitionHash,
  lanes: options.lanes,
  persistentLaneManifestDir: options.persistentLaneManifestDir
};
const scopedDiscovery = unknownLanes.length > 0
  ? {
    fixtureFiles: [],
    helperFiles: [],
    importFiles: [],
    laneManifests: [],
    persistentManifestDir: options.persistentLaneManifestDir,
    persistentManifestEvents: [],
    scanRows: [],
    selectedLanes: [],
    targetFiles: [],
    textReads: 0
  }
  : await validationCache.get(
    "scoped discovery map",
    scopedDiscoveryInput,
    ["lane definitions change", "fixture ownership changes", "helper/import graph changes", "targeted files change"],
    () => buildScopedDiscoveryPlan({
      includeSamples: options.includeSamples,
      laneDefinitionHash,
      persistentManifestDir: options.persistentLaneManifestDir,
      lanes: options.lanes
    })
  );
const scopedDiscoveryValidation = validateScopedDiscoveryPlan({
  includeSamples: options.includeSamples,
  lanes: options.lanes,
  scopedDiscovery
});
const laneInputValidationInput = {
  includeSamples: options.includeSamples,
  laneDefinitionHash,
  lanes: options.lanes,
  scopedDiscoveryHash: fingerprint(scopedDiscovery)
};
const laneInputValidation = unknownLanes.length > 0
  ? {
    fileRows: [],
    findings: [],
    manifestRows: [],
    preventedDiscoveryExpansion: true,
    preventedRedundantScans: 0,
    status: "SKIP"
  }
  : await validationCache.get(
    "targeted file manifest validation",
    laneInputValidationInput,
    ["lane definitions change", "fixture ownership changes", "helper/import graph changes", "targeted files change"],
    () => validateTargetedFileManifests({
      includeSamples: options.includeSamples,
      lanes: options.lanes,
      scopedDiscovery
    })
  );
let structureAudit = {
  command: "",
  reason: needsPreflight
    ? "Playwright structure audit was not run."
    : "No selected lane requires Playwright structure audit.",
  status: needsPreflight ? "SKIP" : "SKIP"
};
preflight.details.push(...runnerPreflight.notes);
const structureAuditInput = {
  discoveryOwnershipReportPath: options.discoveryOwnershipReportPath,
  discoveryScopeReportPath: options.discoveryScopeReportPath,
  filesystemScanReportPath: options.filesystemScanReportPath,
  helperGraph: "tests/helpers",
  laneDefinitionHash,
  lanes: options.lanes,
  locationAuditScript,
  persistentManifestEvents: scopedDiscovery.persistentManifestEvents,
  playwrightRoot: "tests/playwright",
  scopedDiscovery
};
if (unknownLanes.length === 0 && needsPreflight && !options.dryRun && !options.skipPreflight) {
  structureAudit = await validationCache.get(
    "structural ownership validation",
    structureAuditInput,
    ["fixture ownership changes", "helper/import graph changes", "targeted files change"],
    async () => {
      const auditArgs = [
        "--discovery-report",
        options.discoveryOwnershipReportPath,
        "--scope-report",
        options.discoveryScopeReportPath,
        "--scan-report",
        options.filesystemScanReportPath,
        "--lanes",
        options.lanes.join(",")
      ];
      const playwrightAuditTargets = scopedDiscovery.targetFiles.filter((targetFile) => isUnderPath(targetFile, "tests/playwright"));
      if (playwrightAuditTargets.length > 0) {
        auditArgs.push("--targets", playwrightAuditTargets.join(","));
      }
      if (scopedDiscovery.helperFiles.length > 0) {
        auditArgs.push("--helpers", scopedDiscovery.helperFiles.join(","));
      }
      if (scopedDiscovery.fixtureFiles.length > 0) {
        auditArgs.push("--fixtures", scopedDiscovery.fixtureFiles.join(","));
      }
      const result = await runCommand(nodeCommand(locationAuditScript, ...auditArgs));
      return {
        command: result.displayCommand,
        reason: result.exitCode === 0
          ? "Playwright structure audit passed."
          : "Playwright structure audit failed.",
        status: result.exitCode === 0 ? "PASS" : "FAIL"
      };
    }
  );
}

const staticReportText = makeStaticValidationReport({
  dryRun: options.dryRun,
  laneInputValidation,
  laneRegistration,
  lanes: options.lanes,
  runnerPreflight,
  scopedDiscovery,
  scopedDiscoveryValidation,
  staticOnly: options.staticOnly,
  structureAudit,
  unknownLanes
});
const laneCompilationInput = {
  includeSamples: options.includeSamples,
  laneDefinitionHash,
  lanes: options.lanes,
  runnerPreflightFindings: runnerPreflight.findings,
  unknownLanes
};
const laneCompilation = await validationCache.get(
  "lane compilation validation",
  laneCompilationInput,
  ["lane definitions change", "targeted files change", "fixture ownership changes"],
  () => compileLanePlan({
    includeSamples: options.includeSamples,
    lanes: options.lanes,
    runnerPreflight,
    unknownLanes
  })
);
validationCache.reuse("lane compilation validation", laneCompilationInput, "dependency validation input");
const dependencyGateInput = {
  includeSamples: options.includeSamples,
  laneCompilationStatus: laneCompilation.status,
  laneDefinitionHash,
  lanes: options.lanes,
  unknownLanes
};
const dependencyGate = await validationCache.get(
  "dependency validation",
  dependencyGateInput,
  ["dependency graph changes", "lane definitions change", "lane compilation input changes"],
  () => validateDependencyGraph({
    includeSamples: options.includeSamples,
    laneCompilation,
    lanes: options.lanes,
    unknownLanes
  })
);
const runtimeSchedulingBlockers = [...new Set([
  ...unknownLanes.map((lane) => `Unknown lane requested: ${lane}`),
  ...laneRegistration.findings,
  ...runnerPreflight.findings,
  ...scopedDiscoveryValidation.findings,
  ...laneInputValidation.findings,
  ...laneCompilation.findings,
  ...dependencyGate.findings,
  ...(structureAudit.status === "FAIL" ? [structureAudit.reason] : [])
])];
const runtimeSchedule = buildRuntimeSchedule({
  dependencyGate,
  includeSamples: options.includeSamples,
  laneCompilation,
  laneDeduplication,
  lanes: options.lanes,
  preRuntimeFindings: runtimeSchedulingBlockers
});
const zeroBrowserInput = {
  dependencyGateStatus: dependencyGate.status,
  laneCompilationStatus: laneCompilation.status,
  laneDefinitionHash,
  laneInputValidationStatus: laneInputValidation.status,
  laneRegistrationStatus: laneRegistration.findings.length === 0 ? "PASS" : "FAIL",
  runnerPreflightStatus: runnerPreflight.findings.length === 0 ? "PASS" : "FAIL",
  scopedDiscoveryStatus: scopedDiscoveryValidation.status,
  structureAuditStatus: structureAudit.status,
  unknownLanes
};
const laneCompilationReportText = makeLaneCompilationReport({ laneCompilation });
const dependencyGatingReportText = makeDependencyGatingReport({ dependencyGate });
const laneDeduplicationReportText = makeLaneDeduplicationReport({ laneDeduplication });
const laneRuntimeOptimizationReportText = makeLaneRuntimeOptimizationReport({ runtimeSchedule });
const targetedFileManifestReportText = makeTargetedFileManifestReport({
  laneInputValidation,
  scopedDiscovery
});
const persistentLaneManifestReportText = makePersistentLaneManifestReport({ scopedDiscovery });
const incrementalValidationReportText = makeIncrementalValidationReport({ scopedDiscovery });
const laneInputValidationReportText = makeLaneInputValidationReport({ laneInputValidation });
const zeroBrowserReportText = await validationCache.get(
  "zero-browser preflight",
  zeroBrowserInput,
  ["lane definitions change", "fixture ownership changes", "helper/import graph changes", "targeted files change", "dependency graph changes"],
  () => makeZeroBrowserPreflightReport({
    dependencyGate,
    laneInputValidation,
    laneCompilation,
    laneRegistration,
    runnerPreflight,
    scopedDiscovery,
    scopedDiscoveryValidation,
    structureAudit,
    unknownLanes
  })
);
validationCache.reuse("structural ownership validation", structureAuditInput, "static validation report");
validationCache.reuse("structural ownership validation", structureAuditInput, "zero-browser preflight report");
validationCache.reuse("scoped discovery map", scopedDiscoveryInput, "structural ownership validation input");
validationCache.reuse("scoped discovery map", scopedDiscoveryInput, "discovery scope reporting");
validationCache.reuse("targeted file manifest validation", laneInputValidationInput, "lane input validation report");
validationCache.reuse("targeted file manifest validation", laneInputValidationInput, "runtime scheduling blockers");
validationCache.reuse("lane compilation validation", laneCompilationInput, "lane compilation report");
validationCache.reuse("lane compilation validation", laneCompilationInput, "runtime scheduling");
validationCache.reuse("dependency validation", dependencyGateInput, "dependency report");
validationCache.reuse("dependency validation", dependencyGateInput, "runtime scheduling");
validationCache.reuse("zero-browser preflight", zeroBrowserInput, "zero-browser report output");
const validationCacheReportText = makeValidationCacheReport({ validationCache });
await writeTextReport(options.staticReportPath, staticReportText);
await writeTextReport(options.laneCompilationReportPath, laneCompilationReportText);
await writeTextReport(options.dependencyGatingReportPath, dependencyGatingReportText);
await writeTextReport(options.laneDeduplicationReportPath, laneDeduplicationReportText);
await writeTextReport(options.laneRuntimeOptimizationReportPath, laneRuntimeOptimizationReportText);
await writeTextReport(options.targetedFileManifestReportPath, targetedFileManifestReportText);
await writeTextReport(options.persistentLaneManifestReportPath, persistentLaneManifestReportText);
await writeTextReport(options.incrementalValidationReportPath, incrementalValidationReportText);
await writeTextReport(options.laneInputValidationReportPath, laneInputValidationReportText);
await writeTextReport(options.validationCacheReportPath, validationCacheReportText);
await writeTextReport(options.zeroBrowserReportPath, zeroBrowserReportText);

if (options.staticOnly || options.zeroBrowserOnly) {
  if (staticReportText.includes("Status: FAIL") || zeroBrowserReportText.includes("Status: FAIL")) {
    process.exit(1);
  }
  process.exit(0);
}

if (unknownLanes.length > 0
  || laneRegistration.findings.length > 0
  || runnerPreflight.findings.length > 0
  || scopedDiscoveryValidation.status === "FAIL"
  || laneInputValidation.status === "FAIL"
  || laneCompilation.status === "FAIL"
  || dependencyGate.status === "FAIL") {
  preflight.status = "FAIL";
  preflight.reason = "Runner preflight, lane compilation, or dependency gating failed; expensive lanes were skipped before Playwright execution.";
  preflight.details.push(
    ...unknownLanes.map((lane) => `Unknown lane requested: ${lane}`),
    ...laneRegistration.findings,
    ...runnerPreflight.findings,
    ...scopedDiscoveryValidation.findings,
    ...laneInputValidation.findings,
    ...dependencyGate.findings
  );
  for (const [lane, definition] of Object.entries(laneDefinitions)) {
    results.push({
      affectedSurface: definition.affectedSurface,
      commands: [],
      fixtures: definition.fixtures,
      lane,
      reason: requestedLanes.has(lane)
        ? "Skipped because runner preflight failed before lane execution."
        : "Lane was not selected for this targeted run.",
      status: "SKIP"
    });
  }

  const fullSamplesSmoke = {
    reason: "Skipped because runner preflight failed before any samples lane decision could execute.",
    status: "SKIP"
  };
  await writeReport(options.reportPath, makeReport({
    dependencyGate,
    dryRun: options.dryRun,
    fullSamplesSmoke,
    laneInputValidation,
    laneDeduplication,
    preflight,
    results,
    runtimeSchedule,
    scopedDiscovery,
    scopedDiscoveryValidation,
    validationCache
  }));
  process.exit(1);
}

if (needsPreflight && !options.dryRun && !options.skipPreflight) {
  preflight.command = structureAudit.command;
  if (structureAudit.status === "FAIL") {
    preflight.status = "FAIL";
    preflight.reason = "Playwright structure audit failed; expensive lanes were skipped to avoid wasted reruns.";
    for (const [lane, definition] of Object.entries(laneDefinitions)) {
      results.push({
        affectedSurface: definition.affectedSurface,
        commands: [],
        fixtures: definition.fixtures,
        lane,
        reason: requestedLanes.has(lane)
          ? "Skipped because test location preflight failed before lane execution."
          : "Lane was not selected for this targeted run.",
        status: "SKIP"
      });
    }

    const fullSamplesSmoke = {
      reason: "Skipped because preflight failed before any samples lane decision could execute.",
      status: "SKIP"
    };
    await writeReport(options.reportPath, makeReport({
      dependencyGate,
      dryRun: options.dryRun,
      fullSamplesSmoke,
      laneInputValidation,
      laneDeduplication,
      preflight,
      results,
      runtimeSchedule,
      scopedDiscovery,
      scopedDiscoveryValidation,
      validationCache
    }));
    process.exit(1);
  }
  preflight.status = "PASS";
  preflight.reason = "Runner preflight and Playwright structure audit passed before expensive lane execution.";
} else if (needsPreflight && options.skipPreflight) {
  preflight.status = "WARN";
  preflight.reason = "Playwright structure audit was explicitly skipped by --skip-preflight.";
} else if (needsPreflight && options.dryRun) {
  preflight.reason = "Dry run requested; Playwright structure audit was not executed.";
} else if (runnerPreflight.notes.length > 0) {
  preflight.status = "PASS";
  preflight.reason = "Runner preflight passed.";
}

const scheduledCommandsByLane = new Map(runtimeSchedule.lanePlans.map((plan) => [plan.lane, plan.commands]));

for (const [lane, definition] of Object.entries(laneDefinitions)) {
  if (!requestedLanes.has(lane)) {
    results.push({
      affectedSurface: definition.affectedSurface,
      commands: [],
      fixtures: definition.fixtures,
      lane,
      reason: "Lane was not selected for this targeted run.",
      status: "SKIP"
    });
    continue;
  }

  if (definition.requiresSamplesFlag && !options.includeSamples) {
    results.push({
      affectedSurface: definition.affectedSurface,
      commands: [],
      fixtures: definition.fixtures,
      lane,
      reason: "Samples lane is on-request only; rerun with --include-samples when affected samples are in scope.",
      status: "SKIP"
    });
    continue;
  }

  const laneCommands = scheduledCommandsByLane.get(lane) || definition.commands;

  if (options.dryRun) {
    results.push({
      affectedSurface: definition.affectedSurface,
      commands: laneCommands.map((command) => ({
        command: commandToString(command),
        status: "SKIP"
      })),
      fixtures: definition.fixtures,
      lane,
      reason: `${definition.reason} Dry run requested.`,
      status: "SKIP"
    });
    continue;
  }

  const commandResults = [];
  let failed = false;
  for (const command of laneCommands) {
    const result = await runCommand(command);
    const status = result.exitCode === 0 ? "PASS" : "FAIL";
    commandResults.push({ command: result.displayCommand, status });
    if (result.exitCode !== 0) {
      failed = true;
    }
  }

  results.push({
    affectedSurface: definition.affectedSurface,
    commands: commandResults,
    fixtures: definition.fixtures,
    lane,
    reason: definition.reason,
    status: failed ? "FAIL" : "PASS"
  });
}

const samplesSelected = requestedLanes.has("samples") && options.includeSamples;
const fullSamplesSmoke = {
  reason: samplesSelected
    ? "Targeted samples lane may run, but full samples smoke remains skipped because changed files do not modify sample JSON or shared sample loader/framework behavior."
    : "Skipped because changed files do not modify sample JSON or shared sample loader/framework behavior.",
  status: "SKIP"
};

await writeReport(options.reportPath, makeReport({
  dependencyGate,
  dryRun: options.dryRun,
  fullSamplesSmoke,
  laneInputValidation,
  laneDeduplication,
  preflight,
  results,
  runtimeSchedule,
  scopedDiscovery,
  scopedDiscoveryValidation,
  validationCache
}));

if (results.some((result) => result.status === "FAIL")) {
  process.exit(1);
}
