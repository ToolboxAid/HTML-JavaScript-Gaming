/*
Toolbox Aid
David Quesenberry
06/02/2026
workspaceManagerContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "./toolContract.js";

export const WORKSPACE_MANAGER_V2_TOOL_CONTRACT = createToolContract({
  toolId: "workspace-manager-v2",
  toolType: TOOL_CONTRACT_TYPES.WORKSPACE,
  grouping: "Workspace",
  requiredInputs: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST],
  producedOutputs: [TOOL_CONTRACT_FORMATS.TOOL_STATE, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.ALL,
  importFormats: [TOOL_CONTRACT_FORMATS.GAME_MANIFEST, TOOL_CONTRACT_FORMATS.TOOL_STATE],
  exportFormats: [TOOL_CONTRACT_FORMATS.TOOL_STATE, TOOL_CONTRACT_FORMATS.PROJECT_PACKAGE],
});
