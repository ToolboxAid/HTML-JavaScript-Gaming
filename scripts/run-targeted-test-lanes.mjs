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
    command: process.execPath
  };
}

function npmCommand(...args) {
  return {
    args,
    command: npmBin
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
    command: process.execPath
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
        "tests/playwright/tools/PreviewGeneratorV2Baseline.spec.mjs"
      ),
      playwrightCommand("tests/playwright/tools/CollisionInspectorV2.spec.mjs")
    ],
    fixtures: [
      "tool-specific mocked repo/file picker inputs",
      "explicit manifest/toolState launch contexts"
    ],
    reason: "Tool runtime lane validates focused tool behavior without treating unrelated stale product assertions as blockers."
  },
  integration: {
    affectedSurface: "Workspace, tool, game index, and manifest handoff behavior",
    commands: [
      playwrightCommand("tests/playwright/games/GameIndexPreviewManifestResolution.spec.mjs", "--grep", "Pong")
    ],
    fixtures: [
      "repo game manifests",
      "manifest preview asset roles",
      "repo-served browser pages"
    ],
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
    reason: "Samples lane is on-request or affected-sample only and is not the full samples smoke test.",
    requiresSamplesFlag: true
  }
});

function parseArgs(argv) {
  const options = {
    dryRun: false,
    includeSamples: false,
    lanes: [],
    reportPath: defaultReportPath
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--all") {
      options.lanes = Object.keys(laneDefinitions);
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--include-samples") {
      options.includeSamples = true;
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

function commandToString(commandConfig) {
  return [commandConfig.command, ...commandConfig.args].join(" ");
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

function makeReport({ dryRun, fullSamplesSmoke, results }) {
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
if (unknownLanes.length > 0) {
  throw new Error(`Unknown test lane(s): ${unknownLanes.join(", ")}`);
}

const requestedLanes = new Set(options.lanes);
const results = [];

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
  results
}));

if (results.some((result) => result.status === "FAIL")) {
  process.exit(1);
}
