/*
Toolbox Aid
David Quesenberry
06/02/2026
ThreeDCameraPathEditorToolContract.test.mjs
*/
import {
  THREE_D_CAMERA_PATH_EDITOR_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/threeDCameraPathEditorToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(THREE_D_CAMERA_PATH_EDITOR_TOOL_CONTRACT, "3d-camera-path-editor");
}
