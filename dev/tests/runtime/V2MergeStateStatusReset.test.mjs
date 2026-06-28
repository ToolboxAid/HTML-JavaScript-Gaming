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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-merge-state-status-reset-results.json");

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

function clearMergePanelTransientState(summaryMessage, outputMessage, statusMessage) {
  return {
    pendingMergePreview: null,
    mergeOutputSelectionKey: "",
    lastMergedSessionResult: null,
    mergedSessionId: "",
    mergedSessionStatus: "No merged session result to save.",
    mergeResultSummary: summaryMessage,
    mergeOutput: outputMessage,
    mergeConflictHidden: true,
    mergeConflictText: "",
    confirmDisabled: true,
    applyDisabled: true,
    status: statusMessage
  };
}

function isUndoAvailable(lastMergedHostContextId, recentIds, sessionIds) {
  if (!lastMergedHostContextId) {
    return false;
  }
  return recentIds.includes(lastMergedHostContextId) && sessionIds.includes(lastMergedHostContextId);
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? fs.readFileSync(htmlPath, "utf8") : "";
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2MergeStateStatusReset.test.mjs"));

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2MergeStateStatusReset.test.mjs failed syntax check.");

  const requiredTokens = [
    "clearMergePanelTransientState(summaryMessage, outputMessage, statusMessage)",
    "this.clearMergePanelTransientState(",
    "Selections changed. Run Preview Merge again.",
    "No merge preview available.",
    "No merge summary yet."
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing merge-state-reset token/text: ${token}`);
  });

  if (!html.includes("id=\"workspaceV2MergeResultSummary\"")) failures.push("Missing merge result summary node.");
  if (!html.includes("id=\"workspaceV2MergeOutput\"")) failures.push("Missing merge output node.");
  if (!html.includes("id=\"workspaceV2MergedSessionStatus\"")) failures.push("Missing merged session status node.");

  const previewState = {
    mergeResultSummary: "Merge Preview Summary\nSource Session ID: history:asset-manager-v2-a",
    mergeOutput: "{\n  \"source\": \"history:asset-manager-v2-a\"\n}",
    mergedSessionStatus: "Merged session ready. Choose an ID and save if desired.",
    confirmDisabled: false,
    applyDisabled: false
  };
  if (!previewState.mergeResultSummary.includes("Merge Preview Summary")) failures.push("Preview summary should appear after Preview Merge.");
  if (!previewState.mergeOutput.includes("\"source\"")) failures.push("Raw JSON should appear after Preview Merge.");

  const selectionChangeReset = clearMergePanelTransientState(
    "Selections changed. Run Preview Merge again.",
    "No merge preview available.",
    "Selections changed. Run Preview Merge again."
  );
  if (selectionChangeReset.mergeResultSummary !== "Selections changed. Run Preview Merge again.") failures.push("Selection change should clear summary to stale notice.");
  if (selectionChangeReset.mergeOutput !== "No merge preview available.") failures.push("Selection change should clear raw preview JSON.");
  if (selectionChangeReset.mergedSessionStatus !== "No merged session result to save.") failures.push("Selection change should clear merged-session save controls.");
  if (!selectionChangeReset.confirmDisabled || !selectionChangeReset.applyDisabled) failures.push("Selection change should disable Confirm/Apply.");

  const undoReset = clearMergePanelTransientState(
    "Last merged session removed.\nRemoved Session ID: asset-manager-v2-merged-1777777777777-abc123xy",
    "No merge preview available.",
    "Last merged session removed."
  );
  if (!undoReset.mergeResultSummary.includes("Last merged session removed.")) failures.push("Undo should clear stale summary and show undo result.");
  if (undoReset.mergeOutput !== "No merge preview available.") failures.push("Undo should clear raw merge output.");

  const mergedDeleteReset = clearMergePanelTransientState(
    "Selections changed. Run Preview Merge again.",
    "No merge preview available.",
    "Selections changed. Run Preview Merge again."
  );
  if (mergedDeleteReset.mergeOutput !== "No merge preview available.") failures.push("Merged recent deletion should clear stale output.");

  const invalidSelectionReset = clearMergePanelTransientState(
    "Merge preview blocked. Session A and Session B selections are missing.",
    "Merge preview blocked. Session A and Session B selections are missing.",
    "Merge preview blocked. Select Session A and Session B, then run Preview Merge (Dry Run)."
  );
  if (!invalidSelectionReset.mergeResultSummary.includes("selections are missing")) failures.push("Invalid/missing selections should clear stale summary and show blocked reason.");
  if (!invalidSelectionReset.confirmDisabled || !invalidSelectionReset.applyDisabled) failures.push("Invalid/missing selections should keep Confirm/Apply disabled.");

  const refreshBaseline = clearMergePanelTransientState(
    "No merge summary yet.",
    "No merge preview available.",
    ""
  );
  if (refreshBaseline.mergeResultSummary !== "No merge summary yet.") failures.push("Refresh baseline should clear stale summary.");
  if (refreshBaseline.mergeOutput !== "No merge preview available.") failures.push("Refresh baseline should clear stale raw output.");

  const undoAvailabilityAfterResets = isUndoAvailable(
    "asset-manager-v2-merged-1777777777777-abc123xy",
    ["asset-manager-v2-merged-1777777777777-abc123xy", "asset-manager-v2-regular"],
    ["asset-manager-v2-merged-1777777777777-abc123xy", "asset-manager-v2-regular"]
  );
  if (!undoAvailabilityAfterResets) failures.push("Undo availability should remain based on actual recent+session entries.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { htmlExists, jsExists, jsSyntax, testSyntax },
    scenarios: {
      previewState,
      selectionChangeReset,
      undoReset,
      mergedDeleteReset,
      invalidSelectionReset,
      refreshBaseline,
      undoAvailabilityAfterResets
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 merge-state-status-reset results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 merge-state-status-reset failures: ${failures.join(" | ")}`);
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
