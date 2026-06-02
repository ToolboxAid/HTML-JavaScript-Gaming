/*
Toolbox Aid
David Quesenberry
06/02/2026
previewGeneratorContract.js
*/
import {
  TOOL_CONTRACT_ASSET_TYPES,
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "./toolContract.js";

export const PREVIEW_GENERATOR_V2_TOOL_CONTRACT = createToolContract({
  toolId: "preview-generator-v2",
  toolType: TOOL_CONTRACT_TYPES.GENERATOR,
  grouping: "Preview",
  requiredInputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.PREVIEW_SVG],
  supportedAssetTypes: [TOOL_CONTRACT_ASSET_TYPES.IMAGE, TOOL_CONTRACT_ASSET_TYPES.VECTOR],
  importFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.PREVIEW_SVG],
});
