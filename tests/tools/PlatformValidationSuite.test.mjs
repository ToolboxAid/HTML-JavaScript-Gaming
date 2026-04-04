import assert from "node:assert/strict";
import { runPlatformValidationSuite, summarizePlatformValidationSuite } from "../../tools/shared/platformValidationSuite.js";

export async function run() {
  const first = await runPlatformValidationSuite();
  const second = await runPlatformValidationSuite();

  assert.equal(first.platformValidationSuite.status, "pass");
  assert.equal(first.platformValidationSuite.scenarios.length, 8);
  assert.equal(summarizePlatformValidationSuite(first), "Platform validation suite pass with 8/8 scenarios passing.");
  assert.deepEqual(second, first);
  assert.match(first.platformValidationSuite.reportText, /baseline-valid-flow/);
  assert.match(first.platformValidationSuite.reportText, /runtime-fail-fast-flow/);
  assert.match(first.platformValidationSuite.reportText, /plugin-integration-flow/);
}
