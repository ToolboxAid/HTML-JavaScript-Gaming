/*
Toolbox Aid
David Quesenberry
06/02/2026
gameDesignStudioContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createDraftToolContract,
} from "../toolContract.js";

export const GAME_DESIGN_STUDIO_TOOL_CONTRACT = createDraftToolContract({
  toolId: "game-design-studio",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  requiredInputs: [TOOL_CONTRACT_FORMATS.TEXT],
  producedOutputs: [TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE,
  importFormats: [TOOL_CONTRACT_FORMATS.TEXT],
  exportFormats: [TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON],
});
