/*
Toolbox Aid
David Quesenberry
06/02/2026
midiStudioV2ToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const MIDI_STUDIO_V2_TOOL_CONTRACT = createToolContract({
  toolId: "midi-studio-v2",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  requiredInputs: [TOOL_CONTRACT_FORMATS.MIDI_FILE],
  producedOutputs: [TOOL_CONTRACT_FORMATS.AUDIO_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  supportedAssetTypes: [ASSET_TYPES.AUDIO],
  importFormats: [TOOL_CONTRACT_FORMATS.MIDI_FILE],
  exportFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
});
