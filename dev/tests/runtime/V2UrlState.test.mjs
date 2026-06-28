import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const toolsRoot = path.join(repoRoot, "www", "toolbox");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-url-state-results.json");

const REQUIRED_V2_TOOLS = [
  "asset-manager-v2",
  "palette-manager-v2",
  "svg-asset-studio-v2",
  "tilemap-studio-v2",
  "vector-map-editor-v2"
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

function validateTool(toolId) {
  const htmlPath = path.join(toolsRoot, toolId, "index.html");
  const jsPath = path.join(toolsRoot, toolId, "index.js");
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const jsText = jsExists ? readText(jsPath) : "";

  const baseUrlPath = `toolbox/${toolId}/index.html?hostContextId=test-id`;
  const deepLinkUrlPath = `toolbox/${toolId}/index.html?hostContextId=test-id&view=test-view&selection=test-selection&zoom=2&panel=inspector`;
  const parsedBaseUrl = new URL(baseUrlPath, "http://localhost/");
  const parsedDeepLinkUrl = new URL(deepLinkUrlPath, "http://localhost/");

  const baseHostContextId = parsedBaseUrl.searchParams.get("hostContextId");
  const deepHostContextId = parsedDeepLinkUrl.searchParams.get("hostContextId");
  const deepView = parsedDeepLinkUrl.searchParams.get("view");
  const deepSelection = parsedDeepLinkUrl.searchParams.get("selection");
  const deepZoom = parsedDeepLinkUrl.searchParams.get("zoom");
  const deepPanel = parsedDeepLinkUrl.searchParams.get("panel");

  const hasHostContextIdParser = jsText.includes('get("hostContextId")');
  const hasViewParser = jsText.includes('get("view")');
  const hasSelectionParser = jsText.includes('get("selection")');
  const hasZoomParser = jsText.includes('get("zoom")');
  const hasPanelParser = jsText.includes('get("panel")');
  const hasUrlStateObject = jsText.includes("this.urlState");
  const { syntaxValid, syntaxError } = checkJsSyntax(jsPath);

  const failures = [];
  if (!htmlExists) failures.push("Missing tool index.html route target.");
  if (!jsExists) failures.push("Missing tool index.js runtime.");
  if (baseHostContextId !== "test-id") failures.push("Base URL hostContextId parsing failed.");
  if (deepHostContextId !== "test-id") failures.push("Deep-link URL hostContextId parsing failed.");
  if (deepView !== "test-view") failures.push("Deep-link view param parsing failed.");
  if (deepSelection !== "test-selection") failures.push("Deep-link selection param parsing failed.");
  if (deepZoom !== "2") failures.push("Deep-link zoom param parsing failed.");
  if (deepPanel !== "inspector") failures.push("Deep-link panel param parsing failed.");
  if (!hasHostContextIdParser) failures.push('Tool JS does not parse hostContextId from URL query.');
  if (!hasViewParser) failures.push('Tool JS does not parse optional "view" URL param.');
  if (!hasSelectionParser) failures.push('Tool JS does not parse optional "selection" URL param.');
  if (!hasZoomParser) failures.push('Tool JS does not parse optional "zoom" URL param.');
  if (!hasPanelParser) failures.push('Tool JS does not parse optional "panel" URL param.');
  if (!hasUrlStateObject) failures.push("Tool JS does not retain parsed URL state.");
  if (!syntaxValid) failures.push("Tool JS failed syntax check.");

  return {
    tool: toolId,
    routePath: path.relative(repoRoot, htmlPath).replace(/\\/g, "/"),
    jsPath: path.relative(repoRoot, jsPath).replace(/\\/g, "/"),
    htmlExists,
    jsExists,
    baseUrlPath,
    deepLinkUrlPath,
    baseHostContextId,
    deepHostContextId,
    deepView,
    deepSelection,
    deepZoom,
    deepPanel,
    hasHostContextIdParser,
    hasViewParser,
    hasSelectionParser,
    hasZoomParser,
    hasPanelParser,
    hasUrlStateObject,
    syntaxValid,
    syntaxError,
    failures
  };
}

export function run() {
  const rows = REQUIRED_V2_TOOLS.map(validateTool);
  const failures = rows.flatMap((row) => row.failures.map((entry) => `${row.tool}: ${entry}`));

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    toolCount: rows.length,
    failures,
    rows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 url state results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 URL state failures: ${failures.join(" | ")}`);
  return { toolCount: rows.length, failures, rows };
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
