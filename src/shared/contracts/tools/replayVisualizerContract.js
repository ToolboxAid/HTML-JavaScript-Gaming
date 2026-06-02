/*
Toolbox Aid
David Quesenberry
06/02/2026
replayVisualizerContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "./toolContract.js";

export const REPLAY_VISUALIZER_TOOL_CONTRACT = createToolContract({
  toolId: "replay-visualizer",
  toolType: TOOL_CONTRACT_TYPES.VIEWER,
  grouping: "Debug",
  requiredInputs: [TOOL_CONTRACT_FORMATS.REPLAY_EVENTS],
  producedOutputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE,
  importFormats: [TOOL_CONTRACT_FORMATS.REPLAY_EVENTS],
  exportFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
});
