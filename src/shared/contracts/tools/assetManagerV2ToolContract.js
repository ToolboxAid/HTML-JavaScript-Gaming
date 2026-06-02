/*
Toolbox Aid
David Quesenberry
06/02/2026
assetManagerV2ToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const ASSET_MANAGER_V2_TOOL_CONTRACT = createToolContract({
  toolId: "asset-manager-v2",
  toolType: TOOL_CONTRACT_TYPES.MANAGER,
  requiredInputs: [TOOL_CONTRACT_FORMATS.PALETTE_JSON, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  supportedAssetTypes: Object.values(ASSET_TYPES),
  importFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.ASSET],
  exportFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
});
