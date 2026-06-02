/*
Toolbox Aid
David Quesenberry
06/02/2026
InputStudioToolContract.test.mjs
*/
import {
  INPUT_STUDIO_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/inputStudioContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(INPUT_STUDIO_TOOL_CONTRACT, "input-studio");
}
