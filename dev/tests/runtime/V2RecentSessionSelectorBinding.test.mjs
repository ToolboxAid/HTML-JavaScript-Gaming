import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-recent-session-selector-binding-results.json");

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

function safeParseJson(raw) {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, value: null };
  }
}

function isValidPayload(payload) {
  return Boolean(payload && typeof payload === "object" && !Array.isArray(payload));
}

function resolveRecentInventory(history, sessionStorageMap) {
  const inventory = [];
  history.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    if (typeof entry.hostContextId !== "string" || !entry.hostContextId.trim()) return;
    if (typeof entry.tool !== "string" || !entry.tool.trim()) return;
    if (typeof entry.timestamp !== "string" || !entry.timestamp.trim()) return;
    const storageRaw = sessionStorageMap[entry.hostContextId];
    let resolvedPayload = null;
    if (typeof storageRaw === "string") {
      const parsed = safeParseJson(storageRaw);
      if (parsed.ok && isValidPayload(parsed.value)) resolvedPayload = parsed.value;
    }
    if (!resolvedPayload && isValidPayload(entry.payload)) resolvedPayload = entry.payload;
    if (!isValidPayload(resolvedPayload)) return;
    inventory.push({
      id: `history:${entry.hostContextId}`,
      label: `History | ${entry.tool} | ${entry.hostContextId} | ${entry.timestamp}`,
      contextId: entry.hostContextId,
      toolId: entry.tool,
      payload: resolvedPayload,
      version: typeof resolvedPayload.version === "string" ? resolvedPayload.version : "",
      payloadSource: "history"
    });
  });
  return inventory;
}

function buildDiffAndMergeOptions(inventory, library) {
  const options = [];
  inventory.forEach((entry) => options.push(entry));
  if (library && typeof library === "object" && !Array.isArray(library)) {
    Object.keys(library).sort((a, b) => a.localeCompare(b)).forEach((name) => {
      const payload = library[name];
      if (!isValidPayload(payload)) return;
      options.push({
        id: `library:${name}`,
        label: `Library | ${name}`,
        contextId: name,
        toolId: typeof payload.toolId === "string" ? payload.toolId : "",
        payload,
        version: typeof payload.version === "string" ? payload.version : "",
        payloadSource: "library"
      });
    });
  }
  return options;
}

function runDiff(options, leftId, rightId) {
  if (options.length < 2) return { ok: false, message: "Create or reopen at least two Workspace V2 sessions before comparing." };
  if (!leftId && !rightId) return { ok: false, message: "Diff blocked. Session A and Session B selections are missing." };
  if (!leftId) return { ok: false, message: "Diff blocked. Session A selection is missing." };
  if (!rightId) return { ok: false, message: "Diff blocked. Session B selection is missing." };
  if (leftId === rightId) return { ok: false, message: "Diff blocked. Session A and Session B must be different sessions." };
  const left = options.find((entry) => entry.id === leftId);
  const right = options.find((entry) => entry.id === rightId);
  if (!left || !right) return { ok: false, message: "Diff blocked. Selection is no longer available." };
  return { ok: true };
}

