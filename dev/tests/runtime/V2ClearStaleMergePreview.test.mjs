import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-clear-stale-merge-preview-results.json");

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

function selectionKey(leftId, rightId) {
  return `${leftId || ""}|${rightId || ""}`;
}

function undoAvailable(lastMergedHostContextId, recent) {
  return Boolean(lastMergedHostContextId && recent.some((entry) => entry.hostContextId === lastMergedHostContextId));
}

function onSelectionChange(state, nextLeft, nextRight) {
  const next = {
    ...state,
    mergeLeft: nextLeft,
    mergeRight: nextRight
  };
  const currentKey = selectionKey(nextLeft, nextRight);
  if (next.mergeOutputSelectionKey && next.mergeOutputSelectionKey !== currentKey) {
    next.pendingMergePreview = null;
    next.mergeOutputSelectionKey = "";
    next.lastMergedSessionResult = null;
    next.mergedSessionId = "";
    next.mergedSessionStatus = "No merged session result to save.";
    next.mergeResultSummary = "Selections changed. Run Preview Merge again.";
    next.mergeOutput = "No merge preview available.";
    next.confirmDisabled = true;
    next.applyDisabled = true;
  } else {
    next.confirmDisabled = !next.pendingMergePreview;
    next.applyDisabled = !next.pendingMergePreview || !next.pendingMergePreview.confirmed;
  }
  next.previewEnabled = Boolean(nextLeft && nextRight && nextLeft !== nextRight);
  return next;
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2ClearStaleMergePreview.test.mjs"));

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2ClearStaleMergePreview.test.mjs failed syntax check.");

  const requiredTokens = [
    "handleMergeSelectionChange()",
    "clearMergeOutputForSelectionChange()",
    "Selections changed. Run Preview Merge again.",
    "this.mergeOutputNode.textContent = \"No merge preview available.\";",
    "this.lastMergedSessionResult = null;",
    "this.confirmMergeButton.disabled = true;",
    "this.applyMergeButton.disabled = true;",
    "this.mergeOutputSelectionKey = this.buildMergeSelectionKey(left.id, right.id);"
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing stale-preview-clear token/text: ${token}`);
  });

  const originalLeft = "history:asset-manager-v2-a";
  const originalRight = "history:asset-manager-v2-b";
  const originalKey = selectionKey(originalLeft, originalRight);
  const mergedRecentId = "asset-manager-v2-merged-1777777777777-abc123xy";
  const base = {
    mergeLeft: originalLeft,
    mergeRight: originalRight,
    mergeOutputSelectionKey: originalKey,
    pendingMergePreview: {
      source: { id: originalLeft },
      target: { id: originalRight },
      confirmed: true
    },
    lastMergedSessionResult: { payload: { ok: true } },
    mergedSessionId: "asset-manager-v2-merged-1777777777777",
    mergedSessionStatus: "Merged session ready. Choose an ID and save if desired.",
    mergeResultSummary: "Merge Apply Summary",
    mergeOutput: "{\"source\":\"history:asset-manager-v2-a\"}",
    confirmDisabled: false,
    applyDisabled: false,
    recent: [{ hostContextId: mergedRecentId }],
    lastMergedHostContextId: mergedRecentId,
    previewEnabled: true
  };

  if (!base.mergeResultSummary.includes("Merge Apply Summary")) failures.push("Preview/apply summary should exist before selection change.");
  if (!base.mergeOutput.includes("history:asset-manager-v2-a")) failures.push("Raw preview/apply JSON should exist before selection change.");

  const changeA = onSelectionChange(base, "history:palette-manager-v2-a", originalRight);
  if (changeA.mergeResultSummary !== "Selections changed. Run Preview Merge again.") failures.push("Changing Session A should set stale-selection status.");
  if (changeA.mergeOutput !== "No merge preview available.") failures.push("Changing Session A should clear raw merge JSON.");
  if (changeA.mergedSessionId !== "" || changeA.lastMergedSessionResult !== null) failures.push("Changing Session A should clear merged-save controls/output.");
  if (!changeA.confirmDisabled || !changeA.applyDisabled) failures.push("Changing Session A should disable Confirm and Apply.");

  const changeB = onSelectionChange(base, originalLeft, "history:palette-manager-v2-b");
  if (changeB.mergeResultSummary !== "Selections changed. Run Preview Merge again.") failures.push("Changing Session B should set stale-selection status.");
  if (changeB.mergeOutput !== "No merge preview available.") failures.push("Changing Session B should clear raw merge JSON.");

  const changeBoth = onSelectionChange(base, "history:palette-manager-v2-a", "history:palette-manager-v2-b");
  if (changeBoth.mergedSessionStatus !== "No merged session result to save.") failures.push("Changing both selections should clear merged-session status.");
  if (changeBoth.mergeOutputSelectionKey !== "") failures.push("Changing both selections should clear previous merge output key.");

  const switchBack = onSelectionChange(changeBoth, originalLeft, originalRight);
  if (!switchBack.confirmDisabled || !switchBack.applyDisabled) failures.push("Switching back to old pair should still require Preview Merge again.");
  if (switchBack.mergeResultSummary !== "Selections changed. Run Preview Merge again.") failures.push("Switching back should not silently restore stale preview.");

  const undoStillAvailableBefore = undoAvailable(base.lastMergedHostContextId, base.recent);
  const undoStillAvailableAfter = undoAvailable(changeBoth.lastMergedHostContextId, changeBoth.recent);
  if (!undoStillAvailableBefore || !undoStillAvailableAfter) failures.push("Undo Last Merge availability should remain unchanged by selection-change stale clear.");

  const noSelection = onSelectionChange({
    ...base,
    mergeOutputSelectionKey: "",
    pendingMergePreview: null,
    mergeResultSummary: "No merge summary yet.",
    mergeOutput: "No merge preview available."
  }, "", "");
  if (noSelection.previewEnabled) failures.push("Zero selections should keep Preview disabled.");

  const sameSelection = onSelectionChange({
    ...base,
    mergeOutputSelectionKey: "",
    pendingMergePreview: null
  }, "history:palette-manager-v2-a", "history:palette-manager-v2-a");
  if (sameSelection.previewEnabled) failures.push("Same-session selection should keep Preview disabled.");

  const distinctSelection = onSelectionChange({
    ...base,
    mergeOutputSelectionKey: "",
    pendingMergePreview: null
  }, "history:palette-manager-v2-a", "history:palette-manager-v2-b");
  if (!distinctSelection.previewEnabled) failures.push("Distinct selections should keep Preview enabled for normal validation flow.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { jsExists, jsSyntax, testSyntax },
    scenarios: {
      before: { mergeResultSummary: base.mergeResultSummary, mergeOutput: base.mergeOutput },
      changeA,
      changeB,
      changeBoth,
      switchBack,
      undoStillAvailableBefore,
      undoStillAvailableAfter,
      noSelection,
      sameSelection,
      distinctSelection
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 clear-stale-merge-preview results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 clear-stale-merge-preview failures: ${failures.join(" | ")}`);
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
