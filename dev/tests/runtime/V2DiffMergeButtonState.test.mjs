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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-diff-merge-button-state-results.json");

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

function computeActionEnabled(leftId, rightId) {
  return Boolean(leftId && rightId && leftId !== rightId);
}

function previewState(previewExists, confirmed, fresh, conflicts) {
  const canConfirm = Boolean(previewExists && !confirmed && fresh && !conflicts);
  const canApply = Boolean(previewExists && confirmed && fresh && !conflicts);
  return { canConfirm, canApply };
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(workspaceJsPath);
  const htmlExists = fs.existsSync(workspaceHtmlPath);
  const js = jsExists ? readText(workspaceJsPath) : "";
  const html = htmlExists ? readText(workspaceHtmlPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const hasSelectionStateNodes =
    html.includes("workspaceV2DiffSelectionState") &&
    html.includes("workspaceV2MergeSelectionState");
  const hasSameSelectionInline = js.includes("Choose two different sessions.");
  const hasDiffDisableRule = js.includes("this.computeDiffButton.disabled = !canRunDiff;");
  const hasMergeDisableRule = js.includes("this.computeMergeButton.disabled = !canPreviewMerge;");
  const hasConfirmRule = js.includes("const previewReadyForConfirm = Boolean(this.pendingMergePreview && !this.pendingMergePreview.confirmed && previewIsFresh && !previewHasConflicts);");
  const hasApplyRule = js.includes("const previewReadyForApply = Boolean(this.pendingMergePreview && this.pendingMergePreview.confirmed && previewIsFresh && !previewHasConflicts);");
  const hasUpdaterCalls = js.includes("this.updateMergeSelectionFeedbackAndState();") && js.includes("this.updateDiffSelectionFeedbackAndState();");
  const hasBlockedMessages = js.includes("Diff blocked. Session A and Session B selections are missing.") && js.includes("Merge preview blocked. Session A and Session B selections are missing.");

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!syntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  if (!hasSelectionStateNodes) failures.push("Missing inline selection state nodes.");
  if (!hasSameSelectionInline) failures.push("Missing inline same-selection state text.");
  if (!hasDiffDisableRule) failures.push("Missing compute-diff disable rule.");
  if (!hasMergeDisableRule) failures.push("Missing preview-merge disable rule.");
  if (!hasConfirmRule) failures.push("Missing confirm enable-state rule.");
  if (!hasApplyRule) failures.push("Missing apply enable-state rule.");
  if (!hasUpdaterCalls) failures.push("Missing selection-state updater calls.");
  if (!hasBlockedMessages) failures.push("Missing existing blocked messages for direct invalid calls.");

  const matrix = {
    zero: computeActionEnabled("", ""),
    onlyA: computeActionEnabled("a", ""),
    onlyB: computeActionEnabled("", "b"),
    same: computeActionEnabled("a", "a"),
    distinct: computeActionEnabled("a", "b")
  };

  if (matrix.zero) failures.push("Buttons must be disabled for zero selections.");
  if (matrix.onlyA) failures.push("Buttons must be disabled for only Session A selected.");
  if (matrix.onlyB) failures.push("Buttons must be disabled for only Session B selected.");
  if (matrix.same) failures.push("Buttons must be disabled for same-session selection.");
  if (!matrix.distinct) failures.push("Buttons must be enabled for distinct selections.");

  const previewCases = {
    none: previewState(false, false, false, false),
    validPreview: previewState(true, false, true, false),
    confirmedPreview: previewState(true, true, true, false),
    conflicted: previewState(true, false, true, true),
    stale: previewState(true, false, false, false),
    staleConfirmed: previewState(true, true, false, false)
  };

  if (previewCases.none.canConfirm || previewCases.none.canApply) failures.push("No preview should disable confirm/apply.");
  if (!previewCases.validPreview.canConfirm || previewCases.validPreview.canApply) failures.push("Valid preview should enable confirm only.");
  if (previewCases.confirmedPreview.canConfirm || !previewCases.confirmedPreview.canApply) failures.push("Confirmed preview should enable apply only.");
  if (previewCases.conflicted.canConfirm || previewCases.conflicted.canApply) failures.push("Conflicted preview should disable confirm/apply.");
  if (previewCases.stale.canConfirm || previewCases.stale.canApply) failures.push("Stale preview should disable confirm/apply.");
  if (previewCases.staleConfirmed.canApply) failures.push("Stale confirmed preview should disable apply.");

  let diffOutput = "No diff computed.";
  const diffClickEnabled = matrix.onlyA;
  if (diffClickEnabled) {
    diffOutput = "Diff blocked. Session A and Session B selections are missing.";
  }
  if (diffOutput !== "No diff computed.") {
    failures.push("Disabled Diff button simulation should not append blocked/error output.");
  }

  let mergeOutput = "No merge computed.";
  const mergeClickEnabled = matrix.onlyA;
  if (mergeClickEnabled) {
    mergeOutput = "Merge preview blocked. Session A and Session B selections are missing.";
  }
  if (mergeOutput !== "No merge computed.") {
    failures.push("Disabled Merge button simulation should not append blocked/error output.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      jsExists,
      htmlExists,
      syntaxValid,
      syntaxError,
      hasSelectionStateNodes,
      hasSameSelectionInline,
      hasDiffDisableRule,
      hasMergeDisableRule,
      hasConfirmRule,
      hasApplyRule,
      hasUpdaterCalls,
      hasBlockedMessages,
      matrix,
      previewCases
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 diff/merge button-state results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 diff/merge button-state failures: ${failures.join(" | ")}`);
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
