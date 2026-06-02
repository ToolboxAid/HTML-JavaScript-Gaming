/*
Toolbox Aid
David Quesenberry
06/02/2026
ReplayVisualizerToolContract.test.mjs
*/
import {
  REPLAY_VISUALIZER_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/replayVisualizerToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(REPLAY_VISUALIZER_TOOL_CONTRACT, "replay-visualizer");
}
