/*
Toolbox Aid
David Quesenberry
06/02/2026
CodeStudioToolContract.test.mjs
*/
import {
  CODE_STUDIO_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/codeStudioToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(CODE_STUDIO_TOOL_CONTRACT, "code-studio");
}
