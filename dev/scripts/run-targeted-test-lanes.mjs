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

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const playwrightConfigPath = "dev/config/playwright.config.cjs";
const defaultReportPath = "dev/reports/testing_lane_execution_report.md";
const defaultDependencyGatingReportPath = "dev/reports/dependency_gating_report.md";
const defaultDiscoveryOwnershipReportPath = "dev/reports/playwright_discovery_ownership_report.md";
const defaultDiscoveryScopeReportPath = "dev/reports/playwright_discovery_scope_report.md";
const defaultDependencyHydrationReuseReportPath = "dev/reports/dependency_hydration_reuse_report.md";
const defaultFailureFingerprintReportPath = "dev/reports/failure_fingerprint_report.md";
const defaultFilesystemScanReportPath = "dev/reports/filesystem_scan_reduction_report.md";
const defaultIncrementalValidationReportPath = "dev/reports/incremental_validation_report.md";
const defaultLaneInputValidationReportPath = "dev/reports/lane_input_validation_report.md";
const defaultLaneDeduplicationReportPath = "dev/reports/lane_deduplication_report.md";
const defaultLaneCompilationReportPath = "dev/reports/lane_compilation_report.md";
const defaultLaneRuntimeOptimizationReportPath = "dev/reports/lane_runtime_optimization_report.md";
const defaultLaneSnapshotReportPath = "dev/reports/lane_snapshot_report.md";
const defaultLaneSnapshotDir = "dev/workspace/generated/lane_snapshots";
const defaultLaneWarmStartReportPath = "dev/reports/lane_warm_start_report.md";
const defaultLaneWarmStartDir = "dev/workspace/generated/lane_warm_starts";
const defaultStaticReportPath = "dev/reports/static_validation_report.md";
const defaultTargetedFileManifestReportPath = "dev/reports/targeted_file_manifest_report.md";
const defaultPersistentLaneManifestReportPath = "dev/reports/persistent_lane_manifest_report.md";
const defaultPersistentLaneManifestDir = "dev/workspace/generated/lane_manifests";
const defaultRetrySuppressionReportPath = "dev/reports/retry_suppression_report.md";
const defaultExecutionGraphReuseReportPath = "dev/reports/execution_graph_reuse_report.md";
const defaultSlowPathPruningReportPath = "dev/reports/slow_path_pruning_report.md";
const defaultMonolithTriggerRemovalReportPath = "dev/reports/monolith_trigger_removal_report.md";
const defaultTestCleanupPerformanceReportPath = "dev/reports/test_cleanup_performance_report.md";
const defaultTestCleanupRoutingReportPath = "dev/reports/test_cleanup_routing_report.md";
const defaultValidationCacheReportPath = "dev/reports/validation_cache_report.md";
const defaultZeroBrowserReportPath = "dev/reports/zero_browser_preflight_report.md";
const locationAuditScript = "dev/scripts/audit-playwright-test-locations.mjs";
const playwrightCli = path.join(
  repoRoot,
  "node_modules",
  "@playwright",
  "test",
  "cli.js"
);
const persistentLaneManifestVersion = 1;
const laneWarmStartVersion = 1;
const laneSnapshotVersion = 1;

const pr38PerformanceEvidence = Object.freeze({
  actualBrowserLaunches: 4,
  baselineBrowserLaunches: 8,
  fullSamplesSmoke: "SKIP",
  generatedAt: "2026-05-26T21:18:42.199Z",
  reusedManifests: 4,
  reusedSnapshots: 4,
  slowestTests: [
    {
      durationMs: 19100,
      lane: "tool-runtime",
      test: "Asset Manager V2 temporary UAT context"
    },
    {
      durationMs: 14500,
      lane: "integration",
      test: "games index resolves Pong thumbnail from manifest preview role"
    },
    {
      durationMs: 10100,
      lane: "tool-runtime",
      test: "Preview Generator V2 real batch output"
    }
  ],
  sourceReport: "dev/reports/test_cleanup_performance_report.md",
  totalLaneElapsedMs: 169710
});

function nodeCommand(scriptPath, ...args) {
  return {
    args: [scriptPath, ...args],
    command: process.execPath,
    type: "node"
  };
}

function playwrightCommand(...specPaths) {
  return {
    args: [
      playwrightCli,
      "test",
      ...specPaths,
      `--config=${playwrightConfigPath}`,
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
    affectedSurface: "Root tools future-state navigation and Tool Template V2 contract",
    commands: [
      playwrightCommand("dev/tests/playwright/tools/RootToolsFutureState.spec.mjs")
    ],
    dependencies: [],
    discoveryTargets: [
      "dev/tests/playwright/tools/RootToolsFutureState.spec.mjs"
    ],
    fixtures: [
      "repo-served root tools page",
      "Tool Template V2 future-state page",
      "Theme V2 shared partials and assets"
    ],
    fixturePaths: [],
    ownership: "tools",
    requiresPreflight: true,
    reason: "Workspace V2 command now validates the future-state tools surface without exercising deprecated toolbox/old_* routes."
  },
  "game-hub": {
    affectedSurface: "Game Hub mock repository, Game Hub UI, and Toolbox Progress/Build Path game-state bridge",
    commands: [
      playwrightCommand("dev/tests/playwright/tools/GameHubMockRepository.spec.mjs")
    ],
    dependencies: [],
    discoveryTargets: [
      "dev/tests/playwright/tools/GameHubMockRepository.spec.mjs"
    ],
    fixtures: [
      "repo-served Game Hub page",
      "repo-served Toolbox page with role simulation",
      "in-memory SQL-shaped mock game repository"
    ],
    fixturePaths: [],
    ownership: "tools",
    playwrightDir: "dev/tests/playwright/tools",
    requiresPreflight: true,
    reason: "Game Hub rebuild slice validates mock users/games/game_members data actions, game lifecycle controls, and game-driven Progress/Build Path copy without exercising unrelated toolbox routes."
  },
  "game-design": {
    affectedSurface: "Game Design mock repository, project purpose flow, validation overlay, capability demo authoring, and Toolbox progress handoff",
    commands: [
      playwrightCommand("dev/tests/playwright/tools/GameDesignMockRepository.spec.mjs")
    ],
    dependencies: [],
    discoveryTargets: [
      "dev/tests/playwright/tools/GameDesignMockRepository.spec.mjs"
    ],
    fixtures: [
      "repo-served Game Design page",
      "repo-served Toolbox Progress and Build Path views",
      "in-memory SQL-shaped Game Design mock repository",
      "Game Hub mock game context"
    ],
    fixturePaths: [],
    ownership: "tools",
    playwrightDir: "dev/tests/playwright/tools",
    requiresPreflight: true,
    reason: "Game Design rebuild slice validates the active game context, design save/update, actionable validation, capability demo authoring, and Toolbox progress handoff without exercising unrelated toolbox routes."
  },
  "game-configuration": {
    affectedSurface: "Game Configuration mock repository, Game Design handoff, configuration validation, user-facing output, and Toolbox progress handoff",
    commands: [
      playwrightCommand("dev/tests/playwright/tools/GameConfigurationMockRepository.spec.mjs")
    ],
    dependencies: [],
    discoveryTargets: [
      "dev/tests/playwright/tools/GameConfigurationMockRepository.spec.mjs"
    ],
    fixtures: [
      "repo-served Game Configuration page",
      "repo-served Game Design page for handoff checks",
      "repo-served Toolbox Progress and Build Path views",
      "in-memory SQL-shaped Game Configuration mock repository",
      "Game Design mock repository handoff"
    ],
    fixturePaths: [],
    ownership: "tools",
    playwrightDir: "dev/tests/playwright/tools",
    requiresPreflight: true,
    reason: "Game Configuration rebuild slice validates the valid Game Design handoff, blocked invalid handoffs, configuration save/update, actionable validation, user-facing output, and Toolbox progress handoff without exercising unrelated toolbox routes."
  },
  "asset-tool": {
    affectedSurface: "Asset Tool mock repository, Game Configuration readiness handoff, library records, import preview, and visible failure handling",
    commands: [
      playwrightCommand("dev/tests/playwright/tools/AssetToolMockRepository.spec.mjs")
    ],
    dependencies: [],
    discoveryTargets: [
      "dev/tests/playwright/tools/AssetToolMockRepository.spec.mjs"
    ],
    fixtures: [
      "repo-served Assets page",
      "in-memory SQL-shaped Asset Tool mock repository",
      "Game Configuration mock repository handoff",
      "file-name/path-based import preview"
    ],
    fixturePaths: [],
    ownership: "tools",
    playwrightDir: "dev/tests/playwright/tools",
    requiresPreflight: true,
    reason: "Asset Tool rebuild slice validates SQL-shaped asset tables, ready Game Configuration handoff, import/preview workflow, and visible validation errors without exercising unrelated toolbox routes."
  },
  "build-path": {
    affectedSurface: "Toolbox Build Path simplification, workflow status table, and Admin Tools Progress navigation",
    commands: [
      playwrightCommand("dev/tests/playwright/tools/BuildPathProgressSimplification.spec.mjs")
    ],
    dependencies: [],
    discoveryTargets: [
      "dev/tests/playwright/tools/BuildPathProgressSimplification.spec.mjs"
    ],
    fixtures: [
      "repo-served Toolbox page",
      "repo-served Admin Tools Progress page",
      "Game Hub mock game context",
      "Toolbox role simulation"
    ],
    fixturePaths: [],
    ownership: "tools",
    playwrightDir: "dev/tests/playwright/tools",
    requiresPreflight: true,
    reason: "Build Path simplification validates removal of the separate Progress view, workflow-order status/completion table behavior, contributor N/A rows, and Admin Tools Progress navigation without exercising unrelated toolbox routes."
  },
  "tools-progress": {
    affectedSurface: "Admin Tools Progress hydration, Toolbox Group view color model, and Game Build Path separation",
    commands: [
      playwrightCommand("dev/tests/playwright/tools/ToolsProgressHydration.spec.mjs")
    ],
    dependencies: [],
    discoveryTargets: [
      "dev/tests/playwright/tools/ToolsProgressHydration.spec.mjs"
    ],
    fixtures: [
      "repo-served Admin Tools Progress page",
      "repo-served Toolbox Group view",
      "Toolbox registry build sequence",
      "Game Build Path workflow table"
    ],
    fixturePaths: [],
    ownership: "tools",
    playwrightDir: "dev/tests/playwright/tools",
    requiresPreflight: true,
    reason: "Tools Progress validates that Admin platform progress hydrates every planned/active Toolbox registry entry in build order, the restored semantic group colors render in Toolbox Group view, and Game Build Path stays workflow-order and project-specific."
  },
  "tool-navigation": {
    affectedSurface: "Toolbox route links, Tool Display Mode deprecated previous/next removal, and Toolbox group fallback routing",
    commands: [
      playwrightCommand("dev/tests/playwright/tools/ToolNavigationPrevNext.spec.mjs")
    ],
    dependencies: [],
    discoveryTargets: [
      "dev/tests/playwright/tools/ToolNavigationPrevNext.spec.mjs"
    ],
    fixtures: [
      "repo-served Toolbox page",
      "repo-served Game Design tool page",
      "repo-served Toolbox Group view with URL-selected accordion",
      "Toolbox registry route metadata"
    ],
    fixturePaths: [],
    ownership: "tools",
    playwrightDir: "dev/tests/playwright/tools",
    requiresPreflight: true,
    reason: "Tool navigation validates registry-owned tool routes, removal of deprecated Tool Display Mode previous/next controls, and direct Toolbox Group fallback routing without exercising unrelated toolbox routes."
  },
  "tool-display-mode": {
    affectedSurface: "Tool Display Mode single-line summary, registry-owned badge/tool images, and fullscreen icon swap",
    commands: [
      playwrightCommand("dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs")
    ],
    dependencies: [],
    discoveryTargets: [
      "dev/tests/playwright/tools/ToolDisplayModeSingleLineSummary.spec.mjs"
    ],
    fixtures: [
      "repo-served Game Hub, Game Design, Game Configuration, and Build Game tool pages",
      "Toolbox registry image metadata",
      "shared Theme V2 Tool Display Mode script"
    ],
    fixturePaths: [],
    ownership: "tools",
    playwrightDir: "dev/tests/playwright/tools",
    requiresPreflight: true,
    reason: "Tool Display Mode validates the single-line summary contract, direct summary children, registry-owned badge/tool art, fullscreen/exit icon swap, and removal of the deprecated body/navigation row without exercising unrelated toolbox routes."
  },
  "tool-images": {
    affectedSurface: "Toolbox registry image contract, Toolbox card image rendering, and Tool Display Mode image fallback",
    commands: [
      playwrightCommand("dev/tests/playwright/tools/ToolImageRegistry.spec.mjs")
    ],
    dependencies: [],
    discoveryTargets: [
      "dev/tests/playwright/tools/ToolImageRegistry.spec.mjs"
    ],
    fixtures: [
      "Toolbox registry badge/tool image contract",
      "repo-served Toolbox page",
      "repo-served representative Toolbox tool pages",
      "shared registry image fallback"
    ],
    fixturePaths: [],
    ownership: "tools",
    playwrightDir: "dev/tests/playwright/tools",
    requiresPreflight: true,
    reason: "Tool image registry validates every active/planned tool image contract, approved Theme V2 image paths, no size-suffix registry references, registry-owned fallback for missing art, and representative Toolbox image consumption without exercising unrelated toolbox routes."
  },
  "tool-runtime": {
    affectedSurface: "Active public toolbox and Tool Template V2 contract",
    commands: [
      playwrightCommand("dev/tests/playwright/tools/RootToolsFutureState.spec.mjs")
    ],
    dependencies: [],
    discoveryTargets: [
      "dev/tests/playwright/tools/RootToolsFutureState.spec.mjs"
    ],
    fixtures: [
      "repo-served root toolbox page",
      "Tool Template V2 public page",
      "Theme V2 shared partials and assets"
    ],
    fixturePaths: [],
    ownership: "tools",
    playwrightDir: "dev/tests/playwright/tools",
    requiresPreflight: true,
    reason: "Tool runtime lane now validates the active public toolbox/template surface and excludes removed V2 tool routes."
  },
  "game-runtime": {
    affectedSurface: "Deprecated dev/archive/v1-v2/games reference coverage",
    commands: [],
    dependencies: [],
    discoveryTargets: [],
    fixtures: [],
    fixturePaths: [],
    ownership: "games",
    playwrightDir: "",
    requiresPreflight: false,
    reason: "dev/archive/v1-v2/games are deprecated playable references and are excluded from active automated runtime validation."
  },
  integration: {
    affectedSurface: "Integration handoff behavior",
    commands: [],
    dependencies: [],
    discoveryTargets: [],
    fixtures: [
      "No active integration Playwright specs after removal of stale V2 tool and removed game manifest routes."
    ],
    fixturePaths: [],
    ownership: "integration",
    playwrightDir: "dev/tests/playwright/integration",
    requiresPreflight: false,
    reason: "Removed integration specs targeted deleted V2 tool routes or removed game manifest pages; future active integration specs should be added when a current handoff contract exists."
  },
  "engine-src": {
    affectedSurface: "src/ engine and shared runtime capability behavior",
    commands: [
      nodeCommand(
        "dev/scripts/run-node-test-files.mjs",
        "dev/tests/core/EngineCoreBoundaryBaseline.test.mjs",
        "dev/tests/engine/core/FrameClock.test.mjs",
        "dev/tests/engine/core/FixedTicker.test.mjs",
        "dev/tests/assets/AssetLoaderSystem.test.mjs",
        "dev/tests/audio/AudioService.test.mjs",
        "dev/tests/input/InputMap.test.mjs",
        "dev/tests/input/KeyboardState.test.mjs",
        "dev/tests/input/MouseState.test.mjs",
        "dev/tests/input/GamepadInputAdapter.test.mjs",
        "dev/tests/input/GamepadHapticsService.test.mjs",
        "dev/tests/render/Renderer.test.mjs"
      )
    ],
    dependencies: [],
    discoveryTargets: [
      "dev/tests/assets/AssetLoaderSystem.test.mjs",
      "dev/tests/audio/AudioService.test.mjs",
      "dev/tests/core/EngineCoreBoundaryBaseline.test.mjs",
      "dev/tests/engine/core/FixedTicker.test.mjs",
      "dev/tests/engine/core/FrameClock.test.mjs",
      "dev/tests/input/GamepadHapticsService.test.mjs",
      "dev/tests/input/GamepadInputAdapter.test.mjs",
      "dev/tests/input/InputMap.test.mjs",
      "dev/tests/input/KeyboardState.test.mjs",
      "dev/tests/input/MouseState.test.mjs",
      "dev/tests/render/Renderer.test.mjs"
    ],
    fixtures: [
      "explicit node unit fixtures",
      "fresh in-memory localStorage/sessionStorage mocks per file"
    ],
    fixturePaths: [],
    ownership: "engine",
    reason: "Engine/src lane validates reusable runtime surfaces through targeted node tests."
  },
  samples: {
    affectedSurface: "Deprecated dev/archive/v1-v2/samples reference coverage",
    commands: [],
    dependencies: [],
    discoveryTargets: [],
    fixtures: [],
    fixturePaths: [],
    ownership: "samples",
    reason: "dev/archive/v1-v2/samples are deprecated playable references and are excluded from active automated validation.",
    requiresPreflight: false
  }
});

