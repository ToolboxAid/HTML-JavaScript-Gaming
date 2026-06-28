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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-merge-results.json");

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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergePayloads(leftPayload, rightPayload) {
  const conflicts = {};
  const mergeValues = (leftValue, rightValue, currentPath) => {
    if (leftValue === undefined && rightValue !== undefined) {
      return clone(rightValue);
    }
    if (leftValue !== undefined && rightValue === undefined) {
      return clone(leftValue);
    }
    const leftIsObject = leftValue && typeof leftValue === "object";
    const rightIsObject = rightValue && typeof rightValue === "object";
    if (leftIsObject && rightIsObject && !Array.isArray(leftValue) && !Array.isArray(rightValue)) {
      const merged = {};
      const keys = new Set([...Object.keys(leftValue), ...Object.keys(rightValue)]);
      Array.from(keys).sort((a, b) => a.localeCompare(b)).forEach((key) => {
        const nextPath = currentPath ? `${currentPath}.${key}` : key;
        const mergedValue = mergeValues(leftValue[key], rightValue[key], nextPath);
        if (mergedValue !== undefined) {
          merged[key] = mergedValue;
        }
      });
      return merged;
    }
    if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
      if (JSON.stringify(leftValue) === JSON.stringify(rightValue)) {
        return clone(leftValue);
      }
      conflicts[currentPath || "$"] = { a: clone(leftValue), b: clone(rightValue) };
      return undefined;
    }
    if (JSON.stringify(leftValue) === JSON.stringify(rightValue)) {
      return clone(leftValue);
    }
    conflicts[currentPath || "$"] = { a: clone(leftValue), b: clone(rightValue) };
    return undefined;
  };

  return {
    mergedPayload: mergeValues(leftPayload, rightPayload, ""),
    conflicts
  };
}

export function run() {
  const failures = [];
  const workspaceJsExists = fs.existsSync(workspaceJsPath);
  const workspaceHtmlExists = fs.existsSync(workspaceHtmlPath);
  const workspaceJsText = workspaceJsExists ? readText(workspaceJsPath) : "";
  const workspaceHtmlText = workspaceHtmlExists ? readText(workspaceHtmlPath) : "";
  const { syntaxValid, syntaxError } = checkJsSyntax(workspaceJsPath);

  const htmlHasMergeUi = workspaceHtmlText.includes("workspaceV2MergeLeftSelect") &&
    workspaceHtmlText.includes("workspaceV2MergeRightSelect") &&
    workspaceHtmlText.includes("workspaceV2ComputeMergeButton") &&
    workspaceHtmlText.includes("workspaceV2MergeOutput");
  const jsHasMergeCandidatesMethod = workspaceJsText.includes("buildSessionMergeCandidates()");
  const jsHasMergeComputeMethod = workspaceJsText.includes("mergeSessionPayloads(leftPayload, rightPayload)");
  const jsHasMergeSelectionMethod = workspaceJsText.includes("computeSelectedSessionMerge()");
  const jsWritesMergedSession = workspaceJsText.includes("sessionStorage.setItem(hostContextId");

  if (!workspaceJsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!workspaceHtmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!syntaxValid) failures.push("workspace-v2/index.js failed syntax check.");
  if (!htmlHasMergeUi) failures.push("Merge UI nodes are missing.");
  if (!jsHasMergeCandidatesMethod) failures.push("Missing buildSessionMergeCandidates().");
  if (!jsHasMergeComputeMethod) failures.push("Missing mergeSessionPayloads(leftPayload, rightPayload).");
  if (!jsHasMergeSelectionMethod) failures.push("Missing computeSelectedSessionMerge().");
  if (!jsWritesMergedSession) failures.push("Missing merged session write to sessionStorage.");

  const payloadA = {
    version: "v2",
    toolId: "asset-manager-v2",
    payloadJson: {
      shared: "same",
      onlyA: { enabled: true },
      conflictValue: "A",
      nested: { same: 1, onlyA: "A", conflict: { mode: "a" } }
    }
  };
  const payloadB = {
    version: "v2",
    toolId: "asset-manager-v2",
    payloadJson: {
      shared: "same",
      onlyB: { enabled: true },
      conflictValue: "B",
      nested: { same: 1, onlyB: "B", conflict: { mode: "b" } }
    }
  };

  const originalA = clone(payloadA);
  const originalB = clone(payloadB);
  const result = mergePayloads(payloadA, payloadB);

  if (result.mergedPayload.payloadJson.onlyA?.enabled !== true) {
    failures.push("Expected merged payload to include non-conflicting key from payload A.");
  }
  if (result.mergedPayload.payloadJson.onlyB?.enabled !== true) {
    failures.push("Expected merged payload to include non-conflicting key from payload B.");
  }
  if (!Object.prototype.hasOwnProperty.call(result.conflicts, "payloadJson.conflictValue")) {
    failures.push("Expected conflict for payloadJson.conflictValue.");
  }
  if (!Object.prototype.hasOwnProperty.call(result.conflicts, "payloadJson.nested.conflict.mode")) {
    failures.push("Expected nested conflict for payloadJson.nested.conflict.mode.");
  }
  if (JSON.stringify(payloadA) !== JSON.stringify(originalA)) {
    failures.push("Payload A was mutated by merge.");
  }
  if (JSON.stringify(payloadB) !== JSON.stringify(originalB)) {
    failures.push("Payload B was mutated by merge.");
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
      htmlHasMergeUi,
      jsHasMergeCandidatesMethod,
      jsHasMergeComputeMethod,
      jsHasMergeSelectionMethod,
      jsWritesMergedSession
    },
    mergeResult: result
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session merge results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session merge failures: ${failures.join(" | ")}`);
  return { failures, mergeResult: result };
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
