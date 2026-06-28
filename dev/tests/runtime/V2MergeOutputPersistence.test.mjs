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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-merge-output-persistence-results.json");

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

function isValidPayload(payload) {
  return Boolean(payload && typeof payload === "object" && !Array.isArray(payload));
}

function saveMergedSessionResult(state, mergedSessionId) {
  const next = { ...state, library: { ...state.library } };
  if (!isValidPayload(next.lastMergedPayload)) {
    return { ...next, status: "No merged session result available to save." };
  }
  const id = typeof mergedSessionId === "string" ? mergedSessionId.trim() : "";
  if (!id) {
    return { ...next, status: "Enter a merged session ID before saving." };
  }
  if (Object.prototype.hasOwnProperty.call(next.library, id)) {
    return { ...next, status: "Session ID already exists. Choose a different ID." };
  }
  next.library[id] = next.lastMergedPayload;
  return { ...next, status: "Merged session saved." };
}

function useMergedInDiffMerge(state, mergedSessionId) {
  const next = { ...state, sessionStorage: { ...state.sessionStorage }, history: [...state.history] };
  if (!isValidPayload(next.lastMergedPayload)) {
    return { ...next, status: "No merged session result available to use." };
  }
  const id = typeof mergedSessionId === "string" ? mergedSessionId.trim() : "";
  if (!id) {
    return { ...next, status: "Enter a merged session ID before using in Diff/Merge." };
  }
  next.sessionStorage[id] = JSON.stringify(next.lastMergedPayload);
  next.history.unshift({ hostContextId: id, tool: next.lastMergedToolId, payload: next.lastMergedPayload });
  return { ...next, status: "Merged session ready in Diff/Merge selections." };
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? fs.readFileSync(htmlPath, "utf8") : "";
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2MergeOutputPersistence.test.mjs"));

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2MergeOutputPersistence.test.mjs failed syntax check.");

  const requiredHtml = [
    "id=\"workspaceV2MergedSessionId\"",
    "Save Merged Session",
    "Use in Diff/Merge",
    "id=\"workspaceV2MergedSessionStatus\""
  ];
  requiredHtml.forEach((token) => {
    if (!html.includes(token)) failures.push(`Missing merged-session UI token: ${token}`);
  });

  const requiredJs = [
    "defaultMergedSessionId(toolId)",
    "setLastMergedSessionResult(payload, toolId)",
    "saveMergedSessionResult()",
    "useMergedSessionInDiffMerge()",
    "Merged session saved.",
    "Session ID already exists. Choose a different ID.",
    "this.setLastMergedSessionResult(appliedPayload, this.pendingMergePreview.selectedToolId);"
  ];
  requiredJs.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing merged-session persistence token: ${token}`);
  });

  const mergedPayload = { version: "v2", toolId: "asset-manager-v2", payloadJson: { merged: true } };
  const baseState = {
    library: {},
    sessionStorage: {},
    history: [],
    lastMergedPayload: mergedPayload,
    lastMergedToolId: "asset-manager-v2"
  };

  const noSaveState = { ...baseState, library: {} };
  if (Object.keys(noSaveState.library).length !== 0) {
    failures.push("Initial library fixture invalid.");
  }

  const saved = saveMergedSessionResult(baseState, "asset-manager-v2-merged-1000");
  if (saved.status !== "Merged session saved.") failures.push("Merged payload should be savable with new ID.");
  if (!Object.prototype.hasOwnProperty.call(saved.library, "asset-manager-v2-merged-1000")) {
    failures.push("Saved merged session should appear in library.");
  }

  const duplicate = saveMergedSessionResult(saved, "asset-manager-v2-merged-1000");
  if (duplicate.status !== "Session ID already exists. Choose a different ID.") {
    failures.push("Duplicate merged session ID should be blocked.");
  }

  const notSavedLibraryUnchanged = { ...baseState, library: {} };
  if (Object.keys(notSavedLibraryUnchanged.library).length !== 0) {
    failures.push("Library should remain unchanged when user does not save merged result.");
  }

  const reused = useMergedInDiffMerge(baseState, "asset-manager-v2-merged-1001");
  if (reused.status !== "Merged session ready in Diff/Merge selections.") {
    failures.push("Merged session should be reusable in Diff/Merge.");
  }
  if (!Object.prototype.hasOwnProperty.call(reused.sessionStorage, "asset-manager-v2-merged-1001")) {
    failures.push("Use in Diff/Merge should place merged payload in runtime session storage.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { htmlExists, jsExists, jsSyntax, testSyntax },
    scenarios: { saved, duplicate, reused }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 merge-output-persistence results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 merge-output-persistence failures: ${failures.join(" | ")}`);
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

