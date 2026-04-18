# BUILD_PR_LEVEL_22_1_RUNTIME_OBSERVABILITY_FOUNDATION ? Observability Matrix

| Surface | Error Tracking | Logging | Performance Hooks |
| --- | --- | --- | --- |
| Engine runtime (`src/engine/core/Engine.js`) | Yes (`trackRuntimeError` + monitoring bridge events) | `engine.log.v1` (`error`/`warn`) | Frame timings (`frameMs/updateMs/renderMs`) + `load/start/interval/manual` monitoring samples |
| Runtime monitoring module (`src/engine/runtime/RuntimeMonitoringHooks.js`) | Yes (`window.error`, `window.unhandledrejection`, manual emit) | `engine.log.v1` (`error` + `info` + `debug`) | `runtime.monitoring.v1` samples (`start/load/interval/manual`) |
| Tools platform shell (`tools/shared/platformShell.js`) | Yes (shared monitoring hook; latest payload retained) | `engine.log.v1` via `tools.platform` channel | Tool entry load timing + periodic monitoring samples |
| Tool: Vector Map Editor (vector-map-editor) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: Vector Asset Studio (vector-asset-studio) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: Tilemap Studio (tile-map-editor) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: Parallax Scene Studio (parallax-editor) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: Sprite Editor (sprite-editor) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: Asset Browser / Import Hub (asset-browser) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: Palette Browser / Manager (palette-browser) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: State Inspector (state-inspector) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: Replay Visualizer (replay-visualizer) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: Performance Profiler (performance-profiler) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: Physics Sandbox (physics-sandbox) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: Asset Pipeline Tool (asset-pipeline-tool) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: Tile Model Converter (tile-model-converter) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: 3D Map Editor (3d-map-editor) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: 3D Asset Viewer (3d-asset-viewer) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |
| Tool: 3D Camera Path Editor (3d-camera-path-editor) | Yes (inherits platform shell monitoring entry hook) | `engine.log.v1` via shared tools channel | Entry-point monitoring via shared platform shell hooks |

## Notes
- Tool-level monitoring is standardized through shared `tools/shared/platformShell.js` integration.
- No dashboard/UI expansion was introduced in this PR.
