/*
Toolbox Aid
David Quesenberry
06/02/2026
physicsSandboxToolContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const PHYSICS_SANDBOX_TOOL_CONTRACT = createToolContract({
  toolId: "physics-sandbox",
  toolType: TOOL_CONTRACT_TYPES.UTILITY,
  requiredInputs: [TOOL_CONTRACT_FORMATS.PHYSICS_CONFIG],
  producedOutputs: [TOOL_CONTRACT_FORMATS.PHYSICS_CONFIG],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE,
  importFormats: [TOOL_CONTRACT_FORMATS.PHYSICS_CONFIG],
  exportFormats: [TOOL_CONTRACT_FORMATS.PHYSICS_CONFIG, TOOL_CONTRACT_FORMATS.METADATA_JSON],
});
