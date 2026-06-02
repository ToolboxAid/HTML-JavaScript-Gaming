/*
Toolbox Aid
David Quesenberry
06/02/2026
WorldVectorStudioV2ToolContract.test.mjs
*/
import {
  WORLD_VECTOR_STUDIO_V2_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/worldVectorStudioContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(WORLD_VECTOR_STUDIO_V2_TOOL_CONTRACT, "world-vector-studio-v2");
}
