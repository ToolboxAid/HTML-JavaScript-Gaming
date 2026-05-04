# 3D JSON Payload Reengineering Design

Task: PR_26124_022-tighten-tool-design-docs
Classification: rebuildable tool
Core priority: core-11
Source folder: `tools/3D JSON Payload`
Publish target: `tools.3d-json-payload`

## Tool Purpose
3D map payload normalization. This tool owns `mapPayload`, normalization, invalid JSON rejection, export, and publish to `tools.3d-json-payload`.

## Exact Folder/Files Inspected
- `tools/3D JSON Payload/how_to_use.html`
- `tools/3D JSON Payload/index.html`
- `tools/3D JSON Payload/main.js`
- `tools/3D JSON Payload/README.md`

## Exact Current Controls Found
- `tools/3D JSON Payload/index.html`: `button[button]#normalize3dMapButton` - Normalize JSON Payload
- `tools/3D JSON Payload/index.html`: `button[button]#openHowToUse3dMapButton` - How to Use
- `tools/3D JSON Payload/index.html`: `textarea#map3dInput` - map3dInput
- `tools/3D JSON Payload/main.js`: `normalize3dMapButton` via normalizeButton
- `tools/3D JSON Payload/main.js`: `openHowToUse3dMapButton` via howToUseButton
- `tools/3D JSON Payload/main.js`: `map3dStatus` via statusText
- `tools/3D JSON Payload/main.js`: `map3dInput` via input
- `tools/3D JSON Payload/main.js`: `map3dOutput` via output

## Current Panels And Surfaces Found
- `tools/3D JSON Payload/index.html`: `.debug-tool-shell`
- `tools/3D JSON Payload/index.html`: `.app-shell`
- `tools/3D JSON Payload/index.html`: `.panel`
- `tools/3D JSON Payload/index.html`: `.debug-tool-panel`
- `tools/3D JSON Payload/index.html`: `.debug-tool-grid`

## Exact Current Functions And Classes
- `tools/3D JSON Payload/main.js`: function boot3dMapEditor; function buildPresetLoadedStatus; function normalizeMapPayload; function normalizeMapPayloadAction; function normalizeSamplePresetPath; function sanitizeNumber; function setStatus; function tryLoadPresetFromQuery; method getApi; method registerToolBootContract

## Target Controls
Keep:
- Normalize JSON Payload
- How to Use
- map input textarea
- normalized output panel

Remove or rename:
- none identified in the current folder

Add:
- Load 3D Payload JSON
- Export normalized map payload
- Publish `tools.3d-json-payload`

## JSON Contract Owned By This Tool
Baseline schema: `tools/schemas/tools/3d-json-payload.schema.json`. Required top-level fields: mapPayload. Allowed top-level fields: mapPayload. Additional top-level properties are rejected by the current schema. The tool owns import/load, validation, edit/process, export/save, and publish of this payload. Workspace may pass a launch payload, but nested JSON remains tool-owned.

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
- Paste a valid `mapPayload` document and normalize it.
- Export/copy the normalized output.
- Try malformed JSON and JSON without `mapPayload`; output and publish must stay blocked.
