/*
Toolbox Aid
David Quesenberry
06/02/2026
performanceProfilerToolContract.js
*/
import {
  TOOL_CONTRACT_FORMATS,
  TOOL_CONTRACT_TYPES,
  createToolContract,
} from "../toolContractPrimitives.js";

export const PERFORMANCE_PROFILER_TOOL_CONTRACT = createToolContract({
  toolId: "performance-profiler",
  toolType: TOOL_CONTRACT_TYPES.INSPECTOR,
  requiredInputs: [TOOL_CONTRACT_FORMATS.JSON],
  producedOutputs: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
  supportedAssetTypes: [],
  importFormats: [TOOL_CONTRACT_FORMATS.JSON],
  exportFormats: [TOOL_CONTRACT_FORMATS.METADATA_JSON],
});
