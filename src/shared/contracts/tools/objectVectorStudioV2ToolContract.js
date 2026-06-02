/*
Toolbox Aid
David Quesenberry
06/02/2026
objectVectorStudioV2ToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const OBJECT_VECTOR_STUDIO_V2_TOOL_CONTRACT = createToolContract({
  toolId: "object-vector-studio-v2",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  requiredInputs: [TOOL_CONTRACT_FORMATS.PALETTE_JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.SVG],
  supportedAssetTypes: [ASSET_TYPES.VECTOR, ASSET_TYPES.PALETTE],
  importFormats: [TOOL_CONTRACT_FORMATS.PALETTE_JSON, TOOL_CONTRACT_FORMATS.VECTOR_JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.VECTOR_JSON, TOOL_CONTRACT_FORMATS.SVG, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
});
