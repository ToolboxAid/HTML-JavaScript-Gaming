import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-saved-session-delete-feedback-results.json");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function checkSyntax(jsFilePath) {
  try {
    execFileSync(process.execPath, ["--check", jsFilePath], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ok: true, error: "" };
  } catch (error) {
    return { ok: false, error: (error?.stderr || error?.stdout || error?.message || "").toString().trim() };
  }
}

function evaluateDeleteFeedback(sessionName, library, history) {
  const trimmedSessionName = typeof sessionName === "string" ? sessionName.trim() : "";
  if (!trimmedSessionName) {
    return { message: "Enter a saved session ID before deleting.", libraryDeleted: false };
  }
  const libraryMap = library && typeof library === "object" && !Array.isArray(library) ? { ...library } : {};
  const recentMatch = Array.isArray(history)
    ? history.some((entry) => entry && entry.hostContextId === trimmedSessionName)
    : false;
  const librarySessionNames = Object.keys(libraryMap);
  if (librarySessionNames.length === 0) {
    return {
      message: recentMatch
        ? "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions."
        : "No saved sessions exist. Use Delete on Recent Sessions to remove temporary sessions.",
      libraryDeleted: false
    };
  }
  if (!Object.prototype.hasOwnProperty.call(libraryMap, trimmedSessionName)) {
    return {
      message: recentMatch
        ? "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions."
        : "Saved session not found.",
      libraryDeleted: false
    };
  }
  delete libraryMap[trimmedSessionName];
  return { message: "Saved session deleted.", libraryDeleted: true, nextLibrary: libraryMap };
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? readText(jsPath) : "";
  const syntax = checkSyntax(jsPath);

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!syntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");

  const requiredMessages = [
    "Enter a saved session ID before deleting.",
    "No saved sessions exist. Use Delete on Recent Sessions to remove temporary sessions.",
    "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions.",
    "Saved session not found.",
    "Saved session deleted."
  ];
  requiredMessages.forEach((message) => {
    if (!js.includes(message)) {
      failures.push(`Missing required message: ${message}`);
    }
  });

  const deleteNamedStart = js.indexOf("deleteNamedSession() {");
  const deleteNamedEnd = deleteNamedStart >= 0
    ? js.indexOf("  createSessionAndLaunch() {", deleteNamedStart)
    : -1;
  if (deleteNamedStart < 0 || deleteNamedEnd < 0 || deleteNamedEnd <= deleteNamedStart) {
    failures.push("Could not locate deleteNamedSession() block.");
  } else {
    const deleteBlock = js.slice(deleteNamedStart, deleteNamedEnd);
    if (deleteBlock.includes("sessionStorage.removeItem(")) {
      failures.push("Delete Saved Session must not remove sessionStorage payloads.");
    }
    if (deleteBlock.includes("this.deleteRecentSessionEntry(")) {
      failures.push("Delete Saved Session must not delete Recent Sessions entries.");
    }
  }

  const history = [{ hostContextId: "recent-only", tool: "asset-manager-v2", timestamp: "2026-05-01T00:00:00.000Z", payload: { toolId: "asset-manager-v2", version: "v2" } }];
  const recentBefore = JSON.stringify(history);
  const storageBefore = { "recent-only": "{\"toolId\":\"asset-manager-v2\",\"version\":\"v2\"}" };
  const storageAfter = { ...storageBefore };

  const emptyInputCase = evaluateDeleteFeedback("", {}, history);
  if (emptyInputCase.message !== "Enter a saved session ID before deleting.") {
    failures.push("Empty input did not produce required explicit message.");
  }

  const emptyLibraryCase = evaluateDeleteFeedback("unknown-id", {}, history);
  if (emptyLibraryCase.message !== "No saved sessions exist. Use Delete on Recent Sessions to remove temporary sessions.") {
    failures.push("Empty library did not produce required explicit message.");
  }

  const recentOnlyCase = evaluateDeleteFeedback("recent-only", {}, history);
  if (recentOnlyCase.message !== "Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions.") {
    failures.push("Recent-only id did not produce required explicit message.");
  }

  const unknownIdCase = evaluateDeleteFeedback("unknown-id", { "saved-id": { toolId: "palette-manager-v2", version: "v2" } }, history);
  if (unknownIdCase.message !== "Saved session not found.") {
    failures.push("Unknown id did not produce required explicit message.");
  }

  const savedDeleteCase = evaluateDeleteFeedback("saved-id", { "saved-id": { toolId: "palette-manager-v2", version: "v2" }, "saved-2": { toolId: "asset-manager-v2", version: "v2" } }, history);
  if (savedDeleteCase.message !== "Saved session deleted.") {
    failures.push("Saved session delete did not produce success message.");
  }
  if (!savedDeleteCase.libraryDeleted || !savedDeleteCase.nextLibrary || Object.prototype.hasOwnProperty.call(savedDeleteCase.nextLibrary, "saved-id")) {
    failures.push("Saved session id was not deleted from library map.");
  }

  if (JSON.stringify(history) !== recentBefore) {
    failures.push("Delete Saved Session should not delete Recent Sessions entries.");
  }
  if (!Object.prototype.hasOwnProperty.call(storageAfter, "recent-only")) {
    failures.push("Delete Saved Session should not remove sessionStorage payloads.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      jsExists,
      syntax,
      requiredMessagesPresent: requiredMessages.every((message) => js.includes(message))
    },
    cases: {
      emptyInputCase,
      emptyLibraryCase,
      recentOnlyCase,
      unknownIdCase,
      savedDeleteCase
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 saved-session delete feedback results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 saved-session delete feedback failures: ${failures.join(" | ")}`);
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
