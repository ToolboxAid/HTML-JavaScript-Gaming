/*
Toolbox Aid
David Quesenberry
06/02/2026
AssetManagerV2ToolContract.test.mjs
*/
import {
  ASSET_MANAGER_V2_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/assetManagerContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(ASSET_MANAGER_V2_TOOL_CONTRACT, "asset-manager-v2");
}
