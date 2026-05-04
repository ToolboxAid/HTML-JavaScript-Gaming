# Performance Profiler Reengineering Design

Task: PR_26124_022-tighten-tool-design-docs
Classification: rebuildable tool
Core priority: core-17
Source folder: `tools/Performance Profiler`
Publish target: `tools.performance-profiler`

## Tool Purpose
Profile settings and report generation. This tool owns `profileSettings`, workload/frame sample controls, validation, export, and publish to `tools.performance-profiler`.

## Exact Folder/Files Inspected
- `tools/Performance Profiler/how_to_use.html`
- `tools/Performance Profiler/index.html`
- `tools/Performance Profiler/main.js`
- `tools/Performance Profiler/README.md`

## Exact Current Controls Found
- `tools/Performance Profiler/index.html`: `button[button]#runWorkloadButton` - Run Workload Profile
- `tools/Performance Profiler/index.html`: `button[button]#runFrameSampleButton` - Run Frame Sample
- `tools/Performance Profiler/index.html`: `button[button]#stopProfilerButton` - Stop
- `tools/Performance Profiler/index.html`: `input[number]#workloadIterationsInput` - workloadIterationsInput
- `tools/Performance Profiler/index.html`: `input[number]#workSizeInput` - workSizeInput
- `tools/Performance Profiler/index.html`: `input[number]#frameSamplesInput` - frameSamplesInput
- `tools/Performance Profiler/main.js`: `runWorkloadButton` via runWorkloadButton
- `tools/Performance Profiler/main.js`: `runFrameSampleButton` via runFrameSampleButton
- `tools/Performance Profiler/main.js`: `stopProfilerButton` via stopButton
- `tools/Performance Profiler/main.js`: `profilerStatusText` via statusText
- `tools/Performance Profiler/main.js`: `workloadIterationsInput` via workloadIterationsInput
- `tools/Performance Profiler/main.js`: `workSizeInput` via workSizeInput
- `tools/Performance Profiler/main.js`: `frameSamplesInput` via frameSamplesInput
- `tools/Performance Profiler/main.js`: `profileOutput` via output

## Current Panels And Surfaces Found
- `tools/Performance Profiler/index.html`: `.tool-shell-page`
- `tools/Performance Profiler/index.html`: `.tool-shell-container`
- `tools/Performance Profiler/index.html`: `.tool-shell`
- `tools/Performance Profiler/index.html`: `.app-shell`
- `tools/Performance Profiler/index.html`: `.tool-shell__left`
- `tools/Performance Profiler/index.html`: `.panel`
- `tools/Performance Profiler/index.html`: `.debug-tool-panel`
- `tools/Performance Profiler/index.html`: `.tool-shell__center`
- `tools/Performance Profiler/index.html`: `.tool-shell__right`

## Exact Current Functions And Classes
- `tools/Performance Profiler/main.js`: function bindEvents; function bootPerformanceProfiler; function buildPresetLoadedStatus; function normalizeSamplePresetPath; function readPositiveInt; function runFrameSample; function runWorkloadProfile; function setStatus; function stopFrameSampling; function tick; function tryLoadPresetFromQuery; function updateControlState; function writeOutput; method applyProjectState; method captureProjectState; method getApi; method registerToolBootContract

## Target Controls
Keep:
- Run Workload Profile
- Run Frame Sample
- Stop
- workload iterations
- work size
- frame samples
- profile output panel

Remove or rename:
- none identified in the current folder

Add:
- Load Profile Settings JSON
- Validate Profile Settings
- Export Profile Report
- Publish `tools.performance-profiler`

## JSON Contract Owned By This Tool
Baseline schema: `tools/schemas/tools/performance-profiler.schema.json`. Required top-level fields: profileSettings. Allowed top-level fields: profileSettings. Additional top-level properties are rejected by the current schema. The tool owns import/load, validation, edit/process, export/save, and publish of this payload. Workspace may pass a launch payload, but nested JSON remains tool-owned.

## Hosted/Launch Payload Boundary
- Launch payloads may seed this tool, but they do not become workspace-owned internals.
- toolState copies may be created later from the published output, but the copied JSON must still match this tool contract.
- Use file/path/name fields for assets. Do not persist `imageDataUrl`.

## Invalid JSON Behavior
- Reject malformed JSON before state mutation.
- Reject missing required fields from the schema baseline.
- Reject unsupported top-level fields when the schema disallows extras.
- Keep export/save/publish disabled until the current payload validates.
- Show a tool-specific error that names the failing field or control group.

## Manual Test Plan
- Run a workload profile with valid numeric settings.
- Run a frame sample and stop it.
- Try invalid numeric ranges and JSON without `profileSettings`; export and publish must stay blocked.
