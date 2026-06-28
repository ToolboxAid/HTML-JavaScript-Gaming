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
const testPath = path.join(repoRoot, "tests", "runtime", "V2DiffViewerSummaryCounts.test.mjs");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-diff-viewer-summary-counts-results.json");

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

function buildDiffSummary(diff) {
  const addedCount = Object.keys(diff.added).length;
  const removedCount = Object.keys(diff.removed).length;
  const changedCount = Object.keys(diff.changed).length;
  if (addedCount === 0 && removedCount === 0 && changedCount === 0) {
    return "No differences (added: 0, removed: 0, changed: 0)";
  }
  return `Differences detected (added: ${addedCount}, removed: ${removedCount}, changed: ${changedCount})`;
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? fs.readFileSync(htmlPath, "utf8") : "";
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(testPath);

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2DiffViewerSummaryCounts.test.mjs failed syntax check.");

  if (!html.includes('id="workspaceV2DiffSummary"')) {
    failures.push("Missing Diff summary node in Workspace V2 Diff Viewer.");
  }
  if (!js.includes("this.diffSummaryNode = document.getElementById(\"workspaceV2DiffSummary\");")) {
    failures.push("Diff summary node is not wired in JS.");
  }
  if (!js.includes("No differences (added: 0, removed: 0, changed: 0)")) {
    failures.push("Missing no-difference summary text.");
  }
  if (!js.includes("Differences detected (added: ${addedCount}, removed: ${removedCount}, changed: ${changedCount})")) {
    failures.push("Missing diff-exists summary text.");
  }
  if (!js.includes("this.diffSummaryNode.textContent = \"\";")) {
    failures.push("Diff summary clear path missing for stale summary reset.");
  }

  const noDiffSummary = buildDiffSummary({ added: {}, removed: {}, changed: {} });
  const withDiffSummary = buildDiffSummary({
    added: { "a.b": 1, "a.c": 2 },
    removed: { old: true },
    changed: { "x.y": { from: 1, to: 2 } }
  });
  if (noDiffSummary !== "No differences (added: 0, removed: 0, changed: 0)") {
    failures.push("No-diff summary formatting mismatch.");
  }
  if (withDiffSummary !== "Differences detected (added: 2, removed: 1, changed: 1)") {
    failures.push("Diff summary count formatting mismatch.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      htmlExists,
      jsExists,
      jsSyntax,
      testSyntax
    },
    scenarios: {
      noDiffSummary,
      withDiffSummary
    }
  }, null, 2)}
`, "utf8");

  console.log(`v2 diff-viewer summary-counts results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 diff-viewer summary-counts failures: ${failures.join(" | ")}`);
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
