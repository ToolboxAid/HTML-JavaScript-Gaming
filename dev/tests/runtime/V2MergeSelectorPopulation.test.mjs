import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-merge-selector-population-results.json");

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

function buildMergeCandidatesFromHistory(historyEntries) {
  const candidates = [];
  historyEntries.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    if (typeof entry.hostContextId !== "string" || !entry.hostContextId.trim()) return;
    if (typeof entry.tool !== "string" || !entry.tool.trim()) return;
    if (typeof entry.timestamp !== "string" || !entry.timestamp.trim()) return;
    if (!entry.payload || typeof entry.payload !== "object" || Array.isArray(entry.payload)) return;
    candidates.push({
      id: `history:${entry.hostContextId}`,
      label: `History | ${entry.tool} | ${entry.hostContextId} | ${entry.timestamp}`,
      payload: entry.payload
    });
  });
  return candidates;
}

function previewFromSelections(candidates, leftSelection, rightSelection, selectedToolId) {
  const gateMessage = "Create or reopen at least two Workspace V2 sessions before previewing a merge.";
  if (!Array.isArray(candidates) || candidates.length < 2) {
    return { ok: false, message: gateMessage };
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
  const merged = mergeSessionPayloads(left.payload, right.payload);
  const mergedPayload = { ...merged.mergedPayload, version: "v2" };
  return {
    ok: true,
    preview: {
      source: { id: left.id, payload: clone(left.payload), hash: JSON.stringify(left.payload) },
      target: { id: right.id, payload: clone(right.payload), hash: JSON.stringify(right.payload) },
      selectedToolId,
      mergedPayload,
      conflicts: merged.conflicts,
      changes: computeChanges(left.payload, right.payload, mergedPayload),
      confirmed: false
    },
    confirmEnabled: true,
    applyEnabled: false
  };
}

function confirmPreview(preview) {
  if (!preview) return { ok: false };
  preview.confirmed = true;
  return { ok: true, applyEnabled: true };
}

function applyPreview(preview, candidates, storage, audit) {
  if (!preview) return { ok: false, reason: "NO_PREVIEW" };
  if (!preview.confirmed) return { ok: false, reason: "UNCONFIRMED" };
  const liveSource = candidates.find((entry) => entry.id === preview.source.id);
  const liveTarget = candidates.find((entry) => entry.id === preview.target.id);
  if (!liveSource || !liveTarget) return { ok: false, reason: "STALE_MISSING" };
  if (JSON.stringify(liveSource.payload) !== preview.source.hash || JSON.stringify(liveTarget.payload) !== preview.target.hash) return { ok: false, reason: "STALE_CHANGED" };
  if (Object.keys(preview.conflicts).length > 0) return { ok: false, reason: "CONFLICT_BLOCK" };
  const hostContextId = `${preview.selectedToolId}-history-${Date.now()}`;
  storage[hostContextId] = JSON.stringify(preview.mergedPayload);
  const appliedPayload = JSON.parse(storage[hostContextId]);
  const appliedChanges = computeChanges(preview.source.payload, preview.target.payload, appliedPayload);
  if (JSON.stringify(appliedPayload) !== JSON.stringify(preview.mergedPayload) || JSON.stringify(appliedChanges) !== JSON.stringify(preview.changes)) {
    delete storage[hostContextId];
    return { ok: false, reason: "VERIFY_MISMATCH" };
  }
  audit.push({
    sourceSessionContextId: preview.source.id,
    targetSessionContextId: preview.target.id,
    timestamp: new Date().toISOString(),
    addedCount: Object.keys(preview.changes.added).length,
    updatedCount: Object.keys(preview.changes.updated).length,
    unchangedCount: Object.keys(preview.changes.unchanged).length,
    conflictCount: Object.keys(preview.conflicts).length
  });
  return { ok: true, reason: "", hostContextId };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const usesHistorySource = workspaceJsText.includes("const history = this.readSessionHistory();");
  const hasRequiredGateMessage = workspaceJsText.includes("Create or reopen at least two Workspace V2 sessions before previewing a merge.");
  const hasSameSelectionBlock = workspaceJsText.includes("Session A and Session B must be different sessions.");
  const hasMissingMessages = workspaceJsText.includes("Session A selection is missing.") && workspaceJsText.includes("Session B selection is missing.");
  const hasConfirmGuard = workspaceJsText.includes("Merge apply blocked. Confirm preview before apply.");
  const hasAuditWrite = workspaceJsText.includes("recordMergeAuditEntry(preview)");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!syntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  if (!usesHistorySource) failures.push("Merge candidates are not populated from Workspace V2 session history.");
  if (!hasRequiredGateMessage) failures.push("Missing required under-two-sessions message.");
  if (!hasSameSelectionBlock) failures.push("Missing same-session selection block.");
  if (!hasMissingMessages) failures.push("Missing Session A/Session B missing-selection messages.");
  if (!hasConfirmGuard) failures.push("Missing confirmed-preview apply guard.");
  if (!hasAuditWrite) failures.push("Missing merge audit write path.");

  const historyZero = [];
  const historyOne = [
    { hostContextId: "ctx-1", tool: "asset-manager-v2", timestamp: "2026-05-01T00:00:00.000Z", payload: { toolId: "asset-manager-v2", payloadJson: { x: 1 } } }
  ];
  const historyTwo = [
    { hostContextId: "ctx-1", tool: "asset-manager-v2", timestamp: "2026-05-01T00:00:00.000Z", payload: { toolId: "asset-manager-v2", payloadJson: { x: 1, shared: "yes" } } },
    { hostContextId: "ctx-2", tool: "asset-manager-v2", timestamp: "2026-05-01T00:01:00.000Z", payload: { toolId: "asset-manager-v2", payloadJson: { y: 2, shared: "yes" } } }
  ];

  const zeroCandidates = buildMergeCandidatesFromHistory(historyZero);
  const oneCandidates = buildMergeCandidatesFromHistory(historyOne);
  const twoCandidates = buildMergeCandidatesFromHistory(historyTwo);

  const zeroPreview = previewFromSelections(zeroCandidates, "", "", "asset-manager-v2");
  if (zeroPreview.ok || zeroPreview.message !== "Create or reopen at least two Workspace V2 sessions before previewing a merge.") {
    failures.push("Zero valid history sessions should show specific create/reopen message.");
  }

  const onePreview = previewFromSelections(oneCandidates, "", "", "asset-manager-v2");
  if (onePreview.ok || onePreview.message !== "Create or reopen at least two Workspace V2 sessions before previewing a merge.") {
    failures.push("One valid history session should show specific create/reopen message.");
  }

  if (twoCandidates.length < 2) {
    failures.push("Two valid history sessions should populate both selectors.");
  }

  const samePreview = previewFromSelections(twoCandidates, twoCandidates[0].id, twoCandidates[0].id, "asset-manager-v2");
  if (samePreview.ok || !samePreview.message.includes("two different")) {
    failures.push("Same selected history session for A and B should block preview.");
  }

  const validPreview = previewFromSelections(twoCandidates, twoCandidates[0].id, twoCandidates[1].id, "asset-manager-v2");
  if (!validPreview.ok || !validPreview.preview) {
    failures.push("Distinct selected history sessions should produce dry-run preview.");
  }
  if (!validPreview.confirmEnabled || validPreview.applyEnabled) {
    failures.push("Valid preview should enable confirm and keep apply disabled.");
  }

  const confirmed = confirmPreview(validPreview.preview);
  if (!confirmed.ok || !confirmed.applyEnabled) {
    failures.push("Confirmed preview should enable apply.");
  }

  const storage = {};
  const audit = [];
  const applied = applyPreview(validPreview.preview, twoCandidates, storage, audit);
  if (!applied.ok) {
    failures.push("Confirmed preview should apply successfully.");
  }
  if (audit.length < 1) {
    failures.push("Successful apply should write audit record.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      workspaceJsExists,
      syntaxValid,
      syntaxError,
      usesHistorySource,
      hasRequiredGateMessage,
      hasSameSelectionBlock,
      hasMissingMessages,
      hasConfirmGuard,
      hasAuditWrite
    },
    scenarios: {
      zeroCandidatesCount: zeroCandidates.length,
      oneCandidatesCount: oneCandidates.length,
      twoCandidatesCount: twoCandidates.length,
      zeroPreview,
      onePreview,
      samePreview,
      validPreview,
      confirmed,
      applied,
      audit
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 merge selector population results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 merge selector population failures: ${failures.join(" | ")}`);
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
