/*
Toolbox Aid
David Quesenberry
06/02/2026
gameDesignStudioToolContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_STATUS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const GAME_DESIGN_STUDIO_TOOL_CONTRACT = createToolContract({
  toolId: "game-design-studio",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  requiredInputs: [TOOL_CONTRACT_FORMATS.TEXT],
  producedOutputs: [TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON],
  supportedAssetTypes: [],
  importFormats: [TOOL_CONTRACT_FORMATS.TEXT],
  exportFormats: [TOOL_CONTRACT_FORMATS.GAME_DESIGN_JSON],
  status: TOOL_CONTRACT_STATUS.DRAFT,
});
