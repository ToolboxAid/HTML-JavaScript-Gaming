# Level 10.6O Tool UAT Failure Stabilization Report

## Scope
Executed `BUILD_PR_LEVEL_10_6O_TOOL_UAT_FAILURE_STABILIZATION` as a diagnostics-plus-stabilization PR.

Implemented only the listed UAT-failure fixes:
- accordion state persistence
- Asset Browser approved-asset source resolution
- Tilemap Studio sample load/readiness binding
- Vector Asset Studio sample load + palette/paint/stroke readiness binding
- Vector Map Editor failing-sample load binding while preserving 1212/1213/1214 behavior

No fallback/demo payloads or hardcoded sample-path logic were introduced.

## Files Inspected Before Edits
- `tools/shared/platformShell.js`
- `tools/shared/toolLoadDiagnostics.js`
- `tools/Asset Browser/main.js`
- `tools/Tilemap Studio/main.js`
- `tools/Vector Asset Studio/main.js`
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`
- sample payloads and SVG sources for 0901/1204/1205/1208/1209/1210/1211/1212/1213/1214/1215/1216/1217

## Implemented Fixes

### 1. All tools: accordion closes after ~1 second
- Updated `tools/shared/platformShell.js` accordion handling so rerenders no longer force-reset `details.open`.
- Added per-accordion state tracking keyed by panel side + title.
- Added structured control-readiness diagnostics for accordion state:
  - `[tool-ui:control-ready]` with `controlId=accordion:*`.

### 2. Asset Browser / Import Hub: `0 approved assets`
- Updated `tools/Asset Browser/main.js` approved-asset loading pipeline to support both:
  - explicit game asset catalogs (`html-js-gaming.game-asset-catalog`)
  - explicit manifest-declared assets (`tools["asset-browser"].assets`) from manifest-shaped JSON sources.
- Added active-project-manifest fallback extraction for declared asset-browser assets.
- Added approved-asset-list readiness diagnostics:
  - `[tool-ui:control-ready]` with `controlId=approved-asset-list` and classification.

### 3. Tilemap Studio: map/document controls not bound from sample
- Updated `tools/Tilemap Studio/main.js` sample extraction to support `payload` and `config` wrapper shapes, including:
  - `tileMapDocument`, `tilemapDocument`
  - `tileMapDocumentPath`, `tilemapDocumentPath`
  - related path aliases
- Prevented silent fallback-to-root preset object by requiring an explicit document/doc-path extraction result.
- Added readiness diagnostics:
  - `map-canvas`
  - `tile-palette-grid`
  - `selected-tile`
  with `[tool-ui:control-ready]` and explicit classification (`success|missing|empty|defaulted`).

### 4. Vector Asset Studio: palette/paint/stroke readiness for sample loads (incl. 1215/1216/1217)
- Updated `tools/Vector Asset Studio/main.js` extraction to support both `payload` and `config` vector preset wrappers.
- Added declared-input palette stabilization path:
  - if explicit palette selection is unresolved after preset load, derive/select a declared palette strictly from preset-declared options and loaded document colors (no demo/fallback data injection).
- Added readiness diagnostics for required controls:
  - `svg-canvas`
  - `palette-controls`
  - `paint-fill-control`
  - `stroke-control`
  via `[tool-ui:control-ready]`.

### 5. Vector Map Editor: failing samples load no data; preserve 1212/1213/1214
- Updated `tools/Vector Map Editor/editor/VectorMapEditorApp.js` extraction to support `payload` + `config` wrappers (`vectorMapDocument`, aliases).
- Removed permissive fallback that treated wrapper roots as documents.
- Added readiness diagnostics:
  - `document-canvas`
  - `data-list`
  via `[tool-ui:control-ready]`.
- 1212/1213/1214 remained valid in regression validation (see test results).

### 6. Shared diagnostics extension
- Extended `tools/shared/toolLoadDiagnostics.js`:
  - added classification values: `empty`, `defaulted`
  - enabled classification normalization/override handling
  - added `[tool-ui:control-ready]` logging export (`logToolUiControlReady`)

## Diagnostics Evidence
Added/extended diagnostic families now emitted by fixed paths:
- `[tool-load:classification]` with support for `success | missing | wrong-path | wrong-shape | empty | defaulted`
- `[tool-ui:control-ready]` for all required controls listed in BUILD 10.6O minimum set

## Validation
Executed required commands:

1. `npm run test:launch-smoke:games`
- Result: PASS
- Summary: `PASS=12 FAIL=0 TOTAL=12`

2. `npm run test:sample-standalone:data-flow`
- Result: PASS
- Key evidence from summary:
  - `schemaFailures: []`
  - `contractFailures: []`
  - `roundtripPathFailures: []`
  - `genericFailures: []`
  - vector-map-editor sample checks include successful load signals for `0901`, `1204`, `1205`, `1212`, `1213`, `1214`
  - vector-asset-studio sample checks include successful load signals for `0901`, `1204`, `1208`, `1215`, `1216`, `1217`

## Changed Files (this stabilization)
- `tools/shared/toolLoadDiagnostics.js`
- `tools/shared/platformShell.js`
- `tools/Asset Browser/main.js`
- `tools/Tilemap Studio/main.js`
- `tools/Vector Asset Studio/main.js`
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`
- `docs/dev/reports/launch_smoke_report.md` (updated by required test run)
- `docs/dev/reports/level_10_6o_tool_uat_failure_stabilization_report.md`

## Roadmap
- No execution-backed Level 10.6O status marker was found in `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`; no roadmap text changes were made.
