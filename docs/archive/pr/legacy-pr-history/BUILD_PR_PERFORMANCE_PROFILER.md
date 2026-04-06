# BUILD_PR_PERFORMANCE_PROFILER

## Goal
Implement the Performance Profiler defined in `PLAN_PR_PERFORMANCE_PROFILER` without changing engine core APIs.

## Implemented Scope
- Added shared performance profiler in `tools/shared/performanceProfiler.js`
  - captures deterministic platform sample units for validation, packaging, runtime, and suite flows
  - reports bottleneck stages in stable readable form
- Integrated profiler consumption into shared CI and debug surfaces
  - debug visualization can render profiler sections
  - CI reporting can include profiler bottleneck summaries
- Added automated coverage in `tests/tools/PerformanceProfiler.test.mjs`

## Manual Validation Checklist
1. New capability works on valid platform scenarios. `PASS`
2. Failure cases are reported clearly. `PASS`
3. Existing baseline flows still pass. `PASS`
4. Validation suite and CI alignment is maintained. `PASS`
5. No engine core APIs are changed. `PASS`

## Validation Summary
- Syntax checks passed:
  - `node --check tools/shared/performanceProfiler.js`
  - `node --check tests/tools/PerformanceProfiler.test.mjs`
  - `node --check tools/shared/debugVisualizationLayer.js`
  - `node --check tools/shared/ciValidationPipeline.js`
- Full Node test suite passed:
  - `node ./scripts/run-node-tests.mjs`

## Scope Guard
- Profiling remains deterministic and auditable rather than wall-clock dependent.
- Validation, packaging, runtime, debug, and CI boundaries remain authoritative.
- Bottleneck reporting remains stable and readable.
- No engine core API files were modified.

## Approved Commit Comment
build(profiler): add performance profiling system for platform and runtime flows

## Next Command
APPLY_PR_PERFORMANCE_PROFILER
