# Level 10.3 Tool-Local Sample Migration Report

Date: 2026-04-26
Build: `BUILD_PR_LEVEL_10_3_MIGRATE_TOOL_LOCAL_SAMPLES_TO_SAMPLES`

## Scope Summary
- Migrated discovered tool-local sample/demo payloads for:
  - `tools/Vector Map Editor`
  - `tools/Vector Asset Studio`
  - `tools/Parallax Scene Studio`
- Audited `tools/Tilemap Studio` for tool-local sample/demo entries.
- Added migrated sample entries under `samples/phase-12` using next available IDs `1212` to `1220`.
- Updated samples hub indexing through `samples/metadata/samples.index.metadata.json` (the data source used by `samples/index.html`).
- Removed tool-local sample dropdown/select UI entries from processed tools while keeping explicit query-based preset input support.

## Source To Destination Mapping

### Vector Map Editor
- Source tool: `tools/Vector Map Editor`
- Source sample/demo path: `tools/Vector Map Editor/samples/overworld_route_map.editor.json`
- Destination sample path: `samples/phase-12/1212/`
- Assigned phase/id: `phase-12 / 1212`
- Files moved/copied:
  - Created `samples/phase-12/1212/sample-1212-vector-map-editor.json`
  - Created `samples/phase-12/1212/index.html`
  - Created `samples/phase-12/1212/assets/images/preview.svg`

- Source tool: `tools/Vector Map Editor`
- Source sample/demo path: `tools/Vector Map Editor/samples/dungeon_layout_map.editor.json`
- Destination sample path: `samples/phase-12/1213/`
- Assigned phase/id: `phase-12 / 1213`
- Files moved/copied:
  - Created `samples/phase-12/1213/sample-1213-vector-map-editor.json`
  - Created `samples/phase-12/1213/index.html`
  - Created `samples/phase-12/1213/assets/images/preview.svg`

- Source tool: `tools/Vector Map Editor`
- Source sample/demo path: `tools/Vector Map Editor/samples/arena_zone_map.editor.json`
- Destination sample path: `samples/phase-12/1214/`
- Assigned phase/id: `phase-12 / 1214`
- Files moved/copied:
  - Created `samples/phase-12/1214/sample-1214-vector-map-editor.json`
  - Created `samples/phase-12/1214/index.html`
  - Created `samples/phase-12/1214/assets/images/preview.svg`

### Vector Asset Studio
- Source tool: `tools/Vector Asset Studio`
- Source sample/demo path: `tools/Vector Asset Studio/samples/sky_gradient_scene.svg`
- Destination sample path: `samples/phase-12/1215/`
- Assigned phase/id: `phase-12 / 1215`
- Files moved/copied:
  - Created `samples/phase-12/1215/sample-1215-vector-asset-studio.json`
  - Copied `samples/phase-12/1215/assets/data/vector/sky_gradient_scene.svg`
  - Created `samples/phase-12/1215/index.html`
  - Created `samples/phase-12/1215/assets/images/preview.svg`

- Source tool: `tools/Vector Asset Studio`
- Source sample/demo path: `tools/Vector Asset Studio/samples/mountain_range_scene.svg`
- Destination sample path: `samples/phase-12/1216/`
- Assigned phase/id: `phase-12 / 1216`
- Files moved/copied:
  - Created `samples/phase-12/1216/sample-1216-vector-asset-studio.json`
  - Copied `samples/phase-12/1216/assets/data/vector/mountain_range_scene.svg`
  - Created `samples/phase-12/1216/index.html`
  - Created `samples/phase-12/1216/assets/images/preview.svg`

- Source tool: `tools/Vector Asset Studio`
- Source sample/demo path: `tools/Vector Asset Studio/samples/mario_style_learning_backdrop.svg`
- Destination sample path: `samples/phase-12/1217/`
- Assigned phase/id: `phase-12 / 1217`
- Files moved/copied:
  - Created `samples/phase-12/1217/sample-1217-vector-asset-studio.json`
  - Copied `samples/phase-12/1217/assets/data/vector/mario_style_learning_backdrop.svg`
  - Created `samples/phase-12/1217/index.html`
  - Created `samples/phase-12/1217/assets/images/preview.svg`

