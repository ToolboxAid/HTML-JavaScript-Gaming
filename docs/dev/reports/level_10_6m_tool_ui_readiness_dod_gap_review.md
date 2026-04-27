# Level 10.6M Tool UI Readiness DoD Gap Review

## Scope and Method
- Reviewed `docs/pr/BUILD_PR_LEVEL_10_6M_TOOL_UI_READINESS_DOD.md` against currently sample-launched and game-launched tools.
- Compared DoD coverage to tool UI/data contracts evidenced in runtime tests and tool source.
- Runtime code changes were not made.

## Tool reviewed: Sprite Editor (`sprite-editor`)
Observed required controls:
- `paletteSelect`, `paletteButtons`, `colorPicker`, `activeColorSwatch`, `activeColorText`
- `editorCanvas`, `previewCanvas`, frame controls (`add/duplicate/delete/prev/next`)
- `playPreviewButton`, `pausePreviewButton`, `fpsInput`, `fpsValue`
- `saveProjectButton`, `packageProjectButton`, `exportPngButton`, `exportSheetButton`
- `loadProject*`, `loadAssetRegistry*`, `saveAssetRegistryButton`, `paletteLockText`
Observed required fields/data:
- `samplePresetPath` (sprite project input)
- manifest-resolved `palettePath` to canonical `*.palette.json`
- canonical palette fields used by loader: `schema`, `version`, `name`, `source`, `swatches`
DoD gaps found:
- Current DoD does not require palette lock-state UI verification (`paletteLockText`) after sample load.
- Current DoD does not require playback/FPS readiness checks tied to loaded frame data.
- Current DoD does not include asset-registry controls that are part of sprite-editor readiness in sample workflows.
Suggested DoD additions:
- Add control-ready checks for `paletteLockText`, `fpsInput/fpsValue`, preview play/pause, and asset-registry load/save controls.
- Add requirement that `sampleSourceText/sampleSourceDetailText` reflect loaded sample context.
Files inspected:
- `tools/Sprite Editor/modules/spriteEditorApp.js`
- `samples/metadata/samples.index.metadata.json`
No implementation changes made:
- yes

## Tool reviewed: Palette Browser (`palette-browser`)
Observed required controls:
- `paletteTitle`, `paletteSummaryText`, `paletteSwatches`, `paletteSelectionText`
- edit controls (`paletteNameInput`, `swatchColorInput`, `swatchNameInput`, `swatchSymbolInput`)
- actions (`copyPaletteJsonButton`, `exportPaletteJsonButton`, `importPaletteJsonButton`)
Observed required fields/data:
- canonical palette data (`name`, `swatches`, `source`)
- sample preset load signal in `paletteSelectionText`
DoD gaps found:
- DoD does not explicitly require load-status control verification (`paletteSelectionText`) even though this is a primary readiness signal in current tests.
- DoD does not require summary correctness (`paletteSummaryText` not showing empty/zero state when swatches exist).
Suggested DoD additions:
- Add explicit control-ready checks for `paletteSelectionText` and `paletteSummaryText`.
- Add requirement that swatch count in UI equals loaded `swatches.length`.
Files inspected:
- `tools/Palette Browser/main.js`
- `tests/runtime/SampleStandaloneToolDataFlow.test.mjs`
No implementation changes made:
- yes

## Tool reviewed: Tilemap Studio (`tile-map-editor`)
Observed required controls:
- map canvas and metadata (`mapCanvas`, `canvasMeta`, zoom controls)
- tile palette (`tilePalette`) and tileset controls (`tilesetTileWidth/Height`, spacing, margin, PNG loaders)
- layer list and layer controls (`layerList`, visibility, add/remove)
- save/export/package controls (`saveProjectButton`, `exportRuntimeButton`, package/export actions)
Observed required fields/data:
- tilemap document payload
- optional tilemap document indirection path
- tileset atlas/image metadata and layer arrays
DoD gaps found:
- Current DoD misses tileset-atlas readiness (tile width/height/spacing/margin and generated tile grid).
- Current DoD misses layer-kind readiness (`tile`/`collision`/`data`) and per-kind rendering checks.
Suggested DoD additions:
- Add required controls for tileset atlas configuration and generated tile preview state.
- Add readiness checks for layer-kind-specific rendering and selected-layer visibility state.
Files inspected:
- `tools/Tilemap Studio/main.js`
- `tests/runtime/SampleStandaloneToolDataFlow.test.mjs`
No implementation changes made:
- yes

