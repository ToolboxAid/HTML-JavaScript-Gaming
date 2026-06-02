/*
Toolbox Aid
David Quesenberry
06/02/2026
AudioSfxPlaygroundV2ToolContract.test.mjs
*/
import {
  AUDIO_SFX_PLAYGROUND_V2_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/audioSfxPlaygroundContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(AUDIO_SFX_PLAYGROUND_V2_TOOL_CONTRACT, "audio-sfx-playground-v2");
}
