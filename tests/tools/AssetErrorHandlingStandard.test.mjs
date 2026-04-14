import assert from "node:assert/strict";
import { createAssetError, appendAssetError, appendAssetErrors } from "../../tools/shared/pipeline/assetErrorHandling.js";

export async function run() {
  const normalized = createAssetError({
    level: "warning",
    code: "CODE_SAMPLE",
    stage: "runtime-validation",
    domain: "vectors",
    assetId: "vector.ship",
    message: "Sample warning",
    details: { source: "test" }
  });
  assert.equal(normalized.level, "warning");
  assert.equal(normalized.code, "CODE_SAMPLE");
  assert.equal(normalized.stage, "runtime-validation");
  assert.equal(normalized.domain, "vectors");
  assert.equal(normalized.assetId, "vector.ship");
  assert.equal(normalized.details.source, "test");

  const errors = [];
  appendAssetError(errors, {
    code: "ERR_ONE",
    stage: "lookup",
    message: "first"
  });
  appendAssetErrors(errors, [
    { code: "ERR_TWO", stage: "validate", message: "second" },
    { code: "ERR_THREE", stage: "emit", message: "third" }
  ]);
  assert.equal(errors.length, 3);
  assert.deepEqual(errors.map((entry) => entry.code), ["ERR_ONE", "ERR_TWO", "ERR_THREE"]);
}
