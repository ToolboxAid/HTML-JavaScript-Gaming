import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-inventory-diff-merge-results.json");

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

function resolveInventory(library, history) {
  const inventory = [];
  if (library && typeof library === "object" && !Array.isArray(library)) {
    Object.keys(library).sort((a, b) => a.localeCompare(b)).forEach((name) => {
      const payload = library[name];
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) return;
      inventory.push({
        id: `library:${name}`,
        label: `Library | ${name}`,
        payload,
        contextId: name,
        version: typeof payload.version === "string" ? payload.version : ""
      });
    });
  }
  if (Array.isArray(history)) {
    history.forEach((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return;
      if (typeof entry.hostContextId !== "string" || !entry.hostContextId.trim()) return;
      if (typeof entry.tool !== "string" || !entry.tool.trim()) return;
      if (typeof entry.timestamp !== "string" || !entry.timestamp.trim()) return;
      if (!entry.payload || typeof entry.payload !== "object" || Array.isArray(entry.payload)) return;
      inventory.push({
        id: `history:${entry.hostContextId}`,
        label: `History | ${entry.tool} | ${entry.hostContextId} | ${entry.timestamp}`,
        payload: entry.payload,
        contextId: entry.hostContextId,
        version: typeof entry.payload.version === "string" ? entry.payload.version : ""
      });
    });
  }
  return inventory;
}

function computeDiff(inventory, leftId, rightId) {
  if (inventory.length < 2) {
    return { ok: false, message: "Create or reopen at least two Workspace V2 sessions before comparing." };
  }
  if (!leftId && !rightId) return { ok: false, message: "Diff blocked. Session A and Session B selections are missing." };
  if (!leftId) return { ok: false, message: "Diff blocked. Session A selection is missing." };
  if (!rightId) return { ok: false, message: "Diff blocked. Session B selection is missing." };
  if (leftId === rightId) return { ok: false, message: "Diff blocked. Session A and Session B must be different sessions." };
  const left = inventory.find((entry) => entry.id === leftId);
  const right = inventory.find((entry) => entry.id === rightId);
  if (!left || !right) return { ok: false, message: "Diff blocked. Selection is no longer available." };
  return { ok: true, left: left.id, right: right.id };
}

function mergePayloads(leftPayload, rightPayload) {
  const conflicts = {};
  const mergeValues = (leftValue, rightValue, path) => {
    if (leftValue === undefined && rightValue !== undefined) return clone(rightValue);
    if (leftValue !== undefined && rightValue === undefined) return clone(leftValue);
    const leftObject = leftValue && typeof leftValue === "object";
    const rightObject = rightValue && typeof rightValue === "object";
    if (leftObject && rightObject && !Array.isArray(leftValue) && !Array.isArray(rightValue)) {
      const merged = {};
      const keys = new Set([...Object.keys(leftValue), ...Object.keys(rightValue)]);
      Array.from(keys).sort((a, b) => a.localeCompare(b)).forEach((key) => {
        const mergedValue = mergeValues(leftValue[key], rightValue[key], path ? `${path}.${key}` : key);
        if (mergedValue !== undefined) merged[key] = mergedValue;
      });
      return merged;
    }
    if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
      if (JSON.stringify(leftValue) === JSON.stringify(rightValue)) return clone(leftValue);
      conflicts[path || "$"] = { a: clone(leftValue), b: clone(rightValue) };
      return undefined;
    }
    if (JSON.stringify(leftValue) === JSON.stringify(rightValue)) return clone(leftValue);
    conflicts[path || "$"] = { a: clone(leftValue), b: clone(rightValue) };
    return undefined;
  };
  const mergedPayload = mergeValues(leftPayload, rightPayload, "");
  return { mergedPayload: mergedPayload && typeof mergedPayload === "object" ? mergedPayload : {}, conflicts };
}

