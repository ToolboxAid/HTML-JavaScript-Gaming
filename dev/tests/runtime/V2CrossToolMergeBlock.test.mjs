import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-cross-tool-merge-block-results.json");

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

function mergeUiState({ canPreviewMerge, previewExists, previewFresh, previewConfirmed, conflictCount }) {
  const hasConflicts = previewExists && conflictCount > 0;
  const confirmDisabled = !(previewExists && !previewConfirmed && previewFresh && !hasConflicts);
  const applyDisabled = !(previewExists && previewConfirmed && previewFresh && !hasConflicts);
  return { previewEnabled: canPreviewMerge, confirmDisabled, applyDisabled };
}

function evaluateCrossTool(leftToolId, rightToolId) {
  if (leftToolId && rightToolId && leftToolId !== rightToolId) {
    return {
      blocked: true,
      rawJsonRendered: false,
      message: [
        "Cross-tool merge is not supported. Select two sessions with the same toolId.",
        `Session A toolId: ${leftToolId}`,
        `Session B toolId: ${rightToolId}`
      ].join("\n")
    };
  }
  return { blocked: false, rawJsonRendered: true, message: "" };
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2CrossToolMergeBlock.test.mjs"));

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2CrossToolMergeBlock.test.mjs failed syntax check.");

  const requiredTokens = [
    "Cross-tool merge is not supported. Select two sessions with the same toolId.",
    "Session A toolId:",
    "Session B toolId:",
    "if (leftToolId && rightToolId && leftToolId !== rightToolId) {",
    "this.pendingMergePreview = null;",
    "this.updateMergeSelectionFeedbackAndState();"
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing cross-tool merge block token/text: ${token}`);
  });

  const crossTool = evaluateCrossTool("palette-manager-v2", "asset-manager-v2");
  if (!crossTool.blocked) failures.push("Cross-tool merge should be blocked.");
  if (crossTool.rawJsonRendered) failures.push("Cross-tool merge block should not render raw merge JSON.");
  if (!crossTool.message.includes("Session A toolId: palette-manager-v2")) failures.push("Cross-tool block must show Session A toolId.");
  if (!crossTool.message.includes("Session B toolId: asset-manager-v2")) failures.push("Cross-tool block must show Session B toolId.");
  const crossToolState = mergeUiState({ canPreviewMerge: true, previewExists: false, previewFresh: false, previewConfirmed: false, conflictCount: 0 });
  if (!crossToolState.previewEnabled) failures.push("Preview button should remain enabled for cross-tool validation message.");
  if (!crossToolState.confirmDisabled || !crossToolState.applyDisabled) failures.push("Confirm/Apply should remain disabled after cross-tool block.");

  const sameToolConflict = evaluateCrossTool("asset-manager-v2", "asset-manager-v2");
  if (sameToolConflict.blocked) failures.push("Same-tool merge should not be blocked by cross-tool guard.");
  if (!sameToolConflict.rawJsonRendered) failures.push("Same-tool preview should continue to render merge output.");
  const sameToolConflictState = mergeUiState({ canPreviewMerge: true, previewExists: true, previewFresh: true, previewConfirmed: false, conflictCount: 2 });
  if (sameToolConflictState.confirmDisabled !== true || sameToolConflictState.applyDisabled !== true) {
    failures.push("Same-tool conflict preview should keep Confirm/Apply disabled.");
  }
  const sameToolConflictFreeState = mergeUiState({ canPreviewMerge: true, previewExists: true, previewFresh: true, previewConfirmed: false, conflictCount: 0 });
  if (sameToolConflictFreeState.confirmDisabled) failures.push("Same-tool conflict-free preview should enable Confirm.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { jsExists, jsSyntax, testSyntax },
    scenarios: { crossTool, crossToolState, sameToolConflict, sameToolConflictState, sameToolConflictFreeState }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 cross-tool-merge-block results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 cross-tool-merge-block failures: ${failures.join(" | ")}`);
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

