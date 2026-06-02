/*
Toolbox Aid
David Quesenberry
06/02/2026
gameBuilderToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_STATUS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const GAME_BUILDER_TOOL_CONTRACT = createToolContract({
  toolId: "game-builder",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  requiredInputs: [TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON, TOOL_CONTRACT_FORMATS.ASSET],
  producedOutputs: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST],
  supportedAssetTypes: Object.values(ASSET_TYPES),
  importFormats: [TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON, TOOL_CONTRACT_FORMATS.ASSET],
  exportFormats: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  status: TOOL_CONTRACT_STATUS.DRAFT,
});
