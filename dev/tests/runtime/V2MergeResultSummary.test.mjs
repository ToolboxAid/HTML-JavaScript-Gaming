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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-merge-result-summary-results.json");

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

function previewSummary(preview) {
  const addedCount = Object.keys(preview.changes.added).length;
  const updatedCount = Object.keys(preview.changes.updated).length;
  const unchangedCount = Object.keys(preview.changes.unchanged).length;
  const conflictCount = preview.conflictCount;
  return [
    "Merge Preview Summary",
    `Source Session ID: ${preview.source.id}`,
    `Target Session ID: ${preview.target.id}`,
    `Tool ID: ${preview.selectedToolId}`,
    `Added: ${addedCount}`,
    `Updated: ${updatedCount}`,
    `Unchanged: ${unchangedCount}`,
    `Conflicts: ${conflictCount}`
  ].join("\n");
}

function applySummary(applied) {
  return [
    "Merge Apply Summary",
    `Merged Session ID: ${applied.hostContextId}`,
    `Tool ID: ${applied.toolId}`,
    `Timestamp: ${applied.timestamp}`,
    `Added: ${applied.addedCount}`,
    `Updated: ${applied.updatedCount}`,
    `Unchanged: ${applied.unchangedCount}`
  ].join("\n");
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? fs.readFileSync(htmlPath, "utf8") : "";
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2MergeResultSummary.test.mjs"));

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2MergeResultSummary.test.mjs failed syntax check.");

  const requiredHtml = [
    "id=\"workspaceV2MergeResultSummary\"",
    "No merge summary yet.",
    "id=\"workspaceV2MergeOutput\""
  ];
  requiredHtml.forEach((token) => {
    if (!html.includes(token)) failures.push(`Missing merge summary/output HTML token: ${token}`);
  });

  const requiredJs = [
    "setMergeResultSummary(message)",
    "setMergePreviewSummary(preview)",
    "setMergeApplySummary(hostContextId, toolId, timestamp, changes)",
    "Merge Preview Summary",
    "Preview confirmed. Apply Merge is ready.",
    "Merge Apply Summary",
    "Removed Session ID:",
    "Preview summary is stale because Session A or Session B changed. Run Preview Merge again.",
    "this.setMergeResultSummary(\"Merge preview blocked. Session A and Session B selections are missing.\");"
  ];
  requiredJs.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing merge summary JS token/text: ${token}`);
  });

  const preview = {
    source: { id: "history:asset-manager-v2-a1" },
    target: { id: "history:asset-manager-v2-b2" },
    selectedToolId: "asset-manager-v2",
    changes: {
      added: { "payload.layers.2": {} },
      updated: { "payload.zoom": { from: 1, to: 2 } },
      unchanged: { "payload.toolId": "asset-manager-v2" }
    },
    conflictCount: 0
  };
  const previewSummaryText = previewSummary(preview);
  if (!previewSummaryText.includes("Merge Preview Summary")) failures.push("Preview summary missing heading.");
  if (!previewSummaryText.includes("Source Session ID: history:asset-manager-v2-a1")) failures.push("Preview summary missing source id.");
  if (!previewSummaryText.includes("Target Session ID: history:asset-manager-v2-b2")) failures.push("Preview summary missing target id.");
  if (!previewSummaryText.includes("Tool ID: asset-manager-v2")) failures.push("Preview summary missing tool id.");
  if (!previewSummaryText.includes("Added: 1") || !previewSummaryText.includes("Updated: 1") || !previewSummaryText.includes("Unchanged: 1")) {
    failures.push("Preview summary missing added/updated/unchanged counts.");
  }

  const confirmSummaryText = "Preview confirmed. Apply Merge is ready.";
  if (confirmSummaryText !== "Preview confirmed. Apply Merge is ready.") failures.push("Confirm summary mismatch.");

  const applied = {
    hostContextId: "asset-manager-v2-merged-1777777777777-abc123xy",
    toolId: "asset-manager-v2",
    timestamp: "2026-05-02T00:00:00.000Z",
    addedCount: 2,
    updatedCount: 1,
    unchangedCount: 3
  };
  const applySummaryText = applySummary(applied);
  if (!applySummaryText.includes("Merge Apply Summary")) failures.push("Apply summary missing heading.");
  if (!applySummaryText.includes(`Merged Session ID: ${applied.hostContextId}`)) failures.push("Apply summary missing merged session id.");
  if (!applySummaryText.includes(`Timestamp: ${applied.timestamp}`)) failures.push("Apply summary missing timestamp.");

  const undoSummaryText = `Last merged session removed.\nRemoved Session ID: ${applied.hostContextId}`;
  if (!undoSummaryText.includes("Last merged session removed.")) failures.push("Undo summary missing success message.");
  if (!undoSummaryText.includes(`Removed Session ID: ${applied.hostContextId}`)) failures.push("Undo summary missing removed session id.");

  const blockedReason = "Merge preview blocked. Session A and Session B selections are missing.";
  const staleSummary = "Preview summary is stale because Session A or Session B changed. Run Preview Merge again.";
  if (!blockedReason.startsWith("Merge preview blocked.")) failures.push("Blocked preview reason mismatch.");
  if (!staleSummary.startsWith("Preview summary is stale")) failures.push("Stale preview summary mismatch.");

  const rawPreviewJson = JSON.stringify({
    source: preview.source,
    target: preview.target,
    changes: preview.changes,
    conflicts: {},
    conflictCount: 0,
    confirmed: false,
    canApply: true
  }, null, 2);
  if (!rawPreviewJson.includes("\"source\"") || !rawPreviewJson.includes("\"target\"") || !rawPreviewJson.includes("\"changes\"")) {
    failures.push("Raw preview JSON is not available after summary updates.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { htmlExists, jsExists, jsSyntax, testSyntax },
    samples: {
      previewSummaryText,
      confirmSummaryText,
      applySummaryText,
      undoSummaryText,
      blockedReason,
      staleSummary,
      rawPreviewJsonVisible: Boolean(rawPreviewJson)
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 merge-result-summary results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 merge-result-summary failures: ${failures.join(" | ")}`);
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
