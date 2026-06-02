/*
Toolbox Aid
David Quesenberry
06/02/2026
ParallaxEditorToolContract.test.mjs
*/
import {
  PARALLAX_EDITOR_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/parallaxEditorContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(PARALLAX_EDITOR_TOOL_CONTRACT, "parallax-editor");
}
