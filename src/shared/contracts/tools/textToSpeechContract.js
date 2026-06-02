/*
Toolbox Aid
David Quesenberry
06/02/2026
textToSpeechContract.js
*/
import {
  TOOL_CONTRACT_ASSET_TYPES,
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "./toolContract.js";

export const TEXT2SPEECH_V2_TOOL_CONTRACT = createToolContract({
  toolId: "text2speech-V2",
  toolType: TOOL_CONTRACT_TYPES.GENERATOR,
  grouping: "Audio",
  requiredInputs: [TOOL_CONTRACT_FORMATS.TEXT],
  producedOutputs: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
  supportedAssetTypes: [TOOL_CONTRACT_ASSET_TYPES.AUDIO],
  importFormats: [TOOL_CONTRACT_FORMATS.TEXT],
  exportFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
});
