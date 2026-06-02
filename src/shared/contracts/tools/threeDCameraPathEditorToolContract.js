/*
Toolbox Aid
David Quesenberry
06/02/2026
threeDCameraPathEditorToolContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const THREE_D_CAMERA_PATH_EDITOR_TOOL_CONTRACT = createToolContract({
  toolId: "3d-camera-path-editor",
  toolType: TOOL_CONTRACT_TYPES.EDITOR,
  requiredInputs: [TOOL_CONTRACT_FORMATS.CAMERA_PATH_JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.CAMERA_PATH_JSON],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE,
  importFormats: [TOOL_CONTRACT_FORMATS.CAMERA_PATH_JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.CAMERA_PATH_JSON],
});
