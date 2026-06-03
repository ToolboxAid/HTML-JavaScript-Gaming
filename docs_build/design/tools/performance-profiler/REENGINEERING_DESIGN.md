# Performance Profiler Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-17
Source folder: `toolbox/Performance Profiler`
Publish target: `tools.performance-profiler`

## Tool Purpose
Performance Profiler owns profile settings import, validation, measurement/report export, and publish to `tools.performance-profiler`.

## Folder/Files Inspected
- `toolbox/Performance Profiler/how_to_use.html`
- `toolbox/Performance Profiler/index.html`
- `toolbox/Performance Profiler/main.js`
- `toolbox/Performance Profiler/README.md`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `toolbox/Performance Profiler/index.html`: `input[number]#workloadIterationsInput` - 300 | Edits the active profile setting or measurement field. | Updates the draft performance profiler payload field represented by `workloadIterationsInput` before validation. |
| `toolbox/Performance Profiler/index.html`: `input[number]#workSizeInput` - 3000 | Edits the active profile setting or measurement field. | Updates the draft performance profiler payload field represented by `workSizeInput` before validation. |
| `toolbox/Performance Profiler/index.html`: `input[number]#frameSamplesInput` - 120 | Edits the active profile setting or measurement field. | Updates the draft performance profiler payload field represented by `frameSamplesInput` before validation. |
| `toolbox/Performance Profiler/index.html`: `button[button]#runWorkloadButton` - Run Workload Profile | Processes the current performance profiler payload. | Updates tool-owned derived data/report fields that must validate before tools.performance-profiler publish. |
| `toolbox/Performance Profiler/index.html`: `button[button]#runFrameSampleButton` - Run Frame Sample | Processes the current performance profiler payload. | Updates tool-owned derived data/report fields that must validate before tools.performance-profiler publish. |
| `toolbox/Performance Profiler/index.html`: `button[button]#stopProfilerButton` - Stop | Controls preview/playback for the current performance profiler payload. | No tools.performance-profiler JSON change unless a schema-owned playback setting is explicitly edited. |

## Panels And Surfaces Found
- `toolbox/Performance Profiler/how_to_use.html`: `.tools-platform-surface`
- `toolbox/Performance Profiler/index.html`: `.app-shell`
- `toolbox/Performance Profiler/index.html`: `.debug-tool-panel`
- `toolbox/Performance Profiler/index.html`: `.panel`
- `toolbox/Performance Profiler/index.html`: `.tool-shell`
- `toolbox/Performance Profiler/index.html`: `.tool-shell-container`
- `toolbox/Performance Profiler/index.html`: `.tool-shell-page`
- `toolbox/Performance Profiler/index.html`: `.tool-shell__center`
- `toolbox/Performance Profiler/index.html`: `.tool-shell__left`
- `toolbox/Performance Profiler/index.html`: `.tool-shell__right`

## Current Component/Class/Function Inventory
- `toolbox/Performance Profiler/main.js`: applyProjectState; bindEvents; bootPerformanceProfiler; buildPresetLoadedStatus; captureProjectState; getApi; normalizeSamplePresetPath; readPositiveInt; registerToolBootContract; runFrameSample; runWorkloadProfile; setStatus; stopFrameSampling; tick; tryLoadPresetFromQuery; updateControlState; writeOutput

## Target Controls
Keep:
- profile settings controls
- run/measurement controls
- report/export controls

Remove or rename:
- transient measurement state from published settings unless schema-owned

Add:
- Validate Profile Settings
- Publish `tools.performance-profiler`
- setting/report diagnostics

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for performance profiler payload. Current contract baseline: `toolbox/schemas/tools/performance-profiler.schema.json` (performance-profiler Payload).
Required keys: `profileSettings`.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: parse incoming performance profiler payload and reject it before mutation when invalid
- validate: apply the current performance profiler payload contract before export, copy, or publish
- edit/process: mutate only performance profiler payload fields owned by Performance Profiler
- export/save: serialize the validated performance profiler payload as the tools.performance-profiler output shape
- publish: write only the validated tools.performance-profiler value produced by Performance Profiler
- copy/create payload: create copied payload text from the validated performance profiler payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts `profileSettings` with schema-defined numeric settings
- runs measurements without mutating unrelated JSON
- publishes only validated profiler output

## Invalid JSON Rejection Behavior
- malformed JSON
- missing or invalid `profileSettings`
- settings outside schema numeric bounds
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.performance-profiler = {
  "profileSettings": "jsonValue"
}
```

## Playwright Expectations
- load `toolbox/Performance Profiler/index.html` without console errors
- run a profile with valid settings
- reject invalid profiler settings JSON

## Manual Test Expectations
- Open `toolbox/Performance Profiler/index.html` and confirm settings/run/report controls render.
- Run a profile with valid settings, validate, export, and publish.
- Try malformed JSON and out-of-bounds settings; each must block publish.

## Known Gaps
- Run results and publishable settings/report output need a clearer boundary.
- Validation should identify the failing numeric setting.

## Rebuild Order Priority
core-17: rebuild in the core tool lane after earlier priorities are stable.
