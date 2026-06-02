/*
Toolbox Aid
David Quesenberry
06/02/2026
PreviewGeneratorV2ToolContract.test.mjs
*/
import {
  PREVIEW_GENERATOR_V2_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/previewGeneratorV2ToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(PREVIEW_GENERATOR_V2_TOOL_CONTRACT, "preview-generator-v2");
}
