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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-confirm-preview-enable-state-results.json");

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

function evaluateState({ canPreviewMerge, previewExists, previewFresh, previewConfirmed, conflictCount }) {
  const hasConflicts = previewExists && conflictCount > 0;
  const previewReadyForConfirm = previewExists && !previewConfirmed && previewFresh && !hasConflicts;
  const previewReadyForApply = previewExists && previewConfirmed && previewFresh && !hasConflicts;
  const confirmDisabled = !previewReadyForConfirm;
  const applyDisabled = !previewReadyForApply;
  let status = "Select two different sessions to enable Preview Merge.";
  if (canPreviewMerge) {
    if (previewExists && !previewFresh) status = "Preview is stale. Run Preview Merge again.";
    else if (hasConflicts) status = "Preview has conflicts. Resolve conflicts before applying.";
    else if (previewReadyForApply) status = "Preview confirmed. Ready to apply merge.";
    else if (previewReadyForConfirm) status = "Preview ready. Confirm to enable apply.";
    else status = "Ready to preview merge.";
  }
  return { confirmDisabled, applyDisabled, status };
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? fs.readFileSync(htmlPath, "utf8") : "";
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2ConfirmPreviewEnableState.test.mjs"));

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2ConfirmPreviewEnableState.test.mjs failed syntax check.");

  const requiredTokens = [
    "conflictCount: Object.keys(result.conflicts).length",
    "previewFingerprint:",
    "Preview ready. Confirm to enable apply.",
    "Preview confirmed. Ready to apply merge.",
    "Preview has conflicts. Resolve conflicts before applying.",
    "Preview is stale. Run Preview Merge again."
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing merge preview state token/text: ${token}`);
  });

  if (!html.includes("id=\"workspaceV2MergeOutput\"") || !html.includes("max-height: 18rem; overflow: auto; position: relative;")) {
    failures.push("Merge preview output container is not explicitly contained.");
  }

  const noSelection = evaluateState({ canPreviewMerge: false, previewExists: false, previewFresh: false, previewConfirmed: false, conflictCount: 0 });
  if (noSelection.status !== "Select two different sessions to enable Preview Merge.") failures.push("No-selection status mismatch.");

  const readyToPreview = evaluateState({ canPreviewMerge: true, previewExists: false, previewFresh: false, previewConfirmed: false, conflictCount: 0 });
  if (readyToPreview.status !== "Ready to preview merge.") failures.push("Ready-to-preview status mismatch.");

  const previewReady = evaluateState({ canPreviewMerge: true, previewExists: true, previewFresh: true, previewConfirmed: false, conflictCount: 0 });
  if (previewReady.confirmDisabled) failures.push("Conflict-free fresh preview should enable Confirm.");
  if (!previewReady.applyDisabled) failures.push("Apply must remain disabled before Confirm.");
  if (previewReady.status !== "Preview ready. Confirm to enable apply.") failures.push("Preview-ready status mismatch.");

  const previewConfirmed = evaluateState({ canPreviewMerge: true, previewExists: true, previewFresh: true, previewConfirmed: true, conflictCount: 0 });
  if (!previewConfirmed.confirmDisabled) failures.push("Confirm should disable after confirmation.");
  if (previewConfirmed.applyDisabled) failures.push("Apply should enable after confirmed fresh preview.");
  if (previewConfirmed.status !== "Preview confirmed. Ready to apply merge.") failures.push("Preview-confirmed status mismatch.");

  const conflictPreview = evaluateState({ canPreviewMerge: true, previewExists: true, previewFresh: true, previewConfirmed: false, conflictCount: 2 });
  if (!conflictPreview.confirmDisabled || !conflictPreview.applyDisabled) failures.push("Conflict preview must disable Confirm and Apply.");
  if (conflictPreview.status !== "Preview has conflicts. Resolve conflicts before applying.") failures.push("Conflict status mismatch.");

  const stalePreview = evaluateState({ canPreviewMerge: true, previewExists: true, previewFresh: false, previewConfirmed: false, conflictCount: 0 });
  if (!stalePreview.confirmDisabled || !stalePreview.applyDisabled) failures.push("Stale preview must disable Confirm and Apply.");
  if (stalePreview.status !== "Preview is stale. Run Preview Merge again.") failures.push("Stale status mismatch.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { htmlExists, jsExists, jsSyntax, testSyntax },
    states: { noSelection, readyToPreview, previewReady, previewConfirmed, conflictPreview, stalePreview }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 confirm-preview-enable-state results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 confirm-preview-enable-state failures: ${failures.join(" | ")}`);
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

