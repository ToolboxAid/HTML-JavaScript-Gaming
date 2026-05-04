# State Inspector Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `state-inspector`
Source folder: `tools/State Inspector`

## 1. Tool Purpose
Load state snapshots, inspect structure, validate snapshot JSON, and export inspection results.

## 2. Folder/Files Inspected
- `tools/State Inspector/how_to_use.html`
- `tools/State Inspector/index.html`
- `tools/State Inspector/main.js`
- `tools/State Inspector/README.md`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 2, inputs 0, selects 0, textareas 1, tables 0, inferred DOM controls/panels 5.
- `tools/State Inspector/index.html`: button[button] #refreshSnapshotButton - Refresh Snapshot
- `tools/State Inspector/index.html`: button[button] #loadJsonButton - Inspect Pasted JSON
- `tools/State Inspector/index.html`: textarea #stateJsonInput - {
- `tools/State Inspector/main.js`: button #refreshSnapshotButton - inferred from JS DOM lookup
- `tools/State Inspector/main.js`: button #loadJsonButton - inferred from JS DOM lookup
- `tools/State Inspector/main.js`: panel #stateInspectorStatus - inferred from JS DOM lookup
- `tools/State Inspector/main.js`: input #stateJsonInput - inferred from JS DOM lookup
- `tools/State Inspector/main.js`: panel #stateSnapshotOutput - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/State Inspector/index.html`: .tool-shell-page
  - `tools/State Inspector/index.html`: .tool-shell-container
  - `tools/State Inspector/index.html`: .tool-shell
  - `tools/State Inspector/index.html`: .app-shell
  - `tools/State Inspector/index.html`: .tool-shell__left
  - `tools/State Inspector/index.html`: .panel
  - `tools/State Inspector/index.html`: .debug-tool-panel
  - `tools/State Inspector/index.html`: .tool-shell__center
  - `tools/State Inspector/index.html`: .tool-shell__right

## 4. Current Component/Class/Function Inventory
- `tools/State Inspector/main.js`: function bindEvents; function bootStateInspector; function buildLiveSnapshot; function buildPresetLoadedStatus; function clearRoutedPayloadQueryParam; function emitManualJsonDiagnostic; function inspectInputJson; function isEmptySnapshotPayload; function isManualJsonInputEmpty; function normalizeSamplePresetPath; function readBootRegistryKeys; function readProjectManifest; function readRoutedInspectionPayload; function readStorageEntries; function refreshSnapshot; function renderSnapshot; function setStatus; function tryLoadPresetFromQuery; function updateInspectJsonActionState; method applyProjectState; method captureProjectState; method getApi; method registerToolBootContract

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/state-inspector.schema.json`. Title: state-inspector Payload. Required top-level fields: snapshot. Allowed top-level fields: snapshot. Additional top-level properties: rejected.

JSON handling signals found: download/export, JSON.parse, localStorage, safeParseJson, sessionStorage, validate.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the current schema baseline or tool-owned normalized shape, update the local editor/preview state, and remain exportable as path/file-field JSON without embedding `imageDataUrl`.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing required fields, unsupported top-level fields, wrong nested types, and empty required editor payloads must be rejected in the tool UI before export/save/publish.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.state-inspector` if applicable: yes, publish normalized output under `tools.state-inspector` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.state-inspector`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/State Inspector/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/State Inspector/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P20: State Inspector. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
