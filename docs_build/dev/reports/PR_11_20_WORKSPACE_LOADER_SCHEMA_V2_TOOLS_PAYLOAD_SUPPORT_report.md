# PR 11.20 - Workspace Loader Schema V2 Tools Payload Support Report

## PASS/FAIL
PASS

## Files Changed
- tools/Workspace Manager/main.js
- tools/shared/platformShell.js
- docs_build/dev/reports/PR_11_20_WORKSPACE_LOADER_SCHEMA_V2_TOOLS_PAYLOAD_SUPPORT_report.md

## Old Loader Assumptions Found
- Workspace Manager previously derived available tools from registry/game filters, not strictly from `Object.keys(manifest.tools)` when a sample workspace manifest was provided.
- Shared shell sample preset scoping previously matched `manifest.tools` keys by exact tool id only, so a singular `tools.palette-browser` key would not resolve for `palette-browser` launches.

## New Loader Path
- Workspace Manager now reads `samplePresetPath` workspace manifest, classifies `manifest.tools` keys, validates each key against tool host registry IDs (with explicit singular palette mapping), validates payload `tool` id equality, and uses accepted tool IDs as the active tool list filter.
- Shared shell scoped preset resolution now supports singular `tools.palette-browser` mapped to `palette-browser` and rejects mismatched/malformed tool payload entries.

## Sample 1902 Manifest Tool Key Evidence
Source:
- samples/phase-19/1902/sample.1902.workspace-all-tools.json

Discovered tool keys:
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

Accepted tool ids:
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

Rejected tool keys:
- none

Result:
- Workspace manifest resolves to 17 accepted tool IDs, proving Workspace availability is not Palette-only.

## Proof Workspace Shows More Than Palette
- Accepted manifest tools for sample 1902 include 17 valid tool IDs (not only `palette-browser`).
- Launch smoke includes PASS for `samples/phase-19/1902/index.html` and all listed active tools, including but not limited to Asset Browser, Sprite Editor, Tilemap Studio, Vector Asset Studio, Vector Map Editor, and Palette Browser.

## Validation Commands and Results
- `node --check "tools/Workspace Manager/main.js"` -> PASS
- `node --check "tools/shared/platformShell.js"` -> PASS
- `npm run test:launch-smoke -- --tools --samples --sample-range=1902-1902` -> PASS (suite executed; report summary `PASS=287 FAIL=0` includes sample `1902` PASS and all active tool entries PASS)
- Manifest classification evidence command (Node inline script against sample 1902 + tool host manifest) -> PASS (`acceptedCount=17`, `rejected=[]`)

## Scope Confirmation
- No schema loosening was introduced.
- No fallback/default/hidden data was added.
- No standalone sample behavior paths were modified.
- No files under `start_of_day` were changed.
- No samples other than sample 1902 were touched by this PR implementation (code changes were limited to Workspace loader/shared shell paths).
