# BUILD_PR_LEVEL_22_1_RUNTIME_MONITORING_AND_LOGGING_FOUNDATION — Error Tracking

## Scope Implemented
- Added `createRuntimeMonitoringHooks` in `src/engine/runtime/RuntimeMonitoringHooks.js` as the shared runtime error/performance hook surface.
- Wired engine runtime monitoring lifecycle in `src/engine/core/Engine.js`:
  - start hooks during `engine.start()`
  - stop hooks during `engine.stop()`
  - emit monitoring events to runtime consumers:
    - `engine:runtime-monitoring-error`
    - `engine:runtime-monitoring-performance`
- Wired tools runtime monitoring in `tools/shared/platformShell.js` with the shared hook surface and tools runtime context capture.

## Error Tracking Behavior
- Captures global runtime errors when `window` is available:
  - `window.error`
  - `window.unhandledrejection`
- Emits normalized payloads using `runtime.monitoring.v1`.
- Preserves non-breaking behavior by keeping existing `engine:runtime-error` and `trackRuntimeError(...)` flow unchanged.

## Files
- `src/engine/runtime/RuntimeMonitoringHooks.js`
- `src/engine/runtime/index.js`
- `src/engine/core/Engine.js`
- `tools/shared/platformShell.js`
- `tests/runtime/RuntimeMonitoringHooks.test.mjs`
- `tests/runtime/Phase19RuntimeLifecycleValidation.test.mjs`
- `tests/run-tests.mjs`
