/*
Toolbox Aid
David Quesenberry
06/02/2026
threeDAssetViewerContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "./toolContract.js";

export const THREE_D_ASSET_VIEWER_TOOL_CONTRACT = createToolContract({
  toolId: "3d-asset-viewer",
  toolType: TOOL_CONTRACT_TYPES.VIEWER,
  grouping: "3D",
  requiredInputs: [TOOL_CONTRACT_FORMATS.THREE_D_JSON, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE,
  importFormats: [TOOL_CONTRACT_FORMATS.THREE_D_JSON, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
});
