# 3D Camera Path Editor Reengineering Design

Task: PR_26124_022-tighten-tool-design-docs
Classification: rebuildable tool
Core priority: core-13
Source folder: `tools/3D Camera Path Editor`
Publish target: `tools.3d-camera-path-editor`

## Tool Purpose
3D camera path authoring. This tool owns `cameraPath`, waypoint editing, path normalization, export, and publish to `tools.3d-camera-path-editor`.

## Exact Folder/Files Inspected
- `tools/3D Camera Path Editor/how_to_use.html`
- `tools/3D Camera Path Editor/index.html`
- `tools/3D Camera Path Editor/main.js`
- `tools/3D Camera Path Editor/README.md`

## Exact Current Controls Found
- `tools/3D Camera Path Editor/index.html`: `button[button]#addCameraPointButton` - Add Waypoint
- `tools/3D Camera Path Editor/index.html`: `button[button]#normalizeCameraPathButton` - Normalize Path
- `tools/3D Camera Path Editor/index.html`: `textarea#cameraPathInput` - cameraPathInput
- `tools/3D Camera Path Editor/main.js`: `addCameraPointButton` via addButton
- `tools/3D Camera Path Editor/main.js`: `normalizeCameraPathButton` via normalizeButton
- `tools/3D Camera Path Editor/main.js`: `cameraPathStatus` via statusText
- `tools/3D Camera Path Editor/main.js`: `cameraPathInput` via input
- `tools/3D Camera Path Editor/main.js`: `cameraPathOutput` via output

## Current Panels And Surfaces Found
- `tools/3D Camera Path Editor/index.html`: `.debug-tool-shell`
- `tools/3D Camera Path Editor/index.html`: `.app-shell`
- `tools/3D Camera Path Editor/index.html`: `.panel`
- `tools/3D Camera Path Editor/index.html`: `.debug-tool-panel`
- `tools/3D Camera Path Editor/index.html`: `.debug-tool-grid`

## Exact Current Functions And Classes
- `tools/3D Camera Path Editor/main.js`: function addWaypoint; function boot3dCameraPathEditor; function buildPresetLoadedStatus; function normalizeCameraPath; function normalizeCameraPathPayload; function normalizeSamplePresetPath; function parseInputPayload; function sanitizeNumber; function setStatus; function tryLoadPresetFromQuery; method getApi; method registerToolBootContract

## Target Controls
Keep:
- Add Waypoint
- Normalize Path
- camera path input textarea
- normalized output panel

Remove or rename:
- none identified in the current folder

Add:
- Load Camera Path JSON
- delete/reorder waypoint controls
- Export Camera Path JSON
- Publish `tools.3d-camera-path-editor`

## JSON Contract Owned By This Tool
Baseline schema: `tools/schemas/tools/3d-camera-path-editor.schema.json`. Required top-level fields: cameraPath. Allowed top-level fields: cameraPath. Additional top-level properties are rejected by the current schema. The tool owns import/load, validation, edit/process, export/save, and publish of this payload. Workspace may pass a launch payload, but nested JSON remains tool-owned.

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
- Load or paste a valid camera path.
- Add a waypoint, normalize the path, and export.
- Try malformed JSON, empty waypoint arrays, and nonnumeric positions; publish must stay blocked.
