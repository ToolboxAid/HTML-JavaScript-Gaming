import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-merge-apply-session-gate-fix-results.json");

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

function computeMergePreviewChanges(sourcePayload, targetPayload, mergedPayload) {
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

function runPreview(candidates, sourceId, targetId, selectedToolId) {
  if (!Array.isArray(candidates) || candidates.length < 2) {
    return { ok: false, reason: "PREVIEW_TWO_SESSION_GATE", preview: null };
  }
  const source = candidates.find((entry) => entry.id === sourceId);
  const target = candidates.find((entry) => entry.id === targetId);
  if (!source || !target) {
    return { ok: false, reason: "PREVIEW_SELECTION_INVALID", preview: null };
  }
  const result = mergeSessionPayloads(source.payload, target.payload);
  const mergedPayload = { ...result.mergedPayload, version: "v2" };
  return {
    ok: true,
    reason: "",
    preview: {
      source: { id: source.id, payload: clone(source.payload), hash: JSON.stringify(source.payload) },
      target: { id: target.id, payload: clone(target.payload), hash: JSON.stringify(target.payload) },
      selectedToolId,
      mergedPayload,
      conflicts: result.conflicts,
      changes: computeMergePreviewChanges(source.payload, target.payload, mergedPayload),
      confirmed: false
    }
  };
}

function confirmPreview(preview) {
  if (!preview) return { ok: false, reason: "NO_PREVIEW" };
  preview.confirmed = true;
  return { ok: true, reason: "" };
}

function applyPreview(preview, candidates, sessionStorageLike, auditEntries) {
  if (!preview) return { ok: false, reason: "NO_PREVIEW" };
  if (!preview.confirmed) return { ok: false, reason: "UNCONFIRMED_PREVIEW" };
  const liveSource = candidates.find((entry) => entry.id === preview.source.id);
  const liveTarget = candidates.find((entry) => entry.id === preview.target.id);
  if (!liveSource || !liveTarget) return { ok: false, reason: "STALE_PREVIEW_MISSING_CONTEXT" };
  if (JSON.stringify(liveSource.payload) !== preview.source.hash || JSON.stringify(liveTarget.payload) !== preview.target.hash) {
    return { ok: false, reason: "STALE_PREVIEW_CHANGED_CONTEXT" };
  }
  if (Object.keys(preview.conflicts).length > 0) return { ok: false, reason: "CONFLICT_BLOCK" };
  const hostContextId = `${preview.selectedToolId}-apply-${Date.now()}`;
  sessionStorageLike[hostContextId] = JSON.stringify(preview.mergedPayload);
  const appliedPayload = JSON.parse(sessionStorageLike[hostContextId]);
  const appliedChanges = computeMergePreviewChanges(preview.source.payload, preview.target.payload, appliedPayload);
  if (
    JSON.stringify(appliedPayload) !== JSON.stringify(preview.mergedPayload) ||
    JSON.stringify(appliedChanges) !== JSON.stringify(preview.changes)
  ) {
    delete sessionStorageLike[hostContextId];
    return { ok: false, reason: "VERIFY_MISMATCH" };
  }
  auditEntries.push({
    sourceSessionContextId: preview.source.id,
    targetSessionContextId: preview.target.id,
    timestamp: new Date().toISOString(),
    addedCount: Object.keys(preview.changes.added).length,
    updatedCount: Object.keys(preview.changes.updated).length,
    unchangedCount: Object.keys(preview.changes.unchanged).length,
    conflictCount: Object.keys(preview.conflicts).length
  });
  return { ok: true, reason: "", hostContextId, appliedPayload, appliedChanges };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const jsHasPreviewPreserve = workspaceJsText.includes("const previousPreview = this.pendingMergePreview;");
  const jsHasPreviewClearMessage = workspaceJsText.includes("Merge preview cleared because source or target session changed.");
  const jsHasApplyNoPreviewMessage = workspaceJsText.includes("Merge apply blocked. Run Preview Merge (Dry Run), then Confirm Preview.");
  const jsHasApplyStaleMessage = workspaceJsText.includes("Merge apply blocked. Preview is stale because source or target session changed.");
  const jsHasConflictBlock = workspaceJsText.includes("Merge apply blocked by");
  const jsHasAuditMethod = workspaceJsText.includes("recordMergeAuditEntry(preview)");

  const applyStart = workspaceJsText.indexOf("applySelectedSessionMerge() {");
  const applyEnd = workspaceJsText.indexOf("isComparableObject(value)");
  const applyBody = applyStart >= 0 && applyEnd > applyStart ? workspaceJsText.slice(applyStart, applyEnd) : "";
  const applyContainsTwoSessionGateMessage = applyBody.includes("Need at least two valid sessions to merge.");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!syntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  if (!jsHasPreviewPreserve) failures.push("Missing preview context preservation in renderSessionMergeInputs().");
  if (!jsHasPreviewClearMessage) failures.push("Missing stale preview clear message.");
  if (!jsHasApplyNoPreviewMessage) failures.push("Missing actionable no-preview apply block message.");
  if (!jsHasApplyStaleMessage) failures.push("Missing stale-preview apply block message.");
  if (!jsHasConflictBlock) failures.push("Missing conflict apply block message.");
  if (!jsHasAuditMethod) failures.push("Missing merge audit method.");
  if (applyContainsTwoSessionGateMessage) failures.push("Apply method still contains two-session gate message.");

  const cleanCandidates = [
    { id: "library:a", payload: { toolId: "asset-manager-v2", payloadJson: { left: 1, shared: "yes" } } },
    { id: "library:b", payload: { toolId: "asset-manager-v2", payloadJson: { right: 2, shared: "yes" } } }
  ];
  const oneCandidate = [
    { id: "library:a", payload: { toolId: "asset-manager-v2", payloadJson: { left: 1 } } }
  ];
  const conflictCandidates = [
    { id: "history:1", payload: { toolId: "asset-manager-v2", payloadJson: { mode: "A", shared: "yes" } } },
    { id: "history:2", payload: { toolId: "asset-manager-v2", payloadJson: { mode: "B", shared: "yes" } } }
  ];

  const sessionStorageLike = {};
  const auditEntries = [];

  const previewTooFew = runPreview(oneCandidate, "library:a", "library:a", "asset-manager-v2");
  if (previewTooFew.ok || previewTooFew.reason !== "PREVIEW_TWO_SESSION_GATE") {
    failures.push("Preview should be blocked when session count is below two.");
  }

  const previewClean = runPreview(cleanCandidates, "library:a", "library:b", "asset-manager-v2");
  if (!previewClean.ok || !previewClean.preview) {
    failures.push("Preview should succeed with two valid sessions.");
  }
  const confirmClean = confirmPreview(previewClean.preview);
  if (!confirmClean.ok || !previewClean.preview?.confirmed) {
    failures.push("Confirmed preview should enable apply.");
  }
  const applyClean = applyPreview(previewClean.preview, cleanCandidates, sessionStorageLike, auditEntries);
  if (!applyClean.ok) {
    failures.push("Confirmed clean preview should apply.");
  }
  if (applyClean.reason === "PREVIEW_TWO_SESSION_GATE") {
    failures.push("Apply emitted two-session gate after valid confirmed preview.");
  }
  if (applyClean.ok && JSON.stringify(applyClean.appliedChanges) !== JSON.stringify(previewClean.preview.changes)) {
    failures.push("Applied result diff does not match preview diff.");
  }

  const previewStale = runPreview(cleanCandidates, "library:a", "library:b", "asset-manager-v2");
  confirmPreview(previewStale.preview);
  const staleCandidates = [
    { id: "library:a", payload: { toolId: "asset-manager-v2", payloadJson: { left: 999, shared: "yes" } } },
    { id: "library:b", payload: { toolId: "asset-manager-v2", payloadJson: { right: 2, shared: "yes" } } }
  ];
  const applyStale = applyPreview(previewStale.preview, staleCandidates, sessionStorageLike, auditEntries);
  if (applyStale.ok || applyStale.reason !== "STALE_PREVIEW_CHANGED_CONTEXT") {
    failures.push("Stale preview should block apply.");
  }

  const previewConflict = runPreview(conflictCandidates, "history:1", "history:2", "asset-manager-v2");
  confirmPreview(previewConflict.preview);
  const applyConflict = applyPreview(previewConflict.preview, conflictCandidates, sessionStorageLike, auditEntries);
  if (applyConflict.ok || applyConflict.reason !== "CONFLICT_BLOCK") {
    failures.push("Conflicted preview should block apply.");
  }

  if (auditEntries.length < 1) {
    failures.push("Audit record should be written after successful apply.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      workspaceJsExists,
      syntaxValid,
      syntaxError,
      jsHasPreviewPreserve,
      jsHasPreviewClearMessage,
      jsHasApplyNoPreviewMessage,
      jsHasApplyStaleMessage,
      jsHasConflictBlock,
      jsHasAuditMethod,
      applyContainsTwoSessionGateMessage
    },
    scenarios: {
      previewTooFew,
      previewClean,
      confirmClean,
      applyClean,
      applyStale,
      applyConflict,
      auditEntries
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 merge apply session gate fix results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 merge apply session gate fix failures: ${failures.join(" | ")}`);
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
