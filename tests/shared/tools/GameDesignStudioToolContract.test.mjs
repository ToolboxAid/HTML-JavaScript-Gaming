/*
Toolbox Aid
David Quesenberry
06/02/2026
GameDesignStudioToolContract.test.mjs
*/
import {
  GAME_DESIGN_STUDIO_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/gameDesignStudioContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(GAME_DESIGN_STUDIO_TOOL_CONTRACT, "game-design-studio");
}
