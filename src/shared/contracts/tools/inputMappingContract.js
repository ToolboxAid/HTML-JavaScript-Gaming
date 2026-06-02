/*
Toolbox Aid
David Quesenberry
06/02/2026
inputMappingContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "./toolContract.js";

export const INPUT_MAPPING_V2_TOOL_CONTRACT = createToolContract({
  toolId: "input-mapping-v2",
  toolType: TOOL_CONTRACT_TYPES.UTILITY,
  grouping: "Input",
  requiredInputs: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
  producedOutputs: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE,
  importFormats: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
  exportFormats: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
});
