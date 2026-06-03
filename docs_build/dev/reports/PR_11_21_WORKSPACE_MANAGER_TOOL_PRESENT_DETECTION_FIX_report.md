# PR 11.21 - Workspace Manager Tool Present Detection Fix

## PASS/FAIL
PASS

## Files Changed
- toolbox/Workspace Manager/main.js
- docs_build/dev/reports/PR_11_21_workspace_tool_presence_evidence.json
- docs_build/dev/reports/PR_11_21_WORKSPACE_MANAGER_TOOL_PRESENT_DETECTION_FIX_report.md

## Old Presence Check
- Presence classification in Workspace Manager accepted tool entries primarily by:
  - raw `manifest.tools` key -> mapped tool id (palette alias)
  - registry match
  - `tool` field id match
- It did not enforce explicit tool-schema validation for each `manifest.tools` entry.
- When a workspace filter was present, game-level `toolsUsed` filtering could still influence visible tool list.

## New Presence Check
- Presence source is strict `manifest.tools` keys from the loaded workspace manifest.
- Classification now records and validates, per key:
  - raw key
  - normalized key
  - palette alias mapping (`tools.palette-browser` -> `palette-browser`)
  - registry match
  - workspace-schema allowed key
  - tool-schema validity
  - payload `tool` id match
- Workspace schema contract is loaded from:
  - `toolbox/schemas/workspace.manifest.schema.json`
  - referenced tool schemas under `toolbox/schemas/tools/*.schema.json`
- If schema contract cannot be loaded, entries are rejected as not schema-validated.
- Required workspace tool keys from schema (including `palette`) are enforced in diagnostics.
- Visible Workspace Manager tools are now derived from accepted `manifest.tools` presence and no longer intersected with game `toolsUsed` when workspace manifest keys are available.

## Sample 1902 Evidence
Evidence file:
- docs_build/dev/reports/PR_11_21_workspace_tool_presence_evidence.json

Raw loaded tool keys (`manifest.tools`):
- vector-map-editor
- vector-asset-studio
- tile-map-editor
- parallax-editor
- sprite-editor
- skin-editor
- asset-browser
- palette-browser
- state-inspector
- replay-visualizer
- performance-profiler
- physics-sandbox
- asset-pipeline-tool
- tile-model-converter
- 3d-json-payload-normalizer
- 3d-asset-viewer
- 3d-camera-path-editor
- palette

Normalized/mapped keys:
- Every key normalized lowercase; singular `palette` maps to `palette-browser` UI presence.

Valid present keys (accepted tool ids):
- vector-map-editor
- vector-asset-studio
- tile-map-editor
- parallax-editor
- sprite-editor
- skin-editor
- asset-browser
- palette-browser
- state-inspector
- replay-visualizer
- performance-profiler
- physics-sandbox
- asset-pipeline-tool
- tile-model-converter
- 3d-json-payload-normalizer
- 3d-asset-viewer
- 3d-camera-path-editor

Invalid/rejected keys:
- none

Visible Workspace Manager tools (from accepted manifest presence):
- vector-map-editor
- vector-asset-studio
- tile-map-editor
- parallax-editor
- sprite-editor
- skin-editor
- asset-browser
- palette-browser
- state-inspector
- replay-visualizer
- performance-profiler
- physics-sandbox
- asset-pipeline-tool
- tile-model-converter
- 3d-json-payload-normalizer
- 3d-asset-viewer
- 3d-camera-path-editor

## Proof Workspace Manager Shows More Than Palette
- Accepted/present tool ids for sample 1902 = 17 (not palette-only).
- Visible Workspace Manager tools = 17.

## Validation Commands and Results
- `node --check "toolbox/Workspace Manager/main.js"` -> PASS
- `node ./tests/runtime/LaunchSmokeAllEntries.test.mjs --samples --sample-range=1902-1902 --tools` -> PASS (`PASS=19 FAIL=0`)
- `node` inline invocation of `tests/tools/ToolSchemaStrictModeValidation.test.mjs` `run()` -> PASS
- Evidence generation command (`manifest.tools` key normalization/classification export) -> PASS

## Scope and Constraint Confirmation
- No schema loosening was introduced.
- No old presence sources were used for sample 1902 presence classification (`palettes`, `games[].tools`, `activeWorkspaceTools`, top-level `config`, top-level `payload`, wrapper payloads).
- No fallback/default/hidden data added.
- No other sample files were modified.
- No `start_of_day` folders were modified.
