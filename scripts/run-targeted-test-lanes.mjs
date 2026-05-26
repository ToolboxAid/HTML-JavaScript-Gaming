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
const defaultLaneDeduplicationReportPath = "docs/dev/reports/lane_deduplication_report.md";
const defaultLaneCompilationReportPath = "docs/dev/reports/lane_compilation_report.md";
const defaultLaneRuntimeOptimizationReportPath = "docs/dev/reports/lane_runtime_optimization_report.md";
const defaultStaticReportPath = "docs/dev/reports/static_validation_report.md";
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
    fixtures: [
      "tests/fixtures/workspace-v2/uat.manifest.json",
      "mocked File System Access repo handles",
      "explicit game manifest/toolState payloads"
    ],
    fixturePaths: [
      "tests/fixtures/workspace-v2/uat.manifest.json"
    ],
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
    fixtures: [
      "tool-specific mocked repo/file picker inputs",
      "explicit manifest/toolState launch contexts"
    ],
    fixturePaths: [],
    playwrightDir: "tests/playwright/tools",
    requiresPreflight: true,
    reason: "Tool runtime lane validates focused tool behavior without treating unrelated stale product assertions as blockers."
  },
  integration: {
    affectedSurface: "Workspace, tool, game index, and manifest handoff behavior",
    commands: [
      playwrightCommand("tests/playwright/integration/GameIndexPreviewManifestResolution.spec.mjs", "--grep", "Pong")
    ],
    dependencies: [],
    fixtures: [
      "repo game manifests",
      "manifest preview asset roles",
      "repo-served browser pages"
    ],
    fixturePaths: [],
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
    fixtures: [
      "explicit node unit fixtures",
      "fresh in-memory localStorage/sessionStorage mocks per file"
    ],
    fixturePaths: [],
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
    fixtures: [
      "sample metadata and validation artifacts",
      "sample structure fixtures"
    ],
    fixturePaths: [],
    reason: "Samples lane is on-request or affected-sample only and is not the full samples smoke test.",
    requiresPreflight: true,
    requiresSamplesFlag: true
  }
});

