/*
Toolbox Aid
David Quesenberry
06/02/2026
SoundStudioToolContract.test.mjs
*/
import {
  SOUND_STUDIO_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/soundStudioToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(SOUND_STUDIO_TOOL_CONTRACT, "sound-studio");
}
