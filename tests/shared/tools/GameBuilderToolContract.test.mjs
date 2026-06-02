/*
Toolbox Aid
David Quesenberry
06/02/2026
GameBuilderToolContract.test.mjs
*/
import {
  GAME_BUILDER_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/gameBuilderToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(GAME_BUILDER_TOOL_CONTRACT, "game-builder");
}
