/*
Toolbox Aid
David Quesenberry
06/02/2026
publishStudioToolContract.js
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

export const PUBLISH_STUDIO_TOOL_CONTRACT = createToolContract({
  toolId: "publish-studio",
  toolType: TOOL_CONTRACT_TYPES.STUDIO,
  requiredInputs: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.PUBLISH_PACKAGE],
  supportedAssetTypes: Object.values(ASSET_TYPES),
  importFormats: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST, TOOL_CONTRACT_FORMATS.METADATA_JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.PUBLISH_PACKAGE, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  status: TOOL_CONTRACT_STATUS.DRAFT,
});
