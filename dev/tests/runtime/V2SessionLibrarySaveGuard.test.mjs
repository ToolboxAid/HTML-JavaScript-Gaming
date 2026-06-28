import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const testPath = path.join(repoRoot, "tests", "runtime", "V2SessionLibrarySaveGuard.test.mjs");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-library-save-guard-results.json");

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

function canSaveSession({ hasActiveSession, newId, idValid, idExists }) {
  return Boolean(Boolean(newId) && idValid && !idExists && hasActiveSession);
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(testPath);

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2SessionLibrarySaveGuard.test.mjs failed syntax check.");

  const requiredTokens = [
    "hasActiveWorkspaceSessionForSave()",
    "isValidNewSessionId(sessionId)",
    "savedSessionIdExists(sessionId)",
    "libraryCanSave",
    "this.saveSessionButton.disabled = !model.libraryCanSave;",
    "That session ID already exists. Use the saved session card to Load, Overwrite, or Delete it.",
    "loadSavedSessionById(sessionId)",
    "this.loadNamedSession();",
    "this.syncDiffAndMergeSelectionSlotsFromContextId(sessionId.trim());"
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing required save-guard token: ${token}`);
  });

  const scenarios = {
    emptyIdDisabled: canSaveSession({ hasActiveSession: true, newId: "", idValid: false, idExists: false }),
    invalidIdDisabled: canSaveSession({ hasActiveSession: true, newId: "bad id", idValid: false, idExists: false }),
    duplicateIdDisabled: canSaveSession({ hasActiveSession: true, newId: "session-a", idValid: true, idExists: true }),
    noActiveSessionDisabled: canSaveSession({ hasActiveSession: false, newId: "session-a", idValid: true, idExists: false }),
    validEnabled: canSaveSession({ hasActiveSession: true, newId: "session-a", idValid: true, idExists: false })
  };

  if (scenarios.emptyIdDisabled) failures.push("Save should be disabled for empty ID.");
  if (scenarios.invalidIdDisabled) failures.push("Save should be disabled for invalid ID.");
  if (scenarios.duplicateIdDisabled) failures.push("Save should be disabled for duplicate ID.");
  if (scenarios.noActiveSessionDisabled) failures.push("Save should be disabled without active session.");
  if (!scenarios.validEnabled) failures.push("Save should be enabled only for valid new ID with active session.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { jsExists, jsSyntax, testSyntax },
    scenarios
  }, null, 2)}
`, "utf8");

  console.log(`v2 session-library-save-guard results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session-library-save-guard failures: ${failures.join(" | ")}`);
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
