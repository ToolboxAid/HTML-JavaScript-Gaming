import assert from "node:assert/strict";
import { runCiValidationPipeline, summarizeCiValidationPipeline } from "../../tools/shared/ciValidationPipeline.js";

export async function run() {
  const result = await runCiValidationPipeline({ branch: "main", trigger: "pull_request" });
  assert.equal(result.ciValidation.status, "pass");
  assert.equal(result.ciValidation.artifactEntries.length, 9);
  assert.equal(summarizeCiValidationPipeline(result), "Platform validation suite pass with 8/8 scenarios passing. CI gate green.");
  assert.match(result.ciValidation.reportText, /Trigger: pull_request/);
}