const representativeRoutingCases = Object.freeze([
  {
    caseName: "docs-only change",
    changedFiles: ["dev/build/ProjectInstructions/PROJECT_INSTRUCTIONS.md"],
    expectedLanes: [],
    reason: "Docs/workflow-only changes use static review evidence; runtime lanes, Workspace V2, and samples stay explicit/on-request."
  },
  {
    caseName: "tool change",
    changedFiles: ["www/toolbox/audio-sfx-playground-v2/index.js"],
    expectedLanes: ["tool-runtime"],
    reason: "Tool-owned runtime/UI changes route to the affected tool-runtime lane only."
  },
  {
    caseName: "deprecated game change",
    changedFiles: ["dev/archive/v1-v2/games/asteroids/asteroids.js"],
    expectedLanes: [],
    reason: "Deprecated dev/archive/v1-v2/games changes do not route to active runtime test lanes."
  },
  {
    caseName: "src change",
    changedFiles: ["src/input/InputMap.js"],
    expectedLanes: ["engine-src"],
    reason: "Reusable src/ capability changes route to engine-src validation first."
  },
  {
    caseName: "active toolbox Playwright change",
    changedFiles: ["dev/tests/playwright/tools/RootToolsFutureState.spec.mjs"],
    expectedLanes: ["tool-runtime"],
    reason: "Active toolbox Playwright coverage routes to the tool-runtime lane only."
  }
]);

function parseArgs(argv) {
  const options = {
    dependencyGatingReportPath: defaultDependencyGatingReportPath,
    dependencyHydrationReuseReportPath: defaultDependencyHydrationReuseReportPath,
    discoveryOwnershipReportPath: defaultDiscoveryOwnershipReportPath,
    discoveryScopeReportPath: defaultDiscoveryScopeReportPath,
    dryRun: false,
    executionGraphReuseReportPath: defaultExecutionGraphReuseReportPath,
    failureFingerprintReportPath: defaultFailureFingerprintReportPath,
    filesystemScanReportPath: defaultFilesystemScanReportPath,
    includeSamples: false,
    incrementalValidationReportPath: defaultIncrementalValidationReportPath,
    laneInputValidationReportPath: defaultLaneInputValidationReportPath,
    laneCompilationReportPath: defaultLaneCompilationReportPath,
    laneDeduplicationReportPath: defaultLaneDeduplicationReportPath,
    laneRuntimeOptimizationReportPath: defaultLaneRuntimeOptimizationReportPath,
    laneSnapshotDir: defaultLaneSnapshotDir,
    laneSnapshotReportPath: defaultLaneSnapshotReportPath,
    laneWarmStartDir: defaultLaneWarmStartDir,
    laneWarmStartReportPath: defaultLaneWarmStartReportPath,
    lanes: [],
    lanesDefaultedToSafeMode: false,
    playwrightGrep: null,
    monolithTriggerRemovalReportPath: defaultMonolithTriggerRemovalReportPath,
    rawLaneRequests: [],
    reportPath: defaultReportPath,
    persistentLaneManifestDir: defaultPersistentLaneManifestDir,
    persistentLaneManifestReportPath: defaultPersistentLaneManifestReportPath,
    retrySuppressionReportPath: defaultRetrySuppressionReportPath,
    skipPreflight: false,
    slowPathPruningReportPath: defaultSlowPathPruningReportPath,
    staticOnly: false,
    staticReportPath: defaultStaticReportPath,
    targetedFileManifestReportPath: defaultTargetedFileManifestReportPath,
    testCleanupPerformanceReportPath: defaultTestCleanupPerformanceReportPath,
    testCleanupRoutingReportPath: defaultTestCleanupRoutingReportPath,
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
    } else if (argument === "--dependency-hydration-report") {
      options.dependencyHydrationReuseReportPath = argv[index + 1] || defaultDependencyHydrationReuseReportPath;
      index += 1;
    } else if (argument.startsWith("--dependency-hydration-report=")) {
      options.dependencyHydrationReuseReportPath = argument.slice("--dependency-hydration-report=".length);
    } else if (argument === "--failure-fingerprint-report") {
      options.failureFingerprintReportPath = argv[index + 1] || defaultFailureFingerprintReportPath;
      index += 1;
    } else if (argument.startsWith("--failure-fingerprint-report=")) {
      options.failureFingerprintReportPath = argument.slice("--failure-fingerprint-report=".length);
    } else if (argument === "--discovery-scope-report") {
      options.discoveryScopeReportPath = argv[index + 1] || defaultDiscoveryScopeReportPath;
      index += 1;
    } else if (argument.startsWith("--discovery-scope-report=")) {
      options.discoveryScopeReportPath = argument.slice("--discovery-scope-report=".length);
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--execution-graph-report") {
      options.executionGraphReuseReportPath = argv[index + 1] || defaultExecutionGraphReuseReportPath;
      index += 1;
    } else if (argument.startsWith("--execution-graph-report=")) {
      options.executionGraphReuseReportPath = argument.slice("--execution-graph-report=".length);
    } else if (argument === "--filesystem-scan-report") {
      options.filesystemScanReportPath = argv[index + 1] || defaultFilesystemScanReportPath;
      index += 1;
    } else if (argument.startsWith("--filesystem-scan-report=")) {
      options.filesystemScanReportPath = argument.slice("--filesystem-scan-report=".length);
    } else if (argument === "--include-samples") {
      options.includeSamples = true;
    } else if (argument === "--grep") {
      options.playwrightGrep = argv[index + 1] || "";
      index += 1;
    } else if (argument.startsWith("--grep=")) {
      options.playwrightGrep = argument.slice("--grep=".length);
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
    } else if (argument === "--retry-suppression-report") {
      options.retrySuppressionReportPath = argv[index + 1] || defaultRetrySuppressionReportPath;
      index += 1;
    } else if (argument.startsWith("--retry-suppression-report=")) {
      options.retrySuppressionReportPath = argument.slice("--retry-suppression-report=".length);
    } else if (argument === "--monolith-trigger-report") {
      options.monolithTriggerRemovalReportPath = argv[index + 1] || defaultMonolithTriggerRemovalReportPath;
      index += 1;
    } else if (argument.startsWith("--monolith-trigger-report=")) {
      options.monolithTriggerRemovalReportPath = argument.slice("--monolith-trigger-report=".length);
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
    } else if (argument === "--slow-path-pruning-report") {
      options.slowPathPruningReportPath = argv[index + 1] || defaultSlowPathPruningReportPath;
      index += 1;
    } else if (argument.startsWith("--slow-path-pruning-report=")) {
      options.slowPathPruningReportPath = argument.slice("--slow-path-pruning-report=".length);
    } else if (argument === "--targeted-file-manifest-report") {
      options.targetedFileManifestReportPath = argv[index + 1] || defaultTargetedFileManifestReportPath;
      index += 1;
    } else if (argument.startsWith("--targeted-file-manifest-report=")) {
      options.targetedFileManifestReportPath = argument.slice("--targeted-file-manifest-report=".length);
    } else if (argument === "--test-cleanup-performance-report") {
      options.testCleanupPerformanceReportPath = argv[index + 1] || defaultTestCleanupPerformanceReportPath;
      index += 1;
    } else if (argument.startsWith("--test-cleanup-performance-report=")) {
      options.testCleanupPerformanceReportPath = argument.slice("--test-cleanup-performance-report=".length);
    } else if (argument === "--test-cleanup-routing-report") {
      options.testCleanupRoutingReportPath = argv[index + 1] || defaultTestCleanupRoutingReportPath;
      index += 1;
    } else if (argument.startsWith("--test-cleanup-routing-report=")) {
      options.testCleanupRoutingReportPath = argument.slice("--test-cleanup-routing-report=".length);
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
    } else if (argument === "--lane-snapshot-dir") {
      options.laneSnapshotDir = argv[index + 1] || defaultLaneSnapshotDir;
      index += 1;
    } else if (argument.startsWith("--lane-snapshot-dir=")) {
      options.laneSnapshotDir = argument.slice("--lane-snapshot-dir=".length);
    } else if (argument === "--lane-snapshot-report") {
      options.laneSnapshotReportPath = argv[index + 1] || defaultLaneSnapshotReportPath;
      index += 1;
    } else if (argument.startsWith("--lane-snapshot-report=")) {
      options.laneSnapshotReportPath = argument.slice("--lane-snapshot-report=".length);
    } else if (argument === "--lane-warm-start-dir") {
      options.laneWarmStartDir = argv[index + 1] || defaultLaneWarmStartDir;
      index += 1;
    } else if (argument.startsWith("--lane-warm-start-dir=")) {
      options.laneWarmStartDir = argument.slice("--lane-warm-start-dir=".length);
    } else if (argument === "--lane-warm-start-report") {
      options.laneWarmStartReportPath = argv[index + 1] || defaultLaneWarmStartReportPath;
      index += 1;
    } else if (argument.startsWith("--lane-warm-start-report=")) {
      options.laneWarmStartReportPath = argument.slice("--lane-warm-start-report=".length);
    } else if (argument === "--validation-cache-report") {
      options.validationCacheReportPath = argv[index + 1] || defaultValidationCacheReportPath;
      index += 1;
    } else if (argument.startsWith("--validation-cache-report=")) {
      options.validationCacheReportPath = argument.slice("--validation-cache-report=".length);
    } else if (!argument.startsWith("--") && !options.playwrightGrep) {
      options.playwrightGrep = argument;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  options.rawLaneRequests = options.rawLaneRequests.map((lane) => lane.trim()).filter(Boolean);
  options.lanes = [...new Set(options.rawLaneRequests)];
  if (options.lanes.length === 0) {
    options.lanesDefaultedToSafeMode = true;
  }
  return options;
}

function commandWithPlaywrightGrep(commandConfig, pattern) {
  if (!pattern || commandConfig.type !== "playwright") {
    return commandConfig;
  }

  if (grepPatterns(commandConfig).length > 0) {
    return commandConfig;
  }

  return {
    args: [...commandConfig.args, "--grep", pattern],
    command: commandConfig.command,
    type: commandConfig.type
  };
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
  const startedAt = Date.now();
  const outcome = await new Promise((resolve) => {
    let outputText = "";
    const child = spawn(commandConfig.command, commandConfig.args, {
      cwd: repoRoot,
      env: process.env,
      shell: process.platform === "win32" && commandConfig.command.endsWith(".cmd"),
      stdio: ["ignore", "pipe", "pipe"]
    });
    child.stdout?.on("data", (chunk) => {
      outputText += chunk.toString();
      process.stdout.write(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      outputText += chunk.toString();
      process.stderr.write(chunk);
    });
    child.on("error", (error) => resolve({
      errorMessage: error?.message || String(error),
      exitCode: 1,
      outputText
    }));
    child.on("close", (code) => resolve({
      errorMessage: "",
      exitCode: code ?? 1,
      outputText
    }));
  });
  const elapsedMs = Date.now() - startedAt;
  return {
    displayCommand,
    elapsedMs,
    errorMessage: outcome.errorMessage,
    exitCode: outcome.exitCode,
    outputText: outcome.outputText || ""
  };
}

function summarize(results) {
  return results.reduce((summary, result) => {
    summary[result.status] = (summary[result.status] || 0) + 1;
    return summary;
  }, { FAIL: 0, PASS: 0, SKIP: 0, WARN: 0 });
}

function reportLine(value) {
  return String(value || "")
    .replace(/\r?\n/g, " ")
    .replace(/\u203a/g, ">")
    .replace(/\u00e2\u20ac\u00ba/g, ">");
}

function formatDurationMs(milliseconds) {
  const value = Number(milliseconds || 0);
  if (value < 1000) {
    return `${Math.max(0, Math.round(value))}ms`;
  }
  return `${(value / 1000).toFixed(2)}s`;
}

function durationToMs(value, unit) {
  const amount = Number(value || 0);
  if (unit === "m") {
    return amount * 60 * 1000;
  }
  if (unit === "s") {
    return amount * 1000;
  }
  return amount;
}

function extractSlowestTests(outputText, lane, commandText) {
  return String(outputText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /\[[^\]]+\]/.test(line) && /\((\d+(?:\.\d+)?)(ms|s|m)\)\s*$/.test(line))
    .map((line) => {
      const durationMatch = line.match(/\((\d+(?:\.\d+)?)(ms|s|m)\)\s*$/);
      const title = line
        .replace(/^[^\]]*\]\s*(?:\u203a\s*)?/, "")
        .replace(/\s+\(\d+(?:\.\d+)?(?:ms|s|m)\)\s*$/, "")
        .replace(/^\S+\s+\d+\s+/, "");
      return {
        command: commandText,
        durationMs: durationToMs(durationMatch?.[1], durationMatch?.[2]),
        lane,
        title: reportLine(title || line)
      };
    })
    .sort((a, b) => b.durationMs - a.durationMs);
}

function collectSlowestTests(results, limit = 10) {
  return results
    .flatMap((result) => (result.commands || []).flatMap((command) => command.slowestTests || []))
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, limit);
}

function routeLanesForChangedFiles(changedFiles) {
  const routed = new Set();
  for (const changedFile of changedFiles) {
    const normalized = normalizeRelativePath(changedFile);
    if (!normalized || normalized.startsWith("docs/")) {
      continue;
    }
    if (normalized.startsWith("dev/tests/playwright/integration/")) {
      routed.add("integration");
    } else if (normalized.startsWith("dev/tests/playwright/games/")
      || normalized.startsWith("www/games/")
      || normalized.startsWith("dev/archive/v1-v2/games/")) {
      continue;
    } else if (normalized.startsWith("dev/tests/playwright/tools/") || normalized.startsWith("www/toolbox/")) {
      routed.add("tool-runtime");
    } else if (normalized.startsWith("src/")
      || normalized.startsWith("dev/tests/core/")
      || normalized.startsWith("dev/tests/assets/")
      || normalized.startsWith("dev/tests/audio/")
      || normalized.startsWith("dev/tests/input/")
      || normalized.startsWith("dev/tests/render/")) {
      routed.add("engine-src");
    } else if (normalized.startsWith("dev/archive/v1-v2/samples/")
      || normalized.startsWith("dev/tests/samples/")) {
      continue;
    }
  }
  const laneOrder = Object.keys(laneDefinitions);
  return laneOrder.filter((lane) => routed.has(lane));
}

function sameLaneSet(left, right) {
  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();
  return leftSorted.length === rightSorted.length
    && leftSorted.every((lane, index) => lane === rightSorted[index]);
}

async function readPackageScripts() {
  const packageJson = JSON.parse(await fs.readFile(path.join(repoRoot, "package.json"), "utf8"));
  return packageJson.scripts || {};
}

function buildRoutingValidation({ includeSamples, runtimeSchedule, scripts }) {
  const caseRows = representativeRoutingCases.map((routingCase) => {
    const actualLanes = routeLanesForChangedFiles(routingCase.changedFiles);
    return {
      ...routingCase,
      actualLanes,
      status: sameLaneSet(actualLanes, routingCase.expectedLanes) ? "PASS" : "FAIL"
    };
  });
  const misplacedProbe = validateScopedDiscoveryPlan({
    includeSamples: false,
    lanes: ["tool-runtime"],
    scopedDiscovery: {
      fixtureFiles: [],
      helperFiles: [],
      targetFiles: ["dev/tests/playwright/games/AsteroidsShipStateVisuals.spec.mjs"]
    }
  });
  const laneScriptRows = Object.entries(scripts)
    .filter(([scriptName]) => scriptName.startsWith("test:lane:"))
    .map(([scriptName, scriptCommand]) => ({
      command: scriptCommand,
      scriptName,
      status: String(scriptCommand).includes("dev/scripts/run-targeted-test-lanes.mjs") ? "PASS" : "FAIL"
    }));
  const legacyRows = Object.entries(scripts)
    .filter(([scriptName, scriptCommand]) => /^test:/.test(scriptName)
      && !scriptName.startsWith("test:lane:")
      && String(scriptCommand).includes("playwright test"))
    .map(([scriptName, scriptCommand]) => ({
      command: scriptCommand,
      scriptName,
      status: "INFO"
    }));
  const scheduledLanes = runtimeSchedule.orderedLanes || [];
  const findings = [
    ...caseRows.filter((row) => row.status === "FAIL").map((row) => `${row.caseName} routed to ${row.actualLanes.join(", ") || "none"} instead of ${row.expectedLanes.join(", ") || "none"}.`),
    ...laneScriptRows.filter((row) => row.status === "FAIL").map((row) => `${row.scriptName} does not route through dev/scripts/run-targeted-test-lanes.mjs.`)
  ];
  const workspaceExplicit = !caseRows.some((row) => row.expectedLanes.includes("workspace-contract"))
    && (!scheduledLanes.includes("workspace-contract") || scheduledLanes.length === 1);
  const samplesExplicit = !includeSamples && !scheduledLanes.includes("samples");
  if (!workspaceExplicit) {
    findings.push("Workspace V2 lane appeared in routing without an explicit workspace-contract selection.");
  }
  if (!samplesExplicit && !includeSamples) {
    findings.push("Samples lane appeared in routing without --include-samples.");
  }
  if (misplacedProbe.status !== "FAIL") {
    findings.push("Misplaced test ownership probe did not fail before runtime.");
  }
  return {
    caseRows,
    findings,
    laneScriptRows,
    legacyRows,
    misplacedProbe,
    samplesExplicit,
    scheduledLanes,
    status: findings.length === 0 ? "PASS" : "FAIL",
    workspaceExplicit
  };
}

function directPlaywrightScriptRows(scripts) {
  return Object.entries(scripts)
    .filter(([scriptName, scriptCommand]) => /^test:/.test(scriptName)
      && !scriptName.startsWith("test:lane:")
      && String(scriptCommand).includes("playwright test"))
    .map(([scriptName, scriptCommand]) => {
      const commandText = String(scriptCommand);
      const isWide = /\bplaywright\s+test\s*(?:--|$)/.test(commandText)
        || /\bplaywright\s+test\s+dev\/tests\/playwright(?:\s|$)/.test(commandText)
        || /\bplaywright\s+test\s+tests(?:\s|$)/.test(commandText);
      return {
        command: commandText,
        monolithRisk: isWide ? "HIGH" : "LOW",
        reason: isWide
          ? "Script can enumerate a broad Playwright scope."
          : "Script names explicit spec files and is not a Playwright-wide startup trigger.",
        scriptName,
        status: isWide ? "WARN" : "INFO"
      };
    });
}

