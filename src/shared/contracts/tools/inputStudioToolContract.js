/*
Toolbox Aid
David Quesenberry
06/02/2026
inputStudioToolContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_STATUS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const INPUT_STUDIO_TOOL_CONTRACT = createToolContract({
  toolId: "input-studio",
  toolType: TOOL_CONTRACT_TYPES.UTILITY,
  requiredInputs: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
  producedOutputs: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
  supportedAssetTypes: [],
  importFormats: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
  exportFormats: [TOOL_CONTRACT_FORMATS.INPUT_MAP],
  status: TOOL_CONTRACT_STATUS.DRAFT,
});
