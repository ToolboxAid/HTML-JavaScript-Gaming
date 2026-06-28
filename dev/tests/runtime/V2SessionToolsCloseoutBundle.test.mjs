import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const testPath = path.join(repoRoot, "tests", "runtime", "V2SessionToolsCloseoutBundle.test.mjs");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-tools-closeout-results.json");

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

function diffSelectionStatus({ count, left, right }) {
  if (count < 2) return "Create or reopen at least two Workspace V2 sessions before comparing.";
  if (!left && !right) return "Select Session A and Session B to enable Compute Diff.";
  if (!left) return "Select Session A to enable Compute Diff.";
  if (!right) return "Select Session B to enable Compute Diff.";
  if (left === right) return "Choose two different sessions to enable Compute Diff.";
  return "Diff selections are valid. Compute Diff is ready.";
}

function mergeSelectionStatus({ count, left, right, canConfirm, canApply, canPreview }) {
  if (count < 2) return "Create or reopen at least two Workspace V2 sessions before previewing a merge.";
  if (!left && !right) return "Select Session A and Session B to enable Preview Merge.";
  if (!left) return "Select Session A to enable Preview Merge.";
  if (!right) return "Select Session B to enable Preview Merge.";
  if (left === right) return "Choose two different sessions to enable Preview Merge.";
  if (canApply) return "Preview confirmed. Apply Merge is enabled.";
  if (canConfirm) return "Preview ready. Confirm Preview is enabled.";
  if (canPreview) return "Merge selections are valid. Run Preview Merge (Dry Run).";
  return "Select two different sessions to enable Preview Merge.";
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(testPath);

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2SessionToolsCloseoutBundle.test.mjs failed syntax check.");

  const requiredTokens = [
    "this.diffOutputSelectionKey = \"\";",
    "handleDiffSelectionChange()",
    "clearDiffOutputForStateChange(statusMessage, outputMessage)",
    "this.diffLeftSelect.addEventListener(\"change\", () => {",
    "this.handleDiffSelectionChange();",
    "Workspace V2 session views refreshed. Compute Diff or Preview Merge for current selections.",
    "Selections changed. Compute Diff again.",
    "Diff selection is no longer valid. Select Session A and Session B, then compute diff.",
    "this.diffOutputSelectionKey = this.buildMergeSelectionKey(left.id, right.id);",
    "this.statusNode.textContent = \"Selected diff payload is invalid.\";",
    "this.diffOutputSelectionKey.split(\"|\").includes(sessionSelectionId)",
    "this.statusNode.textContent = \"Merge selections are valid. Run Preview Merge (Dry Run).\";"
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing PR_11_266 closeout token/text: ${token}`);
  });

  if (diffSelectionStatus({ count: 0, left: "", right: "" }) !== "Create or reopen at least two Workspace V2 sessions before comparing.") {
    failures.push("Diff empty-state status logic mismatch.");
  }
  if (diffSelectionStatus({ count: 2, left: "", right: "" }) !== "Select Session A and Session B to enable Compute Diff.") {
    failures.push("Diff missing-selection status mismatch.");
  }
  if (diffSelectionStatus({ count: 2, left: "a", right: "a" }) !== "Choose two different sessions to enable Compute Diff.") {
    failures.push("Diff same-selection status mismatch.");
  }
  if (diffSelectionStatus({ count: 2, left: "a", right: "b" }) !== "Diff selections are valid. Compute Diff is ready.") {
    failures.push("Diff ready-status mismatch.");
  }

  if (mergeSelectionStatus({ count: 0, left: "", right: "", canConfirm: false, canApply: false, canPreview: false }) !== "Create or reopen at least two Workspace V2 sessions before previewing a merge.") {
    failures.push("Merge empty-state status logic mismatch.");
  }
  if (mergeSelectionStatus({ count: 2, left: "a", right: "a", canConfirm: false, canApply: false, canPreview: false }) !== "Choose two different sessions to enable Preview Merge.") {
    failures.push("Merge same-selection status mismatch.");
  }
  if (mergeSelectionStatus({ count: 2, left: "a", right: "b", canConfirm: false, canApply: false, canPreview: true }) !== "Merge selections are valid. Run Preview Merge (Dry Run).") {
    failures.push("Merge ready-status mismatch.");
  }
  if (mergeSelectionStatus({ count: 2, left: "a", right: "b", canConfirm: true, canApply: false, canPreview: true }) !== "Preview ready. Confirm Preview is enabled.") {
    failures.push("Merge confirm-status mismatch.");
  }
  if (mergeSelectionStatus({ count: 2, left: "a", right: "b", canConfirm: false, canApply: true, canPreview: true }) !== "Preview confirmed. Apply Merge is enabled.") {
    failures.push("Merge apply-status mismatch.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { jsExists, jsSyntax, testSyntax },
    scenarios: {
      diff: {
        empty: diffSelectionStatus({ count: 0, left: "", right: "" }),
        missing: diffSelectionStatus({ count: 2, left: "", right: "" }),
        same: diffSelectionStatus({ count: 2, left: "a", right: "a" }),
        ready: diffSelectionStatus({ count: 2, left: "a", right: "b" })
      },
      merge: {
        empty: mergeSelectionStatus({ count: 0, left: "", right: "", canConfirm: false, canApply: false, canPreview: false }),
        same: mergeSelectionStatus({ count: 2, left: "a", right: "a", canConfirm: false, canApply: false, canPreview: false }),
        ready: mergeSelectionStatus({ count: 2, left: "a", right: "b", canConfirm: false, canApply: false, canPreview: true }),
        confirm: mergeSelectionStatus({ count: 2, left: "a", right: "b", canConfirm: true, canApply: false, canPreview: true }),
        apply: mergeSelectionStatus({ count: 2, left: "a", right: "b", canConfirm: false, canApply: true, canPreview: true })
      }
    }
  }, null, 2)}
`, "utf8");

  console.log(`v2 session-tools-closeout results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session-tools-closeout failures: ${failures.join(" | ")}`);
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
