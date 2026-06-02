/*
Toolbox Aid
David Quesenberry
06/02/2026
AssetStudioToolContract.test.mjs
*/
import {
  ASSET_STUDIO_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/assetStudioToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(ASSET_STUDIO_TOOL_CONTRACT, "asset-studio");
}
