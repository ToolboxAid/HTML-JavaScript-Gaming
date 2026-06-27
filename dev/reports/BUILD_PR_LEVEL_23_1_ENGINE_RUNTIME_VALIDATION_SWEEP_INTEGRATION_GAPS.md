# BUILD_PR_LEVEL_23_1_ENGINE_RUNTIME_VALIDATION_SWEEP — Integration Gaps

## Gap 1: Shared Extraction Guard Baseline Drift
- Category: contract drift
- Surface: shared extraction enforcement across samples/runtime
- Failing command: `node tools/dev/checkSharedExtractionGuard.mjs`
- Observed:
  - `baseline_unexpected=2`
  - `rule:number-is-finite-usage`
  - impacted files:
    - `samples/phase-17/shared/voxelTileRenderPipeline.js`
    - `src/engine/runtime/RuntimeMonitoringHooks.js`

### Impact
- Runtime/sample behavior is currently stable (all targeted runtime/sample validations pass), but guard enforcement indicates extraction-contract drift.
- CI/pretest lanes that require guard baseline parity can fail until this drift is reconciled.

### Suggested Resolution Path
1. Confirm whether the two new usages are valid shared-layer patterns.
2. If valid, update guard baseline expectations with execution-backed evidence.
3. If invalid, refactor to existing shared extraction surfaces and rerun guard.

## Gap 2: None detected for sample execution lane
- Sample launch smoke covered 242 entries and found no runtime launch failures.
- No broken sample integration issues were detected in this sweep.

## Gap 3: None detected for engine boundary lane
- `EnginePublicBarrelImports` and `ToolBoundaryEnforcement` passed in this sweep.
- No immediate engine boundary regressions detected.
