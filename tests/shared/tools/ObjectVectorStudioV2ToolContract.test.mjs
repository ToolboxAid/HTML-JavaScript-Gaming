/*
Toolbox Aid
David Quesenberry
06/02/2026
ObjectVectorStudioV2ToolContract.test.mjs
*/
import {
  OBJECT_VECTOR_STUDIO_V2_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/objectVectorStudioV2Contract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(OBJECT_VECTOR_STUDIO_V2_TOOL_CONTRACT, "object-vector-studio-v2");
}
