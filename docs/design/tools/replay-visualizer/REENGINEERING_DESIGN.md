# Replay Visualizer Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `replay-visualizer`
Source folder: `tools/Replay Visualizer`

## 1. Tool Purpose
Load event replay JSON, scrub through playback state, validate event structure, and export replay reports.

## 2. Folder/Files Inspected
- `tools/Replay Visualizer/how_to_use.html`
- `tools/Replay Visualizer/index.html`
- `tools/Replay Visualizer/main.js`
- `tools/Replay Visualizer/README.md`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 5, inputs 1, selects 0, textareas 1, tables 0, inferred DOM controls/panels 8.
- `tools/Replay Visualizer/index.html`: button[button] #loadReplayButton - Load Replay JSON
- `tools/Replay Visualizer/index.html`: button[button] #playReplayButton - Play
- `tools/Replay Visualizer/index.html`: button[button] #pauseReplayButton - Pause
- `tools/Replay Visualizer/index.html`: button[button] #resetReplayButton - Reset
- `tools/Replay Visualizer/index.html`: textarea #replayJsonInput - {
- `tools/Replay Visualizer/index.html`: input[range] #replayTimeSlider - 0
- `tools/Replay Visualizer/main.js`: button[button] - ${event.timeMs.toFixed(0)}ms | ${event.type} | ${event.label}
- `tools/Replay Visualizer/main.js`: button #loadReplayButton - inferred from JS DOM lookup
- `tools/Replay Visualizer/main.js`: button #playReplayButton - inferred from JS DOM lookup
- `tools/Replay Visualizer/main.js`: button #pauseReplayButton - inferred from JS DOM lookup
- `tools/Replay Visualizer/main.js`: button #resetReplayButton - inferred from JS DOM lookup
- `tools/Replay Visualizer/main.js`: input #replayJsonInput - inferred from JS DOM lookup
- `tools/Replay Visualizer/main.js`: panel #replayTimeReadout - inferred from JS DOM lookup
- `tools/Replay Visualizer/main.js`: panel #replayEventList - inferred from JS DOM lookup
- `tools/Replay Visualizer/main.js`: panel #replayEventOutput - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/Replay Visualizer/index.html`: .tool-shell-page
  - `tools/Replay Visualizer/index.html`: .tool-shell-container
  - `tools/Replay Visualizer/index.html`: .tool-shell
  - `tools/Replay Visualizer/index.html`: .app-shell
  - `tools/Replay Visualizer/index.html`: .tool-shell__left
  - `tools/Replay Visualizer/index.html`: .panel
  - `tools/Replay Visualizer/index.html`: .debug-tool-panel
  - `tools/Replay Visualizer/index.html`: .tool-shell__center
  - `tools/Replay Visualizer/index.html`: .tool-shell__right
  - `tools/Replay Visualizer/index.html`: .debug-tool-list

## 4. Current Component/Class/Function Inventory
- `tools/Replay Visualizer/main.js`: function applyEvents; function bindEvents; function bootReplayVisualizer; function buildPresetLoadedStatus; function clampTimeMs; function getDurationMs; function loadReplayFromInput; function normalizeSamplePresetPath; function playReplay; function renderCurrentEvent; function renderEventList; function setCurrentTimeMs; function setStatus; function stopPlayback; function tryLoadPresetFromQuery; function updateControlState; method applyProjectState; method captureProjectState; method getApi; method registerToolBootContract

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/replay-visualizer.schema.json`. Title: replay-visualizer Payload. Required top-level fields: events. Allowed top-level fields: events. Additional top-level properties: rejected.

JSON handling signals found: download/export, safeParseJson, validate.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the current schema baseline or tool-owned normalized shape, update the local editor/preview state, and remain exportable as path/file-field JSON without embedding `imageDataUrl`.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing required fields, unsupported top-level fields, wrong nested types, and empty required editor payloads must be rejected in the tool UI before export/save/publish.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.replay-visualizer` if applicable: yes, publish normalized output under `tools.replay-visualizer` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.replay-visualizer`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/Replay Visualizer/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/Replay Visualizer/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P21: Replay Visualizer. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
