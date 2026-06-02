/*
Toolbox Aid
David Quesenberry
06/02/2026
particleStudioToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createDraftToolContract,
} from "../toolContractPrimitives.js";

export const PARTICLE_STUDIO_TOOL_CONTRACT = createDraftToolContract({
  toolId: "particle-studio",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  requiredInputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.VECTOR_JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.PARTICLE_JSON],
  supportedAssetTypes: [ASSET_TYPES.IMAGE, ASSET_TYPES.VECTOR],
  importFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.VECTOR_JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.PARTICLE_JSON],
});
