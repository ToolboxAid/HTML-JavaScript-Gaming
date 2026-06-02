/*
Toolbox Aid
David Quesenberry
06/02/2026
AnimationStudioToolContract.test.mjs
*/
import {
  ANIMATION_STUDIO_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/animationStudioToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(ANIMATION_STUDIO_TOOL_CONTRACT, "animation-studio");
}
