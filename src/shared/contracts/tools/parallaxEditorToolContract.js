/*
Toolbox Aid
David Quesenberry
06/02/2026
parallaxEditorToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const PARALLAX_EDITOR_TOOL_CONTRACT = createToolContract({
  toolId: "parallax-editor",
  toolType: TOOL_CONTRACT_TYPES.EDITOR,
  requiredInputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE],
  producedOutputs: [TOOL_CONTRACT_FORMATS.JSON, TOOL_CONTRACT_FORMATS.IMAGE_FILE],
  supportedAssetTypes: [ASSET_TYPES.IMAGE],
  importFormats: [TOOL_CONTRACT_FORMATS.JSON, TOOL_CONTRACT_FORMATS.IMAGE_FILE],
  exportFormats: [TOOL_CONTRACT_FORMATS.JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
});
