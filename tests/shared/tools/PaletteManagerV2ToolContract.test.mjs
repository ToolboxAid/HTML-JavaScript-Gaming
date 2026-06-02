/*
Toolbox Aid
David Quesenberry
06/02/2026
PaletteManagerV2ToolContract.test.mjs
*/
import {
  PALETTE_MANAGER_V2_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/paletteManagerContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(PALETTE_MANAGER_V2_TOOL_CONTRACT, "palette-manager-v2");
}
