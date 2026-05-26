/*
Toolbox Aid
David Quesenberry
05/26/2026
run-targeted-test-lanes.mjs
*/
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const defaultReportPath = "docs/dev/reports/testing_lane_execution_report.md";
const defaultStaticReportPath = "docs/dev/reports/static_validation_report.md";
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
    dryRun: false,
    includeSamples: false,
    lanes: [],
    reportPath: defaultReportPath,
    skipPreflight: false,
    staticOnly: false,
    staticReportPath: defaultStaticReportPath
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--all") {
      options.lanes = Object.keys(laneDefinitions);
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--include-samples") {
      options.includeSamples = true;
    } else if (argument === "--skip-preflight") {
      options.skipPreflight = true;
    } else if (argument === "--static-only") {
      options.staticOnly = true;
    } else if (argument === "--lane") {
      options.lanes.push(argv[index + 1]);
      index += 1;
    } else if (argument.startsWith("--lane=")) {
      options.lanes.push(argument.slice("--lane=".length));
    } else if (argument === "--lanes") {
      options.lanes.push(...String(argv[index + 1] || "").split(","));
      index += 1;
    } else if (argument.startsWith("--lanes=")) {
      options.lanes.push(...argument.slice("--lanes=".length).split(","));
    } else if (argument === "--report") {
      options.reportPath = argv[index + 1] || defaultReportPath;
      index += 1;
    } else if (argument.startsWith("--report=")) {
      options.reportPath = argument.slice("--report=".length);
    } else if (argument === "--static-report") {
      options.staticReportPath = argv[index + 1] || defaultStaticReportPath;
      index += 1;
    } else if (argument.startsWith("--static-report=")) {
      options.staticReportPath = argument.slice("--static-report=".length);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  options.lanes = [...new Set(options.lanes.map((lane) => lane.trim()).filter(Boolean))];
  if (options.lanes.length === 0) {
    options.lanes = ["workspace-contract", "tool-runtime", "integration", "engine-src", "samples"];
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

async function writeStaticReport(reportPath, reportText) {
  const absoluteReportPath = path.resolve(repoRoot, reportPath);
  await fs.mkdir(path.dirname(absoluteReportPath), { recursive: true });
  await fs.writeFile(absoluteReportPath, reportText, "utf8");
  console.log(`\nWrote ${absoluteReportPath}`);
}

function makeReport({ dryRun, fullSamplesSmoke, preflight, results }) {
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

const laneRegistration = await validateLaneRegistrations();
const runnerPreflight = unknownLanes.length > 0
  ? { findings: [], notes: [] }
  : await validateRunnerPreflight(options.lanes);
let structureAudit = {
  command: "",
  reason: needsPreflight
    ? "Playwright structure audit was not run."
    : "No selected lane requires Playwright structure audit.",
  status: needsPreflight ? "SKIP" : "SKIP"
};
preflight.details.push(...runnerPreflight.notes);
if (unknownLanes.length === 0 && needsPreflight && !options.dryRun && !options.skipPreflight) {
  const result = await runCommand(nodeCommand(locationAuditScript));
  structureAudit = {
    command: result.displayCommand,
    reason: result.exitCode === 0
      ? "Playwright structure audit passed."
      : "Playwright structure audit failed.",
    status: result.exitCode === 0 ? "PASS" : "FAIL"
  };
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
await writeStaticReport(options.staticReportPath, staticReportText);

if (options.staticOnly) {
  if (staticReportText.includes("Status: FAIL")) {
    process.exit(1);
  }
  process.exit(0);
}

if (unknownLanes.length > 0 || laneRegistration.findings.length > 0 || runnerPreflight.findings.length > 0) {
  preflight.status = "FAIL";
  preflight.reason = "Runner preflight failed; expensive lanes were skipped before Playwright execution.";
  preflight.details.push(
    ...unknownLanes.map((lane) => `Unknown lane requested: ${lane}`),
    ...laneRegistration.findings,
    ...runnerPreflight.findings
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
    dryRun: options.dryRun,
    fullSamplesSmoke,
    preflight,
    results
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
      dryRun: options.dryRun,
      fullSamplesSmoke,
      preflight,
      results
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

  if (options.dryRun) {
    results.push({
      affectedSurface: definition.affectedSurface,
      commands: definition.commands.map((command) => ({
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
  for (const command of definition.commands) {
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
  dryRun: options.dryRun,
  fullSamplesSmoke,
  preflight,
  results
}));

if (results.some((result) => result.status === "FAIL")) {
  process.exit(1);
}
