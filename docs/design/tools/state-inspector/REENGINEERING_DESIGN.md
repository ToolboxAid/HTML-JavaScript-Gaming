# State Inspector Reengineering Design

Task: PR_26124_022-tighten-tool-design-docs
Classification: rebuildable tool
Core priority: core-15
Source folder: `tools/State Inspector`
Publish target: `tools.state-inspector`

## Tool Purpose
State snapshot inspection. This tool owns `snapshot`, JSON loading, tree/summary inspection, export, and publish to `tools.state-inspector`.

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
- workspace-managed state mutation assumptions

Add:
- Validate Snapshot
- Export Snapshot Report
- Publish `tools.state-inspector`

## JSON Contract Owned By This Tool
Baseline schema: `tools/schemas/tools/state-inspector.schema.json`. Required top-level fields: snapshot. Allowed top-level fields: snapshot. Additional top-level properties are rejected by the current schema. The tool owns import/load, validation, edit/process, export/save, and publish of this payload. Workspace may pass a launch payload, but nested JSON remains tool-owned.

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
- Paste a valid snapshot and load it.
- Confirm summary/tree output updates.
- Try malformed JSON and JSON without `snapshot`; report export and publish must stay blocked.
