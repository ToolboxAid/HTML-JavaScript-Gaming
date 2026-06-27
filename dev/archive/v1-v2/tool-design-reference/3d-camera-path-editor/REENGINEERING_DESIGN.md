# 3D Camera Path Editor Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-13
Source folder: `toolbox/3D Camera Path Editor`
Publish target: `tools.3d-camera-path-editor`

## Tool Purpose
3D Camera Path Editor owns camera path import, validation, waypoint editing, export, and publish to `tools.3d-camera-path-editor`.

## Folder/Files Inspected
- `toolbox/3D Camera Path Editor/how_to_use.html`
- `toolbox/3D Camera Path Editor/index.html`
- `toolbox/3D Camera Path Editor/main.js`
- `toolbox/3D Camera Path Editor/README.md`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `toolbox/3D Camera Path Editor/index.html`: `button[button]#addCameraPointButton` - Add Waypoint | Adds a new camera waypoint or path setting. | Appends schema-owned data to the draft 3D camera path payload; publish waits for validation. |
| `toolbox/3D Camera Path Editor/index.html`: `button[button]#normalizeCameraPathButton` - Normalize Path | Processes the current 3D camera path payload. | Updates tool-owned derived data/report fields that must validate before tools.3d-camera-path-editor publish. |
| `toolbox/3D Camera Path Editor/index.html`: `textarea#cameraPathInput` - cameraPathInput | Edits the active camera waypoint or path setting field. | Updates the draft 3D camera path payload field represented by `cameraPathInput` before validation. |

## Panels And Surfaces Found
- `toolbox/3D Camera Path Editor/how_to_use.html`: `.tools-platform-surface`
- `toolbox/3D Camera Path Editor/index.html`: `.app-shell`
- `toolbox/3D Camera Path Editor/index.html`: `.debug-tool-grid`
- `toolbox/3D Camera Path Editor/index.html`: `.debug-tool-panel`
- `toolbox/3D Camera Path Editor/index.html`: `.debug-tool-shell`
- `toolbox/3D Camera Path Editor/index.html`: `.panel`

## Current Component/Class/Function Inventory
- `toolbox/3D Camera Path Editor/main.js`: addWaypoint; boot3dCameraPathEditor; buildPresetLoadedStatus; getApi; normalizeCameraPath; normalizeCameraPathPayload; normalizeSamplePresetPath; parseInputPayload; registerToolBootContract; sanitizeNumber; setStatus; tryLoadPresetFromQuery

## Target Controls
Keep:
- waypoint controls
- path preview/playback controls
- import/export controls

Remove or rename:
- preview playback state from published path JSON unless schema-owned

Add:
- Validate Camera Path
- Publish `tools.3d-camera-path-editor`
- waypoint/path diagnostics

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for 3D camera path payload. Current contract baseline: `toolbox/schemas/tools/3d-camera-path-editor.schema.json` (3d-camera-path-editor Payload).
Required keys: `cameraPath`.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: parse incoming 3D camera path payload and reject it before mutation when invalid
- validate: apply the current 3D camera path payload contract before export, copy, or publish
- edit/process: mutate only 3D camera path payload fields owned by 3D Camera Path Editor
- export/save: serialize the validated 3D camera path payload as the tools.3d-camera-path-editor output shape
- publish: write only the validated tools.3d-camera-path-editor value produced by 3D Camera Path Editor
- copy/create payload: create copied payload text from the validated 3D camera path payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts the schema-defined camera path payload
- keeps waypoint edits inside the tool-owned path payload
- publishes only validated camera path JSON

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `3d-camera-path-editor.schema.json`
- invalid waypoint/path fields
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.3d-camera-path-editor = {
  "cameraPath": "jsonValue"
}
```

## Playwright Expectations
- load `toolbox/3D Camera Path Editor/index.html` without console errors
- edit/play a valid path and confirm output JSON updates
- reject invalid camera path JSON

## Manual Test Expectations
- Open `toolbox/3D Camera Path Editor/index.html` and confirm waypoint/path controls render.
- Add or edit a waypoint, validate, export, and re-import.
- Try malformed JSON and an invalid waypoint; each must block publish.

## Known Gaps
- Waypoint validation should identify the failing point.
- Publish should be gated by path validation.

## Rebuild Order Priority
core-13: rebuild in the core tool lane after earlier priorities are stable.
