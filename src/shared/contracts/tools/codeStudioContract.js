/*
Toolbox Aid
David Quesenberry
06/02/2026
codeStudioContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createDraftToolContract,
} from "../toolContract.js";

export const CODE_STUDIO_TOOL_CONTRACT = createDraftToolContract({
  toolId: "code-studio",
  toolType: TOOL_CONTRACT_TYPES.EDITOR,
  requiredInputs: [TOOL_CONTRACT_FORMATS.CODE_FILE],
  producedOutputs: [TOOL_CONTRACT_FORMATS.CODE_FILE],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE,
  importFormats: [TOOL_CONTRACT_FORMATS.CODE_FILE],
  exportFormats: [TOOL_CONTRACT_FORMATS.CODE_FILE],
});
