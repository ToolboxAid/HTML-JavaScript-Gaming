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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-merge-preview-results.json");

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
        const childPath = currentPath ? `${currentPath}.${key}` : key;
        const mergedValue = mergeValues(leftValue[key], rightValue[key], childPath);
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
  return {
    mergedPayload: mergeValues(leftPayload, rightPayload, ""),
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

function createMergePreview(sourcePayload, targetPayload) {
  const mergeResult = mergeSessionPayloads(sourcePayload, targetPayload);
  const mergedPayload = { ...mergeResult.mergedPayload, version: "v2" };
  const changes = computeMergePreviewChanges(sourcePayload, targetPayload, mergedPayload);
  return {
    mergedPayload,
    conflicts: mergeResult.conflicts,
    changes
  };
}

function applyMergePreview(preview, selectedToolId, storage) {
  if (!preview || typeof preview !== "object") {
    return { applied: false, reason: "NO_PREVIEW", hostContextId: "", storedJson: "" };
  }
  if (Object.keys(preview.conflicts).length > 0) {
    return { applied: false, reason: "CONFLICT_BLOCK", hostContextId: "", storedJson: "" };
  }
  const hostContextId = `${selectedToolId}-test-${Date.now()}`;
  const storedJson = JSON.stringify(preview.mergedPayload);
  storage[hostContextId] = storedJson;
  return { applied: true, reason: "", hostContextId, storedJson };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const workspaceHtmlText = workspaceHtmlExists ? readText(workspaceHtmlPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const htmlHasPreviewButton = workspaceHtmlText.includes("workspaceV2ComputeMergeButton") &&
    workspaceHtmlText.includes("Preview Merge (Dry Run)");
  const htmlHasApplyButton = workspaceHtmlText.includes("workspaceV2ApplyMergeButton");
  const jsHasPreviewMethod = workspaceJsText.includes("computeMergePreviewChanges(sourcePayload, targetPayload, mergedPayload)");
  const jsHasApplyMethod = workspaceJsText.includes("applySelectedSessionMerge()");
  const jsHasConflictBlock = workspaceJsText.includes("Merge apply blocked by");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!workspaceHtmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!syntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  if (!htmlHasPreviewButton) failures.push("Missing preview dry-run merge button.");
  if (!htmlHasApplyButton) failures.push("Missing apply merge button.");
  if (!jsHasPreviewMethod) failures.push("Missing computeMergePreviewChanges(sourcePayload, targetPayload, mergedPayload).");
  if (!jsHasApplyMethod) failures.push("Missing applySelectedSessionMerge().");
  if (!jsHasConflictBlock) failures.push("Missing conflict block message in apply flow.");

  const conflictSource = {
    toolId: "asset-manager-v2",
    payloadJson: {
      shared: "same",
      onlySource: { a: 1 },
      conflictValue: "A"
    }
  };
  const conflictTarget = {
    toolId: "asset-manager-v2",
    payloadJson: {
      shared: "same",
      onlyTarget: { b: 1 },
      conflictValue: "B"
    }
  };
  const cleanSource = {
    toolId: "asset-manager-v2",
    payloadJson: {
      shared: "same",
      onlySource: { a: 1 }
    }
  };
  const cleanTarget = {
    toolId: "asset-manager-v2",
    payloadJson: {
      shared: "same",
      onlyTarget: { b: 1 }
    }
  };

  const sourceBefore = clone(cleanSource);
  const targetBefore = clone(cleanTarget);
  const conflictPreview = createMergePreview(conflictSource, conflictTarget);
  const cleanPreview = createMergePreview(cleanSource, cleanTarget);
  const storage = {};

  if (JSON.stringify(cleanSource) !== JSON.stringify(sourceBefore) || JSON.stringify(cleanTarget) !== JSON.stringify(targetBefore)) {
    failures.push("Preview mutated source/target payloads.");
  }

  const blockedApply = applyMergePreview(conflictPreview, "asset-manager-v2", storage);
  if (blockedApply.applied) {
    failures.push("Conflict preview should block apply.");
  }
  if (blockedApply.reason !== "CONFLICT_BLOCK") {
    failures.push("Conflict apply block reason mismatch.");
  }

  const cleanApply = applyMergePreview(cleanPreview, "asset-manager-v2", storage);
  if (!cleanApply.applied) {
    failures.push("Clean preview should proceed to apply.");
  }
  if (!cleanApply.hostContextId) {
    failures.push("Clean apply did not create hostContextId.");
  }

  const appliedPayload = cleanApply.applied ? JSON.parse(storage[cleanApply.hostContextId]) : null;
  if (cleanApply.applied && JSON.stringify(appliedPayload) !== JSON.stringify(cleanPreview.mergedPayload)) {
    failures.push("Applied payload does not match preview merged payload.");
  }

  const recomputedChanges = computeMergePreviewChanges(cleanSource, cleanTarget, cleanPreview.mergedPayload);
  if (JSON.stringify(recomputedChanges) !== JSON.stringify(cleanPreview.changes)) {
    failures.push("Preview change report does not match applied-result diff.");
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
      htmlHasPreviewButton,
      htmlHasApplyButton,
      jsHasPreviewMethod,
      jsHasApplyMethod,
      jsHasConflictBlock
    },
    conflictPreview,
    blockedApply,
    cleanPreview,
    cleanApply,
    appliedPayload
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session merge preview results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session merge preview failures: ${failures.join(" | ")}`);
  return { failures, conflictPreview, blockedApply, cleanPreview, cleanApply };
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
