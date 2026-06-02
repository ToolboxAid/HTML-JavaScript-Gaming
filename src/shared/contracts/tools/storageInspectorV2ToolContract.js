/*
Toolbox Aid
David Quesenberry
06/02/2026
storageInspectorV2ToolContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const STORAGE_INSPECTOR_V2_TOOL_CONTRACT = createToolContract({
  toolId: "storage-inspector-v2",
  toolType: TOOL_CONTRACT_TYPES.INSPECTOR,
  requiredInputs: [TOOL_CONTRACT_FORMATS.STORAGE_SNAPSHOT],
  producedOutputs: [TOOL_CONTRACT_FORMATS.STORAGE_SNAPSHOT],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE,
  importFormats: [TOOL_CONTRACT_FORMATS.STORAGE_SNAPSHOT],
  exportFormats: [TOOL_CONTRACT_FORMATS.STORAGE_SNAPSHOT, TOOL_CONTRACT_FORMATS.METADATA_JSON],
});
