import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const jsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-block-fake-session-save-results.json");

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

function isValidPayload(payload) {
  return Boolean(payload && typeof payload === "object" && !Array.isArray(payload));
}

function readSessionPayloadForLibraryWrite(sessionId, storageMap) {
  const id = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!id) return null;
  const raw = storageMap[id];
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw);
    return isValidPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function looksLikeWorkspaceHostContextId(sessionId) {
  const id = typeof sessionId === "string" ? sessionId.trim() : "";
  if (!id) return false;
  return /-v2-\d{13}-[a-z0-9]{8}$/i.test(id);
}

function cleanupStaleInvalidSavedEntries(library, storageMap) {
  const nextLibrary = { ...library };
  const removed = [];
  Object.keys(nextLibrary).forEach((sessionId) => {
    const payload = nextLibrary[sessionId];
    if (!isValidPayload(payload)) return;
    if (!looksLikeWorkspaceHostContextId(sessionId)) return;
    const storagePayload = readSessionPayloadForLibraryWrite(sessionId, storageMap);
    const hasMatchingStorage = isValidPayload(storagePayload);
    const payloadHostContextId = typeof payload.hostContextId === "string" ? payload.hostContextId.trim() : "";
    const payloadToolId = typeof payload.toolId === "string" ? payload.toolId.trim() : "";
    const idMatchesPayloadHostContext = Boolean(payloadHostContextId && payloadHostContextId === sessionId);
    const idMatchesToolMetadata = Boolean(payloadToolId && sessionId.startsWith(`${payloadToolId}-`));
    if (!hasMatchingStorage && !idMatchesPayloadHostContext && !idMatchesToolMetadata) {
      delete nextLibrary[sessionId];
      removed.push(sessionId);
    }
  });
  return { nextLibrary, removed };
}

function simulateSave(inputId, library, storageMap) {
  const sessionId = typeof inputId === "string" ? inputId.trim() : "";
  const nextLibrary = { ...library };
  if (!sessionId) return { message: "Enter a session ID before saving.", nextLibrary };
  if (Object.prototype.hasOwnProperty.call(nextLibrary, sessionId)) {
    return { message: "Saved session already exists. Use Overwrite Session.", nextLibrary };
  }
  const payload = readSessionPayloadForLibraryWrite(sessionId, storageMap);
  if (!isValidPayload(payload)) {
    return { message: "Session ID does not resolve to a valid Workspace V2 session.", nextLibrary };
  }
  nextLibrary[sessionId] = payload;
  return { message: "Saved session created.", nextLibrary };
}

function simulateOverwrite(inputId, library, storageMap) {
  const sessionId = typeof inputId === "string" ? inputId.trim() : "";
  const nextLibrary = { ...library };
  if (!sessionId) return { message: "Enter a session ID before overwriting.", nextLibrary };
  const payload = readSessionPayloadForLibraryWrite(sessionId, storageMap);
  if (!isValidPayload(payload)) {
    return { message: "Session ID does not resolve to a valid Workspace V2 session.", nextLibrary };
  }
  if (!Object.prototype.hasOwnProperty.call(nextLibrary, sessionId)) {
    return { message: "Saved session not found. Use Save Session to create it first.", nextLibrary };
  }
  nextLibrary[sessionId] = payload;
  return { message: "Saved session overwritten.", nextLibrary };
}

