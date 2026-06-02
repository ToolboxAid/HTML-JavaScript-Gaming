/*
Toolbox Aid
David Quesenberry
06/02/2026
collisionInspectorContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "./toolContract.js";

export const COLLISION_INSPECTOR_V2_TOOL_CONTRACT = createToolContract({
  toolId: "collision-inspector-v2",
  toolType: TOOL_CONTRACT_TYPES.INSPECTOR,
  grouping: "Debug",
  requiredInputs: [TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.IMAGE_FILE],
  producedOutputs: [TOOL_CONTRACT_FORMATS.COLLISION_REPORT],
  supportedAssetTypes: [ASSET_TYPES.VECTOR, ASSET_TYPES.IMAGE],
  importFormats: [TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.IMAGE_FILE],
  exportFormats: [TOOL_CONTRACT_FORMATS.COLLISION_REPORT, TOOL_CONTRACT_FORMATS.METADATA_JSON],
});
