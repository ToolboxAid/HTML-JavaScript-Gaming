import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceHtmlPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.html");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const assetHtmlPath = path.join(repoRoot, "www", "toolbox", "asset-manager-v2", "index.html");
const assetJsPath = path.join(repoRoot, "www", "toolbox", "asset-manager-v2", "index.js");
const toolsIndexPath = path.join(repoRoot, "www", "toolbox", "index.html");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "pr_11_313_workspace_asset_manager_launch_results.json");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function checkSyntax(filePath) {
  execFileSync(process.execPath, ["--check", filePath], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

export function run() {
  checkSyntax(workspaceJsPath);
  checkSyntax(assetJsPath);

  const workspaceHtml = readText(workspaceHtmlPath);
  const workspaceJs = readText(workspaceJsPath);
  const assetHtml = readText(assetHtmlPath);
  const assetJs = readText(assetJsPath);
  const toolsIndex = readText(toolsIndexPath);

  const summary = {
    generatedAt: new Date().toISOString(),
    checks: {
      workspaceHasToolsSection: workspaceHtml.includes("<h2>Tools</h2>"),
      workspaceHasAssetManagerButton: workspaceHtml.includes('id="workspaceV2OpenAssetManagerButton"'),
      workspaceShowsAssetManagerLabel: workspaceHtml.includes(">Asset Manager V2<"),
      workspaceWiresAssetManagerButton: workspaceJs.includes('this.openAssetManagerButton = document.getElementById("workspaceV2OpenAssetManagerButton");') &&
        workspaceJs.includes("this.openAssetManagerButton.addEventListener(\"click\", () => {"),
      workspaceHasAssetManagerLaunchPath: workspaceJs.includes("openAssetManagerFromWorkspace()") &&
        workspaceJs.includes("toolId: \"asset-manager-v2\"") &&
        workspaceJs.includes("payloadJson: this.cloneSessionValue(this.currentSessionPayload.payloadJson)") &&
        workspaceJs.includes("this.buildToolLaunchUrl(\"asset-manager-v2\", hostContextId)"),
      assetManagerUiTitle: assetHtml.includes("<title>Asset Manager V2</title>") &&
        assetJs.includes("document.title = \"Asset Manager V2\";"),
      assetManagerKeepsToolIdContract: assetHtml.includes('data-tool-id="asset-manager-v2"') &&
        assetJs.includes("versionCheck.payload.toolId.trim() !== \"asset-manager-v2\""),
      toolsIndexShowsAssetManager: toolsIndex.includes(">Asset Manager V2<")
    }
  };

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  for (const [key, value] of Object.entries(summary.checks)) {
    assert.equal(value, true, `${key} failed`);
  }

  return summary;
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
