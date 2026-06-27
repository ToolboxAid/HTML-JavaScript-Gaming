/*
Toolbox Aid
David Quesenberry
06/02/2026
TileMapEditorToolContract.test.mjs
*/
import {
  TILE_MAP_EDITOR_TOOL_CONTRACT,
} from "../../../../src/shared/contracts/tools/tileMapEditorContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(TILE_MAP_EDITOR_TOOL_CONTRACT, "tile-map-editor");
}