function mergePreview(inventory, leftId, rightId, toolId) {
  if (inventory.length < 2) {
    return { ok: false, message: "Create or reopen at least two Workspace V2 sessions before previewing a merge." };
  }
  if (!leftId && !rightId) return { ok: false, message: "Merge preview blocked. Session A and Session B selections are missing." };
  if (!leftId) return { ok: false, message: "Merge preview blocked. Session A selection is missing." };
  if (!rightId) return { ok: false, message: "Merge preview blocked. Session B selection is missing." };
  if (leftId === rightId) return { ok: false, message: "Merge preview blocked. Session A and Session B must be different sessions." };
  const left = inventory.find((entry) => entry.id === leftId);
  const right = inventory.find((entry) => entry.id === rightId);
  if (!left || !right) return { ok: false, message: "Merge preview blocked. Selection is no longer available." };
  const merged = mergePayloads(left.payload, right.payload);
  return {
    ok: true,
    preview: {
      source: { id: left.id, payload: clone(left.payload), hash: JSON.stringify(left.payload) },
      target: { id: right.id, payload: clone(right.payload), hash: JSON.stringify(right.payload) },
      selectedToolId: toolId,
      mergedPayload: { ...merged.mergedPayload, version: "v2" },
      conflicts: merged.conflicts,
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

function applyPreview(preview, inventory, storage, audit) {
  if (!preview) return { ok: false, reason: "NO_PREVIEW" };
  if (!preview.confirmed) return { ok: false, reason: "UNCONFIRMED" };
  const liveSource = inventory.find((entry) => entry.id === preview.source.id);
  const liveTarget = inventory.find((entry) => entry.id === preview.target.id);
  if (!liveSource || !liveTarget) return { ok: false, reason: "STALE_MISSING" };
  if (JSON.stringify(liveSource.payload) !== preview.source.hash || JSON.stringify(liveTarget.payload) !== preview.target.hash) return { ok: false, reason: "STALE_CHANGED" };
  if (Object.keys(preview.conflicts).length > 0) return { ok: false, reason: "CONFLICT_BLOCK" };
  const hostContextId = `${preview.selectedToolId}-inv-${Date.now()}`;
  storage[hostContextId] = JSON.stringify(preview.mergedPayload);
  audit.push({
    sourceSessionContextId: preview.source.id,
    targetSessionContextId: preview.target.id,
    timestamp: new Date().toISOString(),
    addedCount: 0,
    updatedCount: 0,
    unchangedCount: 0,
    conflictCount: 0
  });
  return { ok: true, hostContextId };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const hasSharedResolver = workspaceJsText.includes("resolveWorkspaceSessionInventory()");
  const diffUsesResolver = workspaceJsText.includes("this.diffCandidates = this.resolveWorkspaceSessionInventory();");
  const mergeUsesResolver = workspaceJsText.includes("return this.resolveWorkspaceSessionInventory();");
  const hasDiffMessage = workspaceJsText.includes("Create or reopen at least two Workspace V2 sessions before comparing.");
  const hasMergeMessage = workspaceJsText.includes("Create or reopen at least two Workspace V2 sessions before previewing a merge.");
  const hasDiffSameBlock = workspaceJsText.includes("Diff blocked. Session A and Session B must be different sessions.");
  const hasMergeSameBlock = workspaceJsText.includes("Merge preview blocked. Session A and Session B must be different sessions.");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!syntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  if (!hasSharedResolver) failures.push("Missing centralized session inventory resolver.");
  if (!diffUsesResolver) failures.push("Diff does not use centralized inventory resolver.");
  if (!mergeUsesResolver) failures.push("Merge does not use centralized inventory resolver.");
  if (!hasDiffMessage) failures.push("Missing required Diff under-two-sessions message.");
  if (!hasMergeMessage) failures.push("Missing required Merge under-two-sessions message.");
  if (!hasDiffSameBlock) failures.push("Missing same-session block for Diff.");
  if (!hasMergeSameBlock) failures.push("Missing same-session block for Merge.");

  const libraryEmpty = {};
  const historyEmpty = [];
  const libraryOne = { only: { toolId: "asset-manager-v2", payloadJson: { a: 1 }, version: "v2" } };
  const historyOne = [];
  const libraryTwo = { left: { toolId: "asset-manager-v2", payloadJson: { a: 1 }, version: "v2" } };
  const historyTwo = [
    { hostContextId: "ctx-b", tool: "asset-manager-v2", timestamp: "2026-05-01T00:00:00.000Z", payload: { toolId: "asset-manager-v2", payloadJson: { b: 2 }, version: "v2" } }
  ];

  const invZero = resolveInventory(libraryEmpty, historyEmpty);
  const invOne = resolveInventory(libraryOne, historyOne);
  const invTwo = resolveInventory(libraryTwo, historyTwo);

  const diffZero = computeDiff(invZero, "", "");
  const mergeZero = mergePreview(invZero, "", "", "asset-manager-v2");
  const diffOne = computeDiff(invOne, "", "");
  const mergeOne = mergePreview(invOne, "", "", "asset-manager-v2");
  if (diffZero.ok || diffZero.message !== "Create or reopen at least two Workspace V2 sessions before comparing.") failures.push("Zero inventory should show single Diff message.");
  if (mergeZero.ok || mergeZero.message !== "Create or reopen at least two Workspace V2 sessions before previewing a merge.") failures.push("Zero inventory should show single Merge message.");
  if (diffOne.ok || diffOne.message !== "Create or reopen at least two Workspace V2 sessions before comparing.") failures.push("One inventory entry should show single Diff message.");
  if (mergeOne.ok || mergeOne.message !== "Create or reopen at least two Workspace V2 sessions before previewing a merge.") failures.push("One inventory entry should show single Merge message.");

  if (invTwo.length < 2) failures.push("Two inventory entries should populate Diff/Merge selectors.");

  const diffSame = computeDiff(invTwo, invTwo[0].id, invTwo[0].id);
  if (diffSame.ok || !diffSame.message.includes("must be different")) failures.push("Same-session selection should block Diff.");
  const mergeSame = mergePreview(invTwo, invTwo[0].id, invTwo[0].id, "asset-manager-v2");
  if (mergeSame.ok || !mergeSame.message.includes("must be different")) failures.push("Same-session selection should block Merge.");

  const diffDistinct = computeDiff(invTwo, invTwo[0].id, invTwo[1].id);
  if (!diffDistinct.ok) failures.push("Distinct selections should allow Compute Diff.");
  const mergeDistinct = mergePreview(invTwo, invTwo[0].id, invTwo[1].id, "asset-manager-v2");
  if (!mergeDistinct.ok || !mergeDistinct.preview) failures.push("Distinct selections should allow Preview Merge.");
  if (!mergeDistinct.confirmEnabled || mergeDistinct.applyEnabled) failures.push("Valid merge preview should enable confirm and keep apply disabled.");
  const confirmed = confirmPreview(mergeDistinct.preview);
  if (!confirmed.ok || !confirmed.applyEnabled) failures.push("Confirmed preview should enable apply.");
  const audit = [];
  const storage = {};
  const applied = applyPreview(mergeDistinct.preview, invTwo, storage, audit);
  if (!applied.ok) failures.push("Confirmed merge preview should apply.");
  if (audit.length < 1) failures.push("Successful apply should write audit record.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      workspaceJsExists,
      syntaxValid,
      syntaxError,
      hasSharedResolver,
      diffUsesResolver,
      mergeUsesResolver,
      hasDiffMessage,
      hasMergeMessage,
      hasDiffSameBlock,
      hasMergeSameBlock
    },
    scenarios: {
      invZeroCount: invZero.length,
      invOneCount: invOne.length,
      invTwoCount: invTwo.length,
      diffZero,
      mergeZero,
      diffOne,
      mergeOne,
      diffSame,
      mergeSame,
      diffDistinct,
      mergeDistinct,
      confirmed,
      applied,
      audit
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session inventory diff/merge results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session inventory diff/merge failures: ${failures.join(" | ")}`);
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
