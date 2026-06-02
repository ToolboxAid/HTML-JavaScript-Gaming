/*
Toolbox Aid
David Quesenberry
06/02/2026
ParticleStudioToolContract.test.mjs
*/
import {
  PARTICLE_STUDIO_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/particleStudioToolContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(PARTICLE_STUDIO_TOOL_CONTRACT, "particle-studio");
}
