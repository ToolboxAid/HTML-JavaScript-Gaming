import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const testPath = path.join(repoRoot, "tests", "runtime", "V2SessionLibraryCardOverwrite.test.mjs");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-library-card-overwrite-results.json");

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

function overwriteSavedSession(library, sessionId, activePayload) {
  const next = JSON.parse(JSON.stringify(library));
  if (!sessionId || !Object.prototype.hasOwnProperty.call(next, sessionId)) {
    return { ok: false, message: "Saved session not found. Use Save Session to create it first.", library: next };
  }
  if (!activePayload || typeof activePayload !== "object" || Array.isArray(activePayload)) {
    return { ok: false, message: "No active Workspace V2 session is available to overwrite from.", library: next };
  }
  next[sessionId] = JSON.parse(JSON.stringify(activePayload));
  return { ok: true, message: "Saved session updated.", library: next };
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(testPath);

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2SessionLibraryCardOverwrite.test.mjs failed syntax check.");

  const requiredTokens = [
    "overwriteButton.textContent = \"Overwrite\";",
    "overwriteButton.disabled = !canOverwriteFromActiveSession;",
    "overwriteSavedSessionById(sessionId)",
    "No active Workspace V2 session is available to overwrite from.",
    "Saved session updated."
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing overwrite-card token/text: ${token}`);
  });

  const initialLibrary = {
    "saved-1": { version: "v2", toolId: "palette-manager-v2", payloadJson: { original: true } },
    "saved-2": { version: "v2", toolId: "asset-manager-v2", payloadJson: { untouched: true } }
  };
  const activePayload = { version: "v2", toolId: "palette-manager-v2", payloadJson: { updated: true } };

  const noActive = overwriteSavedSession(initialLibrary, "saved-1", null);
  if (noActive.ok || noActive.message !== "No active Workspace V2 session is available to overwrite from.") {
    failures.push("Overwrite should be blocked without active session.");
  }

  const missingSaved = overwriteSavedSession(initialLibrary, "missing-id", activePayload);
  if (missingSaved.ok || missingSaved.message !== "Saved session not found. Use Save Session to create it first.") {
    failures.push("Overwrite should require an existing saved session ID.");
  }

  const overwritten = overwriteSavedSession(initialLibrary, "saved-1", activePayload);
  if (!overwritten.ok || overwritten.message !== "Saved session updated.") {
    failures.push("Overwrite should succeed and return update confirmation.");
  }
  if (!overwritten.library["saved-1"] || overwritten.library["saved-1"].payloadJson?.updated !== true) {
    failures.push("Overwrite should replace saved payload with active payload.");
  }
  if (Object.keys(overwritten.library).length !== Object.keys(initialLibrary).length) {
    failures.push("Overwrite should not create a new saved session entry.");
  }
  if (overwritten.library["saved-2"].payloadJson?.untouched !== true) {
    failures.push("Overwrite should not mutate other saved session entries.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { jsExists, jsSyntax, testSyntax },
    scenarios: { noActive, missingSaved, overwritten }
  }, null, 2)}
`, "utf8");

  console.log(`v2 session-library-card-overwrite results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session-library-card-overwrite failures: ${failures.join(" | ")}`);
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
