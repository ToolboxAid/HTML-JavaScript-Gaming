# State Inspector Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-15
Source folder: `tools/State Inspector`
Publish target: `tools.state-inspector`

## Tool Purpose
State snapshot inspection. State Inspector owns `snapshot`, JSON loading, tree/summary inspection, export, and publish to `tools.state-inspector`.

## Exact Folder/Files Inspected
- `tools/State Inspector/how_to_use.html`
- `tools/State Inspector/index.html`
- `tools/State Inspector/main.js`
- `tools/State Inspector/README.md`

## Exact Current Controls Found
- `tools/State Inspector/index.html`: `button[button]#refreshSnapshotButton` - Refresh Snapshot
- `tools/State Inspector/index.html`: `button[button]#loadJsonButton` - Inspect Pasted JSON
- `tools/State Inspector/index.html`: `textarea#stateJsonInput` - {
- `tools/State Inspector/main.js`: `refreshSnapshotButton` via refreshButton
- `tools/State Inspector/main.js`: `loadJsonButton` via loadJsonButton
- `tools/State Inspector/main.js`: `stateInspectorStatus` via statusText
- `tools/State Inspector/main.js`: `stateJsonInput` via input
- `tools/State Inspector/main.js`: `stateSnapshotOutput` via output

## Current Panels And Surfaces Found
- `tools/State Inspector/index.html`: `.tool-shell-page`
- `tools/State Inspector/index.html`: `.tool-shell-container`
- `tools/State Inspector/index.html`: `.tool-shell`
- `tools/State Inspector/index.html`: `.app-shell`
- `tools/State Inspector/index.html`: `.tool-shell__left`
- `tools/State Inspector/index.html`: `.panel`
- `tools/State Inspector/index.html`: `.debug-tool-panel`
- `tools/State Inspector/index.html`: `.tool-shell__center`
- `tools/State Inspector/index.html`: `.tool-shell__right`

## Exact Current Functions And Classes
- `tools/State Inspector/main.js`: function bindEvents; function bootStateInspector; function buildLiveSnapshot; function buildPresetLoadedStatus; function clearRoutedPayloadQueryParam; function emitManualJsonDiagnostic; function inspectInputJson; function isEmptySnapshotPayload; function isManualJsonInputEmpty; function normalizeSamplePresetPath; function readBootRegistryKeys; function readProjectManifest; function readRoutedInspectionPayload; function readStorageEntries; function refreshSnapshot; function renderSnapshot; function setStatus; function tryLoadPresetFromQuery; function updateInspectJsonActionState; method applyProjectState; method captureProjectState; method getApi; method registerToolBootContract

## Target Controls
Keep:
- Load State
- state JSON textarea
- inspection/summary output panels

Remove or rename:
- cross-tool state mutation assumptions

Add:
- Validate Snapshot
- Export Snapshot Report
- Publish `tools.state-inspector`

## JSON Contract Owned By This Tool
Owned JSON is the state-inspector payload. Required field is `snapshot`; no other top-level fields are allowed. Snapshot data is inspected and summarized by this folder without mutating source state.

## Publish Output
Publish only to `tools.state-inspector`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing `snapshot`
- snapshot values the inspector cannot traverse
- unsupported top-level fields

## Manual Test Plan
- Paste a valid snapshot and load it.
- Confirm summary/tree output updates.
- Try malformed JSON and JSON without `snapshot`; report export and publish must stay blocked.
