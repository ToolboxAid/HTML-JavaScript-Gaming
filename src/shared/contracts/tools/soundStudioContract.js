/*
Toolbox Aid
David Quesenberry
06/02/2026
soundStudioContract.js
*/
import {
  TOOL_CONTRACT_ASSET_TYPES,
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createDraftToolContract,
} from "./toolContract.js";

export const SOUND_STUDIO_TOOL_CONTRACT = createDraftToolContract({
  toolId: "sound-studio",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  grouping: "Audio",
  requiredInputs: [],
  producedOutputs: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
  supportedAssetTypes: [TOOL_CONTRACT_ASSET_TYPES.AUDIO],
  importFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
  exportFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
});
