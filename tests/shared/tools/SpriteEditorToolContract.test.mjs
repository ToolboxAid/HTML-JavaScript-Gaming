/*
Toolbox Aid
David Quesenberry
06/02/2026
SpriteEditorToolContract.test.mjs
*/
import {
  SPRITE_EDITOR_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/spriteEditorContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(SPRITE_EDITOR_TOOL_CONTRACT, "sprite-editor");
}
