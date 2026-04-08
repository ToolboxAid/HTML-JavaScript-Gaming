import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const thisFilePath = fileURLToPath(import.meta.url);
const thisDir = path.dirname(thisFilePath);
const guardScriptPath = path.join(thisDir, "checkSharedExtractionGuard.mjs");

const CASES = [
  {
    name: "violation: local helper definition",
    fileContent: "function asFiniteNumber(value) { return value; }\n",
    expectedExitCode: 1
  },
  {
    name: "violation: disallowed shared relative import",
    fileContent: "import { asFiniteNumber } from '../../../src/shared/utils/numberUtils.js';\n",
    expectedExitCode: 1
  },
  {
    name: "violation: alias usage",
    fileContent: "import { asFiniteNumber } from '@shared/utils/numberUtils.js';\n",
    expectedExitCode: 1
  },
  {
    name: "clean case",
    fileContent: "const frameId = Number(42);\nexport { frameId };\n",
    expectedExitCode: 0
  }
];

async function createWorkspaceWithFixture(content) {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "shared-extraction-guard-selftest-"));
  const srcDir = path.join(workspace, "src");
  await fs.mkdir(srcDir, { recursive: true });
  await fs.writeFile(path.join(srcDir, "fixture.js"), content, "utf8");
  return workspace;
}

function runGuardAt(workspacePath) {
  return spawnSync(process.execPath, [guardScriptPath], {
    cwd: workspacePath,
    encoding: "utf8"
  });
}

async function runCase(testCase) {
  const workspace = await createWorkspaceWithFixture(testCase.fileContent);
  try {
    const result = runGuardAt(workspace);
    const actualExit = typeof result.status === "number" ? result.status : 1;
    const passed = actualExit === testCase.expectedExitCode;
    const line = passed ? "PASS" : "FAIL";
    console.log(`${line}: ${testCase.name} (expected ${testCase.expectedExitCode}, got ${actualExit})`);
    return passed;
  } finally {
    await fs.rm(workspace, { recursive: true, force: true });
  }
}

async function run() {
  try {
    await fs.access(guardScriptPath);
  } catch {
    console.error("FAIL: guard script missing at tools/dev/checkSharedExtractionGuard.mjs");
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  for (const testCase of CASES) {
    const ok = await runCase(testCase);
    if (ok) passed += 1;
    else failed += 1;
  }

  console.log(`Summary: tests_run=${CASES.length}`);
  console.log(`Summary: tests_passed=${passed}`);
  console.log(`Summary: tests_failed=${failed}`);

  process.exit(failed === 0 ? 0 : 1);
}

run().catch((error) => {
  console.error("Selftest runner error.");
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
