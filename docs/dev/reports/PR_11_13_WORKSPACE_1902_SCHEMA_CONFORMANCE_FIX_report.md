# PR 11.13 Workspace 1902 Schema Conformance Fix Report

## Result
PASS

## Scope
- Rewrote `samples/phase-19/1902/sample.1902.workspace-all-tools.json` from mixed sample/tool payload shape into a workspace-manifest-shaped document.
- Added a surgical shared-shell fetch shim so tools launched from Workspace can consume tool-scoped payloads from `tools[toolId]` when the preset is a workspace manifest.
- Did not modify standalone sample launch pages or `start_of_day` folders.

## Schema Files Used
- `tools/schemas/workspace.schema.json`
- `tools/schemas/workspace.manifest.schema.json`
- `tools/schemas/tools/*.schema.json`

## Old JSON Shape Problems (1902)
- Used sample tool payload schema instead of workspace manifest shape.
- Included unsupported top-level fields for workspace manifest usage (`tool`, `activeWorkspaceTools`).
- Contained copied unrelated payload sections and mixed ownership.
- Included palette sidecar references.

## Final JSON Shape Summary
- Top-level now uses workspace-manifest identity:
  - `documentKind: "workspace-manifest"`
  - `schema: "html-js-gaming.project"`
  - `version`, `id`, `name`
- Canonical workspace data is now grouped under:
  - `palettes`
  - `tools`
- Each active workspace-supported tool now has a `tools[toolId]` payload entry with schema-required fields (`tool`, `version`, `config`) and tool-relevant explicit JSON payload data.
- Removed unsupported/misplaced top-level fields and palette sidecar references.

## Schema Validation Command/Result
Command executed:
```powershell
@'
const fs=require('fs');
const path=require('path');
const preset=JSON.parse(fs.readFileSync('samples/phase-19/1902/sample.1902.workspace-all-tools.json','utf8'));
// validates required workspace-manifest identity fields,
// forbidden old-shape fields, tool-schema required fields,
// and workspace.manifest projection (palettes/tools)
'@ | node -
```
Practical validation run result:
- `workspace_preset_validation PASS`
- `toolPayloadCount 17`
- `paletteIds sample-1902-workspace-palette`

## Workspace Validation (More Than Palette)
- Added shared-shell scoped-preset routing in `tools/shared/platformShell.js`:
  - When `samplePresetPath` points to a workspace-manifest JSON, tool fetch of that path receives `tools[activeToolId]` payload.
  - This keeps workspace manifest as SSoT while preserving existing per-tool loaders.
- Launch smoke validation confirms workspace/sample/tool launch stability after change:
  - `npm run test:launch-smoke -- --tools`
  - Result: `PASS=287 FAIL=0 TOTAL=287`
  - Includes `sample 1902` launch PASS and all active tools PASS.

## Resolved Tool IDs
Included under `tools` in `sample.1902.workspace-all-tools.json`:
- `vector-map-editor`
- `vector-asset-studio`
- `tile-map-editor`
- `parallax-editor`
- `sprite-editor`
- `skin-editor`
- `asset-browser`
- `palette-browser`
- `state-inspector`
- `replay-visualizer`
- `performance-profiler`
- `physics-sandbox`
- `asset-pipeline-tool`
- `tile-model-converter`
- `3d-json-payload-normalizer`
- `3d-asset-viewer`
- `3d-camera-path-editor`

Excluded IDs:
- None (all active workspace-supported tool IDs are present).

## Confirmations
- No palette sidecar references remain in sample 1902 workspace preset.
- No fallback/default/hidden sample data was added.
- No `start_of_day` folder changes.

## Files Changed (PR 11.13 Scope)
- `samples/phase-19/1902/sample.1902.workspace-all-tools.json`
- `tools/shared/platformShell.js`
- `docs/dev/reports/PR_11_13_WORKSPACE_1902_SCHEMA_CONFORMANCE_FIX_report.md`
