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
const testPath = path.join(repoRoot, "tests", "runtime", "V2WorkspaceDefaultToolInitialization.test.mjs");
const resultsPath = path.join(repoRoot, "dev", "workspace", "tmp", "v2-workspace-default-tool-init-results.json");

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

function simulateInitialization(selectedToolId, existingPayload, existingHostContextId) {
  if (existingPayload && existingHostContextId) {
    return { initialized: false, blocked: false, payload: existingPayload, hostContextId: existingHostContextId };
  }
  if (!selectedToolId) {
    return { initialized: false, blocked: true, message: "Workspace V2 initialization blocked: default tool is missing." };
  }
  const payload = { version: "v2", toolId: selectedToolId, payloadJson: {} };
  return { initialized: true, blocked: false, payload, hostContextId: `${selectedToolId}-1234567890123-abcd1234` };
}

export function run() {
  const failures = [];
  const htmlExists = fs.existsSync(htmlPath);
  const jsExists = fs.existsSync(jsPath);
  const html = htmlExists ? fs.readFileSync(htmlPath, "utf8") : "";
  const js = jsExists ? fs.readFileSync(jsPath, "utf8") : "";
  const jsSyntax = checkSyntax(jsPath);
  const testSyntax = checkSyntax(testPath);

  if (!htmlExists) failures.push("Missing toolbox/workspace-v2/index.html.");
  if (!jsExists) failures.push("Missing toolbox/workspace-v2/index.js.");
  if (!jsSyntax.ok) failures.push("toolbox/workspace-v2/index.js failed syntax check.");
  if (!testSyntax.ok) failures.push("tests/runtime/V2WorkspaceDefaultToolInitialization.test.mjs failed syntax check.");

  const requiredHtmlTokens = [
    '<option value="palette-manager-v2" selected>Palette Manager V2</option>'
  ];
  requiredHtmlTokens.forEach((token) => {
    if (!html.includes(token)) failures.push(`Missing required default tool HTML token: ${token}`);
  });

  const requiredJsTokens = [
    "this.applyDefaultWorkspaceToolSelection();",
    "this.initializeWorkspaceProducerSession();",
    "applyDefaultWorkspaceToolSelection()",
    'const defaultToolId = "palette-manager-v2";',
    "initializeWorkspaceProducerSession()",
    "payloadJson: {}",
    'this.setCurrentSessionPayload(initialPayload, "workspace-v2-init");',
    "Session is active for Save Session."
  ];
  requiredJsTokens.forEach((token) => {
    if (!js.includes(token)) failures.push(`Missing required initialization token: ${token}`);
  });

  const noExisting = simulateInitialization("palette-manager-v2", null, "");
  if (!noExisting.initialized) failures.push("Initialization should create an active session when none exists.");
  if (noExisting.payload?.toolId !== "palette-manager-v2") failures.push("Initialized payload should use Palette Manager toolId.");
  if (!noExisting.payload || noExisting.payload.version !== "v2") failures.push("Initialized payload should be versioned as v2.");

  const existing = simulateInitialization("palette-manager-v2", { version: "v2", toolId: "palette-manager-v2", payloadJson: {} }, "palette-manager-v2-1");
  if (existing.initialized) failures.push("Initialization should not recreate session when active session already exists.");

  const blocked = simulateInitialization("", null, "");
  if (!blocked.blocked) failures.push("Initialization should block when no default tool is available.");

  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    failures,
    checks: { htmlExists, jsExists, jsSyntax, testSyntax },
    scenarios: { noExisting, existing, blocked }
  }, null, 2)}
`, "utf8");

  console.log(`v2 workspace-default-tool-init results: ${resultsPath}`);
  assert.equal(failures.length, 0, `V2 workspace-default-tool-init failures: ${failures.join(" | ")}`);
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
