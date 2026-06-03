# BUILD_PR_LEVEL_22_1_RUNTIME_MONITORING_AND_LOGGING_FOUNDATION — Performance Monitoring

## Scope Implemented
- Added shared runtime performance sampling via `createRuntimeMonitoringHooks(...)`.
- Hook emits performance samples at runtime start and on configured interval.
- Engine now starts/stops monitoring with runtime lifecycle.
- Tools platform shell now starts/stops monitoring for tool runtime surfaces.

## Monitoring Payload
- Format: `runtime.monitoring.v1`
- Kind: `performance`
- Fields:
  - `source`
  - `reason` (`start`, `interval`, `manual`)
  - `timestamp`
  - `sample.nowMs`
  - optional `sample.memory` (when available)
  - `context`

## Validation Notes
- Targeted tests verify start sample, interval sample, and manual sample behavior.
- Existing lifecycle validation confirms engine performance frame publication remains intact (`engine:performance-frame`).
