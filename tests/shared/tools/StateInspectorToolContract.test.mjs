/*
Toolbox Aid
David Quesenberry
06/02/2026
StateInspectorToolContract.test.mjs
*/
import {
  STATE_INSPECTOR_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/stateInspectorToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(STATE_INSPECTOR_TOOL_CONTRACT, "state-inspector");
}
