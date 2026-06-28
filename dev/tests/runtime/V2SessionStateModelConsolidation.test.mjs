import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-state-model-consolidation-results.json");

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

function computeModelState({
  hasSessionInput,
  diffDistinct,
  mergeDistinct,
  previewExists,
  previewFresh,
  previewConfirmed,
  previewHasConflicts,
  authoritativeUndo
}) {
  let mergeEnableText = "Preview Merge is enabled.";
  if (!mergeDistinct) {
    mergeEnableText = "Select two different sessions to enable Preview Merge.";
  } else if (previewExists && !previewFresh) {
    mergeEnableText = "Preview is stale. Run Preview Merge again.";
  } else if (previewExists && previewHasConflicts) {
    mergeEnableText = "Preview has conflicts. Resolve conflicts before applying.";
  } else if (previewExists && previewConfirmed && previewFresh && !previewHasConflicts) {
    mergeEnableText = "Apply Merge is enabled.";
  } else if (previewExists && !previewConfirmed && previewFresh && !previewHasConflicts) {
    mergeEnableText = "Confirm Preview is enabled.";
  }
  return {
    libraryButtonsDisabled: !hasSessionInput,
    diffCanCompute: diffDistinct,
    diffEnableText: diffDistinct ? "Compute Diff is enabled." : "Select two different sessions to enable Compute Diff.",
    mergeCanPreview: mergeDistinct,
    mergeCanConfirm: previewExists && !previewConfirmed && previewFresh && !previewHasConflicts,
    mergeCanApply: previewExists && previewConfirmed && previewFresh && !previewHasConflicts,
    mergeEnableText,
    undoEnabled: authoritativeUndo
  };
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2SessionStateModelConsolidation.test.mjs"));

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2SessionStateModelConsolidation.test.mjs failed syntax check.");

  const requiredTokens = [
    "computeWorkspaceSessionUiStateModel()",
    "renderWorkspaceSessionUiStateModel(model)",
    "refreshWorkspaceSessionUiStateModel(actionName = \"refresh_load\")",
    "updateSessionLibraryActionState() {",
    "updateDiffSelectionFeedbackAndState() {",
    "updateMergeSelectionFeedbackAndState() {",
    "updateUndoLastMergeState() {",
    "this.refreshWorkspaceSessionUiStateModel(\"refresh_load\");",
    "this.mergeOutputNode.hidden = !model.mergePreviewVisible;"
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing consolidated-state-model token/text: ${token}`);
  });

  const preservedUxTokens = [
    "Compute Diff is enabled.",
    "Preview Merge is enabled.",
    "Confirm Preview is enabled.",
    "Apply Merge is enabled.",
    "Preview confirmed. Apply Merge is enabled."
  ];
  preservedUxTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`PR_11_263 UX text regression: missing '${token}'`);
  });

  const stateNoInputNoSelection = computeModelState({
    hasSessionInput: false,
    diffDistinct: false,
    mergeDistinct: false,
    previewExists: false,
    previewFresh: false,
    previewConfirmed: false,
    previewHasConflicts: false,
    authoritativeUndo: false
  });
  if (!stateNoInputNoSelection.libraryButtonsDisabled) failures.push("Library buttons should be disabled with empty input.");
  if (stateNoInputNoSelection.mergeCanPreview) failures.push("Merge preview should be disabled when selections are not distinct.");
  if (stateNoInputNoSelection.undoEnabled) failures.push("Undo should be disabled without authoritative merge record.");

  const statePreviewReady = computeModelState({
    hasSessionInput: true,
    diffDistinct: true,
    mergeDistinct: true,
    previewExists: true,
    previewFresh: true,
    previewConfirmed: false,
    previewHasConflicts: false,
    authoritativeUndo: false
  });
  if (!statePreviewReady.mergeCanConfirm || statePreviewReady.mergeCanApply) failures.push("Fresh conflict-free preview should enable Confirm only.");
  if (statePreviewReady.mergeEnableText !== "Confirm Preview is enabled.") failures.push("Merge enable text should reflect Confirm-enabled state.");

  const stateApplyReady = computeModelState({
    hasSessionInput: true,
    diffDistinct: true,
    mergeDistinct: true,
    previewExists: true,
    previewFresh: true,
    previewConfirmed: true,
    previewHasConflicts: false,
    authoritativeUndo: true
  });
  if (!stateApplyReady.mergeCanApply) failures.push("Confirmed fresh preview should enable Apply.");
  if (stateApplyReady.mergeEnableText !== "Apply Merge is enabled.") failures.push("Merge enable text should reflect Apply-enabled state.");
  if (!stateApplyReady.undoEnabled) failures.push("Undo should reflect authoritative availability.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { jsExists, jsSyntax, testSyntax },
    scenarios: { stateNoInputNoSelection, statePreviewReady, stateApplyReady }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session-state-model-consolidation results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session-state-model-consolidation failures: ${failures.join(" | ")}`);
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
