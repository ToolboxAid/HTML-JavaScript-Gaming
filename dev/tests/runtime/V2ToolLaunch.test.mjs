import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const toolsRoot = path.join(repoRoot, "www", "toolbox");
const fixturesRoot = path.join(repoRoot, "dev", "tests", "fixtures", "v2-tools");
const toolsIndexPath = path.join(toolsRoot, "index.html");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-tool-launch-results.json");

const RETIRED_FIXTURE_ONLY_V2_TOOLS = [
  "asset-manager-v2",
  "palette-manager-v2",
  "svg-asset-studio-v2",
  "tilemap-studio-v2",
  "vector-map-editor-v2",
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

function validateRetiredTool(toolId, toolsIndexHtmlText) {
  const toolIndexHtmlPath = path.join(toolsRoot, toolId, "index.html");
  const toolIndexJsPath = path.join(toolsRoot, toolId, "index.js");
  const fixturePath = path.join(fixturesRoot, `${toolId}.json`);

  const routeFromIndexPresent = hasIndexRoute(toolsIndexHtmlText, toolId);
  const routePathExists = fs.existsSync(toolIndexHtmlPath);
  const routeScriptExists = fs.existsSync(toolIndexJsPath);
  const fixtureExists = fs.existsSync(fixturePath);

  let fixtureValidJson = false;
  if (fixtureExists) {
    try {
      JSON.parse(readText(fixturePath));
      fixtureValidJson = true;
    } catch {
      fixtureValidJson = false;
    }
  }

  const failures = [];
  if (routeFromIndexPresent) failures.push("Retired V2 route still appears in www/toolbox/index.html.");
  if (routePathExists) failures.push("Retired www/toolbox/<tool>-v2/index.html route target still exists.");
  if (routeScriptExists) failures.push("Retired www/toolbox/<tool>-v2/index.js route runtime target still exists.");
  if (!fixtureExists) failures.push("Retired V2 fixture evidence is missing from dev/tests/fixtures/v2-tools.");
  if (fixtureExists && !fixtureValidJson) failures.push("Fixture is not valid JSON.");

  return {
    tool: toolId,
    retired: true,
    routeFromIndexPresent,
    routePath: path.relative(repoRoot, toolIndexHtmlPath).replace(/\\/g, "/"),
    routePathExists,
    routeScriptPath: path.relative(repoRoot, toolIndexJsPath).replace(/\\/g, "/"),
    routeScriptExists,
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    fixtureExists,
    fixtureValidJson,
    failures,
  };
}

export function run() {
  assert.ok(fs.existsSync(toolsIndexPath), "www/toolbox/index.html is missing.");
  const toolsIndexHtmlText = readText(toolsIndexPath);
  const rows = RETIRED_FIXTURE_ONLY_V2_TOOLS.map((toolId) => validateRetiredTool(toolId, toolsIndexHtmlText));
  const failures = rows.flatMap((row) => row.failures.map((entry) => `${row.tool}: ${entry}`));

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    toolCount: rows.length,
    failures,
    rows,
  }, null, 2)}\n`, "utf8");

  console.log(`v2 tool retirement results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 tool retirement failures: ${failures.join(" | ")}`);
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
