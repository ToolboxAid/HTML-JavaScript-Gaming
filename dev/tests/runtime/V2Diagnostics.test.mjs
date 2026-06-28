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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-diagnostics-results.json");

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    if (!this.values.has(String(key))) {
      return null;
    }
    return this.values.get(String(key));
  }

  setItem(key, value) {
    this.values.set(String(key), String(value));
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

function safeParseJson(rawValue) {
  if (typeof rawValue !== "string") {
    return { ok: false, value: null, error: "value is not a string" };
  }
  try {
    return { ok: true, value: JSON.parse(rawValue), error: "" };
  } catch (error) {
    return { ok: false, value: null, error: error instanceof Error ? error.message : "unknown error" };
  }
}

function truncatePreview(value, maxLength) {
  const text = typeof value === "string" ? value : String(value);
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)} ...truncated (${text.length - maxLength} more chars)`;
}

function isValidSessionPayload(sessionPayload) {
  return Boolean(sessionPayload && typeof sessionPayload === "object" && !Array.isArray(sessionPayload));
}

function diagnosticsActiveHostContextId(url, currentHostContextId) {
  const params = new URL(url).searchParams;
  const urlHostContextId = typeof params.get("hostContextId") === "string" ? params.get("hostContextId").trim() : "";
  if (urlHostContextId) {
    return urlHostContextId;
  }
  if (typeof currentHostContextId === "string" && currentHostContextId.trim()) {
    return currentHostContextId.trim();
  }
  return "";
}

function diagnosticsActiveState(activeHostContextId, sessionStorageLike, currentSessionPayload) {
  if (activeHostContextId) {
    const stored = sessionStorageLike.getItem(activeHostContextId);
    if (!stored) {
      return "EMPTY";
    }
    const parsed = safeParseJson(stored);
    if (!parsed.ok || !isValidSessionPayload(parsed.value)) {
      return "INVALID";
    }
    return "VALID";
  }
  if (isValidSessionPayload(currentSessionPayload)) {
    return "VALID";
  }
  return "EMPTY";
}

function readDiagnosticsSnapshot(url, currentHostContextId, currentSessionPayload, sessionStorageLike, localStorageLike) {
  const params = new URL(url).searchParams;
  const urlParams = {};
  params.forEach((value, key) => {
    urlParams[key] = value;
  });

  const activeHostContextId = diagnosticsActiveHostContextId(url, currentHostContextId);
  const sessionMatches = [];
  if (activeHostContextId) {
    const rawSessionValue = sessionStorageLike.getItem(activeHostContextId);
    if (typeof rawSessionValue === "string") {
      const parsedSession = safeParseJson(rawSessionValue);
      sessionMatches.push({
        key: activeHostContextId,
        parseOk: parsedSession.ok,
        error: parsedSession.ok ? "" : parsedSession.error,
        preview: truncatePreview(rawSessionValue, 500)
      });
    }
  }

  const sessionLibraryRaw = localStorageLike.getItem("v2-session-library");
  const sessionLibraryParsed = safeParseJson(typeof sessionLibraryRaw === "string" ? sessionLibraryRaw : "");
  const errorLogsRaw = localStorageLike.getItem("v2-error-logs");
  const errorLogsParsed = safeParseJson(typeof errorLogsRaw === "string" ? errorLogsRaw : "");
  const payloadPreview = isValidSessionPayload(currentSessionPayload)
    ? truncatePreview(JSON.stringify(currentSessionPayload, null, 2), 800)
    : "No payload loaded.";

  return {
    urlParams,
    activeHostContextId,
    activeState: diagnosticsActiveState(activeHostContextId, sessionStorageLike, currentSessionPayload),
    sessionMatches,
    localStorage: {
      sessionLibrary: {
        exists: typeof sessionLibraryRaw === "string",
        parseOk: typeof sessionLibraryRaw === "string" ? sessionLibraryParsed.ok : false,
        error: typeof sessionLibraryRaw === "string" && !sessionLibraryParsed.ok ? sessionLibraryParsed.error : "",
        preview: typeof sessionLibraryRaw === "string" ? truncatePreview(sessionLibraryRaw, 800) : "missing"
      },
      errorLogs: {
        exists: typeof errorLogsRaw === "string",
        parseOk: typeof errorLogsRaw === "string" ? errorLogsParsed.ok : false,
        error: typeof errorLogsRaw === "string" && !errorLogsParsed.ok ? errorLogsParsed.error : "",
        preview: typeof errorLogsRaw === "string" ? truncatePreview(errorLogsRaw, 800) : "missing"
      }
    },
    payloadPreview
  };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const workspaceHtmlText = workspaceHtmlExists ? readText(workspaceHtmlPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const htmlHasDiagnosticsPanel = workspaceHtmlText.includes("workspaceV2RefreshDiagnosticsButton") &&
    workspaceHtmlText.includes("workspaceV2DiagnosticsUrlParams") &&
    workspaceHtmlText.includes("workspaceV2DiagnosticsSessionStorage") &&
    workspaceHtmlText.includes("workspaceV2DiagnosticsSessionLibrary") &&
    workspaceHtmlText.includes("workspaceV2DiagnosticsErrorLogs") &&
    workspaceHtmlText.includes("workspaceV2DiagnosticsPayload");

  const jsHasReadDiagnostics = workspaceJsText.includes("readDiagnosticsSnapshot()");
  const jsHasRenderDiagnostics = workspaceJsText.includes("renderDiagnosticsPanel()");
  const jsHasActiveState = workspaceJsText.includes("diagnosticsActiveState(activeHostContextId)");
  const jsHasSafeParse = workspaceJsText.includes("safeParseJson(rawValue)");
  const jsHasTruncate = workspaceJsText.includes("truncatePreview(value, maxLength)");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!workspaceHtmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!syntaxValid) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!htmlHasDiagnosticsPanel) failures.push("Diagnostics panel markup is missing required nodes.");
  if (!jsHasReadDiagnostics) failures.push("Workspace V2 is missing readDiagnosticsSnapshot().");
  if (!jsHasRenderDiagnostics) failures.push("Workspace V2 is missing renderDiagnosticsPanel().");
  if (!jsHasActiveState) failures.push("Workspace V2 is missing diagnosticsActiveState(activeHostContextId).");
  if (!jsHasSafeParse) failures.push("Workspace V2 is missing safeParseJson(rawValue).");
  if (!jsHasTruncate) failures.push("Workspace V2 is missing truncatePreview(value, maxLength).");

  const sessionStorageLike = new MemoryStorage();
  const localStorageLike = new MemoryStorage();
  const hostContextId = "diag-host-1";
  const url = `https://example.test/toolbox/workspace-v2/index.html?hostContextId=${encodeURIComponent(hostContextId)}&view=inspector&panel=diagnostics`;
  const payload = {
    toolId: "asset-manager-v2",
    payloadJson: {
      assetCatalog: {
        name: "Diagnostics Fixture",
        entries: [{ id: "asset-1", label: "Hero", kind: "svg", path: "assets/hero.svg" }]
      }
    }
  };

  sessionStorageLike.setItem(hostContextId, JSON.stringify(payload));
  localStorageLike.setItem("v2-session-library", JSON.stringify({ baseline: payload }));
  localStorageLike.setItem("v2-error-logs", "{not-valid-json");

  let validSnapshot = null;
  let invalidSnapshot = null;
  let emptySnapshot = null;
  try {
    validSnapshot = readDiagnosticsSnapshot(url, "", payload, sessionStorageLike, localStorageLike);
    sessionStorageLike.setItem(hostContextId, "{bad-json");
    invalidSnapshot = readDiagnosticsSnapshot(url, "", payload, sessionStorageLike, localStorageLike);
    sessionStorageLike.setItem(hostContextId, "");
    emptySnapshot = readDiagnosticsSnapshot(url, "", null, sessionStorageLike, localStorageLike);
  } catch (error) {
    failures.push(`Diagnostics snapshot logic crashed: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  if (validSnapshot) {
    if (validSnapshot.urlParams.hostContextId !== hostContextId) failures.push("hostContextId URL param was not extracted correctly.");
    if (validSnapshot.urlParams.view !== "inspector") failures.push("Additional URL params were not extracted correctly.");
    if (validSnapshot.activeHostContextId !== hostContextId) failures.push("Active hostContextId was not detected.");
    if (validSnapshot.activeState !== "VALID") failures.push(`Expected VALID active state, got ${validSnapshot.activeState}.`);
    if (validSnapshot.sessionMatches.length !== 1) failures.push(`Expected one matching sessionStorage entry, got ${validSnapshot.sessionMatches.length}.`);
    if (!validSnapshot.localStorage.sessionLibrary.parseOk) failures.push("Expected valid parse for v2-session-library.");
    if (validSnapshot.localStorage.errorLogs.parseOk) failures.push("Expected malformed v2-error-logs to report parse failure.");
    if (!validSnapshot.payloadPreview.includes("assetCatalog")) failures.push("Payload preview is missing expected payload content.");
  }

  if (invalidSnapshot) {
    if (invalidSnapshot.activeState !== "INVALID") failures.push(`Expected INVALID active state for malformed session JSON, got ${invalidSnapshot.activeState}.`);
    if (invalidSnapshot.sessionMatches.length !== 1 || invalidSnapshot.sessionMatches[0].parseOk !== false) {
      failures.push("Expected malformed session entry preview to report parseOk=false.");
    }
  }

  if (emptySnapshot) {
    if (emptySnapshot.activeState !== "EMPTY") failures.push(`Expected EMPTY active state for missing session entry, got ${emptySnapshot.activeState}.`);
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    workspaceChecks: {
      workspaceJsExists,
      workspaceHtmlExists,
      syntaxValid,
      syntaxError,
      htmlHasDiagnosticsPanel,
      jsHasReadDiagnostics,
      jsHasRenderDiagnostics,
      jsHasActiveState,
      jsHasSafeParse,
      jsHasTruncate
    },
    snapshots: {
      valid: validSnapshot,
      invalid: invalidSnapshot,
      empty: emptySnapshot
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 diagnostics results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 diagnostics failures: ${failures.join(" | ")}`);
  return { failures, validSnapshot, invalidSnapshot, emptySnapshot };
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
