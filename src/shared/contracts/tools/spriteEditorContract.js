/*
Toolbox Aid
David Quesenberry
06/02/2026
spriteEditorContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "./toolContract.js";

export const SPRITE_EDITOR_TOOL_CONTRACT = createToolContract({
  toolId: "sprite-editor",
  toolType: TOOL_CONTRACT_TYPES.EDITOR,
  grouping: "Sprites",
  requiredInputs: [TOOL_CONTRACT_FORMATS.PALETTE_JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  supportedAssetTypes: [ASSET_TYPES.IMAGE, ASSET_TYPES.PALETTE],
  importFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.PALETTE_JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.METADATA_JSON],
});
