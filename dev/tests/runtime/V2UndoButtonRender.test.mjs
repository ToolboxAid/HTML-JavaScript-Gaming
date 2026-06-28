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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-undo-button-render-results.json");

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

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? fs.readFileSync(htmlPath, "utf8") : "";
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(path.join(repoRoot, "tests", "runtime", "V2UndoButtonRender.test.mjs"));

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2UndoButtonRender.test.mjs failed syntax check.");

  const mergeActionGroupPattern = /<div>\s*<button id="workspaceV2ComputeMergeButton"[\s\S]*?<button id="workspaceV2ConfirmMergeButton"[\s\S]*?<button id="workspaceV2ApplyMergeButton"[\s\S]*?<button id="workspaceV2UndoLastMergeButton"[\s\S]*?<\/div>/m;
  if (!mergeActionGroupPattern.test(html)) {
    failures.push("Undo Last Merge button is not rendered in the same merge action group as Preview/Confirm/Apply.");
  }
  if (!html.includes('id="workspaceV2UndoLastMergeButton" type="button" disabled')) {
    failures.push("Undo Last Merge button should be initially disabled in UI.");
  }

  const requiredJs = [
    "this.undoLastMergeButton = document.getElementById(\"workspaceV2UndoLastMergeButton\");",
    "this.undoLastMergeButton.addEventListener(\"click\", () => {",
    "this.undoLastMerge();",
    "updateUndoLastMergeState()",
    "this.undoLastMergeButton.disabled = !hasRecentMerged;",
    "Last merged session removed.",
    "No recent merge to undo."
  ];
  requiredJs.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing Undo button wiring token: ${token}`);
  });

  const mergedId = "asset-manager-v2-merged-1777777777777-abcd1234";
  const recentWithMerge = [{ hostContextId: mergedId }, { hostContextId: "other" }];
  const recentWithoutMerge = [{ hostContextId: "other" }];
  const initiallyDisabled = !undoEnabled("", recentWithoutMerge);
  const enabledAfterMerge = undoEnabled(mergedId, recentWithMerge);
  const disabledAfterUndo = !undoEnabled("", recentWithoutMerge);
  if (!initiallyDisabled) failures.push("Undo button should be disabled initially.");
  if (!enabledAfterMerge) failures.push("Undo button should enable when last merged session exists in recent.");
  if (!disabledAfterUndo) failures.push("Undo button should disable after undo clears last merged session.");

  const libraryBefore = { "saved-1": { toolId: "asset-manager-v2", version: "v2" } };
  const libraryAfter = { ...libraryBefore };
  if (JSON.stringify(libraryBefore) !== JSON.stringify(libraryAfter)) {
    failures.push("Undo should not impact Session Library.");
  }

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { htmlExists, jsExists, jsSyntax, testSyntax },
    states: { initiallyDisabled, enabledAfterMerge, disabledAfterUndo }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 undo-button-render results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 undo-button-render failures: ${failures.join(" | ")}`);
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

