/*
Toolbox Aid
David Quesenberry
06/02/2026
particleStudioContract.js
*/
import {
  TOOL_CONTRACT_ASSET_TYPES,
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createDraftToolContract,
} from "./toolContract.js";

export const PARTICLE_STUDIO_TOOL_CONTRACT = createDraftToolContract({
  toolId: "particle-studio",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  grouping: "FX",
  requiredInputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.VECTOR_JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.PARTICLE_JSON],
  supportedAssetTypes: [TOOL_CONTRACT_ASSET_TYPES.IMAGE, TOOL_CONTRACT_ASSET_TYPES.VECTOR],
  importFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.VECTOR_JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.PARTICLE_JSON],
});
