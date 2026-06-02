/*
Toolbox Aid
David Quesenberry
06/02/2026
animationStudioToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createDraftToolContract,
} from "../toolContractPrimitives.js";

export const ANIMATION_STUDIO_TOOL_CONTRACT = createDraftToolContract({
  toolId: "animation-studio",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  requiredInputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE],
  producedOutputs: [TOOL_CONTRACT_FORMATS.ANIMATION_JSON],
  supportedAssetTypes: [ASSET_TYPES.IMAGE],
  importFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE],
  exportFormats: [TOOL_CONTRACT_FORMATS.ANIMATION_JSON],
});