function parseArgs(argv) {
  const options = {
    dependencyGatingReportPath: defaultDependencyGatingReportPath,
    dryRun: false,
    includeSamples: false,
    laneCompilationReportPath: defaultLaneCompilationReportPath,
    laneDeduplicationReportPath: defaultLaneDeduplicationReportPath,
    laneRuntimeOptimizationReportPath: defaultLaneRuntimeOptimizationReportPath,
    lanes: [],
    rawLaneRequests: [],
    reportPath: defaultReportPath,
    skipPreflight: false,
    staticOnly: false,
    staticReportPath: defaultStaticReportPath,
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
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--include-samples") {
      options.includeSamples = true;
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
    options.lanes = ["workspace-contract", "tool-runtime", "integration", "engine-src", "samples"];
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
      fixturePaths: definition.fixturePaths || [],
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

function commandTargetFiles(commandConfig) {
  if (commandConfig.type === "playwright") {
    return commandConfig.args.filter((argument) => /\.spec\.mjs$/i.test(String(argument)));
  }
  if (commandConfig.type === "node") {
    return commandConfig.args.filter((argument) => /\.(mjs|js|json)$/i.test(String(argument)));
  }
  return [];
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
    "- Fixture ownership changes: structural ownership and runner preflight caches invalidate.",
    "- Helper/import graph changes: structural ownership validation cache invalidates.",
    "- Targeted files change: runner preflight and lane compilation caches invalidate.",
    "- Dependency graph changes: dependency validation and runtime scheduling caches invalidate.",
    "",
    "## Runtime Savings Observations",
    "",
    "- Structural ownership validation is computed once per runner invocation and reused by static and zero-browser reporting.",
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

function makeStaticValidationReport({
  dryRun,
  laneRegistration,
  lanes,
  runnerPreflight,
  staticOnly,
  structureAudit,
  unknownLanes
}) {
  const findings = [
    ...unknownLanes.map((lane) => `Unknown lane requested: ${lane}`),
    ...laneRegistration.findings,
    ...runnerPreflight.findings,
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
  laneCompilation,
  laneRegistration,
  runnerPreflight,
  structureAudit,
  unknownLanes
}) {
  const findings = [...new Set([
    ...unknownLanes.map((lane) => `Unknown lane requested: ${lane}`),
    ...laneRegistration.findings,
    ...runnerPreflight.findings,
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
  laneDeduplication,
  preflight,
  results,
  runtimeSchedule,
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
let structureAudit = {
  command: "",
  reason: needsPreflight
    ? "Playwright structure audit was not run."
    : "No selected lane requires Playwright structure audit.",
  status: needsPreflight ? "SKIP" : "SKIP"
};
preflight.details.push(...runnerPreflight.notes);
const structureAuditInput = {
  helperGraph: "tests/helpers",
  laneDefinitionHash,
  lanes: options.lanes,
  locationAuditScript,
  playwrightRoot: "tests/playwright"
};
if (unknownLanes.length === 0 && needsPreflight && !options.dryRun && !options.skipPreflight) {
  structureAudit = await validationCache.get(
    "structural ownership validation",
    structureAuditInput,
    ["fixture ownership changes", "helper/import graph changes", "targeted files change"],
    async () => {
      const result = await runCommand(nodeCommand(locationAuditScript));
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
  laneRegistration,
  lanes: options.lanes,
  runnerPreflight,
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
  laneRegistrationStatus: laneRegistration.findings.length === 0 ? "PASS" : "FAIL",
  runnerPreflightStatus: runnerPreflight.findings.length === 0 ? "PASS" : "FAIL",
  structureAuditStatus: structureAudit.status,
  unknownLanes
};
const laneCompilationReportText = makeLaneCompilationReport({ laneCompilation });
const dependencyGatingReportText = makeDependencyGatingReport({ dependencyGate });
const laneDeduplicationReportText = makeLaneDeduplicationReport({ laneDeduplication });
const laneRuntimeOptimizationReportText = makeLaneRuntimeOptimizationReport({ runtimeSchedule });
const zeroBrowserReportText = await validationCache.get(
  "zero-browser preflight",
  zeroBrowserInput,
  ["lane definitions change", "fixture ownership changes", "helper/import graph changes", "targeted files change", "dependency graph changes"],
  () => makeZeroBrowserPreflightReport({
    dependencyGate,
    laneCompilation,
    laneRegistration,
    runnerPreflight,
    structureAudit,
    unknownLanes
  })
);
validationCache.reuse("structural ownership validation", structureAuditInput, "static validation report");
validationCache.reuse("structural ownership validation", structureAuditInput, "zero-browser preflight report");
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
await writeTextReport(options.validationCacheReportPath, validationCacheReportText);
await writeTextReport(options.zeroBrowserReportPath, zeroBrowserReportText);

if (options.staticOnly || options.zeroBrowserOnly) {
  if (staticReportText.includes("Status: FAIL") || zeroBrowserReportText.includes("Status: FAIL")) {
    process.exit(1);
  }
  process.exit(0);
}

if (unknownLanes.length > 0 || laneRegistration.findings.length > 0 || runnerPreflight.findings.length > 0 || laneCompilation.status === "FAIL" || dependencyGate.status === "FAIL") {
  preflight.status = "FAIL";
  preflight.reason = "Runner preflight, lane compilation, or dependency gating failed; expensive lanes were skipped before Playwright execution.";
  preflight.details.push(
    ...unknownLanes.map((lane) => `Unknown lane requested: ${lane}`),
    ...laneRegistration.findings,
    ...runnerPreflight.findings,
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
    laneDeduplication,
    preflight,
    results,
    runtimeSchedule,
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
      laneDeduplication,
      preflight,
      results,
      runtimeSchedule,
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
  laneDeduplication,
  preflight,
  results,
  runtimeSchedule,
  validationCache
}));

if (results.some((result) => result.status === "FAIL")) {
  process.exit(1);
}
