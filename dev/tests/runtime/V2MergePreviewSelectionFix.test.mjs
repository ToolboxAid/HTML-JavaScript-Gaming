import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-merge-preview-selection-fix-results.json");

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

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function mergeSessionPayloads(leftPayload, rightPayload) {
  const conflicts = {};
  const mergeValues = (leftValue, rightValue, currentPath) => {
    if (leftValue === undefined && rightValue !== undefined) return clone(rightValue);
    if (leftValue !== undefined && rightValue === undefined) return clone(leftValue);
    const leftObject = leftValue && typeof leftValue === "object";
    const rightObject = rightValue && typeof rightValue === "object";
    if (leftObject && rightObject && !Array.isArray(leftValue) && !Array.isArray(rightValue)) {
      const merged = {};
      const keys = new Set([...Object.keys(leftValue), ...Object.keys(rightValue)]);
      Array.from(keys).sort((a, b) => a.localeCompare(b)).forEach((key) => {
        const mergedValue = mergeValues(leftValue[key], rightValue[key], currentPath ? `${currentPath}.${key}` : key);
        if (mergedValue !== undefined) merged[key] = mergedValue;
      });
      return merged;
    }
    if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
      if (JSON.stringify(leftValue) === JSON.stringify(rightValue)) return clone(leftValue);
      conflicts[currentPath || "$"] = { a: clone(leftValue), b: clone(rightValue) };
      return undefined;
    }
    if (JSON.stringify(leftValue) === JSON.stringify(rightValue)) return clone(leftValue);
    conflicts[currentPath || "$"] = { a: clone(leftValue), b: clone(rightValue) };
    return undefined;
  };
  const mergedPayload = mergeValues(leftPayload, rightPayload, "");
  return {
    mergedPayload: mergedPayload && typeof mergedPayload === "object" && !Array.isArray(mergedPayload) ? mergedPayload : {},
    conflicts
  };
}

function computeChanges(sourcePayload, targetPayload, mergedPayload) {
  const added = {};
  const updated = {};
  const unchanged = {};
  const walk = (sourceValue, targetValue, mergedValue, currentPath) => {
    if (mergedValue === undefined) return;
    const sourceObject = sourceValue && typeof sourceValue === "object";
    const targetObject = targetValue && typeof targetValue === "object";
    const mergedObject = mergedValue && typeof mergedValue === "object";
    if (sourceObject && targetObject && mergedObject && !Array.isArray(sourceValue) && !Array.isArray(targetValue) && !Array.isArray(mergedValue)) {
      const keys = new Set([...Object.keys(sourceValue), ...Object.keys(targetValue), ...Object.keys(mergedValue)]);
      Array.from(keys).sort((a, b) => a.localeCompare(b)).forEach((key) => {
        walk(sourceValue[key], targetValue[key], mergedValue[key], currentPath ? `${currentPath}.${key}` : key);
      });
      return;
    }
    if (targetValue === undefined) {
      added[currentPath || "$"] = clone(mergedValue);
      return;
    }
    if (JSON.stringify(mergedValue) === JSON.stringify(targetValue)) {
      unchanged[currentPath || "$"] = clone(mergedValue);
      return;
    }
    updated[currentPath || "$"] = { from: clone(targetValue), to: clone(mergedValue) };
  };
  walk(sourcePayload, targetPayload, mergedPayload, "");
  return { added, updated, unchanged };
}

