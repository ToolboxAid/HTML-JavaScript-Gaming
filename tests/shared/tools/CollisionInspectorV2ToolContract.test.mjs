/*
Toolbox Aid
David Quesenberry
06/02/2026
CollisionInspectorV2ToolContract.test.mjs
*/
import {
  COLLISION_INSPECTOR_V2_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/collisionInspectorV2ToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(COLLISION_INSPECTOR_V2_TOOL_CONTRACT, "collision-inspector-v2");
}
