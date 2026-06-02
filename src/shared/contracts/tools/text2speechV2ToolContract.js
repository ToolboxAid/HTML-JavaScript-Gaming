/*
Toolbox Aid
David Quesenberry
06/02/2026
text2speechV2ToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const TEXT2SPEECH_V2_TOOL_CONTRACT = createToolContract({
  toolId: "text2speech-V2",
  toolType: TOOL_CONTRACT_TYPES.GENERATOR,
  requiredInputs: [TOOL_CONTRACT_FORMATS.TEXT],
  producedOutputs: [TOOL_CONTRACT_FORMATS.AUDIO_FILE],
  supportedAssetTypes: [ASSET_TYPES.AUDIO],
  importFormats: [TOOL_CONTRACT_FORMATS.TEXT],
  exportFormats: [TOOL_CONTRACT_FORMATS.AUDIO_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
});
