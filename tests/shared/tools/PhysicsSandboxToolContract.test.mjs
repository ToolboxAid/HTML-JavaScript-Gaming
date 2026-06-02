/*
Toolbox Aid
David Quesenberry
06/02/2026
PhysicsSandboxToolContract.test.mjs
*/
import {
  PHYSICS_SANDBOX_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/physicsSandboxToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(PHYSICS_SANDBOX_TOOL_CONTRACT, "physics-sandbox");
}
