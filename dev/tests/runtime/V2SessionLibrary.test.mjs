import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceHtmlPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.html");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-library-results.json");

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  setItem(key, value) {
    this.values.set(String(key), String(value));
  }

  getItem(key) {
    if (!this.values.has(String(key))) {
      return null;
    }
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

function isValidPayload(payload) {
  return Boolean(payload && typeof payload === "object" && !Array.isArray(payload));
}

function createHostContextId(toolId) {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${toolId}-library-${Date.now()}-${randomPart}`;
}

function readLibrary(localStorageLike, key) {
  const raw = localStorageLike.getItem(key);
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Library payload is invalid.");
  }
  return parsed;
}

function writeLibrary(localStorageLike, key, library) {
  localStorageLike.setItem(key, JSON.stringify(library));
}

export function run() {
  const failures = [];
  const libraryKey = "v2-session-library";
  const sessionName = "Library Sample";
  const toolId = "asset-manager-v2";
  const samplePayload = {
    toolId: "asset-manager-v2",
    payloadJson: {
      assetCatalog: {
        name: "Library Fixture",
        entries: [
          { id: "entry-1", label: "Ship", kind: "svg", path: "assets/ship.svg" }
        ]
      }
    }
  };
  const localStorageLike = new MemoryStorage();
  const sessionStorageLike = new MemoryStorage();

  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceHtml = workspaceHtmlExists ? readText(workspaceHtmlPath) : "";
  const workspaceJs = workspaceJsExists ? readText(workspaceJsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  if (!workspaceHtmlExists) failures.push("workspace-v2/index.html missing.");
  if (!workspaceJsExists) failures.push("workspace-v2/index.js missing.");
  if (!workspaceHtml.includes('id="workspaceV2SessionName"')) failures.push("Session name input missing in workspace-v2 HTML.");
  if (!workspaceHtml.includes('id="workspaceV2SessionList"')) failures.push("Session list missing in workspace-v2 HTML.");
  if (!workspaceHtml.includes('id="workspaceV2LibraryEmptyState"')) failures.push("Library empty state missing in workspace-v2 HTML.");
  if (!workspaceJs.includes('this.libraryStorageKey = "v2-session-library";')) failures.push("workspace-v2 JS missing v2-session-library key.");
  if (!workspaceJs.includes("saveNamedSession(")) failures.push("workspace-v2 JS missing saveNamedSession handler.");
  if (!workspaceJs.includes("loadNamedSession()")) failures.push("workspace-v2 JS missing loadNamedSession handler.");
  if (!workspaceJs.includes("deleteNamedSession()")) failures.push("workspace-v2 JS missing deleteNamedSession handler.");
  if (!workspaceJs.includes("Session '")) failures.push("workspace-v2 JS missing explicit session status messages.");
  if (!syntaxValid) failures.push("workspace-v2/index.js syntax check failed.");

  if (!isValidPayload(samplePayload)) {
    failures.push("Sample payload is invalid.");
  }

  try {
    const initialLibrary = readLibrary(localStorageLike, libraryKey);
    if (Object.keys(initialLibrary).length !== 0) {
      failures.push("Initial library expected empty.");
    }

    const saveLibrary = readLibrary(localStorageLike, libraryKey);
    saveLibrary[sessionName] = samplePayload;
    writeLibrary(localStorageLike, libraryKey, saveLibrary);
    const afterSave = readLibrary(localStorageLike, libraryKey);
    if (!Object.prototype.hasOwnProperty.call(afterSave, sessionName)) {
      failures.push("Saved session name missing from localStorage library.");
    }
    if (JSON.stringify(afterSave[sessionName]) !== JSON.stringify(samplePayload)) {
      failures.push("Saved payload in localStorage does not match input payload.");
    }

    const attemptedSilentOverwrite = readLibrary(localStorageLike, libraryKey);
    const beforeAttemptJson = JSON.stringify(attemptedSilentOverwrite[sessionName]);
    const differentPayload = { toolId: "asset-manager-v2", payloadJson: { assetCatalog: { name: "Different", entries: [] } } };
    if (Object.prototype.hasOwnProperty.call(attemptedSilentOverwrite, sessionName)) {
      // Explicitly skip writing here to model non-overwrite save path.
      const afterAttempt = readLibrary(localStorageLike, libraryKey);
      if (JSON.stringify(afterAttempt[sessionName]) !== beforeAttemptJson) {
        failures.push("Non-overwrite save path mutated existing library entry.");
      }
    }

    const overwriteLibrary = readLibrary(localStorageLike, libraryKey);
    overwriteLibrary[sessionName] = differentPayload;
    writeLibrary(localStorageLike, libraryKey, overwriteLibrary);
    const afterOverwrite = readLibrary(localStorageLike, libraryKey);
    if (JSON.stringify(afterOverwrite[sessionName]) !== JSON.stringify(differentPayload)) {
      failures.push("Explicit overwrite did not replace existing session payload.");
    }

    const loadLibrary = readLibrary(localStorageLike, libraryKey);
    const payloadToLoad = loadLibrary[sessionName];
    const newHostContextId = createHostContextId(toolId);
    sessionStorageLike.setItem(newHostContextId, JSON.stringify(payloadToLoad));
    const loadedSession = sessionStorageLike.getItem(newHostContextId);
    if (!loadedSession) {
      failures.push("Load did not create sessionStorage entry.");
    } else if (JSON.stringify(JSON.parse(loadedSession)) !== JSON.stringify(payloadToLoad)) {
      failures.push("Loaded sessionStorage payload does not match library payload.");
    }

    const deleteLibrary = readLibrary(localStorageLike, libraryKey);
    delete deleteLibrary[sessionName];
    writeLibrary(localStorageLike, libraryKey, deleteLibrary);
    const afterDelete = readLibrary(localStorageLike, libraryKey);
    if (Object.prototype.hasOwnProperty.call(afterDelete, sessionName)) {
      failures.push("Delete did not remove session from library.");
    }
  } catch (error) {
    failures.push(`Library simulation failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    workspaceHtmlPath: path.relative(repoRoot, workspaceHtmlPath).replace(/\\/g, "/"),
    workspaceJsPath: path.relative(repoRoot, workspaceJsPath).replace(/\\/g, "/"),
    localStorageKey: libraryKey,
    sessionName,
    syntaxValid,
    syntaxError,
    failures
  };

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`v2 session library results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session library failures: ${failures.join(" | ")}`);
  return summary;
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
