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
const testPath = path.join(repoRoot, "tests", "runtime", "V2SessionLibraryActionCleanup.test.mjs");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-library-action-cleanup-results.json");

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
  if (!testSyntax.ok) failures.push("tests/runtime/V2SessionLibraryActionCleanup.test.mjs failed syntax check.");

  const requiredHtmlTokens = [
    '<label for="workspaceV2SessionName">New Session ID (Save Session)</label>',
    '<button id="workspaceV2SaveSessionButton" type="button">Save Session</button>',
    '<button id="workspaceV2OverwriteSessionButton" type="button" hidden>Overwrite Session</button>',
    '<button id="workspaceV2LoadSessionButton" type="button" hidden>Load Session</button>',
    '<button id="workspaceV2DeleteSessionButton" type="button" hidden>Delete Saved Session</button>',
    "Save creates a new saved copy from the active Workspace V2 session. Load from a saved card makes that saved session the active Workspace V2 session. Overwrite replaces this saved session with what you are currently working on. Delete removes the saved copy only."
  ];
  requiredHtmlTokens.forEach((token) => {
    if (!html.includes(token)) failures.push(`Missing expected Session Library cleanup HTML token: ${token}`);
  });

  const requiredJsTokens = [
    'this.setLibraryStatus("That session ID already exists. Use the saved session card to Load or Overwrite it.");',
    "Saved session '${sessionName}' created.",
    'loadButton.textContent = "Load";',
    'overwriteButton.textContent = "Overwrite";',
    'deleteSavedButton.textContent = "Delete Saved";',
    'useInLibraryButton.textContent = "Use in Diff/Merge";'
  ];
  requiredJsTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing expected Session Library cleanup JS token: ${token}`);
  });

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { htmlExists, jsExists, jsSyntax, testSyntax }
  }, null, 2)}
`, "utf8");

  console.log(`v2 session-library-action-cleanup results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session-library-action-cleanup failures: ${failures.join(" | ")}`);
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