function preview(candidates, leftSelection, rightSelection, selectedToolId) {
  if (!Array.isArray(candidates) || candidates.length < 2) {
    return { ok: false, message: "Merge preview blocked. Add at least two valid sessions, then run Preview Merge (Dry Run)." };
  }
  if (!leftSelection && !rightSelection) {
    return { ok: false, message: "Merge preview blocked. Select Session A and Session B, then run Preview Merge (Dry Run)." };
  }
  if (!leftSelection) {
    return { ok: false, message: "Merge preview blocked. Select Session A, then run Preview Merge (Dry Run)." };
  }
  if (!rightSelection) {
    return { ok: false, message: "Merge preview blocked. Select Session B, then run Preview Merge (Dry Run)." };
  }
  if (leftSelection === rightSelection) {
    return { ok: false, message: "Merge preview blocked. Choose two different sessions, then run Preview Merge (Dry Run)." };
  }
  const left = candidates.find((entry) => entry.id === leftSelection);
  const right = candidates.find((entry) => entry.id === rightSelection);
  if (!left || !right) {
    return { ok: false, message: "Merge preview blocked. Refresh or re-select sessions, then run Preview Merge (Dry Run)." };
  }
  const result = mergeSessionPayloads(left.payload, right.payload);
  const mergedPayload = { ...result.mergedPayload, version: "v2" };
  return {
    ok: true,
    confirmEnabled: true,
    applyEnabled: false,
    preview: {
      source: { id: left.id, payload: clone(left.payload), hash: JSON.stringify(left.payload) },
      target: { id: right.id, payload: clone(right.payload), hash: JSON.stringify(right.payload) },
      selectedToolId,
      mergedPayload,
      conflicts: result.conflicts,
      changes: computeChanges(left.payload, right.payload, mergedPayload),
      confirmed: false
    }
  };
}

function confirm(previewState) {
  if (!previewState) return { ok: false };
  previewState.confirmed = true;
  return { ok: true, applyEnabled: true };
}

