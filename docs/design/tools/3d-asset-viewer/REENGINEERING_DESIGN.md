# 3D Asset Viewer Reengineering Design

Task: PR_26124_022-tighten-tool-design-docs
Classification: rebuildable tool
Core priority: core-12
Source folder: `tools/3D Asset Viewer`
Publish target: `tools.3d-asset-viewer`

## Tool Purpose
Read-only 3D asset inspection. This tool owns `asset3d` validation, inspection report generation, export, and publish to `tools.3d-asset-viewer` when a report payload is required.

## Exact Folder/Files Inspected
- `tools/3D Asset Viewer/how_to_use.html`
- `tools/3D Asset Viewer/index.html`
- `tools/3D Asset Viewer/main.js`
- `tools/3D Asset Viewer/README.md`

## Exact Current Controls Found
- `tools/3D Asset Viewer/index.html`: `button[button]#inspect3dAssetButton` - Inspect Asset
- `tools/3D Asset Viewer/index.html`: `textarea#asset3dInput` - asset3dInput
- `tools/3D Asset Viewer/main.js`: `inspect3dAssetButton` via inspectButton
- `tools/3D Asset Viewer/main.js`: `asset3dStatus` via statusText
- `tools/3D Asset Viewer/main.js`: `asset3dInput` via input
- `tools/3D Asset Viewer/main.js`: `asset3dOutput` via output

## Current Panels And Surfaces Found
- `tools/3D Asset Viewer/index.html`: `.debug-tool-shell`
- `tools/3D Asset Viewer/index.html`: `.app-shell`
- `tools/3D Asset Viewer/index.html`: `.panel`
- `tools/3D Asset Viewer/index.html`: `.debug-tool-panel`
- `tools/3D Asset Viewer/index.html`: `.debug-tool-grid`

## Exact Current Functions And Classes
- `tools/3D Asset Viewer/main.js`: function boot3dAssetViewer; function buildPresetLoadedStatus; function computeBounds; function inspectAssetPayload; function normalizeAssetPayload; function normalizeSamplePresetPath; function sanitizeNumber; function setStatus; function tryLoadPresetFromQuery; method getApi; method registerToolBootContract

## Target Controls
Keep:
- Inspect Asset
- asset input textarea
- inspection output panel

Remove or rename:
- editing controls from the viewer path

Add:
- Load 3D Asset JSON
- Export inspection report
- Publish `tools.3d-asset-viewer` report

## JSON Contract Owned By This Tool
Baseline schema: `tools/schemas/tools/3d-asset-viewer.schema.json`. Required top-level fields: asset3d. Allowed top-level fields: asset3d. Additional top-level properties are rejected by the current schema. The tool owns import/load, validation, edit/process, export/save, and publish of this payload. Workspace may pass a launch payload, but nested JSON remains tool-owned.

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
- Paste a valid `asset3d` payload and inspect it.
- Confirm bounds/diagnostics output is deterministic.
- Try malformed JSON and JSON without `asset3d`; report export and publish must stay blocked.
