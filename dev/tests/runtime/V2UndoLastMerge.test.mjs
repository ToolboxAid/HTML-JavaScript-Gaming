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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-undo-last-merge-results.json");

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

function undoEnabled(lastMergedHostContextId, recent) {
  return Boolean(lastMergedHostContextId && recent.some((entry) => entry.hostContextId === lastMergedHostContextId));
}

function undoLastMergeSimulation(state) {
  const next = {
    ...state,
    recent: [...state.recent],
    sessionStorageMap: { ...state.sessionStorageMap },
    library: { ...state.library }
  };
  const lastMergedId = typeof next.lastMergedHostContextId === "string" ? next.lastMergedHostContextId.trim() : "";
  if (!lastMergedId) {
    return { ...next, status: "No recent merge to undo.", undoEnabled: undoEnabled("", next.recent) };
  }
  const exists = next.recent.some((entry) => entry.hostContextId === lastMergedId);
  if (!exists) {
    next.lastMergedHostContextId = "";
    return { ...next, status: "No recent merge to undo.", undoEnabled: undoEnabled("", next.recent) };
  }
  next.recent = next.recent.filter((entry) => entry.hostContextId !== lastMergedId);
  delete next.sessionStorageMap[lastMergedId];
  if (next.diffLeft === `history:${lastMergedId}`) next.diffLeft = "";
  if (next.diffRight === `history:${lastMergedId}`) next.diffRight = "";
  if (next.mergeLeft === `history:${lastMergedId}`) next.mergeLeft = "";
  if (next.mergeRight === `history:${lastMergedId}`) next.mergeRight = "";
  next.lastMergedHostContextId = "";
  return { ...next, status: "Last merged session removed.", undoEnabled: undoEnabled(next.lastMergedHostContextId, next.recent) };
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? fs.readFileSync(htmlPath, "utf8") : "";
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2UndoLastMerge.test.mjs"));

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2UndoLastMerge.test.mjs failed syntax check.");

  const requiredHtml = [
    "id=\"workspaceV2UndoLastMergeButton\"",
    "Undo Last Merge"
  ];
  requiredHtml.forEach((token) => {
    if (!html.includes(token)) failures.push(`Missing Undo Last Merge UI token: ${token}`);
  });

  const requiredJs = [
    "this.lastMergedSessionStorageKey = \"v2-last-merged\";",
    "this.lastMergedHostContextId = this.readLastMergedHostContextId();",
    "createMergedHostContextId(toolId)",
    "this.writeLastMergedHostContextId(hostContextId);",
    "updateUndoLastMergeState()",
    "undoLastMerge()",
    "Last merged session removed.",
    "No recent merge to undo."
  ];
  requiredJs.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing Undo Last Merge token: ${token}`);
  });

  const mergedId = "asset-manager-v2-merged-1777777777777-abcd1234";
  const baseState = {
    lastMergedHostContextId: mergedId,
    recent: [
      { hostContextId: mergedId, tool: "asset-manager-v2", payload: { version: "v2", toolId: "asset-manager-v2", mergeResultMeta: { isMergedResult: true } } },
      { hostContextId: "asset-manager-v2-regular", tool: "asset-manager-v2", payload: { version: "v2", toolId: "asset-manager-v2" } }
    ],
    sessionStorageMap: {
      [mergedId]: "{\"version\":\"v2\",\"toolId\":\"asset-manager-v2\"}",
      "asset-manager-v2-regular": "{\"version\":\"v2\",\"toolId\":\"asset-manager-v2\"}"
    },
    library: {
      "saved-1": { version: "v2", toolId: "asset-manager-v2" }
    },
    diffLeft: `history:${mergedId}`,
    diffRight: "history:asset-manager-v2-regular",
    mergeLeft: `history:${mergedId}`,
    mergeRight: ""
  };

  if (!undoEnabled(baseState.lastMergedHostContextId, baseState.recent)) {
    failures.push("Undo should be enabled when last merged session exists in recent.");
  }

  const undone = undoLastMergeSimulation(baseState);
  if (undone.status !== "Last merged session removed.") {
    failures.push("Undo should report successful removal message.");
  }
  if (undone.recent.some((entry) => entry.hostContextId === mergedId)) {
    failures.push("Undo should remove merged session from recent.");
  }
  if (Object.prototype.hasOwnProperty.call(undone.sessionStorageMap, mergedId)) {
    failures.push("Undo should remove merged session payload from sessionStorage.");
  }
  if (undone.diffLeft !== "" || undone.mergeLeft !== "") {
    failures.push("Undo should clear A/B selections referencing the merged session.");
  }
  if (undone.undoEnabled) {
    failures.push("Undo should disable itself after execution.");
  }
  if (!Object.prototype.hasOwnProperty.call(undone.library, "saved-1")) {
    failures.push("Undo should not affect Session Library entries.");
  }

  const noUndo = undoLastMergeSimulation({ ...undone, lastMergedHostContextId: "" });
  if (noUndo.status !== "No recent merge to undo.") {
    failures.push("Undo should show message when no last merge exists.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { htmlExists, jsExists, jsSyntax, testSyntax },
    scenarios: { baseState, undone, noUndo }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 undo-last-merge results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 undo-last-merge failures: ${failures.join(" | ")}`);
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

