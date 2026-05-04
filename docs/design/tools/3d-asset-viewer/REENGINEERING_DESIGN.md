# 3D Asset Viewer Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-12
Source folder: `tools/3D Asset Viewer`
Publish target: `tools.3d-asset-viewer`

## Tool Purpose
Read-only 3D asset inspection. 3D Asset Viewer owns `asset3d` validation, inspection report generation, export, and publish to `tools.3d-asset-viewer` when a report payload is required.

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
Owned JSON is the 3d-asset-viewer payload. Required field is `asset3d`; no other top-level fields are allowed. Inspection output is read-only and derived from the loaded 3D asset payload.

## Publish Output
Publish only to `tools.3d-asset-viewer`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing `asset3d`
- asset data the inspector cannot summarize
- unsupported top-level fields

## Manual Test Plan
- Paste a valid `asset3d` payload and inspect it.
- Confirm bounds/diagnostics output is deterministic.
- Try malformed JSON and JSON without `asset3d`; report export and publish must stay blocked.
