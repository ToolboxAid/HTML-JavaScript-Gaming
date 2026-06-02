/*
Toolbox Aid
David Quesenberry
06/02/2026
localizationStudioContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createDraftToolContract,
} from "./toolContract.js";

export const LOCALIZATION_STUDIO_TOOL_CONTRACT = createDraftToolContract({
  toolId: "localization-studio",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  grouping: "Localization",
  requiredInputs: [TOOL_CONTRACT_FORMATS.TEXT],
  producedOutputs: [TOOL_CONTRACT_FORMATS.LOCALIZATION_JSON],
  supportedAssetTypes: [ASSET_TYPES.LOCALIZATION],
  importFormats: [TOOL_CONTRACT_FORMATS.TEXT, TOOL_CONTRACT_FORMATS.LOCALIZATION_JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.LOCALIZATION_JSON],
});
