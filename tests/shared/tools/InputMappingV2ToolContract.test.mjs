/*
Toolbox Aid
David Quesenberry
06/02/2026
InputMappingV2ToolContract.test.mjs
*/
import {
  INPUT_MAPPING_V2_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/inputMappingV2ToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(INPUT_MAPPING_V2_TOOL_CONTRACT, "input-mapping-v2");
}
