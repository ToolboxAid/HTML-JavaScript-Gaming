# Performance Profiler Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-17
Source folder: `tools/Performance Profiler`
Publish target: `tools.performance-profiler`

## Tool Purpose
Profile settings and report generation. Performance Profiler owns `profileSettings`, workload/frame sample controls, validation, export, and publish to `tools.performance-profiler`.

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
Owned JSON is the performance-profiler payload. Required field is `profileSettings`; no other top-level fields are allowed. Profile settings own workload iteration count, work size, frame sample count, and report-generation options.

## Publish Output
Publish only to `tools.performance-profiler`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing `profileSettings`
- numeric values outside profiler control ranges
- profile settings the runner cannot process
- unsupported top-level fields

## Manual Test Plan
- Run a workload profile with valid numeric settings.
- Run a frame sample and stop it.
- Try invalid numeric ranges and JSON without `profileSettings`; export and publish must stay blocked.