### Parallax Scene Studio
- Source tool: `tools/Parallax Scene Studio`
- Source sample/demo path: `tools/Parallax Scene Studio/samples/parallax_sample.json`
- Destination sample path: `samples/phase-12/1218/`
- Assigned phase/id: `phase-12 / 1218`
- Files moved/copied:
  - Created `samples/phase-12/1218/sample-1218-parallax-editor.json`
  - Copied referenced assets into `samples/phase-12/1218/assets/data/parallax/`
  - Created `samples/phase-12/1218/index.html`
  - Created `samples/phase-12/1218/assets/images/preview.svg`

- Source tool: `tools/Parallax Scene Studio`
- Source sample/demo path: `tools/Parallax Scene Studio/samples/tilemap_parallax_sample.json`
- Destination sample path: `samples/phase-12/1219/`
- Assigned phase/id: `phase-12 / 1219`
- Files moved/copied:
  - Created `samples/phase-12/1219/sample-1219-parallax-editor.json`
  - Copied referenced assets into `samples/phase-12/1219/assets/data/parallax/`
  - Created `samples/phase-12/1219/index.html`
  - Created `samples/phase-12/1219/assets/images/preview.svg`

- Source tool: `tools/Parallax Scene Studio`
- Source sample/demo path: `tools/Parallax Scene Studio/samples/mario_style_learning_level_parallax.json`
- Destination sample path: `samples/phase-12/1220/`
- Assigned phase/id: `phase-12 / 1220`
- Files moved/copied:
  - Created `samples/phase-12/1220/sample-1220-parallax-editor.json`
  - Copied referenced assets into `samples/phase-12/1220/assets/data/parallax/`
  - Created `samples/phase-12/1220/index.html`
  - Created `samples/phase-12/1220/assets/images/preview.svg`

### Tilemap Studio Audit Result
- Source tool: `tools/Tilemap Studio`
- Discovery result: no tool-local sample/demo `samples/` folder and no sample dropdown/select entries were found.
- Migration action: none required for tool-local sample payloads.

## Tool-Local Sample UI Removal
- `tools/Vector Map Editor/index.html`
  - Removed sample dropdown/select and load button controls.
- `tools/Vector Asset Studio/index.html`
  - Removed sample dropdown/select and refresh/load controls.
- `tools/Parallax Scene Studio/index.html`
  - Removed sample dropdown/select and load controls.
- `tools/Vector Asset Studio/main.js`
  - Added null-safe guards so removed controls do not break runtime.
- `tools/Parallax Scene Studio/main.js`
  - Added null-safe guards so removed controls do not break runtime.
- `tools/Tilemap Studio`
  - No sample dropdown/select existed, retained unchanged.

## Samples Hub Update
- Updated samples hub data source:
  - `samples/metadata/samples.index.metadata.json`
- Added migrated sample rows for IDs:
  - `1212`, `1213`, `1214`, `1215`, `1216`, `1217`, `1218`, `1219`, `1220`
- `samples/index.html` intro copy updated to reflect tool preset samples in hub listing.

## Launch Test Result

### Added/Updated Tests
- Added `tests/tools/ToolLocalSampleMigration.test.mjs`
  - Verifies migrated sample IDs are indexed in metadata and files exist.
  - Verifies each migrated sample index launches correct tool route with `sampleId` and `samplePresetPath`.
  - Verifies old tool-local sample dropdown/select controls are removed from processed tool HTML.
  - Verifies query preset loading hooks remain in processed tool runtime files.

- Updated `tests/run-tests.mjs`
  - Added explicit run hook for `ToolLocalSampleMigration` test.

### Executed
- `node --input-type=module -e "import('./tests/tools/ToolLocalSampleMigration.test.mjs').then((m)=>m.run())"` -> PASS
- `node --input-type=module -e "import('./tests/tools/ToolEntryLaunchContract.test.mjs').then((m)=>m.run())"` -> PASS

### Note
- `SamplesProgramCombinedPass` currently reports pre-existing metadata parity mismatch (`samples.curriculum.validation.json progression.totalSamples`) that is outside this PR’s migration-only scope.

## Roadmap Status
- `docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md` was not updated because no explicit Level 10.3 status markers were present for this migration slice.

## Tool-Local Sample UI Removed/Retained Summary
- Removed:
  - Vector Map Editor sample select/load controls
  - Vector Asset Studio sample select/refresh/load controls
  - Parallax Scene Studio sample select/load controls
- Retained:
  - Query-based preset loading (`sampleId`, `samplePresetPath`) for explicit sample/workspace input
  - Tilemap Studio explicit input flow (no local sample dropdown existed)
