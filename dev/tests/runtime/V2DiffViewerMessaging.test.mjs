import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const testPath = path.join(repoRoot, "tests", "runtime", "V2DiffViewerMessaging.test.mjs");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-diff-viewer-messaging-results.json");

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

function diffStatusMessage(diff) {
  if (
    Object.keys(diff.added).length === 0 &&
    Object.keys(diff.removed).length === 0 &&
    Object.keys(diff.changed).length === 0
  ) {
    return "No differences. The selected sessions are identical.";
  }
  return "Differences detected between selected sessions.";
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(testPath);

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2DiffViewerMessaging.test.mjs failed syntax check.");

  if (!js.includes("No differences. The selected sessions are identical.")) {
    failures.push("Missing empty-diff message.");
  }
  if (!js.includes("Differences detected between selected sessions.")) {
    failures.push("Missing non-empty diff message.");
  }
  if (js.includes("Session diff computed.")) {
    failures.push("Legacy vague diff message should be removed.");
  }

  const emptyDiffMessage = diffStatusMessage({ added: {}, removed: {}, changed: {} });
  const changedDiffMessage = diffStatusMessage({ added: {}, removed: {}, changed: { key: { from: 1, to: 2 } } });
  if (emptyDiffMessage !== "No differences. The selected sessions are identical.") {
    failures.push("Empty diff status message mismatch.");
  }
  if (changedDiffMessage !== "Differences detected between selected sessions.") {
    failures.push("Changed diff status message mismatch.");
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
    scenarios: {
      emptyDiffMessage,
      changedDiffMessage
    }
  }, null, 2)}
`, "utf8");

  console.log(`v2 diff-viewer messaging results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 diff-viewer messaging failures: ${failures.join(" | ")}`);
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
