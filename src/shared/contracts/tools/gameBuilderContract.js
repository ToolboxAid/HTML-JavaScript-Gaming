/*
Toolbox Aid
David Quesenberry
06/02/2026
gameBuilderContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createDraftToolContract,
} from "./toolContract.js";

export const GAME_BUILDER_TOOL_CONTRACT = createDraftToolContract({
  toolId: "game-builder",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  grouping: "Build",
  requiredInputs: [TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON, TOOL_CONTRACT_FORMATS.ASSET],
  producedOutputs: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.ALL,
  importFormats: [TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON, TOOL_CONTRACT_FORMATS.ASSET],
  exportFormats: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
});
