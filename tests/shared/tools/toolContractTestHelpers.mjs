/*
Toolbox Aid
David Quesenberry
06/02/2026
toolContractTestHelpers.mjs
*/
import assert from "node:assert/strict";
import {
  isAssetType,
} from "../../../src/shared/contracts/assetContract.js";
import {
  TOOL_CONTRACT_OWNER_ID,
  TOOL_CONTRACT_PROJECT_ID,
  isToolContractFormat,
  validateToolContract,
} from "../../../src/shared/contracts/toolContractPrimitives.js";
import {
  getToolContractById,
} from "../../../src/shared/contracts/tools/toolContractsIndex.js";

export function runToolContractModuleTest(toolContract, expectedToolId) {
  assert.equal(toolContract.toolId, expectedToolId);
  assert.equal(getToolContractById(expectedToolId), toolContract);
  assert.equal(toolContract.ownerId, TOOL_CONTRACT_OWNER_ID);
  assert.equal(toolContract.projectId, TOOL_CONTRACT_PROJECT_ID);
  assert.ok(Object.isFrozen(toolContract));
  assert.ok(Object.isFrozen(toolContract.requiredInputs));
  assert.ok(Object.isFrozen(toolContract.producedOutputs));
  assert.ok(Object.isFrozen(toolContract.supportedAssetTypes));
  assert.ok(Object.isFrozen(toolContract.importFormats));
  assert.ok(Object.isFrozen(toolContract.exportFormats));
  assert.ok(toolContract.producedOutputs.length > 0, `${expectedToolId} produced outputs`);
  assert.ok(toolContract.exportFormats.length > 0, `${expectedToolId} export formats`);

  const validation = validateToolContract(toolContract);
  assert.equal(validation.valid, true, expectedToolId);
  assert.deepEqual(validation.errors, [], expectedToolId);

  for (const requiredInput of toolContract.requiredInputs) {
    assert.equal(isToolContractFormat(requiredInput), true, `${expectedToolId} required input ${requiredInput}`);
  }
  for (const producedOutput of toolContract.producedOutputs) {
    assert.equal(isToolContractFormat(producedOutput), true, `${expectedToolId} produced output ${producedOutput}`);
  }
  for (const importFormat of toolContract.importFormats) {
    assert.equal(isToolContractFormat(importFormat), true, `${expectedToolId} import format ${importFormat}`);
  }
  for (const exportFormat of toolContract.exportFormats) {
    assert.equal(isToolContractFormat(exportFormat), true, `${expectedToolId} export format ${exportFormat}`);
  }
  for (const supportedAssetType of toolContract.supportedAssetTypes) {
    assert.equal(isAssetType(supportedAssetType), true, `${expectedToolId} supported asset ${supportedAssetType}`);
  }
}
