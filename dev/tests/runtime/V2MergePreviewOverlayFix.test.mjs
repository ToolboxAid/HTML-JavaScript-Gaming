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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-merge-preview-overlay-fix-results.json");

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

function computeMergeUiState({ canPreviewMerge, previewExists, previewFresh, previewConfirmed, previewHasConflicts }) {
  let mergeEnableState = "Select two different sessions to enable Preview Merge.";
  let confirmDisabled = true;
  let applyDisabled = true;

  if (canPreviewMerge) {
    const previewReadyForConfirm = Boolean(previewExists && !previewConfirmed && previewFresh && !previewHasConflicts);
    const previewReadyForApply = Boolean(previewExists && previewConfirmed && previewFresh && !previewHasConflicts);
    confirmDisabled = !previewReadyForConfirm;
    applyDisabled = !previewReadyForApply;
    if (previewHasConflicts && previewFresh) {
      mergeEnableState = "Preview has conflicts. Resolve conflicts before applying.";
    } else if (previewReadyForApply) {
      mergeEnableState = "Preview confirmed. Ready to apply merge.";
    } else if (previewReadyForConfirm) {
      mergeEnableState = "Preview ready. Confirm to enable apply.";
    } else {
      mergeEnableState = "Ready to preview merge.";
    }
  }

  return { mergeEnableState, confirmDisabled, applyDisabled };
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? fs.readFileSync(htmlPath, "utf8") : "";
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2MergePreviewOverlayFix.test.mjs"));

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2MergePreviewOverlayFix.test.mjs failed syntax check.");

  if (!html.includes("id=\"workspaceV2MergeOutput\"")) failures.push("Merge preview output node is missing.");
  if (!html.includes("max-height: 18rem; overflow: auto; position: relative;")) {
    failures.push("Merge preview output container is not explicitly bounded/contained.");
  }
  if (html.includes("position: fixed") || html.includes("inset: 0")) {
    failures.push("Unexpected page-wide overlay styles found in merge panel HTML.");
  }

  const requiredStatusTexts = [
    "Ready to preview merge.",
    "Preview ready. Confirm to enable apply.",
    "Preview confirmed. Ready to apply merge.",
    "Preview has conflicts. Resolve conflicts before applying."
  ];
  requiredStatusTexts.forEach((text) => {
    if (!js.includes(text)) failures.push(`Missing merge status text: ${text}`);
  });

  const beforePreview = computeMergeUiState({
    canPreviewMerge: true,
    previewExists: false,
    previewFresh: false,
    previewConfirmed: false,
    previewHasConflicts: false
  });
  if (beforePreview.mergeEnableState !== "Ready to preview merge.") failures.push("Before preview status mismatch.");
  if (!beforePreview.confirmDisabled) failures.push("Confirm should be disabled before preview.");
  if (!beforePreview.applyDisabled) failures.push("Apply should be disabled before preview.");

  const previewReady = computeMergeUiState({
    canPreviewMerge: true,
    previewExists: true,
    previewFresh: true,
    previewConfirmed: false,
    previewHasConflicts: false
  });
  if (previewReady.mergeEnableState !== "Preview ready. Confirm to enable apply.") failures.push("Preview-ready status mismatch.");
  if (previewReady.confirmDisabled) failures.push("Confirm should be enabled after valid non-conflict preview.");
  if (!previewReady.applyDisabled) failures.push("Apply should stay disabled before confirm.");

  const previewConfirmed = computeMergeUiState({
    canPreviewMerge: true,
    previewExists: true,
    previewFresh: true,
    previewConfirmed: true,
    previewHasConflicts: false
  });
  if (previewConfirmed.mergeEnableState !== "Preview confirmed. Ready to apply merge.") failures.push("Preview-confirmed status mismatch.");
  if (!previewConfirmed.confirmDisabled) failures.push("Confirm should be disabled once preview is confirmed.");
  if (previewConfirmed.applyDisabled) failures.push("Apply should be enabled after confirmed fresh preview.");

  const conflictPreview = computeMergeUiState({
    canPreviewMerge: true,
    previewExists: true,
    previewFresh: true,
    previewConfirmed: false,
    previewHasConflicts: true
  });
  if (conflictPreview.mergeEnableState !== "Preview has conflicts. Resolve conflicts before applying.") {
    failures.push("Conflict preview status mismatch.");
  }
  if (!conflictPreview.confirmDisabled || !conflictPreview.applyDisabled) {
    failures.push("Conflict preview should keep Confirm/Apply disabled.");
  }

  const noSelection = computeMergeUiState({
    canPreviewMerge: false,
    previewExists: false,
    previewFresh: false,
    previewConfirmed: false,
    previewHasConflicts: false
  });
  if (noSelection.mergeEnableState !== "Select two different sessions to enable Preview Merge.") {
    failures.push("No-selection status mismatch.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { htmlExists, jsExists, jsSyntax, testSyntax },
    states: { noSelection, beforePreview, previewReady, previewConfirmed, conflictPreview }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 merge-preview-overlay-fix results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 merge-preview-overlay-fix failures: ${failures.join(" | ")}`);
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

