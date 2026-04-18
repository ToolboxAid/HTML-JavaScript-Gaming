# BUILD_PR_LEVEL_22_1_RUNTIME_OBSERVABILITY_FOUNDATION — Error Tracking

## Implemented Hooks
- `src/engine/core/Engine.js`
  - existing `trackRuntimeError(...)` remains authoritative for runtime-path errors.
  - runtime monitoring integration now starts at runtime entry and emits monitoring events.
- `src/engine/runtime/RuntimeMonitoringHooks.js`
  - captures `window.error` and `window.unhandledrejection` when browser listeners are available.
  - emits normalized error payloads using `format: runtime.monitoring.v1`.
  - logs error events via standardized logger event code `runtime.monitoring.error`.
- `tools/shared/platformShell.js`
  - registers shared runtime monitoring hooks for tool entry surfaces.
  - stores latest captured monitoring error for diagnostics (`window.__TOOLS_PLATFORM_RUNTIME_LAST_ERROR__`).

## Captured Error Example (Execution-backed)
- Source: `example.runtime`
- Hook: `example.manual`
- Message: `example boom`
- Payload format: `runtime.monitoring.v1`
- Logged event: `runtime.monitoring.error`
- Logged format: `engine.log.v1`

## Touched Files
- `src/engine/runtime/RuntimeMonitoringHooks.js`
- `src/engine/core/Engine.js`
- `tools/shared/platformShell.js`
- `tests/runtime/RuntimeMonitoringHooks.test.mjs`
- `tests/runtime/Phase19RuntimeLifecycleValidation.test.mjs`
- `tests/tools/RuntimeObservabilityFoundation.test.mjs`
