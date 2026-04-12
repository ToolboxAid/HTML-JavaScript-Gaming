# BUILD_PR_DEBUG_INSPECTOR_TOOLS Report

## Scope Outcome
- Added three new debug tools:
  - State Inspector
  - Replay Visualizer
  - Performance Profiler (basic)
- Integrated tools with Tool Host by registering them as active/visible entries in the shared tool registry.
- Kept implementations lightweight and read-only focused for inspection/visualization flows.

## Tool Additions
- **State Inspector**
  - Captures runtime snapshot with host context, project manifest storage, toolbox storage keys, and registered boot contracts.
  - Supports pasted JSON inspection for arbitrary state payloads.
- **Replay Visualizer**
  - Loads replay JSON payloads, normalizes event timelines, supports scrub/play/pause/reset, and renders current frame details.
  - Pulls replay state from host context when available.
- **Performance Profiler**
  - Runs deterministic workload timing profile (min/max/avg/p95).
  - Runs frame cadence sample and reports estimated FPS.

## Host Integration
- Updated `tools/toolRegistry.js` with active tool entries:
  - `state-inspector`
  - `replay-visualizer`
  - `performance-profiler`
- Existing Tool Host manifest/runtime already consume active visible registry entries, so no Tool Host runtime refactor was required.

## Validation
- Required smoke command:
  - `npm run test:launch-smoke -- --tools`
  - Result: PASS (`12/12` tools)
  - Evidence: `docs/dev/reports/launch_smoke_report.md`
- Debug tool inspection validation:
  - Verified new tool folders and index entrypoints exist.
  - Verified Tool Host manifest includes all three new tool IDs.
  - Verified state snapshot/replay timeline/performance summary helper behaviors.
  - Result: PASS
  - Evidence: `docs/dev/reports/BUILD_PR_DEBUG_INSPECTOR_TOOLS_validation.txt`

## Exact Files Changed
- `docs/pr/BUILD_PR_DEBUG_INSPECTOR_TOOLS.md`
- `docs/dev/reports/debug_inspector_tools_targets.txt`
- `tools/toolRegistry.js`
- `tools/shared/debugInspectorData.js`
- `tools/shared/debugInspectorTools.css`
- `tools/State Inspector/index.html`
- `tools/State Inspector/main.js`
- `tools/Replay Visualizer/index.html`
- `tools/Replay Visualizer/main.js`
- `tools/Performance Profiler/index.html`
- `tools/Performance Profiler/main.js`
- `docs/dev/reports/launch_smoke_report.md`
- `docs/dev/reports/BUILD_PR_DEBUG_INSPECTOR_TOOLS_validation.txt`
- `docs/dev/reports/BUILD_PR_DEBUG_INSPECTOR_TOOLS_report.md`
