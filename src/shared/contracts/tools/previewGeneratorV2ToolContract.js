/*
Toolbox Aid
David Quesenberry
06/02/2026
previewGeneratorV2ToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const PREVIEW_GENERATOR_V2_TOOL_CONTRACT = createToolContract({
  toolId: "preview-generator-v2",
  toolType: TOOL_CONTRACT_TYPES.GENERATOR,
  requiredInputs: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.PREVIEW_SVG],
  supportedAssetTypes: [ASSET_TYPES.IMAGE, ASSET_TYPES.VECTOR],
  importFormats: [TOOL_CONTRACT_FORMATS.IMAGE_FILE, TOOL_CONTRACT_FORMATS.JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.PREVIEW_SVG],
});
