/*
Toolbox Aid
David Quesenberry
06/02/2026
aiAssistantContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createDraftToolContract,
} from "../toolContract.js";

export const AI_ASSISTANT_TOOL_CONTRACT = createDraftToolContract({
  toolId: "ai-assistant",
  toolType: TOOL_CONTRACT_TYPES.UTILITY,
  requiredInputs: [TOOL_CONTRACT_FORMATS.TEXT],
  producedOutputs: [TOOL_CONTRACT_FORMATS.TEXT],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE,
  importFormats: [TOOL_CONTRACT_FORMATS.TEXT],
  exportFormats: [TOOL_CONTRACT_FORMATS.TEXT],
});
