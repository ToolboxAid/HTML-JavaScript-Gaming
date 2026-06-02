/*
Toolbox Aid
David Quesenberry
06/02/2026
AssetPipelineToolContract.test.mjs
*/
import {
  ASSET_PIPELINE_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/assetPipelineToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(ASSET_PIPELINE_TOOL_CONTRACT, "asset-pipeline");
}
