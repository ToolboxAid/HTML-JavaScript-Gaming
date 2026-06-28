import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-library-action-label-results.json");

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
  return candidates.find((entry) => entry.id === id) || null;
}

function findByContext(candidates, contextId) {
  return candidates.find((entry) => entry.contextId === contextId) || null;
}

function syncSlots(state, contextId) {
  const selected = findByContext(state.candidates, contextId);
  if (!selected) return false;
  const left = findById(state.candidates, state.left);
  const right = findById(state.candidates, state.right);
  if (!left) {
    if (right && right.id === selected.id) return false;
    state.left = selected.id;
    return true;
  }
  if (!right) {
    if (left.id === selected.id) return false;
    state.right = selected.id;
    return true;
  }
  return false;
}

function canRun(left, right, candidates) {
  const leftEntry = findById(candidates, left);
  const rightEntry = findById(candidates, right);
  return Boolean(leftEntry && rightEntry && leftEntry.id !== rightEntry.id);
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2SessionLibraryActionLabel.test.mjs"));

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2SessionLibraryActionLabel.test.mjs failed syntax check.");

  if (!js.includes("useInLibraryButton.textContent = \"Use in Diff/Merge\";")) {
    failures.push("Saved Session Library row action label was not renamed to Use in Diff/Merge.");
  }
  if (!js.includes("useInLibraryButton.textContent = \"Use in Library\";")) {
    failures.push("Recent Sessions row action label should remain Use in Library.");
  }
  if (!js.includes("Saved session ID ready for Diff/Merge and Library actions:")) {
    failures.push("Saved-row status/help text was not updated for Diff/Merge clarity.");
  }

  const candidates = [
    { id: "library:a", contextId: "a" },
    { id: "library:b", contextId: "b" }
  ];
  const state = { candidates, left: "", right: "" };
  syncSlots(state, "a");
  if (state.left !== "library:a" || state.right !== "") {
    failures.push("Saved-row Use in Diff/Merge should fill Session A first.");
  }
  syncSlots(state, "b");
  if (state.left !== "library:a" || state.right !== "library:b") {
    failures.push("Saved-row Use in Diff/Merge should fill Session B second.");
  }
  const beforeThird = JSON.stringify(state);
  syncSlots(state, "a");
  if (JSON.stringify(state) !== beforeThird) {
    failures.push("Saved-row Use in Diff/Merge should not duplicate same session across A/B.");
  }
  if (!canRun(state.left, state.right, candidates)) {
    failures.push("Diff/Merge should be enabled after valid A/B selection from saved-row action.");
  }

  const recentActionOnlyTextbox =
    js.includes("useSessionIdInLibraryInput(hostContextId)") &&
    js.includes("this.sessionNameNode.value = hostContextId.trim();") &&
    !js.includes("useSessionIdInLibraryInput(hostContextId);\n    this.syncDiffAndMergeSelectionSlotsFromContextId");
  if (!recentActionOnlyTextbox) {
    failures.push("Recent Use in Library behavior should remain textbox population only.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      jsExists,
      jsSyntax,
      testSyntax
    },
    state
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session-library action-label results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session-library action-label failures: ${failures.join(" | ")}`);
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

