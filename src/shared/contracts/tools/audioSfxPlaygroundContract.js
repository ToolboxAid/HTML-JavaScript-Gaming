/*
Toolbox Aid
David Quesenberry
06/02/2026
audioSfxPlaygroundContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "./toolContract.js";

export const AUDIO_SFX_PLAYGROUND_V2_TOOL_CONTRACT = createToolContract({
  toolId: "audio-sfx-playground-v2",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  grouping: "Audio",
  requiredInputs: [],
  producedOutputs: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
  supportedAssetTypes: [ASSET_TYPES.AUDIO],
  importFormats: [TOOL_CONTRACT_FORMATS.JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
});
