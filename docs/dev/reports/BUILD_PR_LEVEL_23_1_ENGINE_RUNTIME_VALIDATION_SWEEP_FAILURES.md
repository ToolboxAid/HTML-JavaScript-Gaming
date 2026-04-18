# BUILD_PR_LEVEL_23_1_ENGINE_RUNTIME_VALIDATION_SWEEP — Failures

## Failure Inventory

### F-001
- Command: `node tools/dev/checkSharedExtractionGuard.mjs`
- Status: FAIL
- Error Summary:
  - `Shared extraction guard failed with 2 unexpected violation(s).`
  - `TYPE: inline-helper-clone`
  - `MATCH: rule:number-is-finite-usage`
- Affected Files:
  - `samples/phase-17/shared/voxelTileRenderPipeline.js`
  - `src/engine/runtime/RuntimeMonitoringHooks.js`
- Metrics:
  - `files_scanned=1330`
  - `total_violations=632`
  - `baseline_expected=614`
  - `baseline_unexpected=2`
  - `baseline_resolved=1`

## Non-Failures (for context)
- `node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples`: PASS (`242/242`)
- level23 core contract suite: PASS

## Current Blocking Status
- Blocking for strict shared-extraction guard compliance.
- Not blocking for sample/runtime launch health in this validation sweep.
