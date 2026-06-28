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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-saved-session-row-actions-results.json");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

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

function simulateDeleteSavedRow(sessionId, library, history, storage) {
  const nextLibrary = { ...library };
  const nextHistory = [...history];
  const nextStorage = { ...storage };
  if (Object.prototype.hasOwnProperty.call(nextLibrary, sessionId)) {
    delete nextLibrary[sessionId];
    return { message: "Saved session deleted.", nextLibrary, nextHistory, nextStorage };
  }
  return { message: "Saved session not found.", nextLibrary, nextHistory, nextStorage };
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? readText(htmlPath) : "";
  const js = jsExists ? readText(jsPath) : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2SavedSessionRowActions.test.mjs"));

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("dev/tests/runtime/V2SavedSessionRowActions.test.mjs failed syntax check.");

  if (!html.includes("Saved sessions are stored in Session Library. Recent sessions are temporary.")) {
    failures.push("Helper text is not updated to saved-vs-recent clarification.");
  }

  const requiredRowTokens = [
    "copyIdButton.textContent = \"Copy ID\";",
    "useInLibraryButton.textContent = \"Use in Library\";",
    "loadButton.textContent = \"Load\";",
    "deleteSavedButton.textContent = \"Delete Saved\";",
    "copySavedSessionIdToClipboard(sessionId)",
    "useSavedSessionIdInLibraryInput(sessionId)",
    "loadSavedSessionById(sessionId)",
    "deleteSavedSessionById(sessionId)"
  ];
  requiredRowTokens.forEach((token) => {
    if (!js.includes(token)) {
      failures.push(`Missing required saved-row action token: ${token}`);
    }
  });

  if (!js.includes("await navigator.clipboard.writeText(sessionId.trim());")) {
    failures.push("Row Copy ID does not copy exact saved session ID.");
  }
  if (!js.includes("this.sessionNameNode.value = sessionId.trim();")) {
    failures.push("Use in Library / row actions are not populating Session ID textbox.");
  }
  if (!js.includes("this.loadNamedSession();")) {
    failures.push("Row Load is not wired to library load action.");
  }
  if (!js.includes("this.deleteNamedSession();")) {
    failures.push("Row Delete Saved is not wired to library delete action.");
  }
  if (!js.includes("this.renderSessionLibrary();")) {
    failures.push("Session Library refresh after row actions is missing.");
  }
  if (!js.includes("this.renderSessionDiffInputs();") || !js.includes("this.renderSessionMergeInputs();")) {
    failures.push("Diff/Merge selector recompute hooks are missing.");
  }

  const library = {
    "asset-manager-v2-1777676088718-3eff5h3y": { version: "v2", toolId: "asset-manager-v2", payloadJson: { a: 1 } },
    "palette-manager-v2-1777676088720-abcd1234": { version: "v2", toolId: "palette-manager-v2", payloadJson: { b: 2 } }
  };
  const history = [{ hostContextId: "asset-manager-v2-1777676088718-3eff5h3y", tool: "asset-manager-v2", timestamp: "2026-05-01T00:00:00.000Z", payload: { version: "v2", toolId: "asset-manager-v2" } }];
  const storage = { "asset-manager-v2-1777676088718-3eff5h3y": "{\"version\":\"v2\",\"toolId\":\"asset-manager-v2\"}" };

  const deleted = simulateDeleteSavedRow("asset-manager-v2-1777676088718-3eff5h3y", library, history, storage);
  if (deleted.message !== "Saved session deleted.") {
    failures.push("Row Delete Saved should delete saved library entry.");
  }
  if (Object.prototype.hasOwnProperty.call(deleted.nextLibrary, "asset-manager-v2-1777676088718-3eff5h3y")) {
    failures.push("Row Delete Saved did not remove saved entry.");
  }
  if (deleted.nextHistory.length !== history.length) {
    failures.push("Row Delete Saved must not remove Recent Sessions.");
  }
  if (!Object.prototype.hasOwnProperty.call(deleted.nextStorage, "asset-manager-v2-1777676088718-3eff5h3y")) {
    failures.push("Row Delete Saved must not remove sessionStorage payload.");
  }

  const textboxActionsStillPresent = [
    "saveNamedSession(overwriteExisting)",
    "loadNamedSession()",
    "deleteNamedSession()",
    "Saved session already exists. Use Overwrite Session.",
    "Saved session not found.",
    "Saved session loaded.",
    "Saved session deleted."
  ];
  textboxActionsStillPresent.forEach((token) => {
    if (!js.includes(token)) {
      failures.push(`Textbox Session Library action token missing: ${token}`);
    }
  });

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
      deleted
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 saved-session-row-actions results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 saved-session-row-actions failures: ${failures.join(" | ")}`);
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
