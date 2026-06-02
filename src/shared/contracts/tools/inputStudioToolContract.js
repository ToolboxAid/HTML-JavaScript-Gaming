/*
Toolbox Aid
David Quesenberry
06/02/2026
inputStudioToolContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createDraftToolContract,
} from "../toolContractPrimitives.js";

export const INPUT_STUDIO_TOOL_CONTRACT = createDraftToolContract({
  toolId: "input-studio",
  toolType: TOOL_CONTRACT_TYPES.UTILITY,
  requiredInputs: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
  producedOutputs: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE,
  importFormats: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
  exportFormats: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
});