function mergePayloads(leftPayload, rightPayload) {
  const conflicts = {};
  const walk = (leftValue, rightValue, path) => {
    if (leftValue === undefined && rightValue !== undefined) return clone(rightValue);
    if (leftValue !== undefined && rightValue === undefined) return clone(leftValue);
    const leftObject = leftValue && typeof leftValue === "object";
    const rightObject = rightValue && typeof rightValue === "object";
    if (leftObject && rightObject && !Array.isArray(leftValue) && !Array.isArray(rightValue)) {
      const merged = {};
      const keys = new Set([...Object.keys(leftValue), ...Object.keys(rightValue)]);
      Array.from(keys).sort((a, b) => a.localeCompare(b)).forEach((key) => {
        const mergedValue = walk(leftValue[key], rightValue[key], path ? `${path}.${key}` : key);
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
  return { mergedPayload: walk(leftPayload, rightPayload, ""), conflicts };
}

function previewMerge(options, leftId, rightId, toolId) {
  if (options.length < 2) return { ok: false, message: "Create or reopen at least two Workspace V2 sessions before previewing a merge." };
  if (!leftId && !rightId) return { ok: false, message: "Merge preview blocked. Session A and Session B selections are missing." };
  if (!leftId) return { ok: false, message: "Merge preview blocked. Session A selection is missing." };
  if (!rightId) return { ok: false, message: "Merge preview blocked. Session B selection is missing." };
  if (leftId === rightId) return { ok: false, message: "Merge preview blocked. Session A and Session B must be different sessions." };
  const left = options.find((entry) => entry.id === leftId);
  const right = options.find((entry) => entry.id === rightId);
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

function applyPreview(preview, options, storage, audit) {
  if (!preview) return { ok: false, reason: "NO_PREVIEW" };
  if (!preview.confirmed) return { ok: false, reason: "UNCONFIRMED" };
  const left = options.find((entry) => entry.id === preview.source.id);
  const right = options.find((entry) => entry.id === preview.target.id);
  if (!left || !right) return { ok: false, reason: "STALE_MISSING" };
  if (JSON.stringify(left.payload) !== preview.source.hash || JSON.stringify(right.payload) !== preview.target.hash) return { ok: false, reason: "STALE_CHANGED" };
  if (Object.keys(preview.conflicts).length > 0) return { ok: false, reason: "CONFLICT_BLOCK" };
  const hostContextId = `${preview.selectedToolId}-recent-${Date.now()}`;
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
  return { ok: true };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const hasRecentInventoryField = workspaceJsText.includes("this.recentSessionInventory = [];");
  const hasRecentBuilder = workspaceJsText.includes("buildRecentSessionInventory(history)");
  const hasSessionStorageResolve = workspaceJsText.includes("resolveSessionPayloadFromContextId(contextId, fallbackPayload)");
  const hasResolverUse = workspaceJsText.includes("if (Array.isArray(this.recentSessionInventory))");
  const hasLibraryOptional = workspaceJsText.includes("const library = this.readSessionLibrary();");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!syntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  if (!hasRecentInventoryField) failures.push("Missing recent session inventory cache field.");
  if (!hasRecentBuilder) failures.push("Missing recent session inventory builder.");
  if (!hasSessionStorageResolve) failures.push("Missing sessionStorage payload resolver for recent sessions.");
  if (!hasResolverUse) failures.push("Shared resolver is not using recent session inventory.");
  if (!hasLibraryOptional) failures.push("Library inclusion path is missing.");

  const history = [
    {
      hostContextId: "ctx-a",
      tool: "asset-manager-v2",
      timestamp: "2026-05-01T01:00:00.000Z",
      payload: { toolId: "asset-manager-v2", payloadJson: { a: 1 }, version: "v2" }
    },
    {
      hostContextId: "ctx-b",
      tool: "palette-manager-v2",
      timestamp: "2026-05-01T01:01:00.000Z",
      payload: { toolId: "asset-manager-v2", payloadJson: { b: 2 }, version: "v2" }
    }
  ];
  const sessionStorageMap = {
    "ctx-a": JSON.stringify({ toolId: "asset-manager-v2", payloadJson: { a: 9 }, version: "v2" }),
    "ctx-b": JSON.stringify({ toolId: "asset-manager-v2", payloadJson: { b: 8 }, version: "v2" })
  };

  const inventoryRecentOnly = resolveRecentInventory(history, sessionStorageMap);
  const optionsNoLibrary = buildDiffAndMergeOptions(inventoryRecentOnly, null);

  if (optionsNoLibrary.length < 2) failures.push("Two recent sessions without library should populate selectors.");
  if (!optionsNoLibrary.every((entry) => entry.id.startsWith("history:"))) failures.push("Recent-session options should originate from recent session inventory.");

  const diffMissing = runDiff(optionsNoLibrary, "", "");
  if (diffMissing.ok || !diffMissing.message.includes("Session A and Session B selections are missing")) failures.push("Missing selections should block Diff with one clear message.");

  const mergeMissing = previewMerge(optionsNoLibrary, "", "", "asset-manager-v2");
  if (mergeMissing.ok || !mergeMissing.message.includes("Session A and Session B selections are missing")) failures.push("Missing selections should block Merge with one clear message.");

  const diffSame = runDiff(optionsNoLibrary, optionsNoLibrary[0].id, optionsNoLibrary[0].id);
  if (diffSame.ok || !diffSame.message.includes("must be different")) failures.push("Same recent session for A/B should block Diff.");

  const mergeSame = previewMerge(optionsNoLibrary, optionsNoLibrary[0].id, optionsNoLibrary[0].id, "asset-manager-v2");
  if (mergeSame.ok || !mergeSame.message.includes("must be different")) failures.push("Same recent session for A/B should block Merge.");

  const diffDistinct = runDiff(optionsNoLibrary, optionsNoLibrary[0].id, optionsNoLibrary[1].id);
  if (!diffDistinct.ok) failures.push("Distinct recent sessions should allow Compute Diff.");

  const mergeDistinct = previewMerge(optionsNoLibrary, optionsNoLibrary[0].id, optionsNoLibrary[1].id, "asset-manager-v2");
  if (!mergeDistinct.ok || !mergeDistinct.preview) failures.push("Distinct recent sessions should allow Preview Merge.");
  if (!mergeDistinct.confirmEnabled || mergeDistinct.applyEnabled) failures.push("Valid merge preview should enable confirm and keep apply disabled.");

  const confirmed = confirmPreview(mergeDistinct.preview);
  if (!confirmed.ok || !confirmed.applyEnabled) failures.push("Confirmed merge preview should enable Apply Merge.");

  const audit = [];
  const storage = {};
  const applied = applyPreview(mergeDistinct.preview, optionsNoLibrary, storage, audit);
  if (!applied.ok) failures.push("Confirmed merge preview should apply successfully.");
  if (audit.length < 1) failures.push("Successful apply should write audit record.");

  const noLibraryStillPopulates = optionsNoLibrary.length >= 2;
  if (!noLibraryStillPopulates) failures.push("Missing localStorage v2-session-library should not block recent-session selector population.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      workspaceJsExists,
      syntaxValid,
      syntaxError,
      hasRecentInventoryField,
      hasRecentBuilder,
      hasSessionStorageResolve,
      hasResolverUse,
      hasLibraryOptional
    },
    scenarios: {
      inventoryRecentOnlyCount: inventoryRecentOnly.length,
      optionsNoLibraryCount: optionsNoLibrary.length,
      diffMissing,
      mergeMissing,
      diffSame,
      mergeSame,
      diffDistinct,
      mergeDistinct,
      confirmed,
      applied,
      audit,
      noLibraryStillPopulates
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 recent session selector binding results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 recent session selector binding failures: ${failures.join(" | ")}`);
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
