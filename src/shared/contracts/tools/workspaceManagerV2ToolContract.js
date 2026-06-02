/*
Toolbox Aid
David Quesenberry
06/02/2026
workspaceManagerV2ToolContract.js
*/
import {
  ASSET_TYPES,
} from "../assetContract.js";
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const WORKSPACE_MANAGER_V2_TOOL_CONTRACT = createToolContract({
  toolId: "workspace-manager-v2",
  toolType: TOOL_CONTRACT_TYPES.WORKSPACE,
  requiredInputs: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST],
  producedOutputs: [TOOL_CONTRACT_FORMATS.TOOL_STATE, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  supportedAssetTypes: Object.values(ASSET_TYPES),
  importFormats: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST, TOOL_CONTRACT_FORMATS.TOOL_STATE],
  exportFormats: [TOOL_CONTRACT_FORMATS.TOOL_STATE, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
});
