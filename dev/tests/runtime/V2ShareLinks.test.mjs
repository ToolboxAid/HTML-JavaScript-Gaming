import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const fixturePath = path.join(repoRoot, "tests", "fixtures", "v2-tools", "asset-manager-v2.json");
const workspaceHtmlPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.html");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-share-links-results.json");

class MemorySessionStorage {
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

function readJson(filePath) {
  return JSON.parse(readText(filePath));
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

function generateHostContextId(toolId) {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${toolId}-share-${Date.now()}-${randomPart}`;
}

function encodePayload(payload) {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return Buffer.from(binary, "binary").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodePayload(encodedPayload) {
  const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = Buffer.from(`${normalized}${padding}`, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

export function run() {
  const failures = [];
  const fixtureExists = fs.existsSync(fixturePath);
  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceHtml = workspaceHtmlExists ? readText(workspaceHtmlPath) : "";
  const workspaceJs = workspaceJsExists ? readText(workspaceJsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  if (!fixtureExists) failures.push("Fixture file missing.");
  if (!workspaceHtmlExists) failures.push("workspace-v2/index.html missing.");
  if (!workspaceJsExists) failures.push("workspace-v2/index.js missing.");

  let payload = null;
  if (fixtureExists) {
    try {
      const fixture = readJson(fixturePath);
      payload = fixture.sessionContext;
    } catch {
      failures.push("Fixture JSON failed to parse.");
    }
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    failures.push("Fixture payload missing/invalid.");
  }

  let encoded = "";
  let decoded = null;
  let sessionUrl = "";
  let assignedHostContextId = "";
  const storage = new MemorySessionStorage();

  if (payload) {
    try {
      encoded = encodePayload(payload);
      sessionUrl = `https://example.local/toolbox/workspace-v2/index.html?session=${encoded}`;
      const parsedUrl = new URL(sessionUrl);
      decoded = decodePayload(parsedUrl.searchParams.get("session") || "");
      assignedHostContextId = generateHostContextId("asset-manager-v2");
      storage.setItem(assignedHostContextId, JSON.stringify(decoded));
    } catch (error) {
      failures.push(`Encode/decode simulation failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  const storedSession = assignedHostContextId ? storage.getItem(assignedHostContextId) : null;
  const storedParsed = storedSession ? JSON.parse(storedSession) : null;
  const payloadIntegrityValid = Boolean(decoded && JSON.stringify(decoded) === JSON.stringify(payload));
  const sessionStorageWriteValid = Boolean(storedParsed && JSON.stringify(storedParsed) === JSON.stringify(payload));
  const hostContextAssigned = Boolean(assignedHostContextId && assignedHostContextId.trim());

  if (!payloadIntegrityValid) failures.push("Decoded payload integrity mismatch.");
  if (!sessionStorageWriteValid) failures.push("Decoded payload was not written correctly to sessionStorage.");
  if (!hostContextAssigned) failures.push("No hostContextId was assigned during decode flow.");

  if (!workspaceHtml.includes('id="workspaceV2ShareUrl"')) failures.push("Share URL field missing in workspace-v2 HTML.");
  if (!workspaceHtml.includes('id="workspaceV2CreateShareLinkButton"')) failures.push("Create share link button missing in workspace-v2 HTML.");
  if (!workspaceHtml.includes('id="workspaceV2ApplyShareLinkButton"')) failures.push("Apply share link button missing in workspace-v2 HTML.");
  if (!workspaceJs.includes("encodeSessionPayload(")) failures.push("workspace-v2 JS missing encodeSessionPayload.");
  if (!workspaceJs.includes("decodeSessionPayload(")) failures.push("workspace-v2 JS missing decodeSessionPayload.");
  if (!workspaceJs.includes("decodeSessionParamFromUrl()")) failures.push("workspace-v2 JS missing decodeSessionParamFromUrl.");
  if (!workspaceJs.includes("shareUrl.searchParams.set(\"session\", encoded);")) failures.push("workspace-v2 JS missing session query assignment.");
  if (!workspaceJs.includes("Share session decode failed")) failures.push("workspace-v2 JS missing explicit invalid share decode error.");
  if (!syntaxValid) failures.push("workspace-v2/index.js syntax check failed.");

  const summary = {
    generatedAt: new Date().toISOString(),
    fixturePath: path.relative(repoRoot, fixturePath).replace(/\\/g, "/"),
    workspaceHtmlPath: path.relative(repoRoot, workspaceHtmlPath).replace(/\\/g, "/"),
    workspaceJsPath: path.relative(repoRoot, workspaceJsPath).replace(/\\/g, "/"),
    payloadIntegrityValid,
    sessionStorageWriteValid,
    hostContextAssigned,
    sessionUrl,
    hostContextId: assignedHostContextId,
    syntaxValid,
    syntaxError,
    failures
  };

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`v2 share links results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 share links failures: ${failures.join(" | ")}`);
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
