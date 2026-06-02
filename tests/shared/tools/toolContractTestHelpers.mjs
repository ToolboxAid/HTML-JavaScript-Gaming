/*
Toolbox Aid
David Quesenberry
06/02/2026
toolContractTestHelpers.mjs
*/
import assert from "node:assert/strict";

export function runToolContractModuleTest(toolContract, expectedToolId) {
  assert.equal(toolContract.toolId, expectedToolId);
  assert.equal(typeof toolContract.toolType, "string", `${expectedToolId} toolType`);
  assert.equal(typeof toolContract.grouping, "string", `${expectedToolId} grouping`);
  assert.ok(toolContract.grouping.length > 0, `${expectedToolId} grouping value`);
  assert.ok(Array.isArray(toolContract.requiredInputs), `${expectedToolId} requiredInputs`);
  assert.ok(Array.isArray(toolContract.producedOutputs), `${expectedToolId} producedOutputs`);
  assert.ok(Array.isArray(toolContract.supportedAssetTypes), `${expectedToolId} supportedAssetTypes`);
  assert.ok(Array.isArray(toolContract.importFormats), `${expectedToolId} importFormats`);
  assert.ok(Array.isArray(toolContract.exportFormats), `${expectedToolId} exportFormats`);
  assert.ok(toolContract.producedOutputs.length > 0, `${expectedToolId} declares produced outputs`);
  assert.ok(toolContract.exportFormats.length > 0, `${expectedToolId} declares export formats`);
}
