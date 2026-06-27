/*
Toolbox Aid
David Quesenberry
06/02/2026
ThreeDAssetViewerToolContract.test.mjs
*/
import {
  THREE_D_ASSET_VIEWER_TOOL_CONTRACT,
} from "../../../../src/shared/contracts/tools/threeDAssetViewerContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(THREE_D_ASSET_VIEWER_TOOL_CONTRACT, "3d-asset-viewer");
}
