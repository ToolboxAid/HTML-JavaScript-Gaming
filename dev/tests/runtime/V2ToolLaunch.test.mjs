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
const toolsIndexPath = path.join(toolsRoot, "index.html");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-tool-launch-results.json");

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

function hasIndexRoute(indexHtmlText, toolId) {
  const relHref = `./${toolId}/index.html`;
  const absHref = `/toolbox/${toolId}/index.html`;
  const bareHref = `${toolId}/index.html`;
  return (
    indexHtmlText.includes(`href="${relHref}"`) ||
    indexHtmlText.includes(`href="${absHref}"`) ||
    indexHtmlText.includes(`href="${bareHref}"`)
  );
}

function hasToolSpecificPayload(toolId, fixtureJson) {
  const sessionContext = fixtureJson?.sessionContext;
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
    return false;
  }
  if (toolId === "asset-manager-v2") {
    return Boolean(sessionContext?.payloadJson?.assetCatalog);
  }
  if (toolId === "palette-manager-v2") {
    return Boolean(sessionContext?.paletteJson);
  }
  if (toolId === "svg-asset-studio-v2") {
    return Boolean(sessionContext?.payloadJson?.vectorAssetDocument);
  }
  if (toolId === "tilemap-studio-v2") {
    return Boolean(sessionContext?.payloadJson?.tileMapDocument);
  }
  if (toolId === "vector-map-editor-v2") {
    return Boolean(sessionContext?.payloadJson?.vectorMapDocument);
  }
  return false;
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

function validateTool(toolId, toolsIndexHtmlText) {
  const toolIndexHtmlPath = path.join(toolsRoot, toolId, "index.html");
  const toolIndexJsPath = path.join(toolsRoot, toolId, "index.js");
  const fixturePath = path.join(fixturesRoot, `${toolId}.json`);

  const routeFromIndexValid = hasIndexRoute(toolsIndexHtmlText, toolId);
  const routePathExists = fs.existsSync(toolIndexHtmlPath);
  const directUrl = `toolbox/${toolId}/index.html`;
  const fixtureExists = fs.existsSync(fixturePath);

  let fixtureValidJson = false;
  let hostContextId = "";
  let fixtureToolId = "";
  let fixtureToolIdMatches = false;
  let fixtureHasSessionContext = false;
  let fixtureHasToolPayload = false;
  if (fixtureExists) {
    try {
      const fixtureJson = JSON.parse(readText(fixturePath));
      fixtureValidJson = true;
      hostContextId = typeof fixtureJson?.hostContextId === "string" ? fixtureJson.hostContextId.trim() : "";
      fixtureToolId = typeof fixtureJson?.sessionContext?.toolId === "string" ? fixtureJson.sessionContext.toolId.trim() : "";
      fixtureToolIdMatches = fixtureToolId === toolId;
      fixtureHasSessionContext = Boolean(
        fixtureJson?.sessionContext &&
        typeof fixtureJson.sessionContext === "object" &&
        !Array.isArray(fixtureJson.sessionContext)
      );
      fixtureHasToolPayload = hasToolSpecificPayload(toolId, fixtureJson);
    } catch {
      fixtureValidJson = false;
    }
  }

  const launchUrlWithHostContextId = `${directUrl}?hostContextId=${encodeURIComponent(hostContextId)}`;
  const { syntaxValid, syntaxError } = checkJsSyntax(toolIndexJsPath);

  const failures = [];
  if (!routeFromIndexValid) failures.push("Missing V2 route from toolbox/index.html.");
  if (!routePathExists) failures.push("Missing toolbox/<tool>-v2/index.html route target.");
  if (!fs.existsSync(toolIndexJsPath)) failures.push("Missing toolbox/<tool>-v2/index.js route runtime target.");
  if (!fixtureExists) failures.push("Missing fixture file.");
  if (fixtureExists && !fixtureValidJson) failures.push("Fixture is not valid JSON.");
  if (fixtureValidJson && !hostContextId) failures.push("Fixture hostContextId is missing or empty.");
  if (fixtureValidJson && !fixtureToolIdMatches) failures.push(`Fixture sessionContext.toolId does not match tool (${fixtureToolId || "missing"}).`);
  if (fixtureValidJson && !fixtureHasSessionContext) failures.push("Fixture sessionContext object is missing.");
  if (fixtureValidJson && !fixtureHasToolPayload) failures.push("Fixture is missing tool-specific payload.");
  if (!syntaxValid) failures.push("Tool index.js failed node --check.");

  return {
    tool: toolId,
    routeFromIndexValid,
    routePath: path.relative(repoRoot, toolIndexHtmlPath).replace(/\\/g, "/"),
    routePathExists,
    directUrl,
    launchUrlWithHostContextId,
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    fixtureExists,
    fixtureValidJson,
    hostContextId,
    fixtureToolId,
    fixtureToolIdMatches,
    fixtureHasSessionContext,
    fixtureHasToolPayload,
    syntaxCheckedPath: path.relative(repoRoot, toolIndexJsPath).replace(/\\/g, "/"),
    syntaxValid,
    syntaxError,
    failures
  };
}

export function run() {
  assert.ok(fs.existsSync(toolsIndexPath), "toolbox/index.html is missing.");
  const toolsIndexHtmlText = readText(toolsIndexPath);
  const rows = REQUIRED_V2_TOOLS.map((toolId) => validateTool(toolId, toolsIndexHtmlText));
  const failures = rows.flatMap((row) => row.failures.map((entry) => `${row.tool}: ${entry}`));

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    toolCount: rows.length,
    failures,
    rows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 tool launch results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 tool launch failures: ${failures.join(" | ")}`);
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
