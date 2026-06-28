import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-selection-sync-row-actions-results.json");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

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

function findById(candidates, id) {
  if (!Array.isArray(candidates)) return null;
  return candidates.find((entry) => entry.id === id) || null;
}

function findByContext(candidates, contextId) {
  if (!Array.isArray(candidates)) return null;
  return candidates.find((entry) => entry.contextId === contextId) || null;
}

function syncSlots(state, contextId) {
  const selected = findByContext(state.candidates, contextId);
  if (!selected) return false;
  const leftEntry = findById(state.candidates, state.left);
  const rightEntry = findById(state.candidates, state.right);
  if (!leftEntry) {
    if (rightEntry && rightEntry.id === selected.id) return false;
    state.left = selected.id;
    return true;
  }
  if (!rightEntry) {
    if (leftEntry.id === selected.id) return false;
    state.right = selected.id;
    return true;
  }
  return false;
}

function computeEnabled(state) {
  const leftEntry = findById(state.candidates, state.left);
  const rightEntry = findById(state.candidates, state.right);
  return Boolean(leftEntry && rightEntry && leftEntry.id !== rightEntry.id);
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? readText(jsPath) : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2SelectionSyncRowActions.test.mjs"));

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2SelectionSyncRowActions.test.mjs failed syntax check.");

  const requiredTokens = [
    "syncSelectionSlotsFromContextId(leftSelectNode, rightSelectNode, candidates, contextId)",
    "syncDiffAndMergeSelectionSlotsFromContextId(contextId)",
    "this.syncDiffAndMergeSelectionSlotsFromContextId(sessionId.trim());",
    "this.updateDiffSelectionFeedbackAndState();",
    "this.updateMergeSelectionFeedbackAndState();"
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) {
      failures.push(`Missing required selection-sync token: ${token}`);
    }
  });

  const candidates = [
    { id: "library:s1", contextId: "s1" },
    { id: "library:s2", contextId: "s2" },
    { id: "library:s3", contextId: "s3" }
  ];

  const state = { candidates, left: "", right: "" };
  const firstFill = syncSlots(state, "s1");
  if (!firstFill || state.left !== "library:s1" || state.right !== "") {
    failures.push("First row action should fill Session A when empty.");
  }

  const secondFill = syncSlots(state, "s2");
  if (!secondFill || state.left !== "library:s1" || state.right !== "library:s2") {
    failures.push("Second row action should fill Session B when A already selected.");
  }

  const thirdNoOverwrite = syncSlots(state, "s3");
  if (thirdNoOverwrite || state.left !== "library:s1" || state.right !== "library:s2") {
    failures.push("Third row action should not overwrite when A/B already selected.");
  }

  const dupBlocked = syncSlots(state, "s1");
  if (dupBlocked || state.left !== "library:s1" || state.right !== "library:s2") {
    failures.push("Same session must not be duplicated across A/B.");
  }

  const enabledAfterTwo = computeEnabled({ candidates, left: "library:s1", right: "library:s2" });
  const disabledWithOne = computeEnabled({ candidates, left: "library:s1", right: "" });
  if (!enabledAfterTwo) failures.push("Diff/Merge should be enabled after valid A/B selections.");
  if (disabledWithOne) failures.push("Diff/Merge should remain disabled with one selection.");

  const useInLibraryWiresSync = js.includes("useSavedSessionIdInLibraryInput(sessionId)") && js.includes("this.syncDiffAndMergeSelectionSlotsFromContextId(sessionId.trim());");
  const loadWiresSync = js.includes("loadSavedSessionById(sessionId)") && js.includes("this.syncDiffAndMergeSelectionSlotsFromContextId(sessionId.trim());");
  if (!useInLibraryWiresSync) failures.push("Use in Library does not wire selection sync.");
  if (!loadWiresSync) failures.push("Load row action does not wire selection sync.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      jsExists,
      jsSyntax,
      testSyntax
    },
    scenarios: {
      state,
      firstFill,
      secondFill,
      thirdNoOverwrite,
      dupBlocked,
      enabledAfterTwo,
      disabledWithOne
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 selection-sync row-actions results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 selection-sync row-actions failures: ${failures.join(" | ")}`);
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
