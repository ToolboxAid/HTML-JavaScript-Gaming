import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const toolsRoot = path.join(repoRoot, "www", "toolbox");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-back-nav-results.json");

const FLOWS = [
  {
    first: "workspace-v2",
    second: "asset-manager-v2",
    third: "svg-asset-studio-v2",
    secondActionQueryFrom: "workspace-v2",
    thirdActionQueryFrom: "asset-manager-v2"
  },
  {
    first: "workspace-v2",
    second: "palette-manager-v2",
    third: "vector-map-editor-v2",
    secondActionQueryFrom: "workspace-v2",
    thirdActionQueryFrom: "palette-manager-v2"
  },
  {
    first: "workspace-v2",
    second: "tilemap-studio-v2",
    third: "asset-manager-v2",
    secondActionQueryFrom: "workspace-v2",
    thirdActionQueryFrom: "tilemap-studio-v2"
  }
];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
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

function generateHostContextId(flow) {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${flow.second}-back-nav-${Date.now()}-${randomPart}`;
}

function buildToolUrl(toolId, hostContextId, fromToolId) {
  const url = new URL(`toolbox/${toolId}/index.html`, "http://localhost/");
  url.searchParams.set("hostContextId", hostContextId);
  if (fromToolId) {
    url.searchParams.set("fromTool", fromToolId);
  }
  return url;
}

function validateFlow(flow) {
  const hostContextId = generateHostContextId(flow);
  const secondUrl = buildToolUrl(flow.second, hostContextId, flow.secondActionQueryFrom);
  const thirdUrl = buildToolUrl(flow.third, hostContextId, flow.thirdActionQueryFrom);
  const thirdBackUrl = buildToolUrl(flow.thirdActionQueryFrom, hostContextId, "");
  const secondBackUrl = buildToolUrl(flow.secondActionQueryFrom, hostContextId, "");

  const secondHtmlPath = path.join(toolsRoot, flow.second, "index.html");
  const secondJsPath = path.join(toolsRoot, flow.second, "index.js");
  const thirdHtmlPath = path.join(toolsRoot, flow.third, "index.html");
  const thirdJsPath = path.join(toolsRoot, flow.third, "index.js");
  const workspaceHtmlPath = path.join(toolsRoot, "workspace-v2", "index.html");
  const workspaceJsPath = path.join(toolsRoot, "workspace-v2", "index.js");
  const failures = [];

  const secondHtmlExists = fs.existsSync(secondHtmlPath);
  const secondJsExists = fs.existsSync(secondJsPath);
  const thirdHtmlExists = fs.existsSync(thirdHtmlPath);
  const thirdJsExists = fs.existsSync(thirdJsPath);
  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const secondHtml = secondHtmlExists ? readText(secondHtmlPath) : "";
  const secondJs = secondJsExists ? readText(secondJsPath) : "";
  const thirdHtml = thirdHtmlExists ? readText(thirdHtmlPath) : "";
  const thirdJs = thirdJsExists ? readText(thirdJsPath) : "";
  const workspaceJs = workspaceJsExists ? readText(workspaceJsPath) : "";

  const { syntaxValid: secondSyntaxValid, syntaxError: secondSyntaxError } = checkJsSyntax(secondJsPath);
  const { syntaxValid: thirdSyntaxValid, syntaxError: thirdSyntaxError } = checkJsSyntax(thirdJsPath);
  const { syntaxValid: workspaceSyntaxValid, syntaxError: workspaceSyntaxError } = checkJsSyntax(workspaceJsPath);

  if (!secondHtmlExists) failures.push("Second tool index.html is missing.");
  if (!secondJsExists) failures.push("Second tool index.js is missing.");
  if (!thirdHtmlExists) failures.push("Third tool index.html is missing.");
  if (!thirdJsExists) failures.push("Third tool index.js is missing.");
  if (!workspaceHtmlExists) failures.push("Workspace V2 index.html is missing.");
  if (!workspaceJsExists) failures.push("Workspace V2 index.js is missing.");

  if (!workspaceJs.includes('searchParams.set("fromTool", "workspace-v2");')) failures.push("Workspace V2 launch does not set fromTool=workspace-v2.");
  if (!secondJs.includes('searchParams.set("fromTool"')) failures.push("Second tool action flow does not set fromTool.");
  if (!thirdJs.includes('fromTool: typeof urlStateParams.get("fromTool")')) failures.push("Third tool does not parse fromTool from URL.");
  if (!thirdJs.includes("goBack()")) failures.push("Third tool does not expose goBack navigation handler.");

  if (!secondHtml.includes("Breadcrumb")) failures.push("Second tool breadcrumb UI is missing.");
  if (!thirdHtml.includes("Breadcrumb")) failures.push("Third tool breadcrumb UI is missing.");
  if (!secondHtml.includes("BackButton")) failures.push("Second tool back action UI is missing.");
  if (!thirdHtml.includes("BackButton")) failures.push("Third tool back action UI is missing.");

  if (secondUrl.searchParams.get("hostContextId") !== hostContextId) failures.push("Second tool launch URL did not preserve hostContextId.");
  if (thirdUrl.searchParams.get("hostContextId") !== hostContextId) failures.push("Third tool launch URL did not preserve hostContextId.");
  if (thirdBackUrl.searchParams.get("hostContextId") !== hostContextId) failures.push("Third tool back URL did not preserve hostContextId.");
  if (secondBackUrl.searchParams.get("hostContextId") !== hostContextId) failures.push("Second tool back URL did not preserve hostContextId.");

  if (!thirdBackUrl.pathname.endsWith(`/toolbox/${flow.thirdActionQueryFrom}/index.html`)) failures.push("Third tool back URL target is incorrect.");
  if (!secondBackUrl.pathname.endsWith(`/toolbox/${flow.secondActionQueryFrom}/index.html`)) failures.push("Second tool back URL target is incorrect.");

  if (!secondSyntaxValid) failures.push("Second tool JS failed syntax check.");
  if (!thirdSyntaxValid) failures.push("Third tool JS failed syntax check.");
  if (!workspaceSyntaxValid) failures.push("Workspace V2 JS failed syntax check.");

  return {
    flow: `${flow.first}->${flow.second}->${flow.third}`,
    hostContextId,
    secondUrl: secondUrl.pathname.slice(1) + secondUrl.search,
    thirdUrl: thirdUrl.pathname.slice(1) + thirdUrl.search,
    thirdBackUrl: thirdBackUrl.pathname.slice(1) + thirdBackUrl.search,
    secondBackUrl: secondBackUrl.pathname.slice(1) + secondBackUrl.search,
    secondSyntaxValid,
    secondSyntaxError,
    thirdSyntaxValid,
    thirdSyntaxError,
    workspaceSyntaxValid,
    workspaceSyntaxError,
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

  console.log(`v2 back nav results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 back nav failures: ${failures.join(" | ")}`);
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
