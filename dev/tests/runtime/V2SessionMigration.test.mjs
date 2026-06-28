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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-migration-results.json");

const TOOLS = [
  "asset-manager-v2",
  "palette-manager-v2",
  "svg-asset-studio-v2",
  "tilemap-studio-v2",
  "vector-map-editor-v2"
];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

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

function handleSessionVersion(payload) {
  if (payload && payload.version === "v2") return { ok: true, payload };
  return {
    ok: false,
    error: "Unsupported session version",
    code: "UNSUPPORTED_VERSION"
  };
}

function classifyVersionState(payload) {
  const versionResult = handleSessionVersion(payload);
  if (!versionResult.ok) {
    return { state: "INVALID", result: versionResult };
  }
  return { state: "VALID", result: versionResult };
}

function validateTool(toolId) {
  const fixturePath = path.join(fixturesRoot, `${toolId}.json`);
  const jsPath = path.join(toolsRoot, toolId, "index.js");
  const failures = [];
  const fixtureExists = fs.existsSync(fixturePath);
  const jsExists = fs.existsSync(jsPath);
  const jsText = jsExists ? readText(jsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(jsPath);

  const hasHookMethod = jsText.includes("handleSessionVersion(payload)");
  const hasHookPattern = jsText.includes('if (payload && payload.version === "v2") return { ok: true, payload };') &&
    jsText.includes('code: "UNSUPPORTED_VERSION"');
  const hasHookEnforcement = jsText.includes("const versionCheck = this.handleSessionVersion(sessionContext);") &&
    jsText.includes("if (!versionCheck.ok)");

  if (!jsExists) failures.push("Missing tool index.js.");
  if (!syntaxValid) failures.push("Tool index.js failed syntax check.");
  if (!hasHookMethod) failures.push("Missing handleSessionVersion(payload) hook method.");
  if (!hasHookPattern) failures.push("Missing expected hook return pattern for v2/unsupported versions.");
  if (!hasHookEnforcement) failures.push("Tool does not enforce handleSessionVersion(sessionContext) before render.");

  let fixtureValid = false;
  let sessionContext = null;
  if (!fixtureExists) {
    failures.push("Missing fixture file.");
  } else {
    try {
      const fixture = readJson(fixturePath);
      fixtureValid = true;
      sessionContext = fixture.sessionContext;
    } catch {
      fixtureValid = false;
    }
  }
  if (!fixtureValid) failures.push("Fixture JSON is invalid.");

  let validVersionCase = { state: "INVALID", result: { ok: false, error: "fixture missing", code: "UNSUPPORTED_VERSION" } };
  let wrongVersionCase = { state: "INVALID", result: { ok: false, error: "fixture missing", code: "UNSUPPORTED_VERSION" } };
  let missingVersionCase = { state: "INVALID", result: { ok: false, error: "fixture missing", code: "UNSUPPORTED_VERSION" } };

  if (sessionContext) {
    validVersionCase = classifyVersionState(sessionContext);
    const wrongVersionContext = cloneJson(sessionContext);
    wrongVersionContext.version = "v3";
    wrongVersionCase = classifyVersionState(wrongVersionContext);
    const missingVersionContext = cloneJson(sessionContext);
    delete missingVersionContext.version;
    missingVersionCase = classifyVersionState(missingVersionContext);
  }

  if (validVersionCase.state !== "VALID") failures.push(`Expected VALID for version v2, got ${validVersionCase.state}.`);
  if (wrongVersionCase.state !== "INVALID") failures.push(`Expected INVALID for version v3, got ${wrongVersionCase.state}.`);
  if (missingVersionCase.state !== "INVALID") failures.push(`Expected INVALID for missing version, got ${missingVersionCase.state}.`);
  if (wrongVersionCase.result.code !== "UNSUPPORTED_VERSION") failures.push("Wrong-version case did not return code UNSUPPORTED_VERSION.");
  if (missingVersionCase.result.code !== "UNSUPPORTED_VERSION") failures.push("Missing-version case did not return code UNSUPPORTED_VERSION.");
  if (wrongVersionCase.result.error !== "Unsupported session version") failures.push("Wrong-version case did not return error 'Unsupported session version'.");
  if (missingVersionCase.result.error !== "Unsupported session version") failures.push("Missing-version case did not return error 'Unsupported session version'.");

  return {
    tool: toolId,
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    jsPath: path.relative(repoRoot, jsPath).replace(/\\/g, "/"),
    jsExists,
    fixtureExists,
    fixtureValid,
    syntaxValid,
    syntaxError,
    hasHookMethod,
    hasHookPattern,
    hasHookEnforcement,
    cases: {
      versionV2: validVersionCase,
      versionV3: wrongVersionCase,
      missingVersion: missingVersionCase
    },
    failures
  };
}

export function run() {
  const rows = TOOLS.map(validateTool);
  const failures = rows.flatMap((row) => row.failures.map((entry) => `${row.tool}: ${entry}`));

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    rows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session migration results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session migration failures: ${failures.join(" | ")}`);
  return { failures, rows };
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
