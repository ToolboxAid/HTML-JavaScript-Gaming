import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const workspaceHtmlPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.html");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-selection-feedback-enable-state-results.json");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function checkSyntax(jsPath) {
  try {
    execFileSync(process.execPath, ["--check", jsPath], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ok: true, error: "" };
  } catch (error) {
    return { ok: false, error: (error?.stderr || error?.stdout || error?.message || "").toString().trim() };
  }
}

function isActionEnabled(leftId, rightId) {
  return Boolean(leftId && rightId && leftId !== rightId);
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(workspaceJsPath);
  const htmlExists = fs.existsSync(workspaceHtmlPath);
  const js = jsExists ? read(workspaceJsPath) : "";
  const html = htmlExists ? read(workspaceHtmlPath) : "";
  const syntax = checkSyntax(workspaceJsPath);

  const htmlHasLabels =
    html.includes("workspaceV2DiffLeftSelectedLabel") &&
    html.includes("workspaceV2DiffRightSelectedLabel") &&
    html.includes("workspaceV2MergeLeftSelectedLabel") &&
    html.includes("workspaceV2MergeRightSelectedLabel");
  const htmlHasNoSessionDefaults = (html.match(/No session selected/g) || []).length >= 4;

  const jsHasDiffUpdater = js.includes("updateDiffSelectionFeedbackAndState()");
  const jsHasMergeUpdater = js.includes("updateMergeSelectionFeedbackAndState()");
  const jsHasChangeListeners =
    js.includes("this.diffLeftSelect.addEventListener(\"change\"") &&
    js.includes("this.diffRightSelect.addEventListener(\"change\"") &&
    js.includes("this.mergeLeftSelect.addEventListener(\"change\"") &&
    js.includes("this.mergeRightSelect.addEventListener(\"change\"");
  const jsHasDiffDisableRule = js.includes("this.computeDiffButton.disabled = !(left && right && left.id !== right.id);");
  const jsHasMergeDisableRule = js.includes("this.computeMergeButton.disabled = !(left && right && left.id !== right.id);");
  const jsHasConfirmAfterPreview = js.includes("this.confirmMergeButton.disabled = false;");
  const jsHasApplyAfterConfirm = js.includes("this.applyMergeButton.disabled = false;");

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!syntax.ok) failures.push("workspace-v2/index.js failed syntax check.");
  if (!htmlHasLabels) failures.push("Missing inline selected-session feedback labels in HTML.");
  if (!htmlHasNoSessionDefaults) failures.push("Missing 'No session selected' defaults in HTML.");
  if (!jsHasDiffUpdater) failures.push("Missing diff selection feedback/state updater.");
  if (!jsHasMergeUpdater) failures.push("Missing merge selection feedback/state updater.");
  if (!jsHasChangeListeners) failures.push("Missing select change listeners for state wiring.");
  if (!jsHasDiffDisableRule) failures.push("Missing Compute Diff enable/disable rule.");
  if (!jsHasMergeDisableRule) failures.push("Missing Preview Merge enable/disable rule.");
  if (!jsHasConfirmAfterPreview) failures.push("Missing confirm button enable state after preview.");
  if (!jsHasApplyAfterConfirm) failures.push("Missing apply button enable state after confirm.");

  const stateChecks = {
    noneSelected: isActionEnabled("", ""),
    onlyASelected: isActionEnabled("a", ""),
    onlyBSelected: isActionEnabled("", "b"),
    sameSelected: isActionEnabled("a", "a"),
    distinctSelected: isActionEnabled("a", "b")
  };

  if (stateChecks.noneSelected) failures.push("Buttons should be disabled when nothing is selected.");
  if (stateChecks.onlyASelected) failures.push("Buttons should be disabled when only Session A is selected.");
  if (stateChecks.onlyBSelected) failures.push("Buttons should be disabled when only Session B is selected.");
  if (stateChecks.sameSelected) failures.push("Buttons should be disabled when Session A and Session B are the same.");
  if (!stateChecks.distinctSelected) failures.push("Buttons should be enabled when Session A and Session B are distinct.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      jsExists,
      htmlExists,
      syntax,
      htmlHasLabels,
      htmlHasNoSessionDefaults,
      jsHasDiffUpdater,
      jsHasMergeUpdater,
      jsHasChangeListeners,
      jsHasDiffDisableRule,
      jsHasMergeDisableRule,
      jsHasConfirmAfterPreview,
      jsHasApplyAfterConfirm,
      stateChecks
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 selection feedback/enable-state results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 selection feedback/enable-state failures: ${failures.join(" | ")}`);
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
