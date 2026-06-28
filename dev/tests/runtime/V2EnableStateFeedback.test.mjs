import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const htmlPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.html");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-enable-state-feedback-results.json");

function checkSyntax(filePath) {
  try {
    execFileSync(process.execPath, ["--check", filePath], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ok: true, error: "" };
  } catch (error) {
    return { ok: false, error: (error?.stderr || error?.stdout || error?.message || "").toString().trim() };
  }
}

function computeEnableState(leftId, rightId) {
  const enabled = Boolean(leftId && rightId && leftId !== rightId);
  return {
    diff: enabled ? "Ready to compute diff." : "Select two different sessions to enable Compute Diff.",
    merge: enabled ? "Ready to preview merge." : "Select two different sessions to enable Preview Merge."
  };
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? fs.readFileSync(htmlPath, "utf8") : "";
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2EnableStateFeedback.test.mjs"));

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2EnableStateFeedback.test.mjs failed syntax check.");

  if (!html.includes("id=\"workspaceV2DiffEnableState\"")) failures.push("Missing Diff enable-state line.");
  if (!html.includes("id=\"workspaceV2MergeEnableState\"")) failures.push("Missing Merge enable-state line.");
  if (!js.includes("this.diffEnableStateNode.textContent = canRunDiff")) failures.push("Diff enable-state update is missing.");
  if (!js.includes("this.mergeEnableStateNode.textContent = canPreviewMerge")) failures.push("Merge enable-state update is missing.");
  if (!js.includes("Select two different sessions to enable Compute Diff.")) failures.push("Missing disabled Diff status text.");
  if (!js.includes("Ready to compute diff.")) failures.push("Missing enabled Diff status text.");
  if (!js.includes("Select two different sessions to enable Preview Merge.")) failures.push("Missing disabled Merge status text.");
  if (!js.includes("Ready to preview merge.")) failures.push("Missing enabled Merge status text.");

  const noneSelected = computeEnableState("", "");
  const oneSelected = computeEnableState("a", "");
  const sameSelected = computeEnableState("a", "a");
  const twoSelected = computeEnableState("a", "b");

  if (noneSelected.diff !== "Select two different sessions to enable Compute Diff.") failures.push("No selection should show disabled Diff status.");
  if (oneSelected.diff !== "Select two different sessions to enable Compute Diff.") failures.push("One selection should show disabled Diff status.");
  if (sameSelected.diff !== "Select two different sessions to enable Compute Diff.") failures.push("Same selection should show disabled Diff status.");
  if (twoSelected.diff !== "Ready to compute diff.") failures.push("Two distinct selections should show enabled Diff status.");
  if (noneSelected.merge !== "Select two different sessions to enable Preview Merge.") failures.push("No selection should show disabled Merge status.");
  if (twoSelected.merge !== "Ready to preview merge.") failures.push("Two distinct selections should show enabled Merge status.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { htmlExists, jsExists, jsSyntax, testSyntax },
    states: { noneSelected, oneSelected, sameSelected, twoSelected }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 enable-state feedback results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 enable-state feedback failures: ${failures.join(" | ")}`);
  return { failures };
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

