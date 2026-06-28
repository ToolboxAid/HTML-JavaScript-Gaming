import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-ux-stabilization-results.json");

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

function libraryActionState(sessionName) {
  const hasSessionInput = Boolean(typeof sessionName === "string" && sessionName.trim());
  return {
    saveDisabled: !hasSessionInput,
    overwriteDisabled: !hasSessionInput,
    loadDisabled: !hasSessionInput,
    deleteDisabled: !hasSessionInput
  };
}

function mergeEnableText({ canPreviewMerge, previewFresh, previewHasConflicts, previewConfirmed, previewExists }) {
  if (!canPreviewMerge) {
    return "Select two different sessions to enable Preview Merge.";
  }
  if (previewExists && !previewFresh) {
    return "Preview is stale. Run Preview Merge again.";
  }
  if (previewExists && previewHasConflicts) {
    return "Preview has conflicts. Resolve conflicts before applying.";
  }
  if (previewExists && previewConfirmed && previewFresh && !previewHasConflicts) {
    return "Apply Merge is enabled.";
  }
  if (previewExists && !previewConfirmed && previewFresh && !previewHasConflicts) {
    return "Confirm Preview is enabled.";
  }
  return "Preview Merge is enabled.";
}

function diffEnableText(canRunDiff) {
  return canRunDiff ? "Compute Diff is enabled." : "Select two different sessions to enable Compute Diff.";
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2SessionUxStabilization.test.mjs"));

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2SessionUxStabilization.test.mjs failed syntax check.");

  const requiredTokens = [
    "updateSessionLibraryActionState()",
    "this.sessionNameNode.addEventListener(\"input\", () => {",
    "this.renderSessionLibrary();",
    "this.renderSessionHistory();",
    "Workspace V2 session views refreshed.",
    "Compute Diff is enabled.",
    "Preview Merge is enabled.",
    "Confirm Preview is enabled.",
    "Apply Merge is enabled.",
    "Preview confirmed. Apply Merge is enabled.",
    "Merged session is available for save.",
    "clearMergePanelTransientState("
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing PR_11_263 UX stabilization token/text: ${token}`);
  });

  const removedTokens = [
    "Ready to compute diff.",
    "Ready to preview merge.",
    "Preview ready. Confirm to enable apply.",
    "Preview confirmed. Ready to apply merge.",
    "Merged session ready. Choose an ID and save if desired."
  ];
  removedTokens.forEach((token) => {
    if (js.includes(token)) failures.push(`Deprecated/misleading hint text still present: ${token}`);
  });

  const emptyInput = libraryActionState("");
  if (!emptyInput.saveDisabled || !emptyInput.overwriteDisabled || !emptyInput.loadDisabled || !emptyInput.deleteDisabled) {
    failures.push("Library actions should be disabled when session input is empty.");
  }
  const filledInput = libraryActionState("asset-manager-v2-123");
  if (filledInput.saveDisabled || filledInput.overwriteDisabled || filledInput.loadDisabled || filledInput.deleteDisabled) {
    failures.push("Library actions should be enabled when session input is present.");
  }

  const mergeNoPreview = mergeEnableText({
    canPreviewMerge: true,
    previewFresh: false,
    previewHasConflicts: false,
    previewConfirmed: false,
    previewExists: false
  });
  if (mergeNoPreview !== "Preview Merge is enabled.") {
    failures.push("Merge enable text should reflect immediate current state when selection is valid and preview not present.");
  }
  const mergeReadyConfirm = mergeEnableText({
    canPreviewMerge: true,
    previewFresh: true,
    previewHasConflicts: false,
    previewConfirmed: false,
    previewExists: true
  });
  if (mergeReadyConfirm !== "Confirm Preview is enabled.") {
    failures.push("Merge enable text should indicate Confirm enablement for fresh conflict-free preview.");
  }
  const mergeReadyApply = mergeEnableText({
    canPreviewMerge: true,
    previewFresh: true,
    previewHasConflicts: false,
    previewConfirmed: true,
    previewExists: true
  });
  if (mergeReadyApply !== "Apply Merge is enabled.") {
    failures.push("Merge enable text should indicate Apply enablement after confirmed fresh preview.");
  }

  if (diffEnableText(true) !== "Compute Diff is enabled.") {
    failures.push("Diff enable text should indicate immediate enabled state.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { jsExists, jsSyntax, testSyntax },
    scenarios: {
      emptyInput,
      filledInput,
      mergeNoPreview,
      mergeReadyConfirm,
      mergeReadyApply,
      diffEnabled: diffEnableText(true)
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session-ux-stabilization results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session-ux-stabilization failures: ${failures.join(" | ")}`);
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
