/*
Toolbox Aid
David Quesenberry
06/02/2026
soundStudioToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createDraftToolContract,
} from "../toolContractPrimitives.js";

export const SOUND_STUDIO_TOOL_CONTRACT = createDraftToolContract({
  toolId: "sound-studio",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  requiredInputs: [],
  producedOutputs: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
  supportedAssetTypes: [ASSET_TYPES.AUDIO],
  importFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
  exportFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
});
