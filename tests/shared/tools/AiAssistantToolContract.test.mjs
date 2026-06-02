/*
Toolbox Aid
David Quesenberry
06/02/2026
AiAssistantToolContract.test.mjs
*/
import {
  AI_ASSISTANT_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/aiAssistantToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(AI_ASSISTANT_TOOL_CONTRACT, "ai-assistant");
}
