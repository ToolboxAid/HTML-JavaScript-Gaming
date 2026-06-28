import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const workspaceJsPath = path.join(repoRoot, "www", "toolbox", "workspace-v2", "index.js");
const toolsRoot = path.join(repoRoot, "www", "toolbox");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-size-results.json");

const URL_LENGTH_LIMIT = 2000;
const SESSION_PAYLOAD_BYTES_LIMIT = 1024 * 1024;
const TOOL_IDS = [
  "asset-manager-v2",
  "palette-manager-v2",
  "svg-asset-studio-v2",
  "tilemap-studio-v2",
  "vector-map-editor-v2"
];

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

function sessionPayloadMetrics(sessionPayload) {
  const serializedPayload = JSON.stringify(sessionPayload);
  return {
    serializedPayload,
    bytes: new TextEncoder().encode(serializedPayload).length
  };
}

function encodeSessionPayload(sessionPayload) {
  const json = JSON.stringify(sessionPayload);
  const bytes = new TextEncoder().encode(json);
  return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function validateStorageLimit(sessionPayload) {
  const metrics = sessionPayloadMetrics(sessionPayload);
  if (metrics.bytes > SESSION_PAYLOAD_BYTES_LIMIT) {
    return {
      state: "INVALID",
      message: `Session size exceeds allowed limit. Payload is ${metrics.bytes} bytes and limit is ${SESSION_PAYLOAD_BYTES_LIMIT} bytes.`,
      metrics
    };
  }
  return { state: "VALID", message: "Storage size is within limit.", metrics };
}

function validateUrlLimit(sessionPayload) {
  const encoded = encodeSessionPayload(sessionPayload);
  const shareUrl = new URL("https://example.test/toolbox/workspace-v2/index.html");
  shareUrl.searchParams.set("session", encoded);
  if (shareUrl.toString().length > URL_LENGTH_LIMIT) {
    return {
      state: "INVALID",
      message: `Session size exceeds allowed limit for URL payload. URL length is ${shareUrl.toString().length} and limit is ${URL_LENGTH_LIMIT}.`,
      encodedLength: encoded.length,
      urlLength: shareUrl.toString().length
    };
  }
  return {
    state: "VALID",
    message: "URL size is within limit.",
    encodedLength: encoded.length,
    urlLength: shareUrl.toString().length
  };
}

function buildPayload(stringLength) {
  return {
    toolId: "asset-manager-v2",
    payloadJson: {
      assetCatalog: {
        name: "Session Size Fixture",
        entries: [
          {
            id: "asset-size-001",
            label: "Large Entry",
            kind: "svg",
            path: `assets/${"x".repeat(stringLength)}.svg`
          }
        ]
      }
    }
  };
}

function validateToolReadGuard(toolId) {
  const jsPath = path.join(toolsRoot, toolId, "index.js");
  const jsExists = fs.existsSync(jsPath);
  const jsText = jsExists ? readText(jsPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(jsPath);
  const failures = [];
  const hasLimitConstant = jsText.includes("this.sessionPayloadBytesLimit = 1024 * 1024");
  const hasLimitMessage = jsText.includes("Session size exceeds allowed limit.");
  const hasSerializedSessionVariable = jsText.includes("const serializedSession = window.sessionStorage.getItem(");
  if (!jsExists) failures.push("Missing tool index.js.");
  if (!syntaxValid) failures.push("Tool index.js failed syntax check.");
  if (!hasLimitConstant) failures.push("Missing session payload size limit constant.");
  if (!hasLimitMessage) failures.push("Missing size limit INVALID message.");
  if (!hasSerializedSessionVariable) failures.push("Missing serialized session read path.");
  return {
    tool: toolId,
    jsPath: path.relative(repoRoot, jsPath).replace(/\\/g, "/"),
    jsExists,
    syntaxValid,
    syntaxError,
    hasLimitConstant,
    hasLimitMessage,
    hasSerializedSessionVariable,
    failures
  };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const workspaceSyntax = checkJsSyntax(workspaceJsPath);

  const hasWorkspaceUrlLimit = workspaceJsText.includes("this.urlLengthLimit = 2000");
  const hasWorkspaceStorageLimit = workspaceJsText.includes("this.sessionPayloadBytesLimit = 1024 * 1024");
  const hasStorageGuardMethod = workspaceJsText.includes("validateSessionPayloadSize(sessionPayload)");
  const hasUrlGuardMessage = workspaceJsText.includes("Session size exceeds allowed limit for URL payload");
  const hasStorageGuardMessage = workspaceJsText.includes("Session size exceeds allowed limit. Payload is");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!workspaceSyntax.syntaxValid) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!hasWorkspaceUrlLimit) failures.push("Missing workspace URL size limit constant.");
  if (!hasWorkspaceStorageLimit) failures.push("Missing workspace storage size limit constant.");
  if (!hasStorageGuardMethod) failures.push("Missing workspace validateSessionPayloadSize(sessionPayload).");
  if (!hasUrlGuardMessage) failures.push("Missing workspace URL size guard message.");
  if (!hasStorageGuardMessage) failures.push("Missing workspace storage size guard message.");

  const underLimitPayload = buildPayload(200);
  const overUrlLimitPayload = buildPayload(2600);
  const overStorageLimitPayload = buildPayload(SESSION_PAYLOAD_BYTES_LIMIT + 5000);

  const underStorageResult = validateStorageLimit(underLimitPayload);
  const underUrlResult = validateUrlLimit(underLimitPayload);
  const overUrlStorageResult = validateStorageLimit(overUrlLimitPayload);
  const overUrlResult = validateUrlLimit(overUrlLimitPayload);
  const overStorageResult = validateStorageLimit(overStorageLimitPayload);
  const overStorageUrlResult = validateUrlLimit(overStorageLimitPayload);

  if (underStorageResult.state !== "VALID" || underUrlResult.state !== "VALID") {
    failures.push("Under-limit payload should be VALID for storage and URL.");
  }
  if (overUrlStorageResult.state !== "VALID") {
    failures.push("URL-over-limit payload should remain storage-valid.");
  }
  if (overUrlResult.state !== "INVALID") {
    failures.push("URL-over-limit payload should be INVALID for URL guard.");
  }
  if (overStorageResult.state !== "INVALID") {
    failures.push("Storage-over-limit payload should be INVALID for storage guard.");
  }
  if (!overStorageResult.message.includes("Session size exceeds allowed limit")) {
    failures.push("Storage-over-limit payload did not produce actionable limit message.");
  }
  if (overStorageUrlResult.state !== "INVALID") {
    failures.push("Storage-over-limit payload should also exceed URL limit.");
  }

  const toolRows = TOOL_IDS.map(validateToolReadGuard);
  toolRows.forEach((row) => {
    row.failures.forEach((entry) => failures.push(`${row.tool}: ${entry}`));
  });

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    thresholds: {
      urlLengthLimit: URL_LENGTH_LIMIT,
      sessionPayloadBytesLimit: SESSION_PAYLOAD_BYTES_LIMIT
    },
    failures,
    workspaceChecks: {
      workspaceJsExists,
      syntaxValid: workspaceSyntax.syntaxValid,
      syntaxError: workspaceSyntax.syntaxError,
      hasWorkspaceUrlLimit,
      hasWorkspaceStorageLimit,
      hasStorageGuardMethod,
      hasUrlGuardMessage,
      hasStorageGuardMessage
    },
    cases: {
      underLimit: {
        storage: underStorageResult,
        url: underUrlResult
      },
      overUrlLimit: {
        storage: overUrlStorageResult,
        url: overUrlResult
      },
      overStorageLimit: {
        storage: overStorageResult,
        url: overStorageUrlResult
      }
    },
    toolReadValidation: toolRows
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session size results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session size failures: ${failures.join(" | ")}`);
  return { failures, toolRows };
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
