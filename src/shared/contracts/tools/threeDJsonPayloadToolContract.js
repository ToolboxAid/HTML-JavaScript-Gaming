/*
Toolbox Aid
David Quesenberry
06/02/2026
threeDJsonPayloadToolContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_SUPPORTED_ASSET_TYPES,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const THREE_D_JSON_PAYLOAD_TOOL_CONTRACT = createToolContract({
  toolId: "3d-json-payload",
  toolType: TOOL_CONTRACT_TYPES.UTILITY,
  requiredInputs: [TOOL_CONTRACT_FORMATS.THREE_D_JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.THREE_D_JSON],
  supportedAssetTypes: TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE,
  importFormats: [TOOL_CONTRACT_FORMATS.THREE_D_JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.THREE_D_JSON],
});