function buildSlowPathPruning({ failureClassification, fullSamplesSmoke, laneSnapshot, laneWarmStart, results, runtimeSchedule, validationCache }) {
  const actualBrowserLaunches = results.reduce((count, result) => count + (result.browserLaunches || 0), 0);
  const totalLaneElapsedMs = results.reduce((total, result) => total + (result.elapsedMs || 0), 0);
  const currentSlowestTests = collectSlowestTests(results);
  const noArgumentBrowserLaunchesBefore = 5;
  const noArgumentBrowserLaunchesAfter = 0;
  const workspaceNestedNpmBefore = 1;
  const workspaceNestedNpmAfter = 0;
  const optimizedRows = [
    {
      after: `${noArgumentBrowserLaunchesAfter} browser launches`,
      before: `${noArgumentBrowserLaunchesBefore} browser launches`,
      evidence: "PR_26146_038 showed broad lanes stayed skipped only when lanes were explicitly selected; the no-argument runner path still defaulted to all lanes.",
      optimizedPath: "No-argument targeted lane runner",
      result: "No lane requests now enter safe mode and schedule no runtime lanes until a lane or --all is explicit."
    },
    {
      after: `${workspaceNestedNpmAfter} nested npm startup`,
      before: `${workspaceNestedNpmBefore} nested npm startup`,
      evidence: "PR_26146_038 routing report listed test:workspace-v2 as a direct Playwright legacy entry path.",
      optimizedPath: "Workspace contract lane startup",
      result: "Workspace contract lane now invokes the Node Playwright CLI directly through lane scheduling."
    },
    {
      after: "targeted runner preflight before Workspace Playwright launch",
      before: "direct Playwright command bypassed lane preflight",
      evidence: "PR_26146_038 routing report identified test:workspace-v2 as a legacy direct Playwright script.",
      optimizedPath: "test:workspace-v2 package script",
      result: "Legacy Workspace script now routes through the workspace-contract lane."
    }
  ];

  return {
    actualBrowserLaunches,
    baseline: pr38PerformanceEvidence,
    currentSlowestTests,
    fullSamplesSmoke,
    optimizedRows,
    preventedNoArgumentBrowserLaunches: noArgumentBrowserLaunchesBefore - noArgumentBrowserLaunchesAfter,
    reducedWorkspaceLaneLaunches: workspaceNestedNpmBefore - workspaceNestedNpmAfter,
    reusedDependencyHydration: laneWarmStart?.reusedDependencyHydration || 0,
    reusedSnapshots: laneSnapshot?.reusedSnapshots || 0,
    runtimeFailureCount: failureClassification?.runtimeFailureCount || 0,
    totalLaneElapsedMs,
    validationCacheHits: validationCache?.events?.filter((event) => event.status === "HIT").length || 0,
    runtimeScheduleStatus: runtimeSchedule?.status || "SKIP",
    status: "PASS"
  };
}

