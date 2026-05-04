# 3D Camera Path Editor Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-13
Source folder: `tools/3D Camera Path Editor`
Publish target: `tools.3d-camera-path-editor`

## Tool Purpose
3D camera path authoring. 3D Camera Path Editor owns `cameraPath`, waypoint editing, path normalization, export, and publish to `tools.3d-camera-path-editor`.

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
Owned JSON is the 3d-camera-path-editor payload. Required field is `cameraPath`; no other top-level fields are allowed. Camera path data owns waypoint order, positions, timing, and normalized path output.

## Publish Output
Publish only to `tools.3d-camera-path-editor`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing `cameraPath`
- empty or invalid waypoint data
- nonnumeric camera position/timing values
- unsupported top-level fields

## Manual Test Plan
- Load or paste a valid camera path.
- Add a waypoint, normalize the path, and export.
- Try malformed JSON, empty waypoint arrays, and nonnumeric positions; publish must stay blocked.
