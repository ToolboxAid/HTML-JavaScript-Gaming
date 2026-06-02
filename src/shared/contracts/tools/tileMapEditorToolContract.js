/*
Toolbox Aid
David Quesenberry
06/02/2026
tileMapEditorToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const TILE_MAP_EDITOR_TOOL_CONTRACT = createToolContract({
  toolId: "tile-map-editor",
  toolType: TOOL_CONTRACT_TYPES.EDITOR,
  requiredInputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.PALETTE_JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.TILEMAP_JSON],
  supportedAssetTypes: [ASSET_TYPES.TILEMAP, ASSET_TYPES.IMAGE, ASSET_TYPES.PALETTE],
  importFormats: [TOOL_CONTRACT_FORMATS.TILEMAP_JSON, TOOL_CONTRACT_FORMATS.IMAGE_FILE],
  exportFormats: [TOOL_CONTRACT_FORMATS.TILEMAP_JSON, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
});
