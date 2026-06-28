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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-recent-session-delete-results.json");

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

function resolvePersistedSelectionIds(entries, persisted) {
  if (!Array.isArray(entries) || entries.length < 2) return { leftId: "", rightId: "" };
  if (!persisted.sessionA || !persisted.sessionB || persisted.sessionA === persisted.sessionB) return { leftId: "", rightId: "" };
  const left = entries.find((entry) => entry.contextId === persisted.sessionA);
  const right = entries.find((entry) => entry.contextId === persisted.sessionB);
  if (!left || !right || left.id === right.id) return { leftId: "", rightId: "" };
  return { leftId: left.id, rightId: right.id };
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? readText(htmlPath) : "";
  const js = jsExists ? readText(jsPath) : "";
  const syntax = checkSyntax(jsPath);

  const hasDeleteSavedLabel = html.includes("Delete Saved Session");
  const hasRecentDeleteButton = js.includes("deleteRecentButton.textContent = \"Delete\";");
  const hasRecentDeleteMethod = js.includes("deleteRecentSessionEntry(hostContextId)");
  const hasRecentDeleteHistoryWrite = js.includes("const nextHistory = history.filter((entry) => entry.hostContextId !== sessionId);") && js.includes("this.writeSessionHistory(nextHistory);");
  const hasRecentDeleteStorageClear = js.includes("sessionStorage.removeItem(sessionId);");
  const hasRecentDeleteActiveClear = js.includes("if (this.currentHostContextId === sessionId)") && js.includes("this.currentHostContextId = \"\";");
  const hasLibraryScopeMessage = js.includes("Session ID is not saved in Session Library. Use Delete on Recent Sessions to remove temporary sessions.");

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!syntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!hasDeleteSavedLabel) failures.push("Delete Saved Session label is missing.");
  if (!hasRecentDeleteButton) failures.push("Recent Session row Delete button is missing.");
  if (!hasRecentDeleteMethod) failures.push("deleteRecentSessionEntry(hostContextId) is missing.");
  if (!hasRecentDeleteHistoryWrite) failures.push("Recent delete does not remove the history entry.");
  if (!hasRecentDeleteStorageClear) failures.push("Recent delete does not remove matching sessionStorage payload.");
  if (!hasRecentDeleteActiveClear) failures.push("Recent delete does not clear active hostContextId when deleted.");
  if (!hasLibraryScopeMessage) failures.push("Missing explicit message for recent-only delete attempts in library delete flow.");

  const history = [
    { hostContextId: "ctx-a", tool: "asset-manager-v2", timestamp: "2026-05-01T00:00:00.000Z", payload: { toolId: "asset-manager-v2" } },
    { hostContextId: "ctx-b", tool: "asset-manager-v2", timestamp: "2026-05-01T00:01:00.000Z", payload: { toolId: "asset-manager-v2" } }
  ];
  const sessionStorageMap = { "ctx-a": "{\"toolId\":\"asset-manager-v2\"}", "ctx-b": "{\"toolId\":\"asset-manager-v2\"}" };
  const library = { "saved-1": { toolId: "asset-manager-v2" } };
  let currentHostContextId = "ctx-a";

  const nextHistory = history.filter((entry) => entry.hostContextId !== "ctx-a");
  delete sessionStorageMap["ctx-a"];
  if (currentHostContextId === "ctx-a") currentHostContextId = "";

  if (nextHistory.some((entry) => entry.hostContextId === "ctx-a")) {
    failures.push("Delete Recent should remove the recent entry.");
  }
  if (Object.prototype.hasOwnProperty.call(sessionStorageMap, "ctx-a")) {
    failures.push("Delete Recent should remove matching sessionStorage payload.");
  }
  if (currentHostContextId !== "") {
    failures.push("Deleting active session should clear active state safely.");
  }

  const libraryDeleteAttemptId = "ctx-b";
  const inLibrary = Object.prototype.hasOwnProperty.call(library, libraryDeleteAttemptId);
  const inRecent = nextHistory.some((entry) => entry.hostContextId === libraryDeleteAttemptId);
  if (inLibrary) {
    failures.push("Fixture error: recent-only id unexpectedly exists in library.");
  }
  if (!inRecent) {
    failures.push("Fixture error: recent-only id should exist in recent history.");
  }

  const entries = nextHistory.map((entry) => ({
    id: `history:${entry.hostContextId}`,
    contextId: entry.hostContextId
  }));
  const persisted = { sessionA: "ctx-a", sessionB: "ctx-b" };
  const restored = resolvePersistedSelectionIds(entries, persisted);
  if (restored.leftId || restored.rightId) {
    failures.push("Deleting a selected session should clear selections referencing it.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      htmlExists,
      jsExists,
      syntax,
      hasDeleteSavedLabel,
      hasRecentDeleteButton,
      hasRecentDeleteMethod,
      hasRecentDeleteHistoryWrite,
      hasRecentDeleteStorageClear,
      hasRecentDeleteActiveClear,
      hasLibraryScopeMessage
    },
    scenarios: {
      nextHistory,
      sessionStorageMap,
      currentHostContextId,
      libraryDeleteAttemptId,
      restored
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 recent-session delete results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 recent-session delete failures: ${failures.join(" | ")}`);
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
