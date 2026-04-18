# BUILD_PR_LEVEL_19_15_DEBUG_OBSERVABILITY_VALIDATION Coverage

## Systems Checked And Surfaces
- rendering
  - surface: `src/engine/debug/PerformanceMetricsPanel.js`
  - debug data: `fps`, `frameMs`, `updateMs`, `renderMs`, `fixedUpdates`
  - validation: `tests/final/DebugObservabilityMaturity.test.mjs`

- input
  - surface: `src/engine/input/ActionInputDebugOverlay.js`
  - debug data: action flags (`down/pressed/buffered/queued/windowOpen/cooldown`), queue, chain progress
  - validation: `tests/final/DebugObservabilityMaturity.test.mjs`

- physics
  - surfaces:
    - `src/engine/debug/standard/threeD/providers/collisionOverlaysProvider.js`
    - `src/engine/debug/standard/threeD/panels/panel3dCollisionOverlays.js`
  - debug data: `overlayRows`, `overlayCount`, `activeCount`
  - validation: `tests/final/DebugObservabilityMaturity.test.mjs`

- state/replay
  - surfaces:
    - `src/engine/debug/inspectors/bootstrap/createInspectorSurfaceIntegration.js`
    - `src/engine/debug/inspectors/host/debugInspectorHost.js`
  - debug data:
    - providers: `inspector.stateDiff.snapshot`, `inspector.timeline.snapshot`
    - panel output: state diff lines and replay timeline marker lines
  - validation: `tests/final/DebugObservabilityMaturity.test.mjs`

- networking
  - surfaces:
    - `src/engine/debug/network/panels/networkObservabilityPanels.js`
    - `src/engine/debug/network/diagnostics/*`
  - debug data: latency (`status/rttMs/jitterMs`) and replication (`hostTick/highestBacklog/divergenceWarnings/client rows`)
  - validation:
    - `tests/final/DebugObservabilityMaturity.test.mjs`
    - `tests/final/NetworkDebugAndServerDashboardCloseout.test.mjs`

## Additional Runtime Coverage
- `tests/runtime/LaunchSmokeAllEntries.test.mjs` executed as part of `node ./scripts/run-node-tests.mjs` and passed (`PASS=271 FAIL=0 TOTAL=271`), confirming runtime launch stability for games/samples/tools with debug surfaces present.