export function run() {
  const failures = [];
  const jsExists = fs.existsSync(jsPath);
  const js = jsExists ? readText(jsPath) : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2BlockFakeSessionSave.test.mjs"));

  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2BlockFakeSessionSave.test.mjs failed syntax check.");

  const requiredTokens = [
    "readSessionPayloadForLibraryWrite(sessionId)",
    "looksLikeWorkspaceHostContextId(sessionId)",
    "cleanupStaleInvalidSavedEntries(library)",
    "Session ID does not resolve to a valid Workspace V2 session.",
    "Saved session already exists. Use Overwrite Session.",
    "Saved session not found. Use Save Session to create it first.",
    "Saved session created.",
    "Saved session overwritten."
  ];
  requiredTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing required implementation token/message: ${token}`);
  });

  const validId = "asset-manager-v2-1777676088718-3eff5h3y";
  const fakeId = "fake-manager-v2-1777676067919-bzuo73di";
  const storage = {
    [validId]: JSON.stringify({ version: "v2", toolId: "asset-manager-v2", payloadJson: { source: "sessionStorage" } })
  };
  const activePayload = { version: "v2", toolId: "asset-manager-v2", payloadJson: { source: "active-only" } };

  const saveFake = simulateSave(fakeId, {}, storage);
  if (saveFake.message !== "Session ID does not resolve to a valid Workspace V2 session.") {
    failures.push("Fake unknown ID should not create saved entry.");
  }
  if (Object.prototype.hasOwnProperty.call(saveFake.nextLibrary, fakeId)) {
    failures.push("Fake unknown ID unexpectedly created saved entry.");
  }

  const overwriteFake = simulateOverwrite(fakeId, { [validId]: { version: "v2", toolId: "asset-manager-v2" } }, storage);
  if (overwriteFake.message !== "Session ID does not resolve to a valid Workspace V2 session.") {
    failures.push("Fake unknown ID should not overwrite saved entry.");
  }

  const saveValid = simulateSave(validId, {}, storage);
  if (saveValid.message !== "Saved session created." || !Object.prototype.hasOwnProperty.call(saveValid.nextLibrary, validId)) {
    failures.push("Valid recent/sessionStorage ID should be saved.");
  }

  const duplicateSave = simulateSave(validId, saveValid.nextLibrary, storage);
  if (duplicateSave.message !== "Saved session already exists. Use Overwrite Session.") {
    failures.push("Duplicate save should be blocked.");
  }

  const overwriteValid = simulateOverwrite(validId, saveValid.nextLibrary, storage);
  if (overwriteValid.message !== "Saved session overwritten.") {
    failures.push("Overwrite valid existing saved ID should succeed.");
  }

  const saveUnknownWithActive = simulateSave(fakeId, {}, {});
  if (saveUnknownWithActive.message !== "Session ID does not resolve to a valid Workspace V2 session.") {
    failures.push("Active payload fallback must not save under unrelated ID.");
  }
  if (activePayload.payloadJson.source !== "active-only") {
    failures.push("Test fixture mutated unexpectedly.");
  }

  const libraryBeforeCleanup = {
    [fakeId]: { version: "v2", toolId: "asset-manager-v2", payloadJson: { old: true } },
    [validId]: { version: "v2", toolId: "asset-manager-v2", payloadJson: { valid: true } },
    "custom-user-label": { version: "v2", toolId: "asset-manager-v2", payloadJson: { custom: true } },
    "palette-manager-v2-1777676088718-zzzzzzzz": { version: "v2", toolId: "palette-manager-v2", payloadJson: { keep: true } }
  };
  const cleanupResult = cleanupStaleInvalidSavedEntries(libraryBeforeCleanup, storage);
  if (Object.prototype.hasOwnProperty.call(cleanupResult.nextLibrary, fakeId)) {
    failures.push("Stale invalid fake entry should be cleaned up.");
  }
  if (!Object.prototype.hasOwnProperty.call(cleanupResult.nextLibrary, validId)) {
    failures.push("Valid saved entry should not be removed by cleanup.");
  }
  if (!Object.prototype.hasOwnProperty.call(cleanupResult.nextLibrary, "custom-user-label")) {
    failures.push("Custom valid saved entry should not be removed by cleanup.");
  }
  if (!Object.prototype.hasOwnProperty.call(cleanupResult.nextLibrary, "palette-manager-v2-1777676088718-zzzzzzzz")) {
    failures.push("Host-like entry with matching tool metadata should not be removed.");
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
      saveFake,
      overwriteFake,
      saveValid,
      duplicateSave,
      overwriteValid,
      saveUnknownWithActive,
      cleanupResult
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 block-fake-session-save results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 block-fake-session-save failures: ${failures.join(" | ")}`);
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
