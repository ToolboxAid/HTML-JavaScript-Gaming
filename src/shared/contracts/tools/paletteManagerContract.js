/*
Toolbox Aid
David Quesenberry
06/02/2026
paletteManagerContract.js
*/
import {
  TOOL_CONTRACT_ASSET_TYPES,
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "./toolContract.js";

export const PALETTE_MANAGER_V2_TOOL_CONTRACT = createToolContract({
  toolId: "palette-manager-v2",
  toolType: TOOL_CONTRACT_TYPES.MANAGER,
  grouping: "Palettes",
  requiredInputs: [],
  producedOutputs: [TOOL_CONTRACT_FORMATS.PALETTE_JSON],
  supportedAssetTypes: [TOOL_CONTRACT_ASSET_TYPES.PALETTE],
  importFormats: [TOOL_CONTRACT_FORMATS.PALETTE_JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.PALETTE_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
});
