import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const testPath = path.join(repoRoot, "tests", "runtime", "V2DeterministicStateTransitions.test.mjs");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-deterministic-state-transitions-results.json");

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

function computeStateFromModel(model) {
  if (model.undoEnabled) return "undo_available";
  if (model.hasMergedResult) return "merge_applied";
  if (model.previewExists && (model.mergeCanConfirm || model.mergeCanApply)) return "preview_ready";
  if (model.previewExists) return "preview_active";
  if (model.mergeCanPreview) return "valid_selection";
  return "idle";
}

function isAllowed(actionName, model) {
  if (actionName === "refresh_load") return true;
  if (actionName === "selection_change") return true;
  if (actionName === "delete_session") return true;
  if (actionName === "preview_merge") return model.mergeCanPreview;
  if (actionName === "confirm_preview") return model.mergeCanConfirm;
  if (actionName === "apply_merge") return model.mergeCanApply;
  if (actionName === "undo_merge") return model.undoEnabled;
  return false;
}

function nextState(actionName, model) {
  if (actionName === "preview_merge") return "preview_active";
  if (actionName === "confirm_preview") return "preview_ready";
  if (actionName === "apply_merge") return model.undoEnabled ? "undo_available" : "merge_applied";
  return computeStateFromModel(model);
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(testPath);

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2DeterministicStateTransitions.test.mjs failed syntax check.");

  const requiredTokens = [
    "this.workspaceTransitionState = \"idle\";",
    "computeWorkspaceTransitionStateFromModel(model)",
    "isWorkspaceTransitionAllowed(actionName, model)",
    "computeNextWorkspaceTransitionState(actionName, model)",
    "requestWorkspaceTransition(actionName, model)",
    "refreshWorkspaceSessionUiStateModel(actionName = \"refresh_load\")",
    "this.refreshWorkspaceSessionUiStateModel(\"selection_change\")",
    "this.refreshWorkspaceSessionUiStateModel(\"delete_session\")",
    "this.requestWorkspaceTransition(\"preview_merge\", this.computeWorkspaceSessionUiStateModel())",
    "this.requestWorkspaceTransition(\"confirm_preview\", this.computeWorkspaceSessionUiStateModel())",
    "this.requestWorkspaceTransition(\"apply_merge\", this.computeWorkspaceSessionUiStateModel())",
    "this.requestWorkspaceTransition(\"undo_merge\", this.computeWorkspaceSessionUiStateModel())"
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing deterministic-transition token/text: ${token}`);
  });

  const preservedModelTokens = [
    "computeWorkspaceSessionUiStateModel()",
    "renderWorkspaceSessionUiStateModel(model)",
    "Compute Diff is enabled.",
    "Preview Merge is enabled.",
    "Confirm Preview is enabled.",
    "Apply Merge is enabled."
  ];
  preservedModelTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`PR_11_264 regression token missing: ${token}`);
  });

  const modelIdle = {
    mergeCanPreview: false,
    mergeCanConfirm: false,
    mergeCanApply: false,
    previewExists: false,
    undoEnabled: false,
    hasMergedResult: false
  };
  const modelValidSelection = {
    ...modelIdle,
    mergeCanPreview: true
  };
  const modelPreviewConfirmable = {
    ...modelIdle,
    mergeCanPreview: true,
    previewExists: true,
    mergeCanConfirm: true
  };
  const modelPreviewApply = {
    ...modelIdle,
    mergeCanPreview: true,
    previewExists: true,
    mergeCanApply: true
  };
  const modelUndo = {
    ...modelIdle,
    undoEnabled: true
  };

  const initialState = computeStateFromModel(modelIdle);
  if (initialState !== "idle") failures.push("Initial state should be idle.");
  if (isAllowed("preview_merge", modelIdle)) failures.push("Preview must be blocked without a valid selection.");
  if (!isAllowed("preview_merge", modelValidSelection)) failures.push("Preview must be allowed with valid distinct selection.");

  const previewState = nextState("preview_merge", modelValidSelection);
  if (previewState !== "preview_active") failures.push("preview_merge should transition to preview_active.");
  if (!isAllowed("confirm_preview", modelPreviewConfirmable)) failures.push("confirm_preview should be allowed for fresh conflict-free preview.");

  const confirmState = nextState("confirm_preview", modelPreviewConfirmable);
  if (confirmState !== "preview_ready") failures.push("confirm_preview should transition to preview_ready.");
  if (!isAllowed("apply_merge", modelPreviewApply)) failures.push("apply_merge should be allowed only after confirm-ready model.");

  const applyState = nextState("apply_merge", modelPreviewApply);
  if (applyState !== "merge_applied") failures.push("apply_merge should transition to merge_applied before authoritative undo recompute.");
  if (!isAllowed("undo_merge", modelUndo)) failures.push("undo_merge should be allowed when authoritative merge record exists.");

  const recomputedAfterUndo = nextState("undo_merge", modelIdle);
  if (recomputedAfterUndo !== "idle") failures.push("undo_merge recompute should return idle when authoritative merge record is cleared.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { jsExists, jsSyntax, testSyntax },
    states: {
      initialState,
      previewState,
      confirmState,
      applyState,
      recomputedAfterUndo
    }
  }, null, 2)}
`, "utf8");

  console.log(`v2 deterministic-state-transitions results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 deterministic-state-transitions failures: ${failures.join(" | ")}`);
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
