/*
Toolbox Aid
David Quesenberry
06/02/2026
PerformanceProfilerToolContract.test.mjs
*/
import {
  PERFORMANCE_PROFILER_TOOL_CONTRACT,
} from "../../../src/shared/contracts/tools/performanceProfilerContract.js";
import {
  runToolContractModuleTest,
} from "./toolContractTestHelpers.mjs";

export function run() {
  runToolContractModuleTest(PERFORMANCE_PROFILER_TOOL_CONTRACT, "performance-profiler");
}
