/*
Toolbox Aid
David Quesenberry
06/02/2026
MidiStudioV2ToolContract.test.mjs
*/
import {
  MIDI_STUDIO_V2_TOOL_CONTRACT,
} from "../../../../src/shared/contracts/tools/midiStudioContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(MIDI_STUDIO_V2_TOOL_CONTRACT, "midi-studio-v2");
}
