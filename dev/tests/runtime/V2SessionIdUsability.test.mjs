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
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-session-id-usability-results.json");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function checkSyntax(jsFilePath) {
  try {
    execFileSync(process.execPath, ["--check", jsFilePath], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { ok: true, error: "" };
  } catch (error) {
    return { ok: false, error: (error?.stderr || error?.stdout || error?.message || "").toString().trim() };
  }
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? readText(htmlPath) : "";
  const js = jsExists ? readText(jsPath) : "";
  const syntax = checkSyntax(jsPath);

  const hasSessionIdLabel = html.includes("Session ID (for Save / Load / Delete)");
  const hasHelperText = html.includes("Use a session ID from Recent Sessions or saved library.");
  const hasCopyButtonText = js.includes("copyIdButton.textContent = \"Copy ID\";");
  const hasUseButtonText = js.includes("useInLibraryButton.textContent = \"Use in Library\";");
  const hasCopyMethod = js.includes("async copySessionIdToClipboard(hostContextId)");
  const hasClipboardWrite = js.includes("await navigator.clipboard.writeText(hostContextId.trim());");
  const hasUseMethod = js.includes("useSessionIdInLibraryInput(hostContextId)");
  const hasUsePopulate = js.includes("this.sessionNameNode.value = hostContextId.trim();");

  const deleteMethodStart = js.indexOf("deleteNamedSession() {");
  const createSessionStart = js.indexOf("createSessionAndLaunch() {", deleteMethodStart);
  const deleteMethod = deleteMethodStart >= 0 && createSessionStart > deleteMethodStart
    ? js.slice(deleteMethodStart, createSessionStart)
    : "";
  const deleteTouchesLibrary = deleteMethod.includes("const library = this.readSessionLibrary();") &&
    deleteMethod.includes("delete library[sessionName];") &&
    deleteMethod.includes("this.writeSessionLibrary(library);");
  const deleteTouchesHistory = deleteMethod.includes("readSessionHistory(") ||
    deleteMethod.includes("writeSessionHistory(");

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!syntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!hasSessionIdLabel) failures.push("Session Name label was not updated to Session ID label.");
  if (!hasHelperText) failures.push("Session ID helper text is missing.");
  if (!hasCopyButtonText) failures.push("Copy ID button is missing from Recent Sessions.");
  if (!hasUseButtonText) failures.push("Use in Library button is missing from Recent Sessions.");
  if (!hasCopyMethod || !hasClipboardWrite) failures.push("Copy ID behavior does not write exact hostContextId to clipboard.");
  if (!hasUseMethod || !hasUsePopulate) failures.push("Use in Library behavior does not populate Session ID input.");
  if (!deleteTouchesLibrary) failures.push("Delete behavior is not operating on Session Library as expected.");
  if (deleteTouchesHistory) failures.push("Delete behavior should not affect Recent Sessions history.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: {
      htmlExists,
      jsExists,
      syntax,
      hasSessionIdLabel,
      hasHelperText,
      hasCopyButtonText,
      hasUseButtonText,
      hasCopyMethod,
      hasClipboardWrite,
      hasUseMethod,
      hasUsePopulate,
      deleteTouchesLibrary,
      deleteTouchesHistory
    }
  }, null, 2)}\n`, "utf8");

  console.log(`v2 session-id usability results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 session-id usability failures: ${failures.join(" | ")}`);
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