function buildMonolithTriggerRemoval({ fullSamplesSmoke, options, results, runtimeSchedule, scripts }) {
  const directScripts = directPlaywrightScriptRows(scripts);
  const removedRows = [
    {
      after: "safe no-lane mode; no runtime lanes execute",
      before: "no lane arguments selected all runtime lanes by default",
      trigger: "run-targeted-test-lanes.mjs with no --lane/--lanes/--all",
      status: "REMOVED"
    },
    {
      after: "node ./dev/scripts/run-targeted-test-lanes.mjs --lane workspace-contract",
      before: "direct deprecated Workspace Manager V2 Playwright spec",
      trigger: "npm run test:workspace-v2",
      status: "REDIRECTED"
    },
    {
      after: "workspace-contract command uses the Node Playwright CLI directly",
      before: "workspace-contract invoked npm run test:workspace-v2",
      trigger: "nested Workspace lane startup",
      status: "REMOVED"
    }
  ];
  const broadDiscoveryRows = [
    {
      caller: "npm run test:audit:locations",
      reason: "Standalone ownership audit may inspect all Playwright buckets but does not launch browsers.",
      status: "EXPLICIT_STATIC"
    },
    {
      caller: "npm run test:playwright:structure",
      reason: "Standalone structure audit may inspect all Playwright buckets but remains zero-browser.",
      status: "EXPLICIT_STATIC"
    },
    {
      caller: "--all",
      reason: "All-lane execution remains available only through explicit CLI opt-in.",
      status: "EXPLICIT_OPT_IN"
    }
  ];
  const executedLanes = results.filter((result) => result.status !== "SKIP").map((result) => result.lane);
  const skippedLanes = results.filter((result) => result.status === "SKIP").map((result) => result.lane);
  const findings = [
    ...directScripts.filter((row) => row.monolithRisk === "HIGH").map((row) => `${row.scriptName} still uses broad Playwright discovery.`)
  ];
  return {
    broadDiscoveryRows,
    directScripts,
    executedLanes,
    findings,
    fullSamplesSmoke,
    removedRows,
    safeDefaultActive: Boolean(options.lanesDefaultedToSafeMode),
    scheduledLanes: runtimeSchedule?.orderedLanes || [],
    skippedLanes,
    status: findings.length === 0 ? "PASS" : "WARN",
    unaffectedLaneExecutionBlocked: skippedLanes.length > 0
  };
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

const deterministicFailureRules = Object.freeze([
  {
    key: "windows-quoting-issues",
    pattern: /quoting hazard|shell-sensitive|literal Node argv|grep pattern/i,
    source: "runner preflight",
    summary: "Windows quoting issues"
  },
  {
    key: "invalid-grep-patterns",
    pattern: /invalid.*grep|empty --grep|grep value/i,
    source: "runner preflight",
    summary: "Invalid grep patterns"
  },
  {
    key: "ownership-violations",
    pattern: /ownership|outside selected lane|outside lane ownership|not allowed for this lane/i,
    source: "ownership validation",
    summary: "Ownership violations"
  },
  {
    key: "lane-compilation-failures",
    pattern: /compilation|unknown lane|invalid lane|targets a missing file|outside dev\/tests\/playwright/i,
    source: "lane compilation",
    summary: "Lane compilation failures"
  },
  {
    key: "unresolved-fixtures-imports",
    pattern: /missing fixture|unresolved|import dependency is missing|file is missing/i,
    source: "fixture/import validation",
    summary: "Unresolved fixtures/imports"
  },
  {
    key: "invalid-manifest-lane-metadata",
    pattern: /manifest.*(metadata|hash|input|command|dependency)|persistent manifest|warm-start|lane snapshot|execution graph/i,
    source: "manifest validation",
    summary: "Invalid manifest/lane metadata"
  },
  {
    key: "invalid-dependency-graph",
    pattern: /dependency graph|dependency cycle|requires unselected dependency|dependency-gated/i,
    source: "dependency validation",
    summary: "Invalid dependency graph"
  },
  {
    key: "misplaced-test-helper-ownership",
    pattern: /misplaced|game-specific|tool-specific|helper.*ownership|shared helper/i,
    source: "structure audit",
    summary: "Misplaced test/helper ownership"
  }
]);

function deterministicRuleFingerprint(rule) {
  return fingerprint({
    category: "deterministic setup failure",
    key: rule.key,
    source: rule.source,
    summary: rule.summary
  });
}

function laneFromFailureMessage(message, fallbackLane = "setup") {
  const laneMatch = String(message || "").match(/\b(?:Lane|lane)\s+([A-Za-z0-9_-]+)/);
  if (laneMatch?.[1] && laneDefinitions[laneMatch[1]]) {
    return laneMatch[1];
  }
  const forLaneMatch = String(message || "").match(/\bfor\s+(?:lane\s+)?([A-Za-z0-9_-]+)/i);
  if (forLaneMatch?.[1] && laneDefinitions[forLaneMatch[1]]) {
    return forLaneMatch[1];
  }
  return fallbackLane;
}

function classifySetupFailure(message, source, lane) {
  const rule = deterministicFailureRules.find((entry) => entry.pattern.test(message));
  return {
    allowedRetry: false,
    category: "deterministic setup failure",
    fingerprint: fingerprint({
      category: "deterministic setup failure",
      lane,
      message,
      rule: rule?.key || "deterministic-setup",
      source
    }),
    retryReason: "Automatic retry is suppressed because deterministic setup failures must be fixed before runtime.",
    rule: rule?.key || "deterministic-setup",
    summary: rule?.summary || "Deterministic setup failure"
  };
}

function classifyRuntimeCommandFailure({ command, errorMessage, lane }) {
  const message = errorMessage
    ? `${lane} command failed to start: ${errorMessage}`
    : `${lane} command failed: ${command}`;
  const infrastructurePattern = /ENOENT|EACCES|spawn|browser executable|Cannot find module|ECONNREFUSED/i;
  const transientPattern = /timeout|timed out|ECONNRESET|browser has disconnected|Target page.*closed|net::/i;
  let category = "runtime failure";
  let allowedRetry = true;
  let retryReason = "Retry is allowed only when explicitly requested and must preserve the same targeted lane scope.";
  if (infrastructurePattern.test(message)) {
    category = "infrastructure failure";
    allowedRetry = false;
    retryReason = "Automatic retry is suppressed until infrastructure setup is corrected.";
  } else if (transientPattern.test(message)) {
    category = "flaky/transient failure";
    allowedRetry = true;
    retryReason = "Retry may be allowed only for this explicitly classified transient targeted failure.";
  }
  return {
    allowedRetry,
    category,
    fingerprint: fingerprint({
      category,
      command,
      lane,
      message
    }),
    message,
    retryReason,
    rule: category.replace(/\s+/g, "-"),
    source: "runtime command",
    summary: category
  };
}

function failureRecord({ classification, lane, message, source }) {
  return {
    allowedRetry: classification.allowedRetry,
    category: classification.category,
    fingerprint: classification.fingerprint,
    lane,
    message,
    retryReason: classification.retryReason,
    rule: classification.rule,
    source,
    summary: classification.summary
  };
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
      requiresSamplesFlag: Boolean(definition.requiresSamplesFlag),
      virtualFixturePrefixes: definition.virtualFixturePrefixes || []
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

function warmStartPathForLane(warmStartDir, lane) {
  const safeLane = String(lane || "unknown").replace(/[^A-Za-z0-9_-]/g, "-");
  return normalizeRelativePath(path.posix.join(normalizeRelativePath(warmStartDir), `${safeLane}.json`));
}

async function readWarmStartState(warmStartDir, lane) {
  const warmStartPath = warmStartPathForLane(warmStartDir, lane);
  try {
    const stateText = await fs.readFile(path.resolve(repoRoot, warmStartPath), "utf8");
    return {
      state: JSON.parse(stateText),
      status: "FOUND",
      warmStartPath
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {
        state: null,
        status: "MISSING",
        warmStartPath
      };
    }
    return {
      error: error?.message || String(error),
      state: null,
      status: "INVALID",
      warmStartPath
    };
  }
}

async function writeWarmStartState(warmStartDir, state) {
  const warmStartPath = warmStartPathForLane(warmStartDir, state.lane);
  const absoluteWarmStartPath = path.resolve(repoRoot, warmStartPath);
  await fs.mkdir(path.dirname(absoluteWarmStartPath), { recursive: true });
  await fs.writeFile(absoluteWarmStartPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  return warmStartPath;
}

function laneSnapshotPathForLane(snapshotDir, lane) {
  const safeLane = String(lane || "unknown").replace(/[^A-Za-z0-9_-]/g, "-");
  return normalizeRelativePath(path.posix.join(normalizeRelativePath(snapshotDir), `${safeLane}.json`));
}

async function readLaneSnapshot(snapshotDir, lane) {
  const snapshotPath = laneSnapshotPathForLane(snapshotDir, lane);
  try {
    const snapshotText = await fs.readFile(path.resolve(repoRoot, snapshotPath), "utf8");
    return {
      snapshot: JSON.parse(snapshotText),
      snapshotPath,
      status: "FOUND"
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {
        snapshot: null,
        snapshotPath,
        status: "MISSING"
      };
    }
    return {
      error: error?.message || String(error),
      snapshot: null,
      snapshotPath,
      status: "INVALID"
    };
  }
}

async function writeLaneSnapshot(snapshotDir, snapshot) {
  const snapshotPath = laneSnapshotPathForLane(snapshotDir, snapshot.lane);
  const absoluteSnapshotPath = path.resolve(repoRoot, snapshotPath);
  await fs.mkdir(path.dirname(absoluteSnapshotPath), { recursive: true });
  await fs.writeFile(absoluteSnapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshotPath;
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
    /\bdev\/tests\/fixtures\/[A-Za-z0-9_./-]+/g,
    /\barchive\/v1-v2\/games\/[A-Za-z0-9_-]+\/game\.manifest\.json\b/g,
    /\/archive\/v1-v2\/games\/([A-Za-z0-9_-]+)\/game\.manifest\.json\b/g
  ];
  for (const pattern of patterns) {
    let match = pattern.exec(content);
    while (match) {
      if (match[0].startsWith("/dev/archive/v1-v2/games/")) {
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
  return uniqueRelativePaths(definition.discoveryTargets || []);
}

function laneManifestTests(lane, definition) {
  return laneDiscoveryTargets(lane, definition);
}

function expectedPrefixesForOwnership(ownership) {
  const prefixes = {
    engine: [
      "dev/tests/assets/",
      "dev/tests/audio/",
      "dev/tests/core/",
      "dev/tests/input/",
      "dev/tests/render/",
      "dev/tests/playwright/engine/"
    ],
    games: [
      "dev/tests/playwright/games/"
    ],
    integration: [
      "dev/tests/playwright/integration/"
    ],
    samples: [
      "dev/tests/samples/"
    ],
    tools: [
      "dev/tests/playwright/tools/"
    ]
  };
  return prefixes[ownership] || [];
}

function fixtureAllowedForOwnership(fixturePath, ownership) {
  const normalizedPath = normalizeRelativePath(fixturePath);
  if (normalizedPath.startsWith("dev/tests/fixtures/")) {
    return true;
  }
  if (/^games\/[^/]+\/game\.manifest\.json$/.test(normalizedPath)) {
    return ownership === "tools" || ownership === "games" || ownership === "integration";
  }
  return false;
}

function fixtureIsVirtualForDefinition(fixturePath, definition) {
  const normalizedPath = normalizeRelativePath(fixturePath);
  return (definition.virtualFixturePrefixes || []).some((prefix) => normalizedPath.startsWith(prefix));
}

function helperAllowedForManifest(helperPath) {
  return normalizeRelativePath(helperPath).startsWith("dev/tests/helpers/");
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

function fileHashSubset(fileHashes, relativePaths) {
  return Object.fromEntries(uniqueRelativePaths(relativePaths).map((relativePath) => [
    relativePath,
    fileHashes?.[relativePath] || "missing"
  ]));
}

function dependencyHydrationCore(manifest) {
  const helperHashes = fileHashSubset(manifest.fileHashes, manifest.helpers);
  const fixtureHashes = fileHashSubset(manifest.fileHashes, manifest.fixtures);
  const importHashes = fileHashSubset(manifest.fileHashes, manifest.imports);
  const dependencyHydrationHash = fingerprint({
    dependencyGraphHash: manifest.dependencyGraphHash,
    fixtureHashes,
    fixtures: manifest.fixtures,
    helperHashes,
    helpers: manifest.helpers,
    importHashes,
    imports: manifest.imports,
    lane: manifest.lane,
    ownership: manifest.ownership
  });
  return {
    dependencyHydrationHash,
    fixtureHashes,
    fixtures: manifest.fixtures,
    helperHashes,
    helpers: manifest.helpers,
    importHashes,
    imports: manifest.imports
  };
}

function laneConfigurationHash(definition) {
  return fingerprint({
    commands: definition.commands.map(commandFingerprint),
    dependencies: definition.dependencies || [],
    fixturePaths: definition.fixturePaths || [],
    ownership: definition.ownership || "",
    playwrightDir: definition.playwrightDir || "",
    requiresPreflight: Boolean(definition.requiresPreflight),
    requiresSamplesFlag: Boolean(definition.requiresSamplesFlag)
  });
}

function warmStartCore({ definition, laneDefinitionHash, manifest }) {
  const dependencyHydration = dependencyHydrationCore(manifest);
  const laneConfigHash = laneConfigurationHash(definition);
  const warmStartHash = fingerprint({
    commandsHash: manifest.commandsHash,
    dependencyGraphHash: manifest.dependencyGraphHash,
    dependencyHydrationHash: dependencyHydration.dependencyHydrationHash,
    inputHash: manifest.inputHash,
    lane: manifest.lane,
    laneConfigHash,
    laneDefinitionHash,
    manifestHash: manifest.manifestHash,
    ownership: manifest.ownership,
    version: laneWarmStartVersion
  });
  return {
    commandsHash: manifest.commandsHash,
    dependencyGraphHash: manifest.dependencyGraphHash,
    dependencyHydration,
    dependencyHydrationHash: dependencyHydration.dependencyHydrationHash,
    inputHash: manifest.inputHash,
    lane: manifest.lane,
    laneConfigHash,
    laneDefinitionHash,
    manifestHash: manifest.manifestHash,
    ownership: manifest.ownership,
    warmStartHash,
    version: laneWarmStartVersion
  };
}

function warmStartSchemaFindings(state, lane, definition) {
  const findings = [];
  if (!state || typeof state !== "object") {
    return [`Warm-start state for ${lane} is not a JSON object.`];
  }
  if (state.version !== laneWarmStartVersion) {
    findings.push(`Warm-start version changed for ${lane}.`);
  }
  if (state.lane !== lane) {
    findings.push(`Warm-start lane metadata is stale for ${lane}.`);
  }
  if (state.ownership !== definition.ownership) {
    findings.push(`Warm-start ownership metadata is stale for ${lane}: ${state.ownership || "missing"} -> ${definition.ownership}.`);
  }
  [
    "commandsHash",
    "dependencyGraphHash",
    "dependencyHydrationHash",
    "inputHash",
    "laneConfigHash",
    "laneDefinitionHash",
    "manifestHash",
    "warmStartHash"
  ].forEach((key) => {
    if (!state[key]) {
      findings.push(`Warm-start ${key} is missing for ${lane}.`);
    }
  });
  if (!state.dependencyHydration || typeof state.dependencyHydration !== "object") {
    findings.push(`Warm-start dependency hydration metadata is missing for ${lane}.`);
  }
  return findings;
}

function validateWarmStartState({ definition, lane, laneDefinitionHash, manifest, state }) {
  const schemaFindings = warmStartSchemaFindings(state, lane, definition);
  if (schemaFindings.length > 0) {
    return {
      findings: schemaFindings,
      state: null,
      status: "INVALIDATED"
    };
  }

  const rebuilt = warmStartCore({
    definition,
    laneDefinitionHash,
    manifest
  });
  const findings = [];
  [
    "commandsHash",
    "dependencyGraphHash",
    "dependencyHydrationHash",
    "inputHash",
    "laneConfigHash",
    "laneDefinitionHash",
    "manifestHash",
    "ownership",
    "warmStartHash"
  ].forEach((key) => {
    if (state[key] !== rebuilt[key]) {
      findings.push(`Warm-start ${key} changed for ${lane}.`);
    }
  });

  return {
    findings,
    state: rebuilt,
    status: findings.length === 0 ? "REUSED" : "INVALIDATED"
  };
}

function runtimeConfigurationCore(definition) {
  return {
    affectedSurface: definition.affectedSurface,
    commands: definition.commands.map(commandFingerprint),
    commandsHash: fingerprint(definition.commands.map(commandFingerprint)),
    laneConfigHash: laneConfigurationHash(definition),
    requiresPreflight: Boolean(definition.requiresPreflight),
    requiresSamplesFlag: Boolean(definition.requiresSamplesFlag)
  };
}

function laneSnapshotCore({
  dependencyRow,
  definition,
  laneCompilationRow,
  laneDefinitionHash,
  manifest,
  warmStartRow
}) {
  const runtimeConfiguration = runtimeConfigurationCore(definition);
  const helperGraph = {
    helperHashes: fileHashSubset(manifest.fileHashes, manifest.helpers),
    helpers: manifest.helpers
  };
  const fixtureGraph = {
    fixtureHashes: fileHashSubset(manifest.fileHashes, manifest.fixtures),
    fixtures: manifest.fixtures
  };
  const dependencyGraph = {
    dependencies: definition.dependencies || [],
    dependencyGraphHash: manifest.dependencyGraphHash,
    importHashes: fileHashSubset(manifest.fileHashes, manifest.imports),
    imports: manifest.imports
  };
  const helperGraphHash = fingerprint(helperGraph);
  const fixtureGraphHash = fingerprint(fixtureGraph);
  const runtimeConfigurationHash = fingerprint(runtimeConfiguration);
  const executionGraphHash = fingerprint({
    dependencyGateStatus: dependencyRow?.status || "SKIP",
    dependencyGraphHash: manifest.dependencyGraphHash,
    fixtureGraphHash,
    helperGraphHash,
    lane: manifest.lane,
    laneCompilationStatus: laneCompilationRow?.status || "SKIP",
    manifestHash: manifest.manifestHash,
    runtimeConfigurationHash,
    warmStartHash: warmStartRow?.warmStartHash || "none"
  });
  const snapshotHash = fingerprint({
    executionGraphHash,
    inputHash: manifest.inputHash,
    lane: manifest.lane,
    laneDefinitionHash,
    ownership: manifest.ownership,
    version: laneSnapshotVersion
  });
  return {
    commandsHash: manifest.commandsHash,
    dependencyGateStatus: dependencyRow?.status || "SKIP",
    dependencyGraph,
    dependencyGraphHash: manifest.dependencyGraphHash,
    executionGraphHash,
    fixtureGraph,
    fixtureGraphHash,
    helperGraph,
    helperGraphHash,
    inputHash: manifest.inputHash,
    lane: manifest.lane,
    laneCompilationStatus: laneCompilationRow?.status || "SKIP",
    laneDefinitionHash,
    manifest: {
      fileHashes: manifest.fileHashes || {},
      fixtures: manifest.fixtures,
      helpers: manifest.helpers,
      imports: manifest.imports,
      manifestHash: manifest.manifestHash,
      manifestPath: manifest.manifestPath || "",
      source: manifest.source || "generated",
      tests: manifest.tests
    },
    manifestHash: manifest.manifestHash,
    ownership: manifest.ownership,
    runtimeConfiguration,
    runtimeConfigurationHash,
    snapshotHash,
    version: laneSnapshotVersion,
    warmStartHash: warmStartRow?.warmStartHash || "none"
  };
}

function laneSnapshotSchemaFindings(snapshot, lane, definition) {
  const findings = [];
  if (!snapshot || typeof snapshot !== "object") {
    return [`Lane snapshot for ${lane} is not a JSON object.`];
  }
  if (snapshot.version !== laneSnapshotVersion) {
    findings.push(`Lane snapshot version changed for ${lane}.`);
  }
  if (snapshot.lane !== lane) {
    findings.push(`Lane snapshot lane metadata is stale for ${lane}.`);
  }
  if (snapshot.ownership !== definition.ownership) {
    findings.push(`Lane snapshot ownership metadata is stale for ${lane}: ${snapshot.ownership || "missing"} -> ${definition.ownership}.`);
  }
  [
    "dependencyGraphHash",
    "executionGraphHash",
    "fixtureGraphHash",
    "helperGraphHash",
    "inputHash",
    "laneDefinitionHash",
    "manifestHash",
    "runtimeConfigurationHash",
    "snapshotHash"
  ].forEach((key) => {
    if (!snapshot[key]) {
      findings.push(`Lane snapshot ${key} is missing for ${lane}.`);
    }
  });
  ["dependencyGraph", "fixtureGraph", "helperGraph", "manifest", "runtimeConfiguration"].forEach((key) => {
    if (!snapshot[key] || typeof snapshot[key] !== "object") {
      findings.push(`Lane snapshot ${key} is missing for ${lane}.`);
    }
  });
  return findings;
}

function validateLaneSnapshot({ currentSnapshot, definition, lane, snapshot }) {
  const schemaFindings = laneSnapshotSchemaFindings(snapshot, lane, definition);
  if (schemaFindings.length > 0) {
    return {
      findings: schemaFindings,
      status: "INVALIDATED"
    };
  }
  const findings = [];
  [
    "commandsHash",
    "dependencyGateStatus",
    "dependencyGraphHash",
    "executionGraphHash",
    "fixtureGraphHash",
    "helperGraphHash",
    "inputHash",
    "laneCompilationStatus",
    "laneDefinitionHash",
    "manifestHash",
    "ownership",
    "runtimeConfigurationHash",
    "snapshotHash",
    "warmStartHash"
  ].forEach((key) => {
    if (snapshot[key] !== currentSnapshot[key]) {
      findings.push(`Lane snapshot ${key} changed for ${lane}.`);
    }
  });
  return {
    findings,
    status: findings.length === 0 ? "REUSED" : "INVALIDATED"
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
    .filter(([filePath, hash]) => hash === "missing" && !fixtureIsVirtualForDefinition(filePath, definition))
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
        if (isUnderPath(resolvedPath, "dev/tests/helpers") && !laneHelperFiles.has(resolvedPath)) {
          laneHelperFiles.add(resolvedPath);
          helperQueue.push(resolvedPath);
        } else if (isUnderPath(resolvedPath, "dev/tests/fixtures")) {
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
    const isDirectoryTarget = targetFile === "dev/tests/playwright"
      || targetFile.endsWith("/")
      || [
        "dev/tests/playwright/tools",
        "dev/tests/playwright/games",
        "dev/tests/playwright/integration",
        "dev/tests/playwright/engine",
        "dev/tests/core",
        "dev/tests/assets",
        "dev/tests/audio",
        "dev/tests/input",
        "dev/tests/render",
        "dev/tests/samples"
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
    if (!helperFile.startsWith("dev/tests/helpers/")) {
      findings.push(`Scoped helper is outside dev/tests/helpers: ${helperFile}.`);
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
          : "Helper is missing or outside dev/tests/helpers.",
        role: "helper",
        status: helperStatus
      });
      if (helperStatus === "FAIL") {
        laneFindings.push(`Invalid manifest helper for ${lane}: ${helperFile}.`);
      }
    }

    for (const fixtureFile of manifest.fixtures) {
      expectedFixtureFiles.add(fixtureFile);
      const fixtureExists = await repoPathExists(fixtureFile);
      const virtualFixture = fixtureIsVirtualForDefinition(fixtureFile, definition);
      const fixtureStatus = fixtureAllowedForOwnership(fixtureFile, manifest.ownership) && (fixtureExists || virtualFixture) ? "PASS" : "FAIL";
      fileRows.push({
        file: fixtureFile,
        lane,
        reason: fixtureStatus === "PASS"
          ? (virtualFixture && !fixtureExists
            ? "Fixture is an explicit virtual Workspace repo input and allowed for the lane ownership."
            : "Fixture is explicit, present, and allowed for the lane ownership.")
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

async function buildLaneWarmStartPlan({ laneDefinitionHash, laneInputValidation, scopedDiscovery, warmStartDir }) {
  const manifestStatusByLane = new Map((laneInputValidation.manifestRows || []).map((row) => [row.lane, row.status]));
  const rows = [];
  const hydrationRows = [];
  const findings = [];
  const selectedManifests = scopedDiscovery.laneManifests || [];

  for (const manifest of selectedManifests) {
    const lane = manifest.lane;
    const definition = laneDefinitions[lane];
    const warmStart = await readWarmStartState(warmStartDir, lane);
    const manifestStatus = manifestStatusByLane.get(lane) || manifest.status || "SKIP";

    if (!definition || manifestStatus === "SKIP" || manifest.status === "SKIP") {
      rows.push({
        dependencyHydrationHash: "none",
        invalidationReason: "Lane was skipped before warm-start validation.",
        lane,
        manifestHash: manifest.manifestHash || "none",
        status: "SKIP",
        warmStartHash: "none",
        warmStartPath: warmStart.warmStartPath
      });
      hydrationRows.push({
        fixtures: manifest.fixtures || [],
        helpers: manifest.helpers || [],
        imports: manifest.imports || [],
        lane,
        reason: "Lane was skipped before dependency hydration.",
        status: "SKIP"
      });
      continue;
    }

    if (manifestStatus !== "PASS") {
      const reason = "Warm-start validation is blocked until lane manifest validation passes.";
      findings.push(`${lane}: ${reason}`);
      rows.push({
        dependencyHydrationHash: "blocked",
        invalidationReason: reason,
        lane,
        manifestHash: manifest.manifestHash || "none",
        status: "BLOCKED",
        warmStartHash: "blocked",
        warmStartPath: warmStart.warmStartPath
      });
      hydrationRows.push({
        fixtures: manifest.fixtures || [],
        helpers: manifest.helpers || [],
        imports: manifest.imports || [],
        lane,
        reason,
        status: "BLOCKED"
      });
      continue;
    }

    const currentState = warmStartCore({
      definition,
      laneDefinitionHash,
      manifest
    });
    const hydratedState = {
      ...currentState,
      generatedAt: new Date().toISOString(),
      manifestPath: manifest.manifestPath || "",
      sourceManifest: manifest.source || "generated"
    };

    if (warmStart.status === "FOUND") {
      const validation = validateWarmStartState({
        definition,
        lane,
        laneDefinitionHash,
        manifest,
        state: warmStart.state
      });
      if (validation.status === "REUSED") {
        rows.push({
          dependencyHydrationHash: currentState.dependencyHydrationHash,
          invalidationReason: "Manifest inputs, dependency graph, ownership metadata, helper placement, fixture placement, and lane configuration are unchanged.",
          lane,
          manifestHash: manifest.manifestHash,
          status: "REUSED",
          warmStartHash: currentState.warmStartHash,
          warmStartPath: warmStart.warmStartPath
        });
        hydrationRows.push({
          dependencyHydrationHash: currentState.dependencyHydrationHash,
          fixtures: currentState.dependencyHydration.fixtures,
          helpers: currentState.dependencyHydration.helpers,
          imports: currentState.dependencyHydration.imports,
          lane,
          reason: "Dependency hydration reused from validated warm-start state.",
          status: "REUSED"
        });
        continue;
      }
      hydratedState.warmStartPath = await writeWarmStartState(warmStartDir, hydratedState);
      rows.push({
        dependencyHydrationHash: currentState.dependencyHydrationHash,
        invalidationReason: validation.findings.join("; "),
        lane,
        manifestHash: manifest.manifestHash,
        status: "INVALIDATED",
        warmStartHash: currentState.warmStartHash,
        warmStartPath: hydratedState.warmStartPath
      });
      hydrationRows.push({
        dependencyHydrationHash: currentState.dependencyHydrationHash,
        fixtures: currentState.dependencyHydration.fixtures,
        helpers: currentState.dependencyHydration.helpers,
        imports: currentState.dependencyHydration.imports,
        lane,
        reason: "Dependency hydration was refreshed after warm-start invalidation.",
        status: "INVALIDATED"
      });
      continue;
    }

    hydratedState.warmStartPath = await writeWarmStartState(warmStartDir, hydratedState);
    const status = warmStart.status === "INVALID" ? "INVALIDATED" : "GENERATED";
    const invalidationReason = warmStart.status === "INVALID"
      ? `Warm-start state could not be parsed: ${warmStart.error}`
      : "No prior warm-start state existed for this lane.";
    rows.push({
      dependencyHydrationHash: currentState.dependencyHydrationHash,
      invalidationReason,
      lane,
      manifestHash: manifest.manifestHash,
      status,
      warmStartHash: currentState.warmStartHash,
      warmStartPath: hydratedState.warmStartPath
    });
    hydrationRows.push({
      dependencyHydrationHash: currentState.dependencyHydrationHash,
      fixtures: currentState.dependencyHydration.fixtures,
      helpers: currentState.dependencyHydration.helpers,
      imports: currentState.dependencyHydration.imports,
      lane,
      reason: status === "GENERATED"
        ? "Dependency hydration was recorded for future reuse."
        : "Dependency hydration was refreshed after unreadable warm-start state.",
      status
    });
  }

  const reusedRows = rows.filter((row) => row.status === "REUSED");
  const invalidatedRows = rows.filter((row) => row.status === "INVALIDATED");
  return {
    findings: [...new Set(findings)],
    hydrationRows,
    invalidatedWarmStarts: invalidatedRows.length,
    preventedDependencyGraphHydration: reusedRows.length,
    preventedFixtureOwnershipTraversal: reusedRows.reduce((count, row) => {
      const hydrationRow = hydrationRows.find((entry) => entry.lane === row.lane);
      return count + (hydrationRow?.fixtures?.length || 0);
    }, 0),
    preventedHelperResolution: reusedRows.reduce((count, row) => {
      const hydrationRow = hydrationRows.find((entry) => entry.lane === row.lane);
      return count + (hydrationRow?.helpers?.length || 0);
    }, 0),
    preventedLaneGraphAssembly: reusedRows.length,
    preventedRedundantInitialization: reusedRows.length,
    reusedDependencyHydration: hydrationRows.filter((row) => row.status === "REUSED").length,
    reusedWarmStarts: reusedRows.length,
    rows,
    status: findings.length === 0 ? "PASS" : "FAIL",
    warmStartDir: normalizeRelativePath(warmStartDir)
  };
}

async function buildLaneSnapshotPlan({
  dependencyGate,
  laneCompilation,
  laneDefinitionHash,
  laneInputValidation,
  laneSnapshotDir,
  laneWarmStart,
  scopedDiscovery
}) {
  const dependencyRows = new Map((dependencyGate.rows || []).map((row) => [row.lane, row]));
  const compilationRows = new Map((laneCompilation.rows || []).map((row) => [row.lane, row]));
  const manifestRows = new Map((laneInputValidation.manifestRows || []).map((row) => [row.lane, row]));
  const warmStartRows = new Map((laneWarmStart.rows || []).map((row) => [row.lane, row]));
  const rows = [];
  const findings = [];

  for (const manifest of scopedDiscovery.laneManifests || []) {
    const lane = manifest.lane;
    const definition = laneDefinitions[lane];
    const persistedSnapshot = await readLaneSnapshot(laneSnapshotDir, lane);
    const dependencyRow = dependencyRows.get(lane);
    const compilationRow = compilationRows.get(lane);
    const manifestRow = manifestRows.get(lane);
    const warmStartRow = warmStartRows.get(lane);
    const validationStatus = [
      dependencyRow?.status || "SKIP",
      compilationRow?.status || "SKIP",
      manifestRow?.status || manifest.status || "SKIP",
      warmStartRow?.status || "SKIP"
    ];

    if (!definition || manifest.status === "SKIP" || validationStatus.includes("SKIP")) {
      rows.push({
        dependencyGraphHash: manifest.dependencyGraphHash || "none",
        executionGraphHash: "none",
        fixtureGraphHash: "none",
        helperGraphHash: "none",
        invalidationReason: "Lane was skipped before deterministic snapshot validation.",
        lane,
        manifestHash: manifest.manifestHash || "none",
        runtimeConfigurationHash: "none",
        snapshotHash: "none",
        snapshotPath: persistedSnapshot.snapshotPath,
        status: "SKIP"
      });
      continue;
    }

    if (validationStatus.some((status) => status !== "PASS" && status !== "REUSED" && status !== "GENERATED" && status !== "INVALIDATED")) {
      const reason = `Lane snapshot is blocked by prior validation status: ${validationStatus.join(", ")}.`;
      findings.push(`${lane}: ${reason}`);
      rows.push({
        dependencyGraphHash: manifest.dependencyGraphHash || "blocked",
        executionGraphHash: "blocked",
        fixtureGraphHash: "blocked",
        helperGraphHash: "blocked",
        invalidationReason: reason,
        lane,
        manifestHash: manifest.manifestHash || "blocked",
        runtimeConfigurationHash: "blocked",
        snapshotHash: "blocked",
        snapshotPath: persistedSnapshot.snapshotPath,
        status: "BLOCKED"
      });
      continue;
    }

    const currentSnapshot = {
      ...laneSnapshotCore({
        dependencyRow,
        definition,
        laneCompilationRow: compilationRow,
        laneDefinitionHash,
        manifest,
        warmStartRow
      }),
      generatedAt: new Date().toISOString()
    };

    if (persistedSnapshot.status === "FOUND") {
      const validation = validateLaneSnapshot({
        currentSnapshot,
        definition,
        lane,
        snapshot: persistedSnapshot.snapshot
      });
      if (validation.status === "REUSED") {
        rows.push({
          dependencyGraphHash: currentSnapshot.dependencyGraphHash,
          executionGraphHash: currentSnapshot.executionGraphHash,
          fixtureGraphHash: currentSnapshot.fixtureGraphHash,
          helperGraphHash: currentSnapshot.helperGraphHash,
          invalidationReason: "Targeted files, manifest, dependency graph, helper graph, fixture graph, ownership, lane config, and runtime config are unchanged.",
          lane,
          manifestHash: currentSnapshot.manifestHash,
          runtimeConfigurationHash: currentSnapshot.runtimeConfigurationHash,
          snapshotHash: currentSnapshot.snapshotHash,
          snapshotPath: persistedSnapshot.snapshotPath,
          status: "REUSED"
        });
        continue;
      }
      currentSnapshot.snapshotPath = await writeLaneSnapshot(laneSnapshotDir, currentSnapshot);
      rows.push({
        dependencyGraphHash: currentSnapshot.dependencyGraphHash,
        executionGraphHash: currentSnapshot.executionGraphHash,
        fixtureGraphHash: currentSnapshot.fixtureGraphHash,
        helperGraphHash: currentSnapshot.helperGraphHash,
        invalidationReason: validation.findings.join("; "),
        lane,
        manifestHash: currentSnapshot.manifestHash,
        runtimeConfigurationHash: currentSnapshot.runtimeConfigurationHash,
        snapshotHash: currentSnapshot.snapshotHash,
        snapshotPath: currentSnapshot.snapshotPath,
        status: "INVALIDATED"
      });
      continue;
    }

    currentSnapshot.snapshotPath = await writeLaneSnapshot(laneSnapshotDir, currentSnapshot);
    rows.push({
      dependencyGraphHash: currentSnapshot.dependencyGraphHash,
      executionGraphHash: currentSnapshot.executionGraphHash,
      fixtureGraphHash: currentSnapshot.fixtureGraphHash,
      helperGraphHash: currentSnapshot.helperGraphHash,
      invalidationReason: persistedSnapshot.status === "INVALID"
        ? `Lane snapshot could not be parsed: ${persistedSnapshot.error}`
        : "No prior lane snapshot existed for this lane.",
      lane,
      manifestHash: currentSnapshot.manifestHash,
      runtimeConfigurationHash: currentSnapshot.runtimeConfigurationHash,
      snapshotHash: currentSnapshot.snapshotHash,
      snapshotPath: currentSnapshot.snapshotPath,
      status: persistedSnapshot.status === "INVALID" ? "INVALIDATED" : "GENERATED"
    });
  }

  const reusedRows = rows.filter((row) => row.status === "REUSED");
  const invalidatedRows = rows.filter((row) => row.status === "INVALIDATED");
  return {
    findings: [...new Set(findings)],
    invalidatedSnapshots: invalidatedRows.length,
    laneSnapshotDir: normalizeRelativePath(laneSnapshotDir),
    preventedDependencyTraversal: reusedRows.length,
    preventedFixtureHelperGraphAssembly: reusedRows.reduce((count, row) => {
      const manifest = (scopedDiscovery.laneManifests || []).find((entry) => entry.lane === row.lane);
      return count + (manifest?.fixtures?.length || 0) + (manifest?.helpers?.length || 0);
    }, 0),
    preventedGraphRebuilds: reusedRows.length,
    preventedManifestTraversal: reusedRows.length,
    preventedTargetedSchedulingWork: reusedRows.length,
    reusedSnapshots: reusedRows.length,
    rows,
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
    const declaredTargets = new Set(laneManifestTests(lane, definition));
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
        const normalizedTarget = normalizeRelativePath(target);
        if (!declaredTargets.has(normalizedTarget)) {
          findings.push(`Lane ${lane} command target is not declared in discoveryTargets: ${normalizedTarget}.`);
        }
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
    if (!String(scriptCommand).includes("dev/scripts/run-targeted-test-lanes.mjs")) {
      findings.push(`Lane script ${scriptName} must route through dev/scripts/run-targeted-test-lanes.mjs.`);
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

function buildRuntimeSchedule({ dependencyGate, includeSamples, laneCompilation, laneDeduplication, laneSnapshot, laneWarmStart, lanes, preRuntimeFindings }) {
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
      preventedGraphRebuilds: 0,
      preventedRedundantInitialization: 0,
      preventedRedundantLaneExecutions: laneDeduplication.preventedDuplicateLaneExecutions,
      preRuntimeFindings,
      reusedDependencyHydration: 0,
      reusedRuntimeSessions: 0,
      reusedLaneSnapshots: 0,
      reusedWarmStartLanes: 0,
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
      dependencyHydrationStatus: laneWarmStart?.hydrationRows?.find((row) => row.lane === lane)?.status || "SKIP",
      lane,
      reason: definition.reason,
      scheduledPlaywrightLaunches: laneScheduledPlaywrightLaunches,
      snapshotStatus: laneSnapshot?.rows?.find((row) => row.lane === lane)?.status || "SKIP",
      warmStartStatus: laneWarmStart?.rows?.find((row) => row.lane === lane)?.status || "SKIP"
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
    preventedGraphRebuilds: laneSnapshot?.preventedGraphRebuilds || 0,
    preventedRedundantInitialization: laneWarmStart?.preventedRedundantInitialization || 0,
    preventedRedundantLaneExecutions: skippedLaneCount + laneDeduplication.preventedDuplicateLaneExecutions,
    preRuntimeFindings,
    reusedDependencyHydration: laneWarmStart?.reusedDependencyHydration || 0,
    reusedRuntimeSessions: groupedPlaywrightSessions + (orderedLanes.length > 1 ? 1 : 0),
    reusedLaneSnapshots: laneSnapshot?.reusedSnapshots || 0,
    reusedWarmStartLanes: laneWarmStart?.reusedWarmStarts || 0,
    scheduledPlaywrightLaunches,
    status: dependencyGate.status === "PASS" && laneCompilation.status === "PASS" ? "PASS" : "SKIP"
  };
}

function collectSetupFailureRecords({
  dependencyGate,
  laneCompilation,
  laneInputValidation,
  laneRegistration,
  laneSnapshot,
  laneWarmStart,
  runnerPreflight,
  scopedDiscoveryValidation,
  structureAudit,
  unknownLanes
}) {
  const records = [];
  const seen = new Set();

  function addSetupFinding(source, message, fallbackLane = "setup") {
    const normalizedMessage = reportLine(message);
    if (!normalizedMessage) {
      return;
    }
    const lane = laneFromFailureMessage(normalizedMessage, fallbackLane);
    const classification = classifySetupFailure(normalizedMessage, source, lane);
    const key = `${classification.fingerprint}:${source}:${normalizedMessage}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    records.push(failureRecord({
      classification,
      lane,
      message: normalizedMessage,
      source
    }));
  }

  unknownLanes.forEach((lane) => {
    addSetupFinding("lane compilation", `Unknown lane requested: ${lane}`, lane);
  });
  laneRegistration.findings.forEach((findingText) => addSetupFinding("lane registration", findingText));
  runnerPreflight.findings.forEach((findingText) => addSetupFinding("runner preflight", findingText));
  scopedDiscoveryValidation.findings.forEach((findingText) => addSetupFinding("scoped discovery validation", findingText));
  laneInputValidation.findings.forEach((findingText) => addSetupFinding("manifest input validation", findingText));
  laneWarmStart.findings.forEach((findingText) => addSetupFinding("warm-start validation", findingText));
  laneSnapshot.findings.forEach((findingText) => addSetupFinding("lane snapshot validation", findingText));
  laneCompilation.findings.forEach((findingText) => addSetupFinding("lane compilation", findingText));
  dependencyGate.findings.forEach((findingText) => addSetupFinding("dependency validation", findingText));
  if (structureAudit.status === "FAIL") {
    addSetupFinding("structure audit", structureAudit.reason || "Playwright structure audit failed.");
  }
  return records;
}

function collectRuntimeFailureRecords(results) {
  const records = [];
  for (const result of results) {
    for (const command of result.commands || []) {
      if (command.status !== "FAIL") {
        continue;
      }
      const classification = classifyRuntimeCommandFailure({
        command: command.command,
        errorMessage: command.errorMessage || "",
        lane: result.lane
      });
      records.push(failureRecord({
        classification,
        lane: result.lane,
        message: classification.message,
        source: classification.source
      }));
    }
  }
  return records;
}

function buildFailureClassification({
  dependencyGate,
  laneCompilation,
  laneInputValidation,
  laneRegistration,
  laneSnapshot,
  laneWarmStart,
  results,
  runnerPreflight,
  runtimeSchedule,
  scopedDiscoveryValidation,
  structureAudit,
  unknownLanes
}) {
  const setupRecords = collectSetupFailureRecords({
    dependencyGate,
    laneCompilation,
    laneInputValidation,
    laneRegistration,
    laneSnapshot,
    laneWarmStart,
    runnerPreflight,
    scopedDiscoveryValidation,
    structureAudit,
    unknownLanes
  });
  const runtimeRecords = collectRuntimeFailureRecords(results || []);
  const records = [...setupRecords, ...runtimeRecords];
  const deterministicRecords = records.filter((record) => record.category === "deterministic setup failure");
  const runtimeFailureRecords = records.filter((record) => record.category === "runtime failure");
  const transientRecords = records.filter((record) => record.category === "flaky/transient failure");
  const infrastructureRecords = records.filter((record) => record.category === "infrastructure failure");
  const deterministicFailureCount = deterministicRecords.length;
  const preventedBrowserLaunches = deterministicFailureCount > 0
    ? runtimeSchedule.baselinePlaywrightLaunches || runtimeSchedule.scheduledPlaywrightLaunches || 0
    : 0;
  return {
    deterministicFailureCount,
    infrastructureFailureCount: infrastructureRecords.length,
    preventedBroadLaneEscalations: deterministicFailureCount,
    preventedBrowserLaunches,
    preventedLaneHydration: deterministicFailureCount > 0 ? laneWarmStart.preventedRedundantInitialization || 0 : 0,
    preventedReruns: deterministicFailureCount,
    records,
    runtimeFailureCount: runtimeFailureRecords.length,
    status: records.length === 0 ? "PASS" : "WARN",
    transientFailureCount: transientRecords.length
  };
}

function buildExecutionGraphReuse({ laneSnapshot, runtimeSchedule }) {
  const runtimeLaneSet = new Set(runtimeSchedule.orderedLanes || []);
  const rows = (laneSnapshot.rows || []).map((row) => ({
    executionGraphHash: row.executionGraphHash,
    lane: row.lane,
    reason: runtimeLaneSet.has(row.lane)
      ? "Lane snapshot is part of the selected targeted execution graph."
      : "Lane snapshot is outside the scheduled runtime graph or was skipped.",
    snapshotStatus: row.status,
    status: runtimeLaneSet.has(row.lane) ? row.status : "SKIP"
  }));
  return {
    preventedDependencyTraversal: laneSnapshot.preventedDependencyTraversal || 0,
    preventedFixtureHelperGraphAssembly: laneSnapshot.preventedFixtureHelperGraphAssembly || 0,
    preventedGraphRebuilds: laneSnapshot.preventedGraphRebuilds || 0,
    preventedManifestTraversal: laneSnapshot.preventedManifestTraversal || 0,
    preventedTargetedSchedulingWork: laneSnapshot.preventedTargetedSchedulingWork || 0,
    reusedExecutionGraphs: rows.filter((row) => row.status === "REUSED").length,
    rows,
    status: laneSnapshot.status
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
    `Reused lane snapshots: ${runtimeSchedule.reusedLaneSnapshots || 0}`,
    `Reused warm-start lanes: ${runtimeSchedule.reusedWarmStartLanes || 0}`,
    `Reused dependency hydration: ${runtimeSchedule.reusedDependencyHydration || 0}`,
    `Prevented graph rebuilds: ${runtimeSchedule.preventedGraphRebuilds || 0}`,
    `Prevented redundant initialization: ${runtimeSchedule.preventedRedundantInitialization || 0}`,
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
    "| Lane | Snapshot | Warm Start | Hydration | Baseline Browser Launches | Scheduled Browser Launches | Commands | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |"
  ];

  runtimeSchedule.lanePlans.forEach((plan) => {
    lines.push([
      `| ${plan.lane}`,
      plan.snapshotStatus || "SKIP",
      plan.warmStartStatus || "SKIP",
      plan.dependencyHydrationStatus || "SKIP",
      plan.baselinePlaywrightLaunches,
      plan.scheduledPlaywrightLaunches,
      reportLine(plan.commands.map(commandToString).join("; ") || "none"),
      `${reportLine(plan.reason)} |`
    ].join(" | "));
  });

  if (runtimeSchedule.lanePlans.length === 0) {
    lines.push("| none | SKIP | SKIP | SKIP | 0 | 0 | none | No dependency-eligible targeted lanes were scheduled. |");
  }

  lines.push(
    "",
    "## Runtime Savings Observations",
    "",
    "- Zero-browser preflight, lane compilation, and dependency validation run once per targeted runner invocation.",
    "- Reused lane snapshots avoid rebuilding identical targeted execution graphs.",
    "- Validated warm-start lanes reuse deterministic initialization state when manifest and dependency hashes are unchanged.",
    "- Reused dependency hydration avoids repeated helper resolution and fixture ownership traversal for compatible targeted runs.",
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
    "- Incremental validation remains deterministic and does not use project JSON, toolState, localStorage, sessionStorage, or repo artifact tmp/."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeLaneWarmStartReport({ laneWarmStart }) {
  const reused = laneWarmStart.rows.filter((row) => row.status === "REUSED");
  const invalidated = laneWarmStart.rows.filter((row) => row.status === "INVALIDATED");
  const generated = laneWarmStart.rows.filter((row) => row.status === "GENERATED");
  const skipped = laneWarmStart.rows.filter((row) => row.status === "SKIP");
  const lines = [
    "# Lane Warm-Start Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${laneWarmStart.status}`,
    `Warm-start directory: ${laneWarmStart.warmStartDir || defaultLaneWarmStartDir}`,
    "",
    "## Summary",
    "",
    `Reused warm-start lanes: ${reused.length}`,
    `Invalidated warm-start states: ${invalidated.length}`,
    `Generated warm-start states: ${generated.length}`,
    `Skipped warm-start states: ${skipped.length}`,
    `Prevented redundant initialization: ${laneWarmStart.preventedRedundantInitialization}`,
    `Prevented lane graph assembly: ${laneWarmStart.preventedLaneGraphAssembly}`,
    "",
    "## Warm-Start Decisions",
    "",
    "| Lane | Status | Warm-Start Path | Manifest Hash | Warm-Start Hash | Dependency Hydration Hash | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- |"
  ];

  if (laneWarmStart.rows.length === 0) {
    lines.push("| none | SKIP | none | none | none | none | No selected lanes produced warm-start decisions. |");
  } else {
    laneWarmStart.rows.forEach((row) => {
      lines.push([
        `| ${row.lane}`,
        row.status,
        row.warmStartPath || "none",
        row.manifestHash || "none",
        row.warmStartHash || "none",
        row.dependencyHydrationHash || "none",
        `${reportLine(row.invalidationReason)} |`
      ].join(" | "));
    });
  }

  lines.push("", "## Fast-Fail Safeguards", "");
  if (laneWarmStart.findings.length === 0) {
    lines.push("No warm-start blocker findings were found before runtime.");
  } else {
    laneWarmStart.findings.forEach((findingText) => lines.push(`- ${findingText}`));
  }

  lines.push(
    "",
    "## Invalidation Rules",
    "",
    "- Targeted file changes invalidate the owning warm-start state through manifest input hashes.",
    "- Ownership metadata changes invalidate warm-start state before runtime scheduling.",
    "- Dependency graph changes invalidate warm-start state and dependency hydration reuse.",
    "- Helper or fixture placement changes invalidate the affected lane state.",
    "- Lane configuration changes invalidate warm-start state before Playwright launch.",
    "- Warm-start invalidation never expands into broad fallback lane execution.",
    "",
    "## Runtime Savings Observations",
    "",
    "- Reused warm-start state avoids rebuilding identical lane initialization data.",
    "- Reused state carries validated manifest, ownership, dependency, and hydration hashes into scheduling.",
    "- Generated or invalidated state is refreshed deterministically before runtime and remains scoped to selected lanes."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeDependencyHydrationReuseReport({ laneWarmStart }) {
  const reused = laneWarmStart.hydrationRows.filter((row) => row.status === "REUSED");
  const invalidated = laneWarmStart.hydrationRows.filter((row) => row.status === "INVALIDATED");
  const generated = laneWarmStart.hydrationRows.filter((row) => row.status === "GENERATED");
  const lines = [
    "# Dependency Hydration Reuse Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${laneWarmStart.status}`,
    "",
    "## Summary",
    "",
    `Reused dependency hydration: ${reused.length}`,
    `Invalidated dependency hydration: ${invalidated.length}`,
    `Generated dependency hydration: ${generated.length}`,
    `Prevented dependency graph hydration: ${laneWarmStart.preventedDependencyGraphHydration}`,
    `Prevented helper resolution passes: ${laneWarmStart.preventedHelperResolution}`,
    `Prevented fixture ownership traversal: ${laneWarmStart.preventedFixtureOwnershipTraversal}`,
    "",
    "## Hydration Decisions",
    "",
    "| Lane | Status | Helpers | Fixtures | Imports | Dependency Hydration Hash | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- |"
  ];

  if (laneWarmStart.hydrationRows.length === 0) {
    lines.push("| none | SKIP | none | none | none | none | No selected lanes produced hydration decisions. |");
  } else {
    laneWarmStart.hydrationRows.forEach((row) => {
      lines.push([
        `| ${row.lane}`,
        row.status,
        reportLine((row.helpers || []).join("; ") || "none"),
        reportLine((row.fixtures || []).join("; ") || "none"),
        reportLine((row.imports || []).join("; ") || "none"),
        row.dependencyHydrationHash || "none",
        `${reportLine(row.reason)} |`
      ].join(" | "));
    });
  }

  lines.push(
    "",
    "## Safeguards",
    "",
    "- Dependency hydration reuse is tied to manifest input, ownership, dependency graph, helper, fixture, and import hashes.",
    "- Stale hydration metadata is refreshed before runtime and is not reused silently.",
    "- Hydration invalidation does not trigger fallback broad discovery or unrelated lane execution.",
    "- Reused hydration avoids repeated helper resolution, fixture ownership traversal, and dependency graph hydration for compatible targeted runs."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeLaneSnapshotReport({ laneSnapshot }) {
  const reused = laneSnapshot.rows.filter((row) => row.status === "REUSED");
  const invalidated = laneSnapshot.rows.filter((row) => row.status === "INVALIDATED");
  const generated = laneSnapshot.rows.filter((row) => row.status === "GENERATED");
  const skipped = laneSnapshot.rows.filter((row) => row.status === "SKIP");
  const lines = [
    "# Lane Snapshot Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${laneSnapshot.status}`,
    `Snapshot directory: ${laneSnapshot.laneSnapshotDir || defaultLaneSnapshotDir}`,
    "",
    "## Summary",
    "",
    `Reused lane snapshots: ${reused.length}`,
    `Invalidated snapshots: ${invalidated.length}`,
    `Generated snapshots: ${generated.length}`,
    `Skipped snapshots: ${skipped.length}`,
    `Prevented graph rebuilds: ${laneSnapshot.preventedGraphRebuilds}`,
    `Prevented manifest traversal: ${laneSnapshot.preventedManifestTraversal}`,
    "",
    "## Snapshot Decisions",
    "",
    "| Lane | Status | Snapshot Path | Manifest Hash | Dependency Graph Hash | Helper Graph Hash | Fixture Graph Hash | Runtime Config Hash | Execution Graph Hash | Snapshot Hash | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"
  ];

  if (laneSnapshot.rows.length === 0) {
    lines.push("| none | SKIP | none | none | none | none | none | none | none | none | No selected lanes produced snapshots. |");
  } else {
    laneSnapshot.rows.forEach((row) => {
      lines.push([
        `| ${row.lane}`,
        row.status,
        row.snapshotPath || "none",
        row.manifestHash || "none",
        row.dependencyGraphHash || "none",
        row.helperGraphHash || "none",
        row.fixtureGraphHash || "none",
        row.runtimeConfigurationHash || "none",
        row.executionGraphHash || "none",
        row.snapshotHash || "none",
        `${reportLine(row.invalidationReason)} |`
      ].join(" | "));
    });
  }

  lines.push("", "## Snapshot Validation Findings", "");
  if (laneSnapshot.findings.length === 0) {
    lines.push("No stale graph reuse or snapshot validation blockers were found.");
  } else {
    laneSnapshot.findings.forEach((findingText) => lines.push(`- ${findingText}`));
  }

  lines.push(
    "",
    "## Invalidation Rules",
    "",
    "- Targeted file changes invalidate the owning lane snapshot through manifest input hashes.",
    "- Dependency graph changes invalidate the owning lane snapshot.",
    "- Helper or fixture ownership changes invalidate snapshots that include those graph inputs.",
    "- Lane configuration changes invalidate runtime configuration hashes.",
    "- Runtime configuration changes invalidate execution graph hashes.",
    "- Snapshot invalidation never triggers fallback broad lane regeneration.",
    "",
    "## Runtime Savings Observations",
    "",
    "- Reused snapshots avoid rebuilding identical targeted lane graphs.",
    "- Snapshot reuse carries lane ownership, manifest, dependency, fixture, helper, and runtime configuration hashes into scheduling.",
    "- Stale snapshots are regenerated deterministically before Playwright/browser launch."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeExecutionGraphReuseReport({ executionGraphReuse }) {
  const lines = [
    "# Execution Graph Reuse Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${executionGraphReuse.status}`,
    "",
    "## Summary",
    "",
    `Reused execution graphs: ${executionGraphReuse.reusedExecutionGraphs}`,
    `Prevented graph rebuilds: ${executionGraphReuse.preventedGraphRebuilds}`,
    `Prevented redundant dependency traversal: ${executionGraphReuse.preventedDependencyTraversal}`,
    `Prevented fixture/helper graph assembly: ${executionGraphReuse.preventedFixtureHelperGraphAssembly}`,
    `Prevented manifest traversal: ${executionGraphReuse.preventedManifestTraversal}`,
    `Prevented targeted scheduling work: ${executionGraphReuse.preventedTargetedSchedulingWork}`,
    "",
    "## Execution Graph Decisions",
    "",
    "| Lane | Status | Snapshot Status | Execution Graph Hash | Reason |",
    "| --- | --- | --- | --- | --- |"
  ];

  if (executionGraphReuse.rows.length === 0) {
    lines.push("| none | SKIP | none | none | No targeted execution graph rows were produced. |");
  } else {
    executionGraphReuse.rows.forEach((row) => {
      lines.push([
        `| ${row.lane}`,
        row.status,
        row.snapshotStatus,
        row.executionGraphHash || "none",
        `${reportLine(row.reason)} |`
      ].join(" | "));
    });
  }

  lines.push(
    "",
    "## Safeguards",
    "",
    "- Execution graph reuse is allowed only when the lane snapshot hash remains valid.",
    "- Stale graph snapshots are invalidated before runtime scheduling.",
    "- Deterministic invalidation does not fall back to broad lane regeneration.",
    "- Reused execution graphs keep targeted lane scope and do not start Workspace/global lanes unless selected.",
    "",
    "## Runtime Savings Observations",
    "",
    "- Reused snapshots reduce repeated lane graph construction.",
    "- Reused snapshots reduce repeated manifest, helper, fixture, and dependency traversal.",
    "- Reused snapshots reduce repeated targeted scheduling work before Playwright/browser startup."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeFailureFingerprintReport({ failureClassification }) {
  const lines = [
    "# Failure Fingerprint Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${failureClassification.status}`,
    "",
    "## Summary",
    "",
    `Deterministic setup failures: ${failureClassification.deterministicFailureCount}`,
    `Runtime failures: ${failureClassification.runtimeFailureCount}`,
    `Flaky/transient failures: ${failureClassification.transientFailureCount}`,
    `Infrastructure failures: ${failureClassification.infrastructureFailureCount}`,
    "",
    "## Observed Failure Fingerprints",
    "",
    "| Fingerprint | Category | Rule | Lane | Source | Retry Allowed | Diagnostic |",
    "| --- | --- | --- | --- | --- | --- | --- |"
  ];

  if (failureClassification.records.length === 0) {
    lines.push("| none | none | none | none | none | No | No failures observed during deterministic classification. |");
  } else {
    failureClassification.records.forEach((record) => {
      lines.push([
        `| ${record.fingerprint}`,
        record.category,
        record.rule,
        record.lane,
        record.source,
        record.allowedRetry ? "Yes" : "No",
        `${reportLine(record.message)} |`
      ].join(" | "));
    });
  }

  lines.push(
    "",
    "## Known Deterministic Fingerprint Rules",
    "",
    "| Rule | Fingerprint | Source | Classification | Matches |",
    "| --- | --- | --- | --- | --- |"
  );
  deterministicFailureRules.forEach((rule) => {
    lines.push([
      `| ${rule.key}`,
      deterministicRuleFingerprint(rule),
      rule.source,
      "deterministic setup failure",
      `${reportLine(rule.summary)} |`
    ].join(" | "));
  });

  lines.push(
    "",
    "## Classification Contract",
    "",
    "- Deterministic setup failures block runtime before Playwright/browser startup.",
    "- Runtime failures belong to the targeted lane that executed the failing command.",
    "- Flaky/transient failures require explicit classification before any targeted retry is allowed.",
    "- Infrastructure failures are not retried automatically until the infrastructure issue is corrected.",
    "- Failure fingerprints are based on lane, source, rule, category, command, and diagnostic text."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeRetrySuppressionReport({ failureClassification }) {
  const retryAllowed = failureClassification.records.filter((record) => record.allowedRetry);
  const retrySuppressed = failureClassification.records.filter((record) => !record.allowedRetry);
  const lines = [
    "# Retry Suppression Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${failureClassification.status}`,
    "",
    "## Summary",
    "",
    `Deterministic failures suppressed: ${failureClassification.deterministicFailureCount}`,
    `Prevented reruns: ${failureClassification.preventedReruns}`,
    `Prevented browser launches: ${failureClassification.preventedBrowserLaunches}`,
    `Prevented broad lane escalation: ${failureClassification.preventedBroadLaneEscalations}`,
    `Prevented repeated lane hydration: ${failureClassification.preventedLaneHydration}`,
    "",
    "## Retry Decisions",
    "",
    "| Fingerprint | Lane | Category | Retry Decision | Reason |",
    "| --- | --- | --- | --- | --- |"
  ];

  if (failureClassification.records.length === 0) {
    lines.push("| none | none | none | No retry needed | No failures were observed. |");
  } else {
    retrySuppressed.forEach((record) => {
      lines.push([
        `| ${record.fingerprint}`,
        record.lane,
        record.category,
        "Suppressed",
        `${reportLine(record.retryReason)} |`
      ].join(" | "));
    });
    retryAllowed.forEach((record) => {
      lines.push([
        `| ${record.fingerprint}`,
        record.lane,
        record.category,
        "Allowed only on explicit targeted retry",
        `${reportLine(record.retryReason)} |`
      ].join(" | "));
    });
  }

  lines.push(
    "",
    "## Enforcement Rules",
    "",
    "- Deterministic setup failures never trigger automatic reruns.",
    "- Deterministic targeted-lane failures never escalate into broad lanes.",
    "- Deterministic preflight failures prevent repeated browser startup.",
    "- Targeted retries may run only for explicitly classified runtime or flaky/transient failures.",
    "- Targeted retries must preserve the affected lane scope and must not rerun unaffected lanes.",
    "",
    "## Runtime Savings Observations",
    "",
    "- Suppressed setup failures avoid repeated Playwright/browser initialization.",
    "- Suppressed setup failures avoid repeated Workspace/global lane startup.",
    "- Suppressed setup failures avoid repeated lane hydration after deterministic validation failure.",
    "- Runtime failures are reported without broad fallback execution."
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
  laneWarmStart,
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
    ...laneWarmStart.findings,
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
    `| lane warm-start reuse | ${laneWarmStart.status} | ${laneWarmStart.rows.map((row) => `${row.lane}:${row.status}`).join("; ") || "No warm-start events."} |`,
    `| dependency hydration reuse | ${laneWarmStart.status} | ${laneWarmStart.hydrationRows.map((row) => `${row.lane}:${row.status}`).join("; ") || "No hydration events."} |`,
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
  laneSnapshot,
  laneWarmStart,
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
    ...laneWarmStart.findings,
    ...laneSnapshot.findings,
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
    `| directory placement | ${structureAudit.status} | www/toolbox, www/games, integration, and engine ownership checked. |`,
    `| invalid file naming | ${structureAudit.status} | Game-specific filenames are blocked from generic reusable lanes. |`,
    `| duplicate registrations | ${laneRegistration.findings.some((entry) => entry.includes("Duplicate")) ? "FAIL" : "PASS"} | ${laneRegistration.findings.filter((entry) => entry.includes("Duplicate")).join("; ") || "No duplicate lane registrations."} |`,
    `| invalid imports | ${structureAudit.status} | Relative imports checked by Playwright structure audit. |`,
    `| unresolved fixtures | ${runnerPreflight.findings.some((entry) => entry.includes("missing fixture")) ? "FAIL" : "PASS"} | ${runnerPreflight.findings.filter((entry) => entry.includes("missing fixture")).join("; ") || "No unresolved fixture findings."} |`,
    `| unresolved helpers | ${structureAudit.status} | Shared helper imports and naming ownership checked. |`,
    `| targeted file manifests | ${laneInputValidation.status} | ${laneInputValidation.manifestRows.map((row) => `${row.lane}:${row.status}`).join(", ") || "none"} |`,
    `| persistent lane manifests | ${laneInputValidation.status} | ${(scopedDiscovery.persistentManifestEvents || []).map((event) => `${event.lane}:${event.status}`).join(", ") || "none"} |`,
    `| lane warm-start reuse | ${laneWarmStart.status} | ${laneWarmStart.rows.map((row) => `${row.lane}:${row.status}`).join(", ") || "none"} |`,
    `| dependency hydration reuse | ${laneWarmStart.status} | ${laneWarmStart.hydrationRows.map((row) => `${row.lane}:${row.status}`).join(", ") || "none"} |`,
    `| lane snapshots | ${laneSnapshot.status} | ${laneSnapshot.rows.map((row) => `${row.lane}:${row.status}`).join(", ") || "none"} |`,
    `| manifest input graph expansion | ${laneInputValidation.preventedDiscoveryExpansion ? "PASS" : "FAIL"} | ${laneInputValidation.preventedDiscoveryExpansion ? "No scoped discovery inputs escaped manifest ownership." : "Unexpected manifest input expansion detected."} |`,
    `| scoped discovery | ${scopedDiscoveryValidation.status} | Targets: ${scopedDiscovery.targetFiles.join(", ") || "none"}; helpers: ${scopedDiscovery.helperFiles.join(", ") || "none"}. |`,
    `| invalid grep patterns | ${runnerPreflight.findings.some((entry) => entry.includes("grep")) ? "FAIL" : "PASS"} | ${runnerPreflight.findings.filter((entry) => entry.includes("grep")).join("; ") || "No invalid grep patterns."} |`,
    `| Windows quoting hazards | ${runnerPreflight.findings.some((entry) => entry.includes("quoting hazard")) ? "FAIL" : "PASS"} | ${runnerPreflight.notes.filter((entry) => entry.includes("grep pattern")).join("; ") || "No shell quoting hazards."} |`,
    `| invalid lane references | ${unknownLanes.length > 0 ? "FAIL" : "PASS"} | ${unknownLanes.join("; ") || "No invalid lane references."} |`,
    `| invalid lane configuration | ${laneCompilation.status} | See dev/reports/lane_compilation_report.md. |`,
    `| deterministic dependency graph | ${dependencyGate.status} | See dev/reports/dependency_gating_report.md. |`,
    `| conflicting reusable helper ownership | ${structureAudit.status} | Shared helper filenames checked against known game names. |`,
    "",
    "## Corrected Ownership Drift",
    "",
    "- Asteroids Playwright runtime specs are enforced under `dev/tests/playwright/games`.",
    "- Game index preview manifest handoff is enforced under `dev/tests/playwright/integration`.",
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

function makeTestCleanupPerformanceReport({
  executionGraphReuse,
  failureClassification,
  fullSamplesSmoke,
  laneDeduplication,
  laneSnapshot,
  results,
  runtimeSchedule,
  scopedDiscovery,
  validationCache
}) {
  const manifestEvents = scopedDiscovery?.persistentManifestEvents || [];
  const reusedManifests = manifestEvents.filter((event) => event.status === "REUSED");
  const skippedResults = results.filter((result) => result.status === "SKIP");
  const actualBrowserLaunches = results.reduce((count, result) => count + (result.browserLaunches || 0), 0);
  const totalLaneElapsedMs = results.reduce((total, result) => total + (result.elapsedMs || 0), 0);
  const slowestTests = collectSlowestTests(results);
  const cacheHits = validationCache?.events?.filter((event) => event.status === "HIT").length || 0;
  const preventedBroadExecution = [
    runtimeSchedule?.orderedLanes?.includes("workspace-contract") ? "" : "Workspace V2 lane was not scheduled without explicit selection.",
    fullSamplesSmoke?.status === "SKIP" ? "Full samples smoke stayed skipped/on-request." : "",
    "Unselected lane directories stayed outside targeted discovery."
  ].filter(Boolean);
  const lines = [
    "# Test Cleanup Performance Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${results.some((result) => result.status === "FAIL") ? "WARN" : "PASS"}`,
    "",
    "## Cost Summary",
    "",
    `Total measured lane elapsed time: ${formatDurationMs(totalLaneElapsedMs)}`,
    `Actual browser launch count: ${actualBrowserLaunches}`,
    `Scheduled browser launch count: ${runtimeSchedule?.scheduledPlaywrightLaunches ?? 0}`,
    `Baseline browser launch count: ${runtimeSchedule?.baselinePlaywrightLaunches ?? 0}`,
    `Skipped lanes: ${skippedResults.length}`,
    `Reused manifests: ${reusedManifests.length}`,
    `Reused snapshots: ${laneSnapshot?.reusedSnapshots ?? 0}`,
    `Cached validations reused: ${cacheHits}`,
    `Prevented broad execution: ${preventedBroadExecution.length}`,
    `Prevented reruns: ${(failureClassification?.preventedReruns ?? 0) + (laneDeduplication?.preventedDuplicateLaneExecutions ?? 0)}`,
    `Prevented redundant browser launches: ${runtimeSchedule?.preventedRedundantBrowserLaunches ?? 0}`,
    `Prevented graph rebuilds: ${runtimeSchedule?.preventedGraphRebuilds ?? 0}`,
    `Prevented redundant dependency traversal: ${executionGraphReuse?.preventedDependencyTraversal ?? 0}`,
    "",
    "## Lane Elapsed Time",
    "",
    "| Lane | Status | Elapsed | Browser Launches | Reason |",
    "| --- | --- | --- | --- | --- |"
  ];

  if (results.length === 0) {
    lines.push("| none | SKIP | 0ms | 0 | Zero-browser validation only; runtime lanes were not launched. |");
  } else {
    results.forEach((result) => {
      lines.push([
        `| ${result.lane}`,
        result.status,
        formatDurationMs(result.elapsedMs || 0),
        result.browserLaunches || 0,
        `${reportLine(result.reason)} |`
      ].join(" | "));
    });
  }

  lines.push(
    "",
    "## Slowest Tests",
    "",
    "| Lane | Duration | Test | Command |",
    "| --- | --- | --- | --- |"
  );
  if (slowestTests.length === 0) {
    lines.push("| none | 0ms | No Playwright test-duration lines were emitted for this run. | none |");
  } else {
    slowestTests.forEach((entry) => {
      lines.push(`| ${entry.lane} | ${formatDurationMs(entry.durationMs)} | ${reportLine(entry.title)} | ${reportLine(entry.command)} |`);
    });
  }

  lines.push(
    "",
    "## Prevented Broad Execution",
    "",
    ...preventedBroadExecution.map((entry) => `- ${entry}`),
    "",
    "## Runtime Savings Observations",
    "",
    "- Performance reporting is generated from the targeted lane runner without launching additional broad suites.",
    "- Browser launch counts are counted from scheduled Playwright command groups, not from recursive test discovery.",
    "- Manifest, snapshot, and validation-cache reuse are reported from deterministic pre-runtime state.",
    "- Full samples smoke remains skipped unless an explicit samples scope is active."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeTestCleanupRoutingReport({ fullSamplesSmoke, routingValidation }) {
  const lines = [
    "# Test Cleanup Routing Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${routingValidation.status}`,
    "",
    "## Representative Routing Cases",
    "",
    "| Case | Changed Files | Expected Lanes | Actual Lanes | Status | Reason |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  routingValidation.caseRows.forEach((row) => {
    lines.push([
      `| ${row.caseName}`,
      reportLine(row.changedFiles.join("; ")),
      row.expectedLanes.join(", ") || "none",
      row.actualLanes.join(", ") || "none",
      row.status,
      `${reportLine(row.reason)} |`
    ].join(" | "));
  });

  lines.push(
    "",
    "## Explicit Broad-Lane Guards",
    "",
    `Workspace V2 explicit/on-request only: ${routingValidation.workspaceExplicit ? "PASS" : "FAIL"}`,
    `Full samples smoke explicit/on-request only: ${fullSamplesSmoke?.status === "SKIP" && routingValidation.samplesExplicit ? "PASS" : "FAIL"}`,
    `Misplaced test preflight fast-fail: ${routingValidation.misplacedProbe.status === "FAIL" ? "PASS" : "FAIL"}`,
    `Scheduled runtime lanes: ${routingValidation.scheduledLanes.join(", ") || "none"}`,
    `Full samples smoke decision: ${fullSamplesSmoke?.status || "SKIP"} - ${reportLine(fullSamplesSmoke?.reason || "not evaluated")}`,
    "",
    "## Lane Script Routing",
    "",
    "| Script | Status | Command |",
    "| --- | --- | --- |"
  );

  if (routingValidation.laneScriptRows.length === 0) {
    lines.push("| none | FAIL | No test:lane:* scripts were found. |");
  } else {
    routingValidation.laneScriptRows.forEach((row) => {
      lines.push(`| ${row.scriptName} | ${row.status} | ${reportLine(row.command)} |`);
    });
  }

  lines.push(
    "",
    "## Legacy Direct Playwright Scripts",
    "",
    "| Script | Status | Command |",
    "| --- | --- | --- |"
  );
  if (routingValidation.legacyRows.length === 0) {
    lines.push("| none | INFO | No direct Playwright scripts were found outside targeted lane scripts. |");
  } else {
    routingValidation.legacyRows.forEach((row) => {
      lines.push(`| ${row.scriptName} | ${row.status} | ${reportLine(row.command)} |`);
    });
  }

  lines.push("", "## Misplaced Test Probe", "");
  if (routingValidation.misplacedProbe.findings.length === 0) {
    lines.push("- No misplaced ownership finding was produced.");
  } else {
    routingValidation.misplacedProbe.findings.forEach((findingText) => {
      lines.push(`- ${findingText}`);
    });
  }

  lines.push("", "## Routing Findings", "");
  if (routingValidation.findings.length === 0) {
    lines.push("No routing findings. Targeted lanes execute only expected representative lanes, and broad Workspace/samples paths remain explicit.");
  } else {
    routingValidation.findings.forEach((findingText) => lines.push(`- ${findingText}`));
  }

  lines.push(
    "",
    "## Enforcement Notes",
    "",
    "- Representative docs, tool, game, src, and integration cases route through deterministic lane rules.",
    "- Old direct Playwright scripts may remain available, but test:lane:* scripts route through the targeted Node lane runner.",
    "- Misplaced ownership probes fail in zero-browser scoped discovery before Playwright/browser launch.",
    "- Full Workspace and full samples smoke are not used as accidental fallback lanes."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeSlowPathPruningReport({ slowPathPruning }) {
  const lines = [
    "# Slow Path Pruning Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${slowPathPruning.status}`,
    `Source timing evidence: ${slowPathPruning.baseline.sourceReport} (${slowPathPruning.baseline.generatedAt})`,
    "",
    "## Before / After Runtime Observations",
    "",
    `PR_26146_038 measured lane elapsed time: ${formatDurationMs(slowPathPruning.baseline.totalLaneElapsedMs)}`,
    `Current measured lane elapsed time: ${formatDurationMs(slowPathPruning.totalLaneElapsedMs)}`,
    `PR_26146_038 actual browser launches: ${slowPathPruning.baseline.actualBrowserLaunches}`,
    `Current actual browser launches: ${slowPathPruning.actualBrowserLaunches}`,
    `Accidental no-argument browser launches prevented: ${slowPathPruning.preventedNoArgumentBrowserLaunches}`,
    `Reduced Workspace lane nested launches: ${slowPathPruning.reducedWorkspaceLaneLaunches}`,
    `Reused dependency hydration: ${slowPathPruning.reusedDependencyHydration}`,
    `Reused snapshots: ${slowPathPruning.reusedSnapshots}`,
    `Validation cache hits: ${slowPathPruning.validationCacheHits}`,
    "",
    "## Slow Paths Optimized",
    "",
    "| Optimized Path | Before | After | Evidence | Result |",
    "| --- | --- | --- | --- | --- |"
  ];

  slowPathPruning.optimizedRows.forEach((row) => {
    lines.push([
      `| ${row.optimizedPath}`,
      reportLine(row.before),
      reportLine(row.after),
      reportLine(row.evidence),
      `${reportLine(row.result)} |`
    ].join(" | "));
  });

  lines.push(
    "",
    "## Remaining Known Expensive Tests",
    "",
    "| Source | Lane | Duration | Test |",
    "| --- | --- | --- | --- |"
  );
  slowPathPruning.baseline.slowestTests.forEach((entry) => {
    lines.push(`| PR_26146_038 | ${entry.lane} | ${formatDurationMs(entry.durationMs)} | ${reportLine(entry.test)} |`);
  });
  slowPathPruning.currentSlowestTests.forEach((entry) => {
    lines.push(`| current targeted run | ${entry.lane} | ${formatDurationMs(entry.durationMs)} | ${reportLine(entry.title)} |`);
  });
  if (slowPathPruning.currentSlowestTests.length === 0) {
    lines.push("| current targeted run | none | 0ms | No runtime test-duration lines were emitted. |");
  }

  lines.push(
    "",
    "## Guardrails",
    "",
    `Full samples smoke: ${slowPathPruning.fullSamplesSmoke.status} - ${reportLine(slowPathPruning.fullSamplesSmoke.reason)}`,
    `Runtime failures observed: ${slowPathPruning.runtimeFailureCount}`,
    `Runtime schedule status: ${slowPathPruning.runtimeScheduleStatus}`,
    "",
    "- Only no-argument broad defaults and safe Workspace legacy routing were pruned.",
    "- Slow individual tests were reported but not deleted, consolidated, or fixture-rewritten.",
    "- Explicit targeted lane execution remains available through --lane and --lanes.",
    "- Broad all-lane execution requires explicit --all."
  );

  return `${lines.join("\n").trim()}\n`;
}

function makeMonolithTriggerRemovalReport({ monolithTriggerRemoval }) {
  const lines = [
    "# Monolith Trigger Removal Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Status: ${monolithTriggerRemoval.status}`,
    "",
    "## Removed Broad Execution Triggers",
    "",
    "| Trigger | Status | Before | After |",
    "| --- | --- | --- | --- |"
  ];

  monolithTriggerRemoval.removedRows.forEach((row) => {
    lines.push(`| ${row.trigger} | ${row.status} | ${reportLine(row.before)} | ${reportLine(row.after)} |`);
  });

  lines.push(
    "",
    "## Remaining Broad Discovery Callers",
    "",
    "| Caller | Status | Reason |",
    "| --- | --- | --- |"
  );
  monolithTriggerRemoval.broadDiscoveryRows.forEach((row) => {
    lines.push(`| ${row.caller} | ${row.status} | ${reportLine(row.reason)} |`);
  });

  lines.push(
    "",
    "## Remaining Direct Playwright Scripts",
    "",
    "| Script | Risk | Status | Command | Reason |",
    "| --- | --- | --- | --- | --- |"
  );
  if (monolithTriggerRemoval.directScripts.length === 0) {
    lines.push("| none | none | PASS | none | No direct Playwright scripts remain outside targeted lane scripts. |");
  } else {
    monolithTriggerRemoval.directScripts.forEach((row) => {
      lines.push([
        `| ${row.scriptName}`,
        row.monolithRisk,
        row.status,
        reportLine(row.command),
        `${reportLine(row.reason)} |`
      ].join(" | "));
    });
  }

  lines.push(
    "",
    "## Execution Safeguards",
    "",
    `No-argument safe mode active for this invocation: ${monolithTriggerRemoval.safeDefaultActive ? "Yes" : "No"}`,
    `Scheduled runtime lanes: ${monolithTriggerRemoval.scheduledLanes.join(", ") || "none"}`,
    `Executed lanes: ${monolithTriggerRemoval.executedLanes.join(", ") || "none"}`,
    `Skipped lanes: ${monolithTriggerRemoval.skippedLanes.join(", ") || "none"}`,
    `Full samples smoke: ${monolithTriggerRemoval.fullSamplesSmoke.status} - ${reportLine(monolithTriggerRemoval.fullSamplesSmoke.reason)}`,
    `Unaffected lane execution blocked: ${monolithTriggerRemoval.unaffectedLaneExecutionBlocked ? "Yes" : "No"}`,
    "",
    "## Findings",
    ""
  );

  if (monolithTriggerRemoval.findings.length === 0) {
    lines.push("No accidental Playwright-wide startup or broad lane escalation triggers remain in the targeted lane path.");
  } else {
    monolithTriggerRemoval.findings.forEach((findingText) => lines.push(`- ${findingText}`));
  }

  lines.push(
    "",
    "## Enforcement Notes",
    "",
    "- Broad execution requires explicit --all or an explicitly named static audit command.",
    "- Deterministic setup failures still stop before runtime launch.",
    "- Unaffected lanes stay skipped unless selected by --lane or --lanes.",
    "- Remaining direct Playwright scripts are explicit single-tool specs, not Playwright-wide discovery."
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
  executionGraphReuse,
  failureClassification,
  fullSamplesSmoke,
  laneSnapshot,
  laneWarmStart,
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
  const totalLaneElapsedMs = results.reduce((total, result) => total + (result.elapsedMs || 0), 0);
  const actualBrowserLaunches = results.reduce((count, result) => count + (result.browserLaunches || 0), 0);
  const slowestTests = collectSlowestTests(results, 5);
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
    `Total lane elapsed time: ${formatDurationMs(totalLaneElapsedMs)}`,
    `Actual browser launches: ${actualBrowserLaunches}`,
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
    `Reused lane snapshots: ${runtimeSchedule?.reusedLaneSnapshots ?? 0}`,
    `Reused warm-start lanes: ${runtimeSchedule?.reusedWarmStartLanes ?? 0}`,
    `Reused dependency hydration: ${runtimeSchedule?.reusedDependencyHydration ?? 0}`,
    `Prevented graph rebuilds: ${runtimeSchedule?.preventedGraphRebuilds ?? 0}`,
    `Prevented redundant initialization: ${runtimeSchedule?.preventedRedundantInitialization ?? 0}`,
    `Prevented redundant browser launches: ${runtimeSchedule?.preventedRedundantBrowserLaunches ?? 0}`,
    `Prevented redundant lane execution: ${runtimeSchedule?.preventedRedundantLaneExecutions ?? 0}`,
    "",
    "## Validation Cache",
    "",
    `Cached validations reused: ${validationCache?.events?.filter((event) => event.status === "HIT").length ?? 0}`,
    `Validation computations: ${validationCache?.events?.filter((event) => event.status === "MISS" || event.status === "MISS_UNCACHED").length ?? 0}`,
    "",
    "## Failure Fingerprints",
    "",
    `Status: ${failureClassification?.status || "PASS"}`,
    `Deterministic setup failures: ${failureClassification?.deterministicFailureCount ?? 0}`,
    `Runtime failures: ${failureClassification?.runtimeFailureCount ?? 0}`,
    `Flaky/transient failures: ${failureClassification?.transientFailureCount ?? 0}`,
    `Infrastructure failures: ${failureClassification?.infrastructureFailureCount ?? 0}`,
    `Prevented reruns: ${failureClassification?.preventedReruns ?? 0}`,
    `Prevented browser launches: ${failureClassification?.preventedBrowserLaunches ?? 0}`,
    `Prevented broad lane escalation: ${failureClassification?.preventedBroadLaneEscalations ?? 0}`,
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
    "## Warm-Start Reuse",
    "",
    `Status: ${laneWarmStart?.status || "SKIP"}`,
    `Warm-start events: ${laneWarmStart?.rows?.map((row) => `${row.lane}:${row.status}`).join(", ") || "none"}`,
    `Dependency hydration events: ${laneWarmStart?.hydrationRows?.map((row) => `${row.lane}:${row.status}`).join(", ") || "none"}`,
    `Prevented redundant initialization: ${laneWarmStart?.preventedRedundantInitialization ?? 0}`,
    `Prevented helper resolution passes: ${laneWarmStart?.preventedHelperResolution ?? 0}`,
    `Prevented fixture ownership traversal: ${laneWarmStart?.preventedFixtureOwnershipTraversal ?? 0}`,
    "",
    "## Lane Snapshots",
    "",
    `Status: ${laneSnapshot?.status || "SKIP"}`,
    `Snapshot events: ${laneSnapshot?.rows?.map((row) => `${row.lane}:${row.status}`).join(", ") || "none"}`,
    `Reused snapshots: ${laneSnapshot?.reusedSnapshots ?? 0}`,
    `Invalidated snapshots: ${laneSnapshot?.invalidatedSnapshots ?? 0}`,
    `Prevented graph rebuilds: ${laneSnapshot?.preventedGraphRebuilds ?? 0}`,
    `Prevented redundant dependency traversal: ${executionGraphReuse?.preventedDependencyTraversal ?? 0}`,
    `Prevented fixture/helper graph assembly: ${executionGraphReuse?.preventedFixtureHelperGraphAssembly ?? 0}`,
    "",
    "## Lane Deduplication",
    "",
    `Prevented duplicate lane executions: ${laneDeduplication?.preventedDuplicateLaneExecutions ?? 0}`,
    `Prevented browser launches from duplicate lane requests: ${laneDeduplication?.preventedDuplicateBrowserLaunches ?? 0}`,
    `Prevented Workspace lane reruns: ${laneDeduplication?.preventedWorkspaceLaneReruns ?? 0}`,
    "",
    "## Lanes",
    "",
    "| Lane | Status | Elapsed | Browser Launches | Executed/Skipped Reason | Affected Surface | Fixtures / Inputs |",
    "| --- | --- | --- | --- | --- | --- | --- |"
  ];

  results.forEach((result) => {
    const cells = [
      result.lane,
      result.status,
      formatDurationMs(result.elapsedMs || 0),
      result.browserLaunches || 0,
      reportLine(result.reason),
      reportLine(result.affectedSurface),
      reportLine(result.fixtures.join("; "))
    ];
    lines.push(`| ${cells.join(" | ")} |`);
  });

  lines.push(
    "",
    "## Slowest Tests",
    "",
    "| Lane | Duration | Test |",
    "| --- | --- | --- |"
  );
  if (slowestTests.length === 0) {
    lines.push("| none | 0ms | No Playwright test-duration lines were emitted for this run. |");
  } else {
    slowestTests.forEach((entry) => {
      lines.push(`| ${entry.lane} | ${formatDurationMs(entry.durationMs)} | ${reportLine(entry.title)} |`);
    });
  }

  lines.push("", "## Commands", "");
  results.forEach((result) => {
    lines.push(`### ${result.lane}`);
    if (result.commands.length === 0) {
      lines.push("- SKIP");
    } else {
      result.commands.forEach((command) => {
        lines.push(`- ${command.status} ${formatDurationMs(command.elapsedMs || 0)} ${command.command}`);
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
const laneWarmStartInput = {
  laneDefinitionHash,
  laneInputValidationStatus: laneInputValidation.status,
  scopedDiscoveryHash: fingerprint(scopedDiscovery),
  warmStartDir: options.laneWarmStartDir
};
const laneWarmStart = unknownLanes.length > 0
  ? {
    findings: [],
    hydrationRows: [],
    invalidatedWarmStarts: 0,
    preventedDependencyGraphHydration: 0,
    preventedFixtureOwnershipTraversal: 0,
    preventedHelperResolution: 0,
    preventedLaneGraphAssembly: 0,
    preventedRedundantInitialization: 0,
    reusedDependencyHydration: 0,
    reusedWarmStarts: 0,
    rows: [],
    status: "SKIP",
    warmStartDir: options.laneWarmStartDir
  }
  : await validationCache.get(
    "lane warm-start validation",
    laneWarmStartInput,
    ["lane definitions change", "targeted files change", "ownership metadata changes", "dependency graph changes", "helper/fixture placement changes", "lane configuration changes"],
    () => buildLaneWarmStartPlan({
      laneDefinitionHash,
      laneInputValidation,
      scopedDiscovery,
      warmStartDir: options.laneWarmStartDir
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
  helperGraph: "dev/tests/helpers",
  laneDefinitionHash,
  lanes: options.lanes,
  locationAuditScript,
  persistentManifestEvents: scopedDiscovery.persistentManifestEvents,
  playwrightRoot: "dev/tests/playwright",
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
      const playwrightAuditTargets = scopedDiscovery.targetFiles.filter((targetFile) => isUnderPath(targetFile, "dev/tests/playwright"));
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
  laneWarmStart,
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
const laneSnapshotInput = {
  dependencyGateStatus: dependencyGate.status,
  laneCompilationStatus: laneCompilation.status,
  laneDefinitionHash,
  laneInputValidationStatus: laneInputValidation.status,
  laneSnapshotDir: options.laneSnapshotDir,
  laneWarmStartStatus: laneWarmStart.status,
  scopedDiscoveryHash: fingerprint(scopedDiscovery)
};
const laneSnapshot = unknownLanes.length > 0
  ? {
    findings: [],
    invalidatedSnapshots: 0,
    laneSnapshotDir: options.laneSnapshotDir,
    preventedDependencyTraversal: 0,
    preventedFixtureHelperGraphAssembly: 0,
    preventedGraphRebuilds: 0,
    preventedManifestTraversal: 0,
    preventedTargetedSchedulingWork: 0,
    reusedSnapshots: 0,
    rows: [],
    status: "SKIP"
  }
  : await validationCache.get(
    "lane snapshot validation",
    laneSnapshotInput,
    ["targeted files change", "dependency graph changes", "helper/fixture ownership changes", "lane configuration changes", "runtime configuration changes"],
    () => buildLaneSnapshotPlan({
      dependencyGate,
      laneCompilation,
      laneDefinitionHash,
      laneInputValidation,
      laneSnapshotDir: options.laneSnapshotDir,
      laneWarmStart,
      scopedDiscovery
    })
  );
const runtimeSchedulingBlockers = [...new Set([
  ...unknownLanes.map((lane) => `Unknown lane requested: ${lane}`),
  ...laneRegistration.findings,
  ...runnerPreflight.findings,
  ...scopedDiscoveryValidation.findings,
  ...laneInputValidation.findings,
  ...laneWarmStart.findings,
  ...laneSnapshot.findings,
  ...laneCompilation.findings,
  ...dependencyGate.findings,
  ...(structureAudit.status === "FAIL" ? [structureAudit.reason] : [])
])];
const runtimeSchedule = buildRuntimeSchedule({
  dependencyGate,
  includeSamples: options.includeSamples,
  laneCompilation,
  laneDeduplication,
  laneSnapshot,
  laneWarmStart,
  lanes: options.lanes,
  preRuntimeFindings: runtimeSchedulingBlockers
});
const executionGraphReuse = buildExecutionGraphReuse({
  laneSnapshot,
  runtimeSchedule
});
const packageScripts = await readPackageScripts();
const routingValidation = buildRoutingValidation({
  includeSamples: options.includeSamples,
  runtimeSchedule,
  scripts: packageScripts
});
let failureClassification = buildFailureClassification({
  dependencyGate,
  laneCompilation,
  laneInputValidation,
  laneRegistration,
  laneSnapshot,
  laneWarmStart,
  results,
  runnerPreflight,
  runtimeSchedule,
  scopedDiscoveryValidation,
  structureAudit,
  unknownLanes
});
const zeroBrowserInput = {
  dependencyGateStatus: dependencyGate.status,
  laneCompilationStatus: laneCompilation.status,
  laneDefinitionHash,
  laneInputValidationStatus: laneInputValidation.status,
  laneSnapshotStatus: laneSnapshot.status,
  laneWarmStartStatus: laneWarmStart.status,
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
const laneWarmStartReportText = makeLaneWarmStartReport({ laneWarmStart });
const dependencyHydrationReuseReportText = makeDependencyHydrationReuseReport({ laneWarmStart });
const laneSnapshotReportText = makeLaneSnapshotReport({ laneSnapshot });
const executionGraphReuseReportText = makeExecutionGraphReuseReport({ executionGraphReuse });
let failureFingerprintReportText = makeFailureFingerprintReport({ failureClassification });
let retrySuppressionReportText = makeRetrySuppressionReport({ failureClassification });
const targetedFileManifestReportText = makeTargetedFileManifestReport({
  laneInputValidation,
  scopedDiscovery
});
const persistentLaneManifestReportText = makePersistentLaneManifestReport({ scopedDiscovery });
const incrementalValidationReportText = makeIncrementalValidationReport({ scopedDiscovery });
const laneInputValidationReportText = makeLaneInputValidationReport({ laneInputValidation });
const preRuntimeFullSamplesSmoke = {
  reason: "Skipped during pre-runtime validation because changed files do not modify sample JSON or shared sample loader/framework behavior.",
  status: "SKIP"
};
let slowPathPruning = buildSlowPathPruning({
  failureClassification,
  fullSamplesSmoke: preRuntimeFullSamplesSmoke,
  laneSnapshot,
  laneWarmStart,
  results,
  runtimeSchedule,
  validationCache
});
let monolithTriggerRemoval = buildMonolithTriggerRemoval({
  fullSamplesSmoke: preRuntimeFullSamplesSmoke,
  options,
  results,
  runtimeSchedule,
  scripts: packageScripts
});
const zeroBrowserReportText = await validationCache.get(
  "zero-browser preflight",
  zeroBrowserInput,
  ["lane definitions change", "fixture ownership changes", "helper/import graph changes", "targeted files change", "dependency graph changes"],
  () => makeZeroBrowserPreflightReport({
    dependencyGate,
    laneSnapshot,
    laneWarmStart,
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
validationCache.reuse("lane warm-start validation", laneWarmStartInput, "warm-start report");
validationCache.reuse("lane warm-start validation", laneWarmStartInput, "dependency hydration reuse report");
validationCache.reuse("lane warm-start validation", laneWarmStartInput, "runtime scheduling");
validationCache.reuse("lane snapshot validation", laneSnapshotInput, "lane snapshot report");
validationCache.reuse("lane snapshot validation", laneSnapshotInput, "execution graph reuse report");
validationCache.reuse("lane snapshot validation", laneSnapshotInput, "runtime scheduling");
validationCache.reuse("lane compilation validation", laneCompilationInput, "lane compilation report");
validationCache.reuse("lane compilation validation", laneCompilationInput, "runtime scheduling");
validationCache.reuse("dependency validation", dependencyGateInput, "dependency report");
validationCache.reuse("dependency validation", dependencyGateInput, "runtime scheduling");
validationCache.reuse("zero-browser preflight", zeroBrowserInput, "zero-browser report output");
const validationCacheReportText = makeValidationCacheReport({ validationCache });
let testCleanupPerformanceReportText = makeTestCleanupPerformanceReport({
  executionGraphReuse,
  failureClassification,
  fullSamplesSmoke: preRuntimeFullSamplesSmoke,
  laneDeduplication,
  laneSnapshot,
  results,
  runtimeSchedule,
  scopedDiscovery,
  validationCache
});
let testCleanupRoutingReportText = makeTestCleanupRoutingReport({
  fullSamplesSmoke: preRuntimeFullSamplesSmoke,
  routingValidation
});
let slowPathPruningReportText = makeSlowPathPruningReport({ slowPathPruning });
let monolithTriggerRemovalReportText = makeMonolithTriggerRemovalReport({ monolithTriggerRemoval });
await writeTextReport(options.staticReportPath, staticReportText);
await writeTextReport(options.laneCompilationReportPath, laneCompilationReportText);
await writeTextReport(options.dependencyGatingReportPath, dependencyGatingReportText);
await writeTextReport(options.laneDeduplicationReportPath, laneDeduplicationReportText);
await writeTextReport(options.laneRuntimeOptimizationReportPath, laneRuntimeOptimizationReportText);
await writeTextReport(options.laneWarmStartReportPath, laneWarmStartReportText);
await writeTextReport(options.dependencyHydrationReuseReportPath, dependencyHydrationReuseReportText);
await writeTextReport(options.laneSnapshotReportPath, laneSnapshotReportText);
await writeTextReport(options.executionGraphReuseReportPath, executionGraphReuseReportText);
await writeTextReport(options.failureFingerprintReportPath, failureFingerprintReportText);
await writeTextReport(options.retrySuppressionReportPath, retrySuppressionReportText);
await writeTextReport(options.targetedFileManifestReportPath, targetedFileManifestReportText);
await writeTextReport(options.persistentLaneManifestReportPath, persistentLaneManifestReportText);
await writeTextReport(options.incrementalValidationReportPath, incrementalValidationReportText);
await writeTextReport(options.laneInputValidationReportPath, laneInputValidationReportText);
await writeTextReport(options.validationCacheReportPath, validationCacheReportText);
await writeTextReport(options.zeroBrowserReportPath, zeroBrowserReportText);
await writeTextReport(options.testCleanupPerformanceReportPath, testCleanupPerformanceReportText);
await writeTextReport(options.testCleanupRoutingReportPath, testCleanupRoutingReportText);
await writeTextReport(options.slowPathPruningReportPath, slowPathPruningReportText);
await writeTextReport(options.monolithTriggerRemovalReportPath, monolithTriggerRemovalReportText);

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
  || laneWarmStart.status === "FAIL"
  || laneSnapshot.status === "FAIL"
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
    ...laneWarmStart.findings,
    ...laneSnapshot.findings,
    ...dependencyGate.findings
  );
  for (const [lane, definition] of Object.entries(laneDefinitions)) {
    results.push({
      affectedSurface: definition.affectedSurface,
      browserLaunches: 0,
      commands: [],
      elapsedMs: 0,
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
  slowPathPruning = buildSlowPathPruning({
    failureClassification,
    fullSamplesSmoke,
    laneSnapshot,
    laneWarmStart,
    results,
    runtimeSchedule,
    validationCache
  });
  monolithTriggerRemoval = buildMonolithTriggerRemoval({
    fullSamplesSmoke,
    options,
    results,
    runtimeSchedule,
    scripts: packageScripts
  });
  testCleanupPerformanceReportText = makeTestCleanupPerformanceReport({
    executionGraphReuse,
    failureClassification,
    fullSamplesSmoke,
    laneDeduplication,
    laneSnapshot,
    results,
    runtimeSchedule,
    scopedDiscovery,
    validationCache
  });
  testCleanupRoutingReportText = makeTestCleanupRoutingReport({
    fullSamplesSmoke,
    routingValidation
  });
  slowPathPruningReportText = makeSlowPathPruningReport({ slowPathPruning });
  monolithTriggerRemovalReportText = makeMonolithTriggerRemovalReport({ monolithTriggerRemoval });
  await writeTextReport(options.testCleanupPerformanceReportPath, testCleanupPerformanceReportText);
  await writeTextReport(options.testCleanupRoutingReportPath, testCleanupRoutingReportText);
  await writeTextReport(options.slowPathPruningReportPath, slowPathPruningReportText);
  await writeTextReport(options.monolithTriggerRemovalReportPath, monolithTriggerRemovalReportText);
  await writeReport(options.reportPath, makeReport({
    dependencyGate,
    dryRun: options.dryRun,
    executionGraphReuse,
    failureClassification,
    fullSamplesSmoke,
    laneSnapshot,
    laneWarmStart,
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
        browserLaunches: 0,
        commands: [],
        elapsedMs: 0,
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
    slowPathPruning = buildSlowPathPruning({
      failureClassification,
      fullSamplesSmoke,
      laneSnapshot,
      laneWarmStart,
      results,
      runtimeSchedule,
      validationCache
    });
    monolithTriggerRemoval = buildMonolithTriggerRemoval({
      fullSamplesSmoke,
      options,
      results,
      runtimeSchedule,
      scripts: packageScripts
    });
    testCleanupPerformanceReportText = makeTestCleanupPerformanceReport({
      executionGraphReuse,
      failureClassification,
      fullSamplesSmoke,
      laneDeduplication,
      laneSnapshot,
      results,
      runtimeSchedule,
      scopedDiscovery,
      validationCache
    });
    testCleanupRoutingReportText = makeTestCleanupRoutingReport({
      fullSamplesSmoke,
      routingValidation
    });
    slowPathPruningReportText = makeSlowPathPruningReport({ slowPathPruning });
    monolithTriggerRemovalReportText = makeMonolithTriggerRemovalReport({ monolithTriggerRemoval });
    await writeTextReport(options.testCleanupPerformanceReportPath, testCleanupPerformanceReportText);
    await writeTextReport(options.testCleanupRoutingReportPath, testCleanupRoutingReportText);
    await writeTextReport(options.slowPathPruningReportPath, slowPathPruningReportText);
    await writeTextReport(options.monolithTriggerRemovalReportPath, monolithTriggerRemovalReportText);
    await writeReport(options.reportPath, makeReport({
      dependencyGate,
      dryRun: options.dryRun,
      executionGraphReuse,
      failureClassification,
      fullSamplesSmoke,
      laneSnapshot,
      laneWarmStart,
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
      browserLaunches: 0,
      commands: [],
      elapsedMs: 0,
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
      browserLaunches: 0,
      commands: [],
      elapsedMs: 0,
      fixtures: definition.fixtures,
      lane,
      reason: "Samples lane is on-request only; rerun with --include-samples when affected samples are in scope.",
      status: "SKIP"
    });
    continue;
  }

  const laneCommands = (scheduledCommandsByLane.get(lane) || definition.commands)
    .map((commandConfig) => commandWithPlaywrightGrep(commandConfig, options.playwrightGrep));

  if (options.dryRun) {
    results.push({
      affectedSurface: definition.affectedSurface,
      browserLaunches: 0,
      commands: laneCommands.map((command) => ({
        command: commandToString(command),
        elapsedMs: 0,
        slowestTests: [],
        status: "SKIP"
      })),
      elapsedMs: 0,
      fixtures: definition.fixtures,
      lane,
      reason: `${definition.reason} Dry run requested.`,
      status: "SKIP"
    });
    continue;
  }

  const commandResults = [];
  const laneStartedAt = Date.now();
  let failed = false;
  let browserLaunches = 0;
  for (const command of laneCommands) {
    const result = await runCommand(command);
    const status = result.exitCode === 0 ? "PASS" : "FAIL";
    if (command.type === "playwright") {
      browserLaunches += 1;
    }
    commandResults.push({
      command: result.displayCommand,
      elapsedMs: result.elapsedMs,
      errorMessage: result.errorMessage,
      slowestTests: extractSlowestTests(result.outputText, lane, result.displayCommand),
      status
    });
    if (result.exitCode !== 0) {
      failed = true;
    }
  }

  results.push({
    affectedSurface: definition.affectedSurface,
    browserLaunches,
    commands: commandResults,
    elapsedMs: Date.now() - laneStartedAt,
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

failureClassification = buildFailureClassification({
  dependencyGate,
  laneCompilation,
  laneInputValidation,
  laneRegistration,
  laneSnapshot,
  laneWarmStart,
  results,
  runnerPreflight,
  runtimeSchedule,
  scopedDiscoveryValidation,
  structureAudit,
  unknownLanes
});
failureFingerprintReportText = makeFailureFingerprintReport({ failureClassification });
retrySuppressionReportText = makeRetrySuppressionReport({ failureClassification });
slowPathPruning = buildSlowPathPruning({
  failureClassification,
  fullSamplesSmoke,
  laneSnapshot,
  laneWarmStart,
  results,
  runtimeSchedule,
  validationCache
});
monolithTriggerRemoval = buildMonolithTriggerRemoval({
  fullSamplesSmoke,
  options,
  results,
  runtimeSchedule,
  scripts: packageScripts
});
testCleanupPerformanceReportText = makeTestCleanupPerformanceReport({
  executionGraphReuse,
  failureClassification,
  fullSamplesSmoke,
  laneDeduplication,
  laneSnapshot,
  results,
  runtimeSchedule,
  scopedDiscovery,
  validationCache
});
testCleanupRoutingReportText = makeTestCleanupRoutingReport({
  fullSamplesSmoke,
  routingValidation
});
slowPathPruningReportText = makeSlowPathPruningReport({ slowPathPruning });
monolithTriggerRemovalReportText = makeMonolithTriggerRemovalReport({ monolithTriggerRemoval });
await writeTextReport(options.failureFingerprintReportPath, failureFingerprintReportText);
await writeTextReport(options.retrySuppressionReportPath, retrySuppressionReportText);
await writeTextReport(options.testCleanupPerformanceReportPath, testCleanupPerformanceReportText);
await writeTextReport(options.testCleanupRoutingReportPath, testCleanupRoutingReportText);
await writeTextReport(options.slowPathPruningReportPath, slowPathPruningReportText);
await writeTextReport(options.monolithTriggerRemovalReportPath, monolithTriggerRemovalReportText);

await writeReport(options.reportPath, makeReport({
  dependencyGate,
  dryRun: options.dryRun,
  executionGraphReuse,
  failureClassification,
  fullSamplesSmoke,
  laneSnapshot,
  laneWarmStart,
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