function apply(previewState, candidates, storage, audit) {
  if (!previewState) return { ok: false, reason: "NO_PREVIEW" };
  if (!previewState.confirmed) return { ok: false, reason: "UNCONFIRMED" };
  const liveSource = candidates.find((entry) => entry.id === previewState.source.id);
  const liveTarget = candidates.find((entry) => entry.id === previewState.target.id);
  if (!liveSource || !liveTarget) return { ok: false, reason: "STALE_MISSING" };
  if (JSON.stringify(liveSource.payload) !== previewState.source.hash || JSON.stringify(liveTarget.payload) !== previewState.target.hash) {
    return { ok: false, reason: "STALE_CHANGED" };
  }
  if (Object.keys(previewState.conflicts).length > 0) return { ok: false, reason: "CONFLICT_BLOCK" };
  const hostContextId = `${previewState.selectedToolId}-selection-${Date.now()}`;
  storage[hostContextId] = JSON.stringify(previewState.mergedPayload);
  const appliedPayload = JSON.parse(storage[hostContextId]);
  const appliedChanges = computeChanges(previewState.source.payload, previewState.target.payload, appliedPayload);
  if (JSON.stringify(appliedPayload) !== JSON.stringify(previewState.mergedPayload) || JSON.stringify(appliedChanges) !== JSON.stringify(previewState.changes)) {
    delete storage[hostContextId];
    return { ok: false, reason: "VERIFY_MISMATCH" };
  }
  audit.push({
    sourceSessionContextId: previewState.source.id,
    targetSessionContextId: previewState.target.id,
    timestamp: new Date().toISOString(),
    addedCount: Object.keys(previewState.changes.added).length,
    updatedCount: Object.keys(previewState.changes.updated).length,
    unchangedCount: Object.keys(previewState.changes.unchanged).length,
    conflictCount: Object.keys(previewState.conflicts).length
  });
  return { ok: true, reason: "", hostContextId };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const hasLeftPlaceholder = workspaceJsText.includes("Select Session A");
  const hasRightPlaceholder = workspaceJsText.includes("Select Session B");
  const hasMissingA = workspaceJsText.includes("Session A selection is missing.");
  const hasMissingB = workspaceJsText.includes("Session B selection is missing.");
  const hasSameBlock = workspaceJsText.includes("Session A and Session B must be different sessions.");
  const hasNoAutoSelect = workspaceJsText.includes("this.mergeCandidates.some((entry) => entry.id === currentLeft) ? currentLeft : \"\"");
  const hasApplyMessage = workspaceJsText.includes("Merge apply blocked. Run Preview Merge (Dry Run), then Confirm Preview.");
  const hasAudit = workspaceJsText.includes("recordMergeAuditEntry(preview)");
  const applyStart = workspaceJsText.indexOf("applySelectedSessionMerge() {");
  const applyEnd = workspaceJsText.indexOf("isComparableObject(value)");
  const applyBody = applyStart >= 0 && applyEnd > applyStart ? workspaceJsText.slice(applyStart, applyEnd) : "";
  const applyHasTwoSessionMessage = applyBody.includes("Need at least two valid sessions to merge.");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!syntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  if (!hasLeftPlaceholder || !hasRightPlaceholder) failures.push("Missing explicit Session A/B placeholder options.");
  if (!hasMissingA || !hasMissingB) failures.push("Missing specific Session A/Session B missing-selection messages.");
  if (!hasSameBlock) failures.push("Missing same-session selection block message.");
  if (!hasNoAutoSelect) failures.push("Missing no-auto-select selection logic.");
  if (!hasApplyMessage) failures.push("Missing apply actionable blocked message.");
  if (!hasAudit) failures.push("Missing audit recording behavior.");
  if (applyHasTwoSessionMessage) failures.push("Apply still includes two-session gate message.");

  const cleanCandidates = [
    { id: "library:a", payload: { toolId: "asset-manager-v2", payloadJson: { shared: "same", left: 1 } } },
    { id: "library:b", payload: { toolId: "asset-manager-v2", payloadJson: { shared: "same", right: 2 } } }
  ];
  const conflictCandidates = [
    { id: "history:1", payload: { toolId: "asset-manager-v2", payloadJson: { shared: "same", mode: "A" } } },
    { id: "history:2", payload: { toolId: "asset-manager-v2", payloadJson: { shared: "same", mode: "B" } } }
  ];
  const storage = {};
  const audit = [];

  const noSelections = preview(cleanCandidates, "", "", "asset-manager-v2");
  if (noSelections.ok || !noSelections.message.includes("Session A and Session B")) failures.push("No selections should block preview with specific Session A/B message.");
  const onlyA = preview(cleanCandidates, "library:a", "", "asset-manager-v2");
  if (onlyA.ok || !onlyA.message.includes("Session B")) failures.push("Only Session A should block preview with missing Session B message.");
  const onlyB = preview(cleanCandidates, "", "library:b", "asset-manager-v2");
  if (onlyB.ok || !onlyB.message.includes("Session A")) failures.push("Only Session B should block preview with missing Session A message.");
  const sameSelection = preview(cleanCandidates, "library:a", "library:a", "asset-manager-v2");
  if (sameSelection.ok || !sameSelection.message.includes("two different")) failures.push("Same session for A/B should block preview.");

  const validPreview = preview(cleanCandidates, "library:a", "library:b", "asset-manager-v2");
  if (!validPreview.ok || !validPreview.preview) failures.push("Two distinct selected sessions should create dry-run preview.");
  if (!validPreview.confirmEnabled || validPreview.applyEnabled) failures.push("Valid preview should enable confirm and keep apply disabled.");
  const confirmed = confirm(validPreview.preview);
  if (!confirmed.ok || !confirmed.applyEnabled) failures.push("Confirmed preview should enable apply.");
  const applied = apply(validPreview.preview, cleanCandidates, storage, audit);
  if (!applied.ok) failures.push("Confirmed preview should apply successfully.");
  if (applied.reason === "PREVIEW_TWO_SESSION_GATE") failures.push("Apply repeated two-session gate error after valid preview.");

  const conflictedPreview = preview(conflictCandidates, "history:1", "history:2", "asset-manager-v2");
  confirm(conflictedPreview.preview);
  const conflictedApply = apply(conflictedPreview.preview, conflictCandidates, storage, audit);
  if (conflictedApply.ok || conflictedApply.reason !== "CONFLICT_BLOCK") failures.push("Conflicted preview should still block apply.");

  if (audit.length < 1) failures.push("Successful apply should write audit record.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      workspaceJsExists,
      syntaxValid,
      syntaxError,
      hasLeftPlaceholder,
      hasRightPlaceholder,
      hasMissingA,
      hasMissingB,
      hasSameBlock,
      hasNoAutoSelect,
      hasApplyMessage,
      hasAudit,
      applyHasTwoSessionMessage
    },
    scenarios: {
      noSelections,
      onlyA,
      onlyB,
      sameSelection,
      validPreview,
      confirmed,
      applied,
      conflictedApply,
      audit
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 merge preview selection fix results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 merge preview selection fix failures: ${failures.join(" | ")}`);
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
