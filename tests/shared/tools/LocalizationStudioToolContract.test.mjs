/*
Toolbox Aid
David Quesenberry
06/02/2026
LocalizationStudioToolContract.test.mjs
*/
import {
  LOCALIZATION_STUDIO_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/localizationStudioToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(LOCALIZATION_STUDIO_TOOL_CONTRACT, "localization-studio");
}
