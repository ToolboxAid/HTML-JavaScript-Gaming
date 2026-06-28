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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-merge-conflict-summary-results.json");

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

function truncatePreview(value, maxLength) {
  const text = typeof value === "string" ? value : String(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)} ...truncated (${text.length - maxLength} more chars)`;
}

function conflictValuePreview(value) {
  if (value === undefined) return "undefined";
  const json = JSON.stringify(value);
  return truncatePreview(json === undefined ? String(value) : json, 140);
}

function buildConflictSummary(conflicts) {
  const entries = Object.entries(conflicts || {});
  if (entries.length === 0) return "";
  const lines = [
    "Conflict preview only. Apply is blocked until conflicts are resolved.",
    `Total conflicts: ${entries.length}`
  ];
  entries.sort((a, b) => a[0].localeCompare(b[0])).forEach(([path, values]) => {
    lines.push(`- ${path}`);
    lines.push(`  source: ${conflictValuePreview(values && Object.prototype.hasOwnProperty.call(values, "a") ? values.a : undefined)}`);
    lines.push(`  target: ${conflictValuePreview(values && Object.prototype.hasOwnProperty.call(values, "b") ? values.b : undefined)}`);
  });
  return lines.join("\n");
}

function mergeUiState(conflictCount, fresh, confirmed) {
  const hasConflicts = conflictCount > 0;
  const confirmDisabled = !(fresh && !confirmed && !hasConflicts);
  const applyDisabled = !(fresh && confirmed && !hasConflicts);
  return { confirmDisabled, applyDisabled };
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? fs.readFileSync(htmlPath, "utf8") : "";
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2MergeConflictSummary.test.mjs"));

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2MergeConflictSummary.test.mjs failed syntax check.");

  if (!html.includes("id=\"workspaceV2MergeConflictSummary\"")) failures.push("Missing merge conflict summary node.");
  if (!html.includes("id=\"workspaceV2MergeOutput\"")) failures.push("Missing raw merge JSON preview node.");
  if (!js.includes("renderMergeConflictSummary()")) failures.push("Missing renderMergeConflictSummary implementation.");
  if (!js.includes("Conflict preview only. Apply is blocked until conflicts are resolved.")) failures.push("Missing required conflict inline text.");
  if (!js.includes("Total conflicts:")) failures.push("Missing conflict count summary rendering.");
  if (!js.includes("source: ${this.conflictValuePreview")) failures.push("Missing source value preview rendering.");
  if (!js.includes("target: ${this.conflictValuePreview")) failures.push("Missing target value preview rendering.");

  const conflicts = {
    "payload.layers[1].tiles[3]": { a: 4, b: 9 },
    "payload.palette.primary": { a: "#ff0000", b: "#00ff00" }
  };
  const summary = buildConflictSummary(conflicts);
  if (!summary.includes("Total conflicts: 2")) failures.push("Conflict summary did not include total conflict count.");
  if (!summary.includes("- payload.layers[1].tiles[3]")) failures.push("Conflict summary missing path listing.");
  if (!summary.includes("source: 4")) failures.push("Conflict summary missing source value preview.");
  if (!summary.includes("target: 9")) failures.push("Conflict summary missing target value preview.");
  if (!summary.includes("- payload.palette.primary")) failures.push("Conflict summary missing second path.");

  const conflictState = mergeUiState(2, true, false);
  if (!conflictState.confirmDisabled || !conflictState.applyDisabled) {
    failures.push("Confirm/Apply should remain disabled for conflict preview.");
  }

  const conflictFreeState = mergeUiState(0, true, false);
  if (conflictFreeState.confirmDisabled) {
    failures.push("Conflict-free fresh preview should enable Confirm.");
  }

  const noConflictSummary = buildConflictSummary({});
  if (noConflictSummary !== "") {
    failures.push("Conflict-free preview should not render conflict summary.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { htmlExists, jsExists, jsSyntax, testSyntax },
    sampleSummary: summary,
    states: { conflictState, conflictFreeState }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 merge-conflict-summary results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 merge-conflict-summary failures: ${failures.join(" | ")}`);
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

