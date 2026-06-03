# 3D Asset Viewer Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-12
Source folder: `tools/3D Asset Viewer`
Publish target: `tools.3d-asset-viewer`

## Tool Purpose
3D Asset Viewer owns 3D asset inspection payload import, validation, report export, and publish to `tools.3d-asset-viewer`.

## Folder/Files Inspected
- `tools/3D Asset Viewer/how_to_use.html`
- `tools/3D Asset Viewer/index.html`
- `tools/3D Asset Viewer/main.js`
- `tools/3D Asset Viewer/README.md`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/3D Asset Viewer/index.html`: `button[button]#inspect3dAssetButton` - Inspect Asset | Triggers the current 3D asset viewer payload UI action for `Inspect Asset`. | May update draft 3D asset viewer payload data; tools.3d-asset-viewer publish must wait for validation. |
| `tools/3D Asset Viewer/index.html`: `textarea#asset3dInput` - asset3dInput | Edits the current 3D asset viewer payload through `asset3dInput`. | Updates draft 3D asset viewer payload data and requires validation before tools.3d-asset-viewer publish. |

## Panels And Surfaces Found
- `tools/3D Asset Viewer/how_to_use.html`: `.tools-platform-surface`
- `tools/3D Asset Viewer/index.html`: `.app-shell`
- `tools/3D Asset Viewer/index.html`: `.debug-tool-grid`
- `tools/3D Asset Viewer/index.html`: `.debug-tool-panel`
- `tools/3D Asset Viewer/index.html`: `.debug-tool-shell`
- `tools/3D Asset Viewer/index.html`: `.panel`

## Current Component/Class/Function Inventory
- `tools/3D Asset Viewer/main.js`: boot3dAssetViewer; buildPresetLoadedStatus; computeBounds; getApi; inspectAssetPayload; normalizeAssetPayload; normalizeSamplePresetPath; registerToolBootContract; sanitizeNumber; setStatus; tryLoadPresetFromQuery

## Target Controls
Keep:
- asset selection controls
- viewer/camera controls
- inspection/report export controls

Remove or rename:
- viewer-only camera state from published asset JSON unless schema-owned

Add:
- Validate 3D Asset Payload
- Publish `tools.3d-asset-viewer`
- inspection diagnostics

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for 3D asset viewer payload. Current contract baseline: `tools/schemas/tools/3d-asset-viewer.schema.json` (3d-asset-viewer Payload).
Required keys: `asset3d`.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: parse incoming 3D asset viewer payload and reject it before mutation when invalid
- validate: apply the current 3D asset viewer payload contract before export, copy, or publish
- edit/process: mutate only 3D asset viewer payload fields owned by 3D Asset Viewer
- export/save: serialize the validated 3D asset viewer payload as the tools.3d-asset-viewer output shape
- publish: write only the validated tools.3d-asset-viewer value produced by 3D Asset Viewer
- copy/create payload: create copied payload text from the validated 3D asset viewer payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts the schema-defined 3D asset viewer payload
- uses viewer controls for inspection without mutating unrelated JSON
- publishes only validated asset inspection output

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `3d-asset-viewer.schema.json`
- invalid asset reference or inspection setting
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.3d-asset-viewer = {
  "asset3d": "jsonValue"
}
```

## Playwright Expectations
- load `tools/3D Asset Viewer/index.html` without console errors
- exercise viewer controls against a valid payload
- reject invalid 3D asset viewer JSON

## Manual Test Expectations
- Open `tools/3D Asset Viewer/index.html` and confirm the viewer/inspection controls render.
- Load a valid 3D asset payload, inspect it, validate, export, and publish.
- Try malformed JSON and an invalid asset reference; each must block publish.

## Known Gaps
- Viewer state and published payload should be clearly separated.
- Validation diagnostics should identify the failing asset field.

## Rebuild Order Priority
core-12: rebuild in the core tool lane after earlier priorities are stable.
