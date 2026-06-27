/*
Toolbox Aid
David Quesenberry
06/02/2026
ToolOutputDeclarationContract.test.mjs
*/
import assert from "node:assert/strict";
import {
  TOOL_CONTRACT_ASSET_TYPES,
  TOOL_CONTRACT_ASSET_TYPE_LIST,
  TOOL_CONTRACT_ASSET_TYPE_OUTPUT_FORMATS,
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  isToolContractAssetType,
  isToolContractFormat,
  isToolContractOutputFormatForAssetType,
} from "../../../../src/shared/contracts/tools/toolContract.js";
import {
  TOOL_CONTRACT_LIST,
  getToolContractById,
} from "../../../../src/shared/contracts/tools/toolContractsIndex.js";

export function run() {
  assert.deepEqual(TOOL_CONTRACT_ASSET_TYPE_LIST, [
    "vector",
    "palette",
    "image",
    "audio",
    "tilemap",
    "localization",
  ]);
  assert.deepEqual(TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.ALL, TOOL_CONTRACT_ASSET_TYPE_LIST);
  assert.deepEqual(TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE, []);

  assert.equal(isToolContractAssetType(TOOL_CONTRACT_ASSET_TYPES.VECTOR), true);
  assert.equal(isToolContractAssetType("shader"), false);
  assert.equal(isToolContractOutputFormatForAssetType(TOOL_CONTRACT_ASSET_TYPES.VECTOR, TOOL_CONTRACT_FORMATS.SVG), true);
  assert.equal(isToolContractOutputFormatForAssetType(TOOL_CONTRACT_ASSET_TYPES.VECTOR, TOOL_CONTRACT_FORMATS.PALETTE_JSON), false);
  assert.deepEqual(TOOL_CONTRACT_ASSET_TYPE_OUTPUT_FORMATS[TOOL_CONTRACT_ASSET_TYPES.IMAGE], [
    "image-file",
    "metadata-json",
    "project-package",
  ]);

  const representedAssetTypes = new Set();

  for (const toolContract of TOOL_CONTRACT_LIST) {
    assert.ok(toolContract.producedOutputs.length > 0, `${toolContract.toolId} declares produced outputs`);

    for (const producedOutput of toolContract.producedOutputs) {
      assert.equal(isToolContractFormat(producedOutput), true, `${toolContract.toolId} output ${producedOutput}`);
    }

    for (const assetType of toolContract.supportedAssetTypes) {
      assert.equal(isToolContractAssetType(assetType), true, `${toolContract.toolId} supported asset type ${assetType}`);
      representedAssetTypes.add(assetType);
    }
  }

  assert.deepEqual(Array.from(representedAssetTypes).sort(), [...TOOL_CONTRACT_ASSET_TYPE_LIST].sort());

  assert.deepEqual(getToolContractById("object-vector-studio-v2").producedOutputs, [
    TOOL_CONTRACT_FORMATS.VECTOR_JSON,
    TOOL_CONTRACT_FORMATS.SVG,
  ]);
  assert.deepEqual(getToolContractById("palette-manager-v2").producedOutputs, [
    TOOL_CONTRACT_FORMATS.PALETTE_JSON,
  ]);
  assert.deepEqual(getToolContractById("audio-sfx-playground-v2").producedOutputs, [
    TOOL_CONTRACT_FORMATS.AUDIO_FILE,
  ]);
  assert.deepEqual(getToolContractById("tile-map-editor").producedOutputs, [
    TOOL_CONTRACT_FORMATS.TILEMAP_JSON,
  ]);
  assert.deepEqual(getToolContractById("localization-studio").producedOutputs, [
    TOOL_CONTRACT_FORMATS.LOCALIZATION_JSON,
  ]);
}
