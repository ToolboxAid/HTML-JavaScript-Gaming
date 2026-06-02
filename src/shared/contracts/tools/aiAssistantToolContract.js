/*
Toolbox Aid
David Quesenberry
06/02/2026
aiAssistantToolContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_STATUS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const AI_ASSISTANT_TOOL_CONTRACT = createToolContract({
  toolId: "ai-assistant",
  toolType: TOOL_CONTRACT_TYPES.UTILITY,
  requiredInputs: [TOOL_CONTRACT_FORMATS.TEXT],
  producedOutputs: [TOOL_CONTRACT_FORMATS.TEXT],
  supportedAssetTypes: [],
  importFormats: [TOOL_CONTRACT_FORMATS.TEXT],
  exportFormats: [TOOL_CONTRACT_FORMATS.TEXT],
  status: TOOL_CONTRACT_STATUS.DRAFT,
});
