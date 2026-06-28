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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-merge-apply-guard-audit-results.json");

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
  if (value === undefined) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(value));
}

function mergeSessionPayloads(leftPayload, rightPayload) {
  const conflicts = {};
  const mergeValues = (leftValue, rightValue, currentPath) => {
    if (leftValue === undefined && rightValue !== undefined) {
      return clone(rightValue);
    }
    if (leftValue !== undefined && rightValue === undefined) {
      return clone(leftValue);
    }
    const leftIsObject = leftValue && typeof leftValue === "object";
    const rightIsObject = rightValue && typeof rightValue === "object";
    if (leftIsObject && rightIsObject && !Array.isArray(leftValue) && !Array.isArray(rightValue)) {
      const merged = {};
      const keys = new Set([...Object.keys(leftValue), ...Object.keys(rightValue)]);
      Array.from(keys).sort((a, b) => a.localeCompare(b)).forEach((key) => {
        const nextPath = currentPath ? `${currentPath}.${key}` : key;
        const mergedValue = mergeValues(leftValue[key], rightValue[key], nextPath);
        if (mergedValue !== undefined) {
          merged[key] = mergedValue;
        }
      });
      return merged;
    }
    if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
      if (JSON.stringify(leftValue) === JSON.stringify(rightValue)) {
        return clone(leftValue);
      }
      conflicts[currentPath || "$"] = { a: clone(leftValue), b: clone(rightValue) };
      return undefined;
    }
    if (JSON.stringify(leftValue) === JSON.stringify(rightValue)) {
      return clone(leftValue);
    }
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
    if (mergedValue === undefined) {
      return;
    }
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

function createPreview(sourceId, targetId, sourcePayload, targetPayload, selectedToolId) {
  const mergeResult = mergeSessionPayloads(sourcePayload, targetPayload);
  const mergedPayload = { ...mergeResult.mergedPayload, version: "v2" };
  return {
    source: {
      id: sourceId,
      payload: clone(sourcePayload),
      hash: JSON.stringify(sourcePayload)
    },
    target: {
      id: targetId,
      payload: clone(targetPayload),
      hash: JSON.stringify(targetPayload)
    },
    selectedToolId,
    mergedPayload,
    conflicts: mergeResult.conflicts,
    changes: computeMergePreviewChanges(sourcePayload, targetPayload, mergedPayload),
    confirmed: false
  };
}

function applyPreview(preview, leftSelectedId, rightSelectedId, liveSourcePayload, liveTargetPayload, sessionStorageLike, auditLogLike) {
  if (!preview) return { ok: false, reason: "NO_PREVIEW" };
  if (!preview.confirmed) return { ok: false, reason: "NOT_CONFIRMED" };
  if (leftSelectedId !== preview.source.id || rightSelectedId !== preview.target.id) return { ok: false, reason: "STALE_SELECTION" };
  if (JSON.stringify(liveSourcePayload) !== preview.source.hash || JSON.stringify(liveTargetPayload) !== preview.target.hash) {
    return { ok: false, reason: "STALE_PAYLOAD" };
  }
  if (Object.keys(preview.conflicts).length > 0) return { ok: false, reason: "CONFLICT_BLOCK" };

  const hostContextId = `${preview.selectedToolId}-guard-${Date.now()}`;
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

  auditLogLike.push({
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
  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const workspaceHtmlText = workspaceHtmlExists ? readText(workspaceHtmlPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const htmlHasConfirmButton = workspaceHtmlText.includes("workspaceV2ConfirmMergeButton");
  const jsHasConfirmMethod = workspaceJsText.includes("confirmSelectedSessionMergePreview()");
  const jsHasPreviewConfirmGuard = workspaceJsText.includes("Merge apply blocked. Confirm preview before apply.");
  const jsHasStalePayloadGuard = workspaceJsText.includes("Preview is stale because source or target session changed.");
  const jsHasAuditKey = workspaceJsText.includes("this.mergeAuditStorageKey = \"v2-merge-audit-log\";");
  const jsHasAuditMethod = workspaceJsText.includes("recordMergeAuditEntry(preview)");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!workspaceHtmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!syntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  if (!htmlHasConfirmButton) failures.push("Missing Confirm Preview button.");
  if (!jsHasConfirmMethod) failures.push("Missing confirmSelectedSessionMergePreview().");
  if (!jsHasPreviewConfirmGuard) failures.push("Missing apply guard for unconfirmed preview.");
  if (!jsHasStalePayloadGuard) failures.push("Missing apply stale-preview guard.");
  if (!jsHasAuditKey) failures.push("Missing merge audit storage key.");
  if (!jsHasAuditMethod) failures.push("Missing recordMergeAuditEntry(preview).");

  const sourcePayload = { toolId: "asset-manager-v2", payloadJson: { shared: "same", left: 1 } };
  const targetPayload = { toolId: "asset-manager-v2", payloadJson: { shared: "same", right: 2 } };
  const conflictSource = { toolId: "asset-manager-v2", payloadJson: { shared: "same", mode: "A" } };
  const conflictTarget = { toolId: "asset-manager-v2", payloadJson: { shared: "same", mode: "B" } };

  const sessionStorageLike = {};
  const auditLogLike = [];

  const noPreviewApply = applyPreview(null, "library:A", "library:B", sourcePayload, targetPayload, sessionStorageLike, auditLogLike);
  if (noPreviewApply.ok || noPreviewApply.reason !== "NO_PREVIEW") {
    failures.push("Apply should be blocked when preview was not run.");
  }

  const stalePreview = createPreview("library:A", "library:B", sourcePayload, targetPayload, "asset-manager-v2");
  stalePreview.confirmed = true;
  const changedSourcePayload = { toolId: "asset-manager-v2", payloadJson: { shared: "same", left: 999 } };
  const staleApply = applyPreview(stalePreview, "library:A", "library:B", changedSourcePayload, targetPayload, sessionStorageLike, auditLogLike);
  if (staleApply.ok || staleApply.reason !== "STALE_PAYLOAD") {
    failures.push("Apply should be blocked when preview is stale due to source/target change.");
  }

  const conflictPreview = createPreview("history:1", "history:2", conflictSource, conflictTarget, "asset-manager-v2");
  conflictPreview.confirmed = true;
  const conflictApply = applyPreview(conflictPreview, "history:1", "history:2", conflictSource, conflictTarget, sessionStorageLike, auditLogLike);
  if (conflictApply.ok || conflictApply.reason !== "CONFLICT_BLOCK") {
    failures.push("Apply should be blocked when conflicts exist.");
  }

  const cleanPreview = createPreview("library:A", "library:B", sourcePayload, targetPayload, "asset-manager-v2");
  cleanPreview.confirmed = true;
  const cleanApply = applyPreview(cleanPreview, "library:A", "library:B", sourcePayload, targetPayload, sessionStorageLike, auditLogLike);
  if (!cleanApply.ok) {
    failures.push("Confirmed clean preview should apply.");
  }
  if (cleanApply.ok && JSON.stringify(cleanApply.appliedPayload) !== JSON.stringify(cleanPreview.mergedPayload)) {
    failures.push("Applied result payload does not match preview payload.");
  }
  if (cleanApply.ok && JSON.stringify(cleanApply.appliedChanges) !== JSON.stringify(cleanPreview.changes)) {
    failures.push("Applied result diff does not match preview diff.");
  }
  if (auditLogLike.length !== 1) {
    failures.push("Audit entry was not recorded.");
  } else {
    const audit = auditLogLike[0];
    if (audit.sourceSessionContextId !== "library:A" || audit.targetSessionContextId !== "library:B") {
      failures.push("Audit source/target ids are incorrect.");
    }
    if (typeof audit.timestamp !== "string" || !audit.timestamp) {
      failures.push("Audit timestamp missing.");
    }
    if (typeof audit.addedCount !== "number" || typeof audit.updatedCount !== "number" || typeof audit.unchangedCount !== "number" || typeof audit.conflictCount !== "number") {
      failures.push("Audit counts missing or invalid.");
    }
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      workspaceJsExists,
      workspaceHtmlExists,
      syntaxValid,
      syntaxError,
      htmlHasConfirmButton,
      jsHasConfirmMethod,
      jsHasPreviewConfirmGuard,
      jsHasStalePayloadGuard,
      jsHasAuditKey,
      jsHasAuditMethod
    },
    scenarios: {
      noPreviewApply,
      staleApply,
      conflictApply,
      cleanApply,
      auditLogLike
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 merge apply guard audit results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 merge apply guard/audit failures: ${failures.join(" | ")}`);
  return { failures, scenarios: { noPreviewApply, staleApply, conflictApply, cleanApply, auditLogLike } };
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