## Tool reviewed: Vector Map Editor (`vector-map-editor`)
Observed required controls:
- canvas and object list (`editorCanvas`, `objectList`)
- selected-object editors (position, rotation, style, flags)
- document controls (`saveDocumentButton`, `exportRuntimeButton`, `loadDocumentInput`)
- mode and status controls (`workspaceModeSelect`, `toolModeSelect`, status triplet)
Observed required fields/data:
- vector map document (`vectorMapDocument` / `vectorMap` / `document`)
- object flags and transform fields used by selection/editor controls
DoD gaps found:
- Current DoD section is too narrow for actual required selection/transform/flag controls.
- Current DoD does not require readiness of object-detail panel fields after load.
Suggested DoD additions:
- Add required control checks for object selection detail panel, transform controls, and flag binding.
- Add required check that object list count and selected-object editor state match loaded document.
Files inspected:
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`
No implementation changes made:
- yes

## Tool reviewed: Vector Asset Studio (`vector-asset-studio`)
Observed required controls:
- SVG viewport and element list (`editorSvg`, `elementList`)
- palette target controls (paint/stroke/gradient start/end selectors and readouts)
- style controls (`strokeWidthInput`, `gradientAngleInput`, apply buttons)
- save/load controls (`loadSvg*`, `saveSvgButton`)
Observed required fields/data:
- vector asset payload plus palette-affecting style configuration
- loaded palette groups/options and active palette target state
DoD gaps found:
- Current DoD does not require readiness for multi-target palette binding (paint/stroke/gradient start/end).
- Current DoD does not require gating checks that editing is disabled until required palette targets are set.
Suggested DoD additions:
- Add control-ready checks for each palette target readout and active swatch state.
- Add explicit failure condition when editing proceeds with missing required palette target bindings.
Files inspected:
- `tools/Vector Asset Studio/main.js`
No implementation changes made:
- yes

## Tool reviewed: Replay Visualizer (`replay-visualizer`)
Observed required controls:
- `replayJsonInput`, `loadReplayButton`, `playReplayButton`, `pauseReplayButton`, `resetReplayButton`
- `replayTimeSlider`, `replayTimeReadout`, `replayEventList`, `replayEventOutput`, `replayStatusText`
Observed required fields/data:
- replay events array (`events` / `replayEvents` variants)
DoD gaps found:
- Current DoD does not include JSON source input/load action controls which are core readiness controls in current tool.
- Current DoD includes speed control but current tool readiness is primarily slider/time readout + event output binding.
Suggested DoD additions:
- Add required checks for source JSON input/load controls and event output panel binding.
- Keep speed control optional unless implemented in current tool UI.
Files inspected:
- `tools/Replay Visualizer/main.js`
- `tests/runtime/SampleStandaloneToolDataFlow.test.mjs`
No implementation changes made:
- yes

## Tool reviewed: Workspace Manager (`workspace-manager`) and launch routing
Observed required controls:
- host mount/pager controls (`[data-tool-host-prev]`, `[data-tool-host-next]`, mount container)
- current tool label and status text
- workspace launch links from game cards
Observed required fields/data:
- forwarded launch params: `sampleId`, `sampleTitle`, `samplePresetPath`, `gameId`, `gameTitle`, `gameHref`, `workspaceHref`, `returnTo`
- game launch params from SSoT: `gameId`, `mount=game`
DoD gaps found:
- Current DoD does not include forwarded launch-query contract validation across workspace mount boundary.
- Current DoD does not include game-card workspace launch error surfacing as readiness control.
Suggested DoD additions:
- Add required readiness checks for forwarded launch params and mount failure surface.
- Add explicit launch-tile check for workspace-launch error badge/text visibility when launch href resolution fails.
Files inspected:
- `tools/Workspace Manager/main.js`
- `tools/shared/toolLaunchSSoT.js`
- `games/index.render.js`
No implementation changes made:
- yes

## Tool reviewed: Sample launch tiles and sample detail tool links
Observed required controls:
- sample roundtrip launch link list and launch issue section
- sample detail tool preset status text (`Preset: ... | Status: ...`)
Observed required fields/data:
- sample launch currently routes `sampleId`, `sampleTitle`, `samplePresetPath`
- sample detail preset status check validates preset file fetch only
DoD gaps found:
- Current DoD does not explicitly require declared dependency paths beyond `samplePresetPath` at sample-launch surface.
- Current DoD does not require launch indicator to validate secondary required inputs (for example palette path dependencies) before launch.
Suggested DoD additions:
- Add readiness checks for per-tool required path keys in launch query, not just preset path.
- Require launch indicator to separate `preset exists` from `all required dependencies declared`.
Files inspected:
- `samples/index.render.js`
- `samples/shared/sampleDetailPageEnhancement.js`
- `tools/shared/toolLaunchSSoT.js`
No implementation changes made:
- yes

## Tool reviewed: Current sample-launched tools missing explicit DoD sections
Observed required controls:
- `asset-browser`: import plan controls (`importNameInput`, category/destination selectors, status)
- `asset-pipeline-tool`: pipeline input/output + status controls
- `state-inspector`: snapshot refresh/load controls and snapshot output
- `3d-camera-path-editor`: camera path input/status controls
- `3d-asset-viewer`: asset input/status controls
- `3d-json-payload-normalizer`: map payload input/status controls
- `physics-sandbox`: physics body input/status controls
- `performance-profiler`: workload/frame sample setting controls and status
- `tile-model-converter`: candidate/conversion input controls and status
- `parallax-editor`: layer list and layer property controls
Observed required fields/data:
- `asset-browser`: `assetBrowserPreset.importName` and selected category/destination bindings
- `asset-pipeline-tool`: `pipelinePayload.gameId`, non-empty `domainInputs`
- `state-inspector`: snapshot payload (`snapshot`/`inspectJson`/`stateSnapshot` variants)
- `3d-camera-path-editor`: `config.cameraPath.waypoints`
- `3d-asset-viewer`: `config.asset3d.vertices`
- `3d-json-payload-normalizer`: `config.mapPayload.points/segments`
- `physics-sandbox`: `config.physicsBody`
- `performance-profiler`: `config.profileSettings` (`workloadIterations`, `workSize`, `frameSamples`)
- `tile-model-converter`: `config.candidate` + `config.conversion`
- `parallax-editor`: `config.parallaxDocument.layers`
DoD gaps found:
- DoD currently does not contain dedicated sections/readiness checks for these active sample-launched tools.
Suggested DoD additions:
- Add explicit per-tool DoD sections for all sample-launched tools listed above.
- For each section, include minimum required field checks and minimum required control-binding checks aligned to existing runtime test expectations.
Files inspected:
- `tools/Asset Browser/main.js`
- `tools/Asset Pipeline Tool/main.js`
- `tools/State Inspector/main.js`
- `tools/3D Camera Path Editor/main.js`
- `tools/3D Asset Viewer/main.js`
- `tools/3D JSON Payload Normalizer/main.js`
- `tools/Physics Sandbox/main.js`
- `tools/Performance Profiler/main.js`
- `tools/Tile Model Converter/main.js`
- `tools/Parallax Scene Studio/main.js`
- `samples/metadata/samples.index.metadata.json`
- `tests/runtime/SampleStandaloneToolDataFlow.test.mjs`
- `tools/toolRegistry.js`
No implementation changes made:
- yes

## Tool reviewed: Cross-tool diagnostic contract
Observed required controls:
- tools consistently expose load/status controls used to determine readiness after preset load.
Observed required fields/data:
- current DoD proposes `[tool-ui:control-ready]` classification with `success|missing|wrong-shape|empty|defaulted`.
DoD gaps found:
- Current DoD diagnostic shape misses classification states used by existing fetch/load diagnostics (`wrong-path`) and does not specify required evidence for count/value parity checks.
Suggested DoD additions:
- Extend control-ready classification to include `wrong-path` where control-level data source fetch fails.
- Require evidence fields for count parity when applicable (`expectedCount`, `actualCount`) to avoid false success.
Files inspected:
- `docs/pr/BUILD_PR_LEVEL_10_6M_TOOL_UI_READINESS_DOD.md`
- `tools/shared/toolLoadDiagnostics.js`
No implementation changes made:
- yes

## Roadmap marker update
- No execution-backed roadmap line for this 10.6M docs review was identified in inspected roadmap files.
- No roadmap status marker was changed.

## Validation
- Ran `git status` for docs-only validation.
