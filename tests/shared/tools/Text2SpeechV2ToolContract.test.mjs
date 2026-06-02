/*
Toolbox Aid
David Quesenberry
06/02/2026
Text2SpeechV2ToolContract.test.mjs
*/
import {
  TEXT2SPEECH_V2_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/textToSpeechContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(TEXT2SPEECH_V2_TOOL_CONTRACT, "text2speech-V2");
}
