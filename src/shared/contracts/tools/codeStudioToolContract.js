/*
Toolbox Aid
David Quesenberry
06/02/2026
codeStudioToolContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_STATUS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const CODE_STUDIO_TOOL_CONTRACT = createToolContract({
  toolId: "code-studio",
  toolType: TOOL_CONTRACT_TYPES.EDITOR,
  requiredInputs: [TOOL_CONTRACT_FORMATS.CODE_FILE],
  producedOutputs: [TOOL_CONTRACT_FORMATS.CODE_FILE],
  supportedAssetTypes: [],
  importFormats: [TOOL_CONTRACT_FORMATS.CODE_FILE],
  exportFormats: [TOOL_CONTRACT_FORMATS.CODE_FILE],
  status: TOOL_CONTRACT_STATUS.DRAFT,
});
