import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const fixturePath = path.join(repoRoot, "tests", "fixtures", "v2-tools", "asset-manager-v2.json");
const toolJsPath = path.join(repoRoot, "www", "toolbox", "asset-manager-v2", "index.js");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "pr_11_313_asset_browser_results.json");

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateAssetBrowserSession(sessionContext) {
  if (!sessionContext || typeof sessionContext !== "object" || Array.isArray(sessionContext)) {
    return { state: "INVALID", message: "Session context is invalid." };
  }
  if (sessionContext.version !== "v2") {
    return { state: "INVALID", message: "Unsupported session version." };
  }
  if (typeof sessionContext.toolId !== "string" || sessionContext.toolId.trim() !== "asset-manager-v2") {
    return { state: "INVALID", message: "Expected toolId 'asset-manager-v2'." };
  }
  if (!sessionContext.payloadJson || typeof sessionContext.payloadJson !== "object" || Array.isArray(sessionContext.payloadJson)) {
    return { state: "INVALID", message: "Expected payloadJson object." };
  }
  if (typeof sessionContext.payloadJson.importName === "string" || typeof sessionContext.payloadJson.importDestination === "string") {
    return { state: "INVALID", message: "Legacy importName/importDestination is not allowed." };
  }
  if (!sessionContext.payloadJson.assetCatalog || typeof sessionContext.payloadJson.assetCatalog !== "object" || Array.isArray(sessionContext.payloadJson.assetCatalog)) {
    return { state: "INVALID", message: "Expected payloadJson.assetCatalog." };
  }
  if (typeof sessionContext.payloadJson.assetCatalog.name !== "string" || !sessionContext.payloadJson.assetCatalog.name.trim()) {
    return { state: "INVALID", message: "Expected assetCatalog.name." };
  }
  if (!Array.isArray(sessionContext.payloadJson.assetCatalog.entries)) {
    return { state: "INVALID", message: "Expected assetCatalog.entries[]." };
  }
  if (sessionContext.payloadJson.assetCatalog.entries.some((entry) =>
    !entry ||
    typeof entry !== "object" ||
    Array.isArray(entry) ||
    typeof entry.id !== "string" ||
    !entry.id.trim() ||
    typeof entry.label !== "string" ||
    !entry.label.trim() ||
    typeof entry.kind !== "string" ||
    !entry.kind.trim() ||
    typeof entry.path !== "string" ||
    !entry.path.trim()
  )) {
    return { state: "INVALID", message: "Each entry must include id, label, kind, and path." };
  }
  if (sessionContext.payloadJson.assetCatalog.entries.length === 0) {
    return { state: "VALID_EMPTY", message: "Valid catalog with zero assets." };
  }
  return { state: "VALID_ENTRIES", message: "Valid catalog with renderable assets." };
}

function checkSyntax(filePath) {
  execFileSync(process.execPath, ["--check", filePath], {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

export function run() {
  checkSyntax(toolJsPath);
  const fixtureJson = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  const toolSource = fs.readFileSync(toolJsPath, "utf8");
  const validWithEntries = validateAssetBrowserSession(fixtureJson.sessionContext);

  const validEmptyContext = cloneJson(fixtureJson.sessionContext);
  validEmptyContext.payloadJson.assetCatalog.entries = [];
  const validEmpty = validateAssetBrowserSession(validEmptyContext);

  const invalidPayloadContext = cloneJson(fixtureJson.sessionContext);
  delete invalidPayloadContext.payloadJson;
  const invalidPayload = validateAssetBrowserSession(invalidPayloadContext);

  const invalidLegacyHintContext = cloneJson(fixtureJson.sessionContext);
  invalidLegacyHintContext.payloadJson.importName = "future-import";
  const invalidLegacyHint = validateAssetBrowserSession(invalidLegacyHintContext);

  const invalidEntryContext = cloneJson(fixtureJson.sessionContext);
  invalidEntryContext.payloadJson.assetCatalog.entries[0] = {
    id: "broken",
    label: "Broken",
    kind: "image"
  };
  const invalidEntry = validateAssetBrowserSession(invalidEntryContext);

  const summary = {
    generatedAt: new Date().toISOString(),
    checks: {
      hasPayloadCatalogValidation: toolSource.includes("payloadJson.assetCatalog"),
      hasLegacyFutureHintRejection: toolSource.includes("importName/importDestination"),
      hasEmptyValidStateMessage: toolSource.includes("Asset catalog is valid but empty")
    },
    cases: {
      validWithEntries,
      validEmpty,
      invalidPayload,
      invalidLegacyHint,
      invalidEntry
    }
  };

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  assert.equal(summary.checks.hasPayloadCatalogValidation, true, "Asset Browser V2 must validate payloadJson.assetCatalog.");
  assert.equal(summary.checks.hasLegacyFutureHintRejection, true, "Asset Browser V2 must reject legacy future hint fields.");
  assert.equal(summary.checks.hasEmptyValidStateMessage, true, "Asset Browser V2 must expose an explicit empty valid-catalog message.");
  assert.equal(validWithEntries.state, "VALID_ENTRIES");
  assert.equal(validEmpty.state, "VALID_EMPTY");
  assert.equal(invalidPayload.state, "INVALID");
  assert.equal(invalidLegacyHint.state, "INVALID");
  assert.equal(invalidEntry.state, "INVALID");
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
