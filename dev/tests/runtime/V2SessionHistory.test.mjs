import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const workspaceHtmlPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.html");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-history-results.json");

const HISTORY_KEY = "v2-session-history";
const HISTORY_MAX_ENTRIES = 10;

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  setItem(key, value) {
    this.values.set(String(key), String(value));
  }

  getItem(key) {
    if (!this.values.has(String(key))) return null;
    return this.values.get(String(key));
  }
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function checkJsSyntax(jsPath) {
  try {
    execFileSync(process.execPath, ["--check", jsPath], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { syntaxValid: true, syntaxError: "" };
  } catch (error) {
    return {
      syntaxValid: false,
      syntaxError: (error?.stderr || error?.stdout || error?.message || "").toString().trim()
    };
  }
}

function isValidSessionPayload(payload) {
  return Boolean(payload && typeof payload === "object" && !Array.isArray(payload));
}

function isValidSessionHistoryEntry(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
  if (typeof entry.hostContextId !== "string" || !entry.hostContextId.trim()) return false;
  if (typeof entry.tool !== "string" || !entry.tool.trim()) return false;
  if (typeof entry.timestamp !== "string" || !entry.timestamp.trim()) return false;
  if (!isValidSessionPayload(entry.payload)) return false;
  return true;
}

function readSessionHistory(rawValue) {
  if (!rawValue) return [];
  let parsed = null;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((entry) => isValidSessionHistoryEntry(entry));
}

function addRecentSessionEntry(history, hostContextId, toolId, payload, timestamp) {
  if (typeof hostContextId !== "string" || !hostContextId.trim()) return history;
  if (typeof toolId !== "string" || !toolId.trim()) return history;
  if (!isValidSessionPayload(payload)) return history;
  const deduped = history.filter((entry) => entry.hostContextId !== hostContextId.trim());
  deduped.unshift({
    hostContextId: hostContextId.trim(),
    tool: toolId.trim(),
    timestamp,
    payload
  });
  if (deduped.length > HISTORY_MAX_ENTRIES) {
    deduped.length = HISTORY_MAX_ENTRIES;
  }
  return deduped;
}

function buildToolLaunchUrl(baseUrl, toolId, hostContextId) {
  const targetUrl = new URL(`../${toolId}/index.html`, baseUrl);
  targetUrl.searchParams.set("hostContextId", hostContextId);
  targetUrl.searchParams.set("fromTool", "workspace-v2");
  return targetUrl.toString();
}

function reopenSessionHistoryEntry(history, hostContextId, sessionStorageLike, baseUrl) {
  const entry = history.find((row) => row.hostContextId === hostContextId);
  if (!entry || !isValidSessionHistoryEntry(entry)) {
    return { ok: false, url: "", entry: null };
  }
  sessionStorageLike.setItem(entry.hostContextId, JSON.stringify(entry.payload));
  return {
    ok: true,
    url: buildToolLaunchUrl(baseUrl, entry.tool, entry.hostContextId),
    entry
  };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const workspaceHtmlText = workspaceHtmlExists ? readText(workspaceHtmlPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const hasHistoryStorageKey = workspaceJsText.includes('this.historyStorageKey = "v2-session-history"');
  const hasHistoryLimit = workspaceJsText.includes("this.historyMaxEntries = 10");
  const hasAddEntryMethod = workspaceJsText.includes("addRecentSessionEntry(hostContextId, toolId, payload)");
  const hasReopenMethod = workspaceJsText.includes("reopenSessionHistoryEntry(hostContextId)");
  const hasRenderMethod = workspaceJsText.includes("renderSessionHistory()");
  const hasLaunchHook = workspaceJsText.includes("this.addRecentSessionEntry(hostContextId, toolId, versionedPayload);");
  const htmlHasHistoryUI = workspaceHtmlText.includes("workspaceV2SessionHistoryList") && workspaceHtmlText.includes("workspaceV2RefreshSessionHistoryButton");

  if (!workspaceJsExists) failures.push("Missing workspace-v2/index.js.");
  if (!workspaceHtmlExists) failures.push("Missing workspace-v2/index.html.");
  if (!syntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  if (!hasHistoryStorageKey) failures.push("Missing v2-session-history storage key wiring.");
  if (!hasHistoryLimit) failures.push("Missing history max entries limit.");
  if (!hasAddEntryMethod) failures.push("Missing addRecentSessionEntry(hostContextId, toolId, payload) method.");
  if (!hasReopenMethod) failures.push("Missing reopenSessionHistoryEntry(hostContextId) method.");
  if (!hasRenderMethod) failures.push("Missing renderSessionHistory() method.");
  if (!hasLaunchHook) failures.push("Missing launch flow history insertion hook.");
  if (!htmlHasHistoryUI) failures.push("Missing session history UI controls.");

  const sessionStorageLike = new MemoryStorage();
  let history = [];
  const payloadBase = {
    version: "v2",
    toolId: "asset-manager-v2",
    payloadJson: {
      assetCatalog: {
        name: "History Fixture",
        entries: [{ id: "a1", label: "Asset A", kind: "svg", path: "assets/a.svg" }]
      }
    }
  };

  for (let index = 0; index < 12; index += 1) {
    history = addRecentSessionEntry(
      history,
      `host-${index}`,
      "asset-manager-v2",
      { ...payloadBase, payloadJson: { ...payloadBase.payloadJson, sequence: index } },
      `2026-05-01T00:00:${String(index).padStart(2, "0")}Z`
    );
  }

  if (history.length !== HISTORY_MAX_ENTRIES) failures.push(`Expected history length ${HISTORY_MAX_ENTRIES}, got ${history.length}.`);
  if (history[0]?.hostContextId !== "host-11") failures.push(`Expected newest entry host-11 first, got ${history[0]?.hostContextId || "missing"}.`);
  if (history[HISTORY_MAX_ENTRIES - 1]?.hostContextId !== "host-2") failures.push(`Expected trimmed oldest entry host-2 last, got ${history[HISTORY_MAX_ENTRIES - 1]?.hostContextId || "missing"}.`);

  history = addRecentSessionEntry(
    history,
    "host-5",
    "tilemap-studio-v2",
    {
      version: "v2",
      toolId: "tilemap-studio-v2",
      payloadJson: { tileMapDocument: { map: { name: "Reused", width: 1, height: 1 }, layers: [] } }
    },
    "2026-05-01T00:01:00Z"
  );

  const host5Count = history.filter((entry) => entry.hostContextId === "host-5").length;
  if (host5Count !== 1) failures.push(`Expected deduped host-5 count 1, got ${host5Count}.`);
  if (history[0]?.hostContextId !== "host-5") failures.push(`Expected deduped host-5 moved to front, got ${history[0]?.hostContextId || "missing"}.`);

  const malformedRawHistory = JSON.stringify([
    ...history,
    { hostContextId: "", tool: "asset-manager-v2", timestamp: "bad", payload: {} },
    { hostContextId: "broken", timestamp: "2026-05-01T00:00:00Z", payload: {} },
    "invalid-row"
  ]);
  const cleanedHistory = readSessionHistory(malformedRawHistory);
  if (cleanedHistory.length !== history.length) failures.push(`Expected malformed entries ignored; cleaned length ${cleanedHistory.length} vs ${history.length}.`);

  const reopenResult = reopenSessionHistoryEntry(
    history,
    "host-5",
    sessionStorageLike,
    "https://example.test/toolbox/workspace-v2/index.html"
  );
  if (!reopenResult.ok) failures.push("Expected reopen result ok=true.");
  if (!reopenResult.url.includes("/toolbox/tilemap-studio-v2/index.html")) failures.push(`Expected reopen URL to target tilemap-studio-v2, got ${reopenResult.url}.`);
  if (!reopenResult.url.includes("hostContextId=host-5")) failures.push("Expected reopen URL to preserve hostContextId.");

  const storedReopenSession = sessionStorageLike.getItem("host-5");
  if (!storedReopenSession) {
    failures.push("Expected sessionStorage populated on reopen.");
  } else {
    const parsedStored = JSON.parse(storedReopenSession);
    if (JSON.stringify(parsedStored) !== JSON.stringify(reopenResult.entry.payload)) {
      failures.push("Reopen payload stored in sessionStorage does not match history payload.");
    }
  }

  const localStorageLike = new MemoryStorage();
  localStorageLike.setItem(HISTORY_KEY, JSON.stringify(history));
  const persistedHistory = readSessionHistory(localStorageLike.getItem(HISTORY_KEY));
  if (persistedHistory.length !== history.length) failures.push("Persisted history roundtrip mismatch.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      workspaceJsExists,
      workspaceHtmlExists,
      syntaxValid,
      syntaxError,
      hasHistoryStorageKey,
      hasHistoryLimit,
      hasAddEntryMethod,
      hasReopenMethod,
      hasRenderMethod,
      hasLaunchHook,
      htmlHasHistoryUI
    },
    simulation: {
      historyLength: history.length,
      firstHostContextId: history[0]?.hostContextId || "",
      lastHostContextId: history[history.length - 1]?.hostContextId || "",
      host5Count,
      reopenResult: {
        ok: reopenResult.ok,
        url: reopenResult.url
      }
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session history results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session history failures: ${failures.join(" | ")}`);
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
