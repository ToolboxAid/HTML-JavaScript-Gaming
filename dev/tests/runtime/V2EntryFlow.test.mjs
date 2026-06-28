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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-entry-flow-results.json");

const TOOL_IDS = [
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

function generateHostContextId(toolId) {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${toolId}-entry-flow-${Date.now()}-${randomPart}`;
}

function validateEntrySurface() {
  const indexPath = path.join(toolsRoot, "index.html");
  const workspacePath = path.join(toolsRoot, "workspace-v2", "index.html");
  const workspaceJsPath = path.join(toolsRoot, "workspace-v2", "index.js");
  const failures = [];

  const indexExists = fs.existsSync(indexPath);
  const workspaceExists = fs.existsSync(workspacePath);
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const indexHtml = indexExists ? readText(indexPath) : "";
  const workspaceHtml = workspaceExists ? readText(workspacePath) : "";
  const workspaceJs = workspaceJsExists ? readText(workspaceJsPath) : "";
  const { syntaxValid: workspaceSyntaxValid, syntaxError: workspaceSyntaxError } = checkJsSyntax(workspaceJsPath);

  if (!indexExists) failures.push("toolbox/index.html is missing.");
  if (!workspaceExists) failures.push("toolbox/workspace-v2/index.html is missing.");
  if (!workspaceJsExists) failures.push("toolbox/workspace-v2/index.js is missing.");
  if (!indexHtml.includes("Open Workspace V2")) failures.push("toolbox/index.html does not expose 'Open Workspace V2' entry action.");
  if (!indexHtml.includes("./workspace-v2/index.html")) failures.push("toolbox/index.html does not link to workspace-v2 route.");
  if (!workspaceHtml.includes("Workspace V2 Session Producer")) failures.push("workspace-v2 landing title is missing.");
  if (!workspaceJs.includes("sessionStorage.setItem(hostContextId, JSON.stringify(payload));")) failures.push("workspace-v2 does not create session storage entry.");
  if (!workspaceJs.includes('toolUrl.searchParams.set("hostContextId", hostContextId);')) failures.push("workspace-v2 launch URL does not include hostContextId.");
  if (!workspaceJs.includes('toolUrl.searchParams.set("fromTool", "workspace-v2");')) failures.push("workspace-v2 launch URL does not include fromTool=workspace-v2.");
  if (!workspaceSyntaxValid) failures.push("workspace-v2/index.js failed syntax check.");

  return {
    indexPath: path.relative(repoRoot, indexPath).replace(/\\/g, "/"),
    workspacePath: path.relative(repoRoot, workspacePath).replace(/\\/g, "/"),
    workspaceJsPath: path.relative(repoRoot, workspaceJsPath).replace(/\\/g, "/"),
    indexExists,
    workspaceExists,
    workspaceJsExists,
    workspaceSyntaxValid,
    workspaceSyntaxError,
    failures
  };
}

function validateWorkspaceToToolRoute(toolId) {
  const fixturePath = path.join(fixturesRoot, `${toolId}.json`);
  const toolHtmlPath = path.join(toolsRoot, toolId, "index.html");
  const toolJsPath = path.join(toolsRoot, toolId, "index.js");
  const failures = [];

  const fixtureExists = fs.existsSync(fixturePath);
  const toolHtmlExists = fs.existsSync(toolHtmlPath);
  const toolJsExists = fs.existsSync(toolJsPath);
  let fixtureValid = false;
  let sessionContext = null;

  if (!fixtureExists) {
    failures.push("Fixture missing.");
  } else {
    try {
      const fixture = readJson(fixturePath);
      fixtureValid = true;
      sessionContext = fixture.sessionContext;
    } catch {
      fixtureValid = false;
    }
    if (!fixtureValid) failures.push("Fixture JSON invalid.");
    if (fixtureValid && (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext))) {
      failures.push("Fixture sessionContext missing/invalid.");
    }
  }

  const hostContextId = generateHostContextId(toolId);
  const launchUrl = new URL(`toolbox/${toolId}/index.html`, "http://localhost/");
  launchUrl.searchParams.set("hostContextId", hostContextId);
  launchUrl.searchParams.set("fromTool", "workspace-v2");
  const parsedHostContextId = launchUrl.searchParams.get("hostContextId");
  const launchHref = launchUrl.pathname.slice(1) + launchUrl.search;
  const toolRouteExists = toolHtmlExists && toolJsExists;
  const { syntaxValid, syntaxError } = checkJsSyntax(toolJsPath);

  if (!toolRouteExists) failures.push("Tool route is broken (missing index.html or index.js).");
  if (!launchHref.startsWith(`toolbox/${toolId}/index.html?hostContextId=`)) failures.push("Launch route format is invalid.");
  if (parsedHostContextId !== hostContextId) failures.push("hostContextId was not preserved in launch URL.");
  if (!syntaxValid) failures.push("Tool index.js failed syntax check.");

  return {
    tool: toolId,
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    toolHtmlPath: path.relative(repoRoot, toolHtmlPath).replace(/\\/g, "/"),
    toolJsPath: path.relative(repoRoot, toolJsPath).replace(/\\/g, "/"),
    fixtureExists,
    fixtureValid,
    toolRouteExists,
    hostContextId,
    launchHref,
    parsedHostContextId,
    syntaxValid,
    syntaxError,
    failures
  };
}

export function run() {
  const entrySurface = validateEntrySurface();
  const toolRows = TOOL_IDS.map(validateWorkspaceToToolRoute);
  const failures = [...entrySurface.failures];
  toolRows.forEach((row) => row.failures.forEach((entry) => failures.push(`${row.tool}: ${entry}`)));

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    toolCount: toolRows.length,
    failures,
    entrySurface,
    toolRows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 entry flow results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 entry flow failures: ${failures.join(" | ")}`);
  return { toolCount: toolRows.length, failures, entrySurface, toolRows };
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
