# State Inspector Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-15
Source folder: `tools/State Inspector`
Publish target: `tools.state-inspector`

## Tool Purpose
State Inspector owns state snapshot import, validation, inspection/report export, and publish to `tools.state-inspector`.

## Folder/Files Inspected
- `tools/State Inspector/how_to_use.html`
- `tools/State Inspector/index.html`
- `tools/State Inspector/main.js`
- `tools/State Inspector/README.md`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/State Inspector/index.html`: `button[button]#refreshSnapshotButton` - Refresh Snapshot | Triggers the current state snapshot payload UI action for `Refresh Snapshot`. | May update draft state snapshot payload data; tools.state-inspector publish must wait for validation. |
| `tools/State Inspector/index.html`: `button[button]#loadJsonButton` - Inspect Pasted JSON | Starts state snapshot payload import/load. | Reads incoming JSON into the tool-owned state snapshot payload only after validation succeeds. |
| `tools/State Inspector/index.html`: `textarea#stateJsonInput` - {"example":"state"} | Edits or loads state snapshot payload text. | Parses into the tool-owned state snapshot payload; malformed or schema-invalid content must not publish. |

## Panels And Surfaces Found
- `tools/State Inspector/how_to_use.html`: `.tools-platform-surface`
- `tools/State Inspector/index.html`: `.app-shell`
- `tools/State Inspector/index.html`: `.debug-tool-panel`
- `tools/State Inspector/index.html`: `.panel`
- `tools/State Inspector/index.html`: `.tool-shell`
- `tools/State Inspector/index.html`: `.tool-shell-container`
- `tools/State Inspector/index.html`: `.tool-shell-page`
- `tools/State Inspector/index.html`: `.tool-shell__center`
- `tools/State Inspector/index.html`: `.tool-shell__left`
- `tools/State Inspector/index.html`: `.tool-shell__right`

## Current Component/Class/Function Inventory
- `tools/State Inspector/main.js`: applyProjectState; bindEvents; bootStateInspector; buildLiveSnapshot; buildPresetLoadedStatus; captureProjectState; clearRoutedPayloadQueryParam; emitManualJsonDiagnostic; getApi; inspectInputJson; isEmptySnapshotPayload; isManualJsonInputEmpty; normalizeSamplePresetPath; readBootRegistryKeys; readProjectManifest; readRoutedInspectionPayload; readStorageEntries; refreshSnapshot; registerToolBootContract; renderSnapshot; setStatus; tryLoadPresetFromQuery; updateInspectJsonActionState

## Target Controls
Keep:
- snapshot input controls
- inspection/filter controls
- report/export controls

Remove or rename:
- inspection UI state from published snapshot JSON unless schema-owned

Add:
- Validate Snapshot
- Publish `tools.state-inspector`
- state path diagnostics

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for state snapshot payload. Current contract baseline: `tools/schemas/tools/state-inspector.schema.json` (state-inspector Payload).
Required keys: `snapshot`.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: parse incoming state snapshot payload and reject it before mutation when invalid
- validate: apply the current state snapshot payload contract before export, copy, or publish
- edit/process: mutate only state snapshot payload fields owned by State Inspector
- export/save: serialize the validated state snapshot payload as the tools.state-inspector output shape
- publish: write only the validated tools.state-inspector value produced by State Inspector
- copy/create payload: create copied payload text from the validated state snapshot payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts the schema-defined state snapshot payload
- keeps inspection filtering separate from snapshot JSON
- publishes only validated state inspector output

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `state-inspector.schema.json`
- invalid snapshot/path data
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.state-inspector = {
  "snapshot": "jsonValue"
}
```

## Playwright Expectations
- load `tools/State Inspector/index.html` without console errors
- inspect/filter a valid snapshot
- reject invalid state snapshot JSON

## Manual Test Expectations
- Open `tools/State Inspector/index.html` and confirm snapshot/inspection controls render.
- Load a valid snapshot, inspect/filter it, validate, export, and publish.
- Try malformed JSON and invalid snapshot data; each must block publish.

## Known Gaps
- Inspection filters should not be confused with published snapshot fields.
- Diagnostics should identify the failing state path.

## Rebuild Order Priority
core-15: rebuild in the core tool lane after earlier priorities are stable.
