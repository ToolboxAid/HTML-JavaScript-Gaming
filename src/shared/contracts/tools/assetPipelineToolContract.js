/*
Toolbox Aid
David Quesenberry
06/02/2026
assetPipelineToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const ASSET_PIPELINE_TOOL_CONTRACT = createToolContract({
  toolId: "asset-pipeline",
  toolType: TOOL_CONTRACT_TYPES.PIPELINE,
  requiredInputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.ASSET],
  producedOutputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  supportedAssetTypes: Object.values(ASSET_TYPES),
  importFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.ASSET],
  exportFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
});
