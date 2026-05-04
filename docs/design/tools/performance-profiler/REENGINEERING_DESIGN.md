# Performance Profiler Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `performance-profiler`
Source folder: `tools/Performance Profiler`

## 1. Tool Purpose
Configure profiling settings, collect runtime/profile data, and emit profile reports.

## 2. Folder/Files Inspected
- `tools/Performance Profiler/how_to_use.html`
- `tools/Performance Profiler/index.html`
- `tools/Performance Profiler/main.js`
- `tools/Performance Profiler/README.md`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 3, inputs 3, selects 0, textareas 0, tables 0, inferred DOM controls/panels 7.
- `tools/Performance Profiler/index.html`: button[button] #runWorkloadButton - Run Workload Profile
- `tools/Performance Profiler/index.html`: button[button] #runFrameSampleButton - Run Frame Sample
- `tools/Performance Profiler/index.html`: button[button] #stopProfilerButton - Stop
- `tools/Performance Profiler/index.html`: input[number] #workloadIterationsInput - 300
- `tools/Performance Profiler/index.html`: input[number] #workSizeInput - 3000
- `tools/Performance Profiler/index.html`: input[number] #frameSamplesInput - 120
- `tools/Performance Profiler/main.js`: button #runWorkloadButton - inferred from JS DOM lookup
- `tools/Performance Profiler/main.js`: button #runFrameSampleButton - inferred from JS DOM lookup
- `tools/Performance Profiler/main.js`: button #stopProfilerButton - inferred from JS DOM lookup
- `tools/Performance Profiler/main.js`: input #workloadIterationsInput - inferred from JS DOM lookup
- `tools/Performance Profiler/main.js`: input #workSizeInput - inferred from JS DOM lookup
- `tools/Performance Profiler/main.js`: input #frameSamplesInput - inferred from JS DOM lookup
- `tools/Performance Profiler/main.js`: panel #profileOutput - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/Performance Profiler/index.html`: .tool-shell-page
  - `tools/Performance Profiler/index.html`: .tool-shell-container
  - `tools/Performance Profiler/index.html`: .tool-shell
  - `tools/Performance Profiler/index.html`: .app-shell
  - `tools/Performance Profiler/index.html`: .tool-shell__left
  - `tools/Performance Profiler/index.html`: .panel
  - `tools/Performance Profiler/index.html`: .debug-tool-panel
  - `tools/Performance Profiler/index.html`: .tool-shell__center
  - `tools/Performance Profiler/index.html`: .tool-shell__right

## 4. Current Component/Class/Function Inventory
- `tools/Performance Profiler/main.js`: function bindEvents; function bootPerformanceProfiler; function buildPresetLoadedStatus; function normalizeSamplePresetPath; function readPositiveInt; function runFrameSample; function runWorkloadProfile; function setStatus; function stopFrameSampling; function tick; function tryLoadPresetFromQuery; function updateControlState; function writeOutput; method applyProjectState; method captureProjectState; method getApi; method registerToolBootContract

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/performance-profiler.schema.json`. Title: performance-profiler Payload. Required top-level fields: profileSettings. Allowed top-level fields: profileSettings. Additional top-level properties: rejected.

JSON handling signals found: download/export, schema, tools.*, validate.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the current schema baseline or tool-owned normalized shape, update the local editor/preview state, and remain exportable as path/file-field JSON without embedding `imageDataUrl`.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing required fields, unsupported top-level fields, wrong nested types, and empty required editor payloads must be rejected in the tool UI before export/save/publish.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.performance-profiler` if applicable: yes, publish normalized output under `tools.performance-profiler` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.performance-profiler`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/Performance Profiler/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/Performance Profiler/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P22: Performance Profiler. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
