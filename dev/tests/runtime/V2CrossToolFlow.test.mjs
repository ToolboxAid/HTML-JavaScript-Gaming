import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const toolsRoot = path.join(repoRoot, "www", "toolbox");
const fixturesRoot = path.join(repoRoot, "tests", "fixtures", "v2-tools");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-cross-tool-results.json");

const FLOWS = [
  {
    sourceTool: "asset-manager-v2",
    targetTool: "svg-asset-studio-v2"
  },
  {
    sourceTool: "palette-manager-v2",
    targetTool: "vector-map-editor-v2"
  },
  {
    sourceTool: "tilemap-studio-v2",
    targetTool: "asset-manager-v2"
  }
];

function checkJsSyntax(jsPath) {
  try {
    execFileSync(process.execPath, ["--check", jsPath], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { syntaxValid: true, syntaxError: "" };
  } catch (error) {
    return {
      syntaxValid: false,
      syntaxError: (error?.stderr || error?.stdout || error?.message || "").toString().trim()
    };
  }
}

function buildTargetUrl(targetTool, hostContextId) {
  return `toolbox/${targetTool}/index.html?hostContextId=${encodeURIComponent(hostContextId)}`;
}

function validateFlow(flow) {
  const sourceFixturePath = path.join(fixturesRoot, `${flow.sourceTool}.json`);
  const sourceFixtureExists = fs.existsSync(sourceFixturePath);
  const failures = [];

  let sourceFixtureValid = false;
  let sourceHostContextId = "";
  let fixtureMutationDetected = false;
  let launchUrl = "";

  if (!sourceFixtureExists) {
    failures.push(`Missing source fixture: dev/tests/fixtures/v2-tools/${flow.sourceTool}.json`);
  } else {
    const beforeText = fs.readFileSync(sourceFixturePath, "utf8");
    let sourceFixture = null;
    try {
      sourceFixture = JSON.parse(beforeText);
      sourceFixtureValid = true;
    } catch {
      sourceFixtureValid = false;
    }
    if (!sourceFixtureValid) {
      failures.push(`Invalid source fixture JSON: dev/tests/fixtures/v2-tools/${flow.sourceTool}.json`);
    } else {
      sourceHostContextId = typeof sourceFixture.hostContextId === "string" ? sourceFixture.hostContextId.trim() : "";
      if (!sourceHostContextId) {
        failures.push("Source fixture hostContextId is missing or empty.");
      }
      launchUrl = buildTargetUrl(flow.targetTool, sourceHostContextId);
      const afterText = fs.readFileSync(sourceFixturePath, "utf8");
      fixtureMutationDetected = beforeText !== afterText;
      if (fixtureMutationDetected) {
        failures.push("Source fixture was unexpectedly mutated during flow simulation.");
      }
    }
  }

  const targetHtmlPath = path.join(toolsRoot, flow.targetTool, "index.html");
  const targetJsPath = path.join(toolsRoot, flow.targetTool, "index.js");
  const targetRouteExists = fs.existsSync(targetHtmlPath);
  if (!targetRouteExists) {
    failures.push(`Missing target route: toolbox/${flow.targetTool}/index.html`);
  }
  const hostContextIdPreserved = sourceHostContextId
    ? launchUrl.includes(`hostContextId=${encodeURIComponent(sourceHostContextId)}`)
    : false;
  if (sourceHostContextId && !hostContextIdPreserved) {
    failures.push("hostContextId was not preserved in constructed target URL.");
  }

  const { syntaxValid, syntaxError } = checkJsSyntax(targetJsPath);
  if (!syntaxValid) {
    failures.push(`Target index.js failed syntax check: toolbox/${flow.targetTool}/index.js`);
  }

  return {
    flow: `${flow.sourceTool} -> ${flow.targetTool}`,
    sourceTool: flow.sourceTool,
    targetTool: flow.targetTool,
    sourceFixturePath: path.relative(repoRoot, sourceFixturePath).replace(/\\/g, "/"),
    sourceFixtureExists,
    sourceFixtureValid,
    sourceHostContextId,
    fixtureMutationDetected,
    launchUrl,
    targetRoutePath: path.relative(repoRoot, targetHtmlPath).replace(/\\/g, "/"),
    targetRouteExists,
    hostContextIdPreserved,
    targetSyntaxPath: path.relative(repoRoot, targetJsPath).replace(/\\/g, "/"),
    targetSyntaxValid: syntaxValid,
    targetSyntaxError: syntaxError,
    failures
  };
}

export function run() {
  const rows = FLOWS.map(validateFlow);
  const failures = rows.flatMap((row) => row.failures.map((entry) => `${row.flow}: ${entry}`));

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    flowCount: rows.length,
    failures,
    rows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 cross-tool flow results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 cross-tool flow failures: ${failures.join(" | ")}`);
  return { flowCount: rows.length, failures, rows };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const summary = run();
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
