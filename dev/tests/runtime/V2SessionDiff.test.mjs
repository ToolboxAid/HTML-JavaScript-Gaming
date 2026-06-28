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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-diff-results.json");

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

function isComparableObject(value) {
  return Boolean(value && typeof value === "object");
}

function computeSessionDiff(leftPayload, rightPayload) {
  const added = {};
  const removed = {};
  const changed = {};
  const walk = (leftValue, rightValue, currentPath) => {
    if (leftValue === undefined && rightValue !== undefined) {
      added[currentPath] = rightValue;
      return;
    }
    if (leftValue !== undefined && rightValue === undefined) {
      removed[currentPath] = leftValue;
      return;
    }
    const leftComparable = isComparableObject(leftValue);
    const rightComparable = isComparableObject(rightValue);
    if (leftComparable && rightComparable) {
      if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
        const maxLength = Math.max(leftValue.length, rightValue.length);
        for (let index = 0; index < maxLength; index += 1) {
          walk(leftValue[index], rightValue[index], `${currentPath}[${index}]`);
        }
        return;
      }
      if (!Array.isArray(leftValue) && !Array.isArray(rightValue)) {
        const keys = new Set([...Object.keys(leftValue), ...Object.keys(rightValue)]);
        Array.from(keys).sort((a, b) => a.localeCompare(b)).forEach((key) => {
          walk(leftValue[key], rightValue[key], currentPath ? `${currentPath}.${key}` : key);
        });
        return;
      }
    }
    if (JSON.stringify(leftValue) !== JSON.stringify(rightValue)) {
      changed[currentPath || "$"] = { from: leftValue, to: rightValue };
    }
  };
  walk(leftPayload, rightPayload, "");
  return { added, removed, changed };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const workspaceHtmlText = workspaceHtmlExists ? readText(workspaceHtmlPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const htmlHasDiffUi = workspaceHtmlText.includes("workspaceV2DiffLeftSelect") &&
    workspaceHtmlText.includes("workspaceV2DiffRightSelect") &&
    workspaceHtmlText.includes("workspaceV2ComputeDiffButton") &&
    workspaceHtmlText.includes("workspaceV2DiffOutput");
  const jsHasCandidatesMethod = workspaceJsText.includes("buildSessionDiffCandidates()");
  const jsHasInputsMethod = workspaceJsText.includes("renderSessionDiffInputs()");
  const jsHasComputeMethod = workspaceJsText.includes("computeSessionDiff(leftPayload, rightPayload)");
  const jsHasSelectMethod = workspaceJsText.includes("computeSelectedSessionDiff()");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!workspaceHtmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!syntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  if (!htmlHasDiffUi) failures.push("Diff viewer UI nodes are missing.");
  if (!jsHasCandidatesMethod) failures.push("Missing buildSessionDiffCandidates().");
  if (!jsHasInputsMethod) failures.push("Missing renderSessionDiffInputs().");
  if (!jsHasComputeMethod) failures.push("Missing computeSessionDiff(leftPayload, rightPayload).");
  if (!jsHasSelectMethod) failures.push("Missing computeSelectedSessionDiff().");

  const leftPayload = {
    version: "v2",
    toolId: "asset-manager-v2",
    payloadJson: {
      assetCatalog: {
        name: "A",
        entries: [{ id: "1", label: "Ship", kind: "svg", path: "assets/ship.svg" }],
        flags: { featured: true }
      },
      metadata: { owner: "team-a" }
    }
  };
  const rightPayload = {
    version: "v2",
    toolId: "asset-manager-v2",
    payloadJson: {
      assetCatalog: {
        name: "B",
        entries: [
          { id: "1", label: "Ship", kind: "svg", path: "assets/ship.svg" },
          { id: "2", label: "Planet", kind: "svg", path: "assets/planet.svg" }
        ],
        extra: { source: "imported" }
      }
    }
  };

  const diff = computeSessionDiff(leftPayload, rightPayload);
  if (!Object.prototype.hasOwnProperty.call(diff.added, "payloadJson.assetCatalog.extra")) {
    failures.push("Expected added field payloadJson.assetCatalog.extra not detected.");
  }
  if (!Object.prototype.hasOwnProperty.call(diff.removed, "payloadJson.assetCatalog.flags")) {
    failures.push("Expected removed field payloadJson.assetCatalog.flags not detected.");
  }
  if (!Object.prototype.hasOwnProperty.call(diff.removed, "payloadJson.metadata")) {
    failures.push("Expected removed field payloadJson.metadata not detected.");
  }
  if (!Object.prototype.hasOwnProperty.call(diff.changed, "payloadJson.assetCatalog.name")) {
    failures.push("Expected changed field payloadJson.assetCatalog.name not detected.");
  }
  if (!Object.prototype.hasOwnProperty.call(diff.added, "payloadJson.assetCatalog.entries[1]")) {
    failures.push("Expected added array element payloadJson.assetCatalog.entries[1] not detected.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      workspaceJsExists,
      workspaceHtmlExists,
      syntaxValid,
      syntaxError,
      htmlHasDiffUi,
      jsHasCandidatesMethod,
      jsHasInputsMethod,
      jsHasComputeMethod,
      jsHasSelectMethod
    },
    diff
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session diff results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session diff failures: ${failures.join(" | ")}`);
  return { failures, diff };
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
