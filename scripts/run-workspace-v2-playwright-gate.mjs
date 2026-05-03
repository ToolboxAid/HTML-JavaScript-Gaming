/*
Toolbox Aid
David Quesenberry
05/03/2026
run-workspace-v2-playwright-gate.mjs
*/
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const npmExecPath = typeof process.env.npm_execpath === "string" ? process.env.npm_execpath.trim() : "";
const command = process.execPath;
const args = npmExecPath
  ? [npmExecPath, "run", "--silent", "test:workspace-v2:playwright"]
  : [path.join(repoRoot, "node_modules", "@playwright", "test", "cli.js"), "test", "tests/ui/workspace-v2.asset-manager.spec.js"];

const result = spawnSync(command, args, {
  cwd: repoRoot,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
});

const stdout = typeof result.stdout === "string" ? result.stdout : "";
const stderr = typeof result.stderr === "string" ? result.stderr : "";
if (stdout) process.stdout.write(stdout);
if (stderr) process.stderr.write(stderr);

const combinedOutput = `${stdout}\n${stderr}`;
const passedMatch = combinedOutput.match(/(^|\n)\s*(\d+)\s+passed\b/);
const failedMatch = combinedOutput.match(/(^|\n)\s*(\d+)\s+failed\b/);
const passedCount = passedMatch ? Number.parseInt(passedMatch[2], 10) : 0;
const failedCount = failedMatch ? Number.parseInt(failedMatch[2], 10) : 0;

console.log(`Workspace V2 Playwright Gate Summary: passed=${passedCount} failed=${failedCount}`);

if (result.error) {
  console.error(`Workspace V2 Playwright gate execution failed: ${result.error.message}`);
  process.exitCode = 1;
} else if (result.status !== 0 || failedCount > 0) {
  process.exitCode = typeof result.status === "number" && result.status !== 0 ? result.status : 1;
}
