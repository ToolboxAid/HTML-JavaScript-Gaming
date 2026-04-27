# PR 10.6R Tool UI Control Inventory

## Scope
- Docs-only inventory.
- No runtime implementation files changed.
- Coverage includes all active sample/game-launched tools plus `workspace-manager`, sample launch tiles, and game launch tiles.

## Covered Tool Surfaces
- `sprite-editor`
- `palette-browser`
- `asset-browser`
- `tile-map-editor`
- `vector-asset-studio`
- `vector-map-editor`
- `replay-visualizer`
- `state-inspector`
- `performance-profiler`
- `physics-sandbox`
- `asset-pipeline-tool`
- `tile-model-converter`
- `3d-json-payload-normalizer`
- `3d-asset-viewer`
- `3d-camera-path-editor`
- `parallax-editor`
- `skin-editor`
- `workspace-manager`
- `samples-launch-tiles`
- `games-launch-tiles`

TOOL: sprite-editor

CONTROL: palette-swatch-grid (#paletteButtons)
REQUIRES: canonical palette swatches from required `palettePath` (`*.palette.json`) resolved for `samplePresetPath`.
BINDING: Renders swatches from loaded canonical palette and drives active drawing color selection.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after preset+palette fetch/validation; update on explicit palette/color actions; reset only on explicit load/new/reset.
FAIL_IF:
  - Required palette data is missing, wrong-path, wrong-shape, or empty at bind time.
  - Swatch UI is populated from fallback/demo/hardcoded colors.
  - Control resets after successful load without explicit user action.
  - Tool reports success before swatch grid proves loaded-data consumption.

TOOL: sprite-editor

CONTROL: color-1-selector (dedicated id not observed)
REQUIRES: first valid loaded palette swatch.
BINDING: Expected primary-color selector for DoD acceptance; current runtime flow uses active-color pipeline without dedicated control id.
DEFAULT_ALLOWED: false
LIFECYCLE: Same as sprite editor load lifecycle.
FAIL_IF:
  - Dedicated Color 1 selector is absent.
  - Color 1 is derived from fallback/default instead of loaded canonical palette.

TOOL: sprite-editor

CONTROL: color-2-selector (dedicated id not observed)
REQUIRES: second valid loaded palette swatch.
BINDING: Expected secondary-color selector for DoD acceptance; current runtime flow uses active-color pipeline without dedicated control id.
DEFAULT_ALLOWED: false
LIFECYCLE: Same as sprite editor load lifecycle.
FAIL_IF:
  - Dedicated Color 2 selector is absent.
  - Color 2 is derived from fallback/default instead of loaded canonical palette.

TOOL: sprite-editor

CONTROL: active-drawing-color (#activeColorSwatch/#colorPicker)
REQUIRES: loaded palette selection.
BINDING: Active drawing color readout/control reflects currently selected loaded palette swatch.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after palette bind; update on explicit color/swatch actions.
FAIL_IF:
  - Active color does not map to loaded palette content.
  - Active color silently resets or defaults after load.

TOOL: sprite-editor

CONTROL: sprite-canvas (#editorCanvas)
REQUIRES: loaded sprite project frames + active drawing color.
BINDING: Draw/edit canvas consumes loaded project/frame data and active color state.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after project load; update on explicit edit/frame actions.
FAIL_IF:
  - Canvas renders before required palette/project data is bound.
  - Canvas draws using fallback project data.

TOOL: sprite-editor

CONTROL: frame-controls (#frameCounter/#frameStateText/#playPreviewButton/#fpsInput)
REQUIRES: loaded `spriteProject.frames[]`.
BINDING: Frame list/counter/preview controls bind loaded frame state and preview timing.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after project load; update on explicit frame/preview actions.
FAIL_IF:
  - Frames are empty while tool reports loaded success.
  - Preview controls operate on default/generated frame data.

TOOL: sprite-editor

CONTROL: load-save-export-controls (#saveProjectButton/#exportPngButton/#exportSheetButton)
REQUIRES: loaded sprite project + canonical palette context.
BINDING: Save/export serializes currently loaded/edited sprite project and palette-linked output.
DEFAULT_ALLOWED: false
LIFECYCLE: Enabled after required inputs are loaded and validated.
FAIL_IF:
  - Save/export is enabled without valid loaded project data.
  - Export path uses fallback palette state.

TOOL: sprite-editor

CONTROL: source-status-readout (#sampleSourceText/#sampleSourceDetailText/#statusText/#paletteLockText)
REQUIRES: resolved `sampleId`, `samplePresetPath`, required `palettePath`, load classification.
BINDING: Readouts show source provenance and load/result state for preset and palette dependencies.
DEFAULT_ALLOWED: false
LIFECYCLE: Set during load boundaries; updated on warnings/errors and explicit reload.
FAIL_IF:
  - Source readout omits active loaded source.
  - Success shown before required palette/project controls are bound.

TOOL: palette-browser

CONTROL: palette-title (#paletteTitle)
REQUIRES: loaded canonical palette `name`.
BINDING: Title text binds to loaded palette name.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after preset load; update on explicit palette switch/import.
FAIL_IF:
  - Title is empty while load status reports success.
  - Title is sourced from fallback/demo data.

TOOL: palette-browser

CONTROL: swatch-grid (#paletteSwatches)
REQUIRES: loaded canonical palette `swatches[]`.
BINDING: Swatch grid renders loaded swatches.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit palette edits/import.
FAIL_IF:
  - Grid empty with successful canonical palette load.
  - Grid sourced from duplicate wrapper payload instead of canonical source.

TOOL: palette-browser

CONTROL: selected-swatch-detail (#swatchNameInput/#swatchSymbolInput/#swatchColorInput)
REQUIRES: selected loaded swatch.
BINDING: Detail fields bind selected swatch values from loaded palette data.
DEFAULT_ALLOWED: false
LIFECYCLE: Update on explicit swatch selection/edit actions.
FAIL_IF:
  - Detail fields show stale/default values not present in loaded swatches.
  - Selection state resets without user action.

TOOL: palette-browser

CONTROL: summary-status-controls (#paletteSummaryText/#paletteCountText/#paletteSelectionText/#launchContextText)
REQUIRES: loaded palette metadata, swatch count, source context.
BINDING: Summary/status readouts are derived from loaded payload and launch context.
DEFAULT_ALLOWED: false
LIFECYCLE: Set on load and updated on explicit palette actions.
FAIL_IF:
  - Summary values disagree with loaded palette payload.
  - Status reports success before swatch/detail controls are ready.

TOOL: palette-browser

CONTROL: copy-export-search-controls (#copyPaletteJsonButton/#exportPaletteJsonButton/#paletteSearchInput)
REQUIRES: loaded palette + selected swatch.
BINDING: Copy/export/search operate only on loaded palette state.
DEFAULT_ALLOWED: false
LIFECYCLE: Enabled after successful load; updated on explicit selection/filter changes.
FAIL_IF:
  - Export/copy operates with empty loaded palette.
  - Search results are disconnected from loaded palette data.

TOOL: asset-browser

CONTROL: approved-asset-count (#assetCountText)
REQUIRES: loaded approved asset list/catalog.
BINDING: Count text is computed from loaded approved assets.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after preset/catalog load; update on explicit filter/import actions.
FAIL_IF:
  - Count is zero while approved assets exist in loaded data.
  - Count uses fallback/demo records.

TOOL: asset-browser

CONTROL: asset-list-grid (#assetList)
REQUIRES: loaded asset catalog entries.
BINDING: List renders loaded assets and selection candidates.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit filter/search actions.
FAIL_IF:
  - List empty while status reports successful catalog load.
  - List is populated from fallback sample data.

TOOL: asset-browser

CONTROL: preview-and-detail (#assetPreviewCanvas/#assetPreviewText/#assetPreviewMeta/#assetPreviewTitle)
REQUIRES: selected loaded asset and metadata.
BINDING: Preview and detail panels bind selected loaded asset content and metadata.
DEFAULT_ALLOWED: false
LIFECYCLE: Update on explicit asset selection.
FAIL_IF:
  - Preview shows fallback/demo asset when loaded selection exists.
  - Detail panel does not match selected loaded asset metadata.

TOOL: asset-browser

CONTROL: import-controls (#useAssetInToolButton/#validateImportButton/#importDestinationSelect/#importCategorySelect)
REQUIRES: selected loaded asset + valid import destination/category.
BINDING: Import actions are enabled and classified based on selected loaded asset and destination.
DEFAULT_ALLOWED: false
LIFECYCLE: Enabled/disabled on selection and input changes.
FAIL_IF:
  - Import action enabled with no selected loaded asset.
  - Import plan is generated from default/fallback data.

TOOL: asset-browser

CONTROL: status-readout (#importStatusText)
REQUIRES: load classification + import validation result.
BINDING: Status panel reports loaded/failure/validation outcomes and remains visible until user action.
DEFAULT_ALLOWED: false
LIFECYCLE: Set during load and import validation boundaries.
FAIL_IF:
  - Status claims success while required controls are empty.
  - Error state is hidden before explicit user action.

TOOL: tile-map-editor

CONTROL: map-canvas (#mapCanvas)
REQUIRES: loaded tilemap document (`map`, `layers`).
BINDING: Canvas renders loaded map/layer data.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after document load; update on explicit edit/simulate actions.
FAIL_IF:
  - Canvas empty after successful tilemap load.
  - Canvas uses seeded/default map while loaded map exists.

TOOL: tile-map-editor

CONTROL: tile-palette-grid (#tilePalette)
REQUIRES: loaded tileset/atlas + resolved tile ids.
BINDING: Tile palette renders selectable tiles from loaded atlas.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after tileset load; update on explicit tileset/tile actions.
FAIL_IF:
  - Tile palette is empty while tileset status reports success.
  - Tile entries come from fallback/demo values.

TOOL: tile-map-editor

CONTROL: selected-tile-control (selection state + #activeToolSelect)
REQUIRES: loaded tile selection candidates from tileset.
BINDING: Selected tile/tool state maps to loaded tile candidates and edit tool mode.
DEFAULT_ALLOWED: false
LIFECYCLE: Update on explicit tile/tool selection actions.
FAIL_IF:
  - Selected tile defaults to synthetic value not present in loaded tileset.
  - Selection resets without user action.

TOOL: tile-map-editor

CONTROL: layer-list (#layerList)
REQUIRES: loaded `layers[]`.
BINDING: Layer panel binds loaded layers and visibility/edit state.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit layer actions.
FAIL_IF:
  - Layer list empty while loaded map includes layers.
  - Layer entries originate from fallback defaults.

TOOL: tile-map-editor

CONTROL: map-tileset-status (#statusText/#canvasMeta/#tilesetMeta)
REQUIRES: loaded map dimensions + tileset resolution metadata.
BINDING: Status/readouts report loaded dimensions and tile/tileset resolution state.
DEFAULT_ALLOWED: false
LIFECYCLE: Set on load and updated on explicit dimension/tileset actions.
FAIL_IF:
  - Status claims loaded success with unresolved tileset/tile ids.
  - Readouts mismatch loaded map/tileset data.

TOOL: tile-map-editor

CONTROL: atlas-controls (#tilesetTileWidthInput/#tilesetTileHeightInput/#tilesetSpacingInput/#tilesetMarginInput)
REQUIRES: loaded atlas geometry fields.
BINDING: Atlas controls initialize from loaded atlas and drive tile palette layout.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after atlas load; update on explicit atlas input changes.
FAIL_IF:
  - Atlas controls are populated from fallback values when loaded atlas exists.
  - Atlas control changes overwrite loaded state without user action.

TOOL: tile-map-editor

CONTROL: tileset-source-controls (#loadTilesetPngButton/#loadTilePngAssetsButton)
REQUIRES: loaded map/tileset context for source replacement.
BINDING: Source controls import/apply explicit asset sources to the active loaded document.
DEFAULT_ALLOWED: false
LIFECYCLE: Enabled only when loaded document context exists.
FAIL_IF:
  - Source controls run with no loaded document context.
  - Source load silently replaces loaded data with defaults.

TOOL: tile-map-editor

CONTROL: save-export-controls (#saveProjectButton/#exportRuntimeButton/#packageProjectButton)
REQUIRES: loaded tilemap + tileset contract data.
BINDING: Save/export/package actions serialize currently loaded/edited document.
DEFAULT_ALLOWED: false
LIFECYCLE: Enabled after required map/tileset controls are ready.
FAIL_IF:
  - Save/export enabled while required inputs are unresolved.
  - Export output omits loaded required map/tileset fields.

TOOL: vector-asset-studio

CONTROL: asset-preview (#editorSvg/#canvasViewport)
REQUIRES: loaded vector document/SVG source.
BINDING: Preview/canvas renders loaded vector document.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after preset load (+ optional SVG fetch); update on explicit edit actions.
FAIL_IF:
  - Preview empty after successful loaded state.
  - Preview uses hardcoded/demo asset.

TOOL: vector-asset-studio

CONTROL: shape-path-list (#elementList)
REQUIRES: loaded parsed vector elements.
BINDING: List is populated from loaded vector element/path data.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after parse; update on explicit selection/edit actions.
FAIL_IF:
  - Element list empty while loaded SVG contains elements.
  - List represents stale/fallback data.

TOOL: vector-asset-studio

CONTROL: palette-control (#paletteSelect/#mainPaletteGrid/#paletteStateReadout)
REQUIRES: loaded canonical palette entries when palette controls are visible.
BINDING: Palette select/grid/readout bind loaded palette options and selection state.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after palette load; update on explicit palette target/selection actions.
FAIL_IF:
  - Palette control defaulted while required palette is available.
  - Palette binding is sourced from fallback/demo palette.

TOOL: vector-asset-studio

CONTROL: palette-target-controls (#setPaletteTargetPaintButton/#setPaletteTargetStrokeButton/#setPaletteTargetGradientStartButton/#setPaletteTargetGradientEndButton)
REQUIRES: loaded palette + selected palette target role.
BINDING: Target controls route selected loaded palette colors into paint/stroke/gradient bindings.
DEFAULT_ALLOWED: false
LIFECYCLE: Update on explicit target/color selection actions.
FAIL_IF:
  - Target controls apply with missing required palette.
  - Targeted binding remains empty/defaulted after load.

TOOL: vector-asset-studio

CONTROL: paint-stroke-controls (#activePaintSwatch/#activeStrokeSwatch/#applyFillButton/#strokeWidthInput)
REQUIRES: loaded palette-derived paint/stroke values and selected element.
BINDING: Paint/stroke controls bind to selected element style values derived from loaded data.
DEFAULT_ALLOWED: false
LIFECYCLE: Update on explicit palette/style/selection actions.
FAIL_IF:
  - Paint or stroke is empty/defaulted when required loaded bindings exist.
  - Controls apply style before required loaded data is ready.

TOOL: vector-asset-studio

CONTROL: transform-and-save-controls (#zoomInButton/#zoomOutButton/#zoomPercentInput/#saveSvgButton)
REQUIRES: loaded document viewport state + loaded document content.
BINDING: Transform and save controls operate on loaded document state.
DEFAULT_ALLOWED: false
LIFECYCLE: Enable after document load; update on explicit user actions.
FAIL_IF:
  - Save runs while required document fields are missing.
  - View state resets without explicit user action.

TOOL: vector-map-editor

CONTROL: map-canvas (#editorCanvas)
REQUIRES: loaded vector map document objects/layers/entities.
BINDING: Canvas renders loaded document geometry and object state.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after preset load; update on explicit object/edit actions.
FAIL_IF:
  - Canvas empty after successful load.
  - Canvas output reflects default document instead of loaded document.

TOOL: vector-map-editor

CONTROL: object-layer-entity-list (#objectList)
REQUIRES: loaded vector map objects/entities.
BINDING: List binds loaded object/entity collection and selection.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit object/layer actions.
FAIL_IF:
  - List empty while loaded data contains entities.
  - List state resets/stales without explicit user action.

TOOL: vector-map-editor

CONTROL: selected-entity-panel (#selectedObjectNameInput/#selectedObjectKindInput/#selectedObjectSpaceInput)
REQUIRES: selected loaded entity.
BINDING: Selection panel fields bind selected loaded entity metadata.
DEFAULT_ALLOWED: false
LIFECYCLE: Update on explicit selection changes.
FAIL_IF:
  - Panel values do not match selected loaded entity.
  - Panel shows defaults after successful selection.

TOOL: vector-map-editor

CONTROL: transform-style-flag-controls (#centerXInput/#centerYInput/#rotation*/#objectFillInput/#objectStrokeInput/#flag*)
REQUIRES: selected loaded entity transform/style/flag fields.
BINDING: Controls read/write selected loaded entity transform/style/flags.
DEFAULT_ALLOWED: false
LIFECYCLE: Update on explicit user edits.
FAIL_IF:
  - Inputs are enabled with no valid selected loaded entity.
  - Inputs are hydrated from default/fallback values.

TOOL: vector-map-editor

CONTROL: color-controls (#selectedPointColorInput/#applyPointColorButton)
REQUIRES: selected loaded entity + color/palette context when visible.
BINDING: Color controls apply selected color to loaded entity points/style.
DEFAULT_ALLOWED: false
LIFECYCLE: Update on explicit color/apply actions.
FAIL_IF:
  - Color control remains defaulted despite required loaded color source.
  - Apply action succeeds with missing required color input.

TOOL: vector-map-editor

CONTROL: zoom-save-export-status (#zoomInButton/#zoomOutButton/#zoomResetButton/#saveDocumentButton/#exportRuntimeButton)
REQUIRES: loaded document and viewport context.
BINDING: Zoom/save/export/status behavior is bound to loaded document state.
DEFAULT_ALLOWED: false
LIFECYCLE: Enable after required load; update on explicit actions.
FAIL_IF:
  - Save/export reports success while required document fields are missing.
  - Zoom/status resets without explicit user action.

TOOL: replay-visualizer

CONTROL: replay-json-input (#replayJsonInput)
REQUIRES: loaded replay events payload.
BINDING: JSON input reflects loaded replay event data.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit reload/edit actions.
FAIL_IF:
  - Input empty while replay status reports loaded success.
  - Input populated with synthetic/demo events.

TOOL: replay-visualizer

CONTROL: event-list (#replayEventList)
REQUIRES: loaded `events[]`.
BINDING: Event list renders loaded events and current index marker.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update during explicit playback/scrub actions.
FAIL_IF:
  - Event list empty while loaded events expected.
  - List content diverges from loaded events array.

TOOL: replay-visualizer

CONTROL: timeline-controls (#replayTimeSlider/#replayTimeReadout)
REQUIRES: loaded replay duration/event times.
BINDING: Slider range/readout binds replay timeline derived from loaded events.
DEFAULT_ALLOWED: false
LIFECYCLE: Update during playback/scrub/reset actions.
FAIL_IF:
  - Slider range does not match loaded event timeline.
  - Time readout remains stale after timeline changes.

TOOL: replay-visualizer

CONTROL: playback-controls (#playReplayButton/#pauseReplayButton/#resetReplayButton)
REQUIRES: loaded replay state/events.
BINDING: Playback controls run/pause/reset loaded replay state.
DEFAULT_ALLOWED: false
LIFECYCLE: Enabled after load; state transitions on explicit user actions.
FAIL_IF:
  - Playback runs with missing events.
  - Reset/play toggles produce hidden state overwrite.

TOOL: replay-visualizer

CONTROL: status-result-panel (#replayStatusText/#replayEventOutput)
REQUIRES: load classification + current loaded event output.
BINDING: Status/output panel reports loaded/failure and current event details.
DEFAULT_ALLOWED: false
LIFECYCLE: Set during load and playback boundaries.
FAIL_IF:
  - Status reports success with zero loaded events.
  - Output panel remains empty while loaded event exists.

TOOL: state-inspector

CONTROL: state-input-output-status (#stateJsonInput/#stateSnapshotOutput/#stateInspectorStatus)
REQUIRES: loaded inspector snapshot payload via `samplePresetPath`.
BINDING: Input/output/status surfaces bind loaded snapshot source and parsed payload.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit load/refresh actions.
FAIL_IF:
  - Snapshot output empty while status reports loaded success.
  - Status hides required load failure details.

TOOL: performance-profiler

CONTROL: settings-inputs (#workloadIterationsInput/#workSizeInput/#frameSamplesInput)
REQUIRES: loaded `profileSettings`.
BINDING: Inputs should initialize from loaded profile settings.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit input edits.
FAIL_IF:
  - Inputs remain defaulted after successful settings load.
  - Inputs silently revert due to lifecycle reset.

TOOL: performance-profiler

CONTROL: run-stop-output-status (#runWorkloadButton/#runFrameSampleButton/#stopProfilerButton/#profileOutput/#profilerStatusText)
REQUIRES: validated loaded settings + run results.
BINDING: Run/stop actions and output/status panels are bound to loaded settings context.
DEFAULT_ALLOWED: false
LIFECYCLE: Enable after loaded settings are ready; update on explicit run/stop actions.
FAIL_IF:
  - Run executes with unresolved required settings.
  - Status reports success without loaded settings bind.

TOOL: physics-sandbox

CONTROL: body-input-run-output-status (#physicsBodyInput/#runPhysicsStepButton/#physicsSandboxOutput/#physicsSandboxStatus)
REQUIRES: loaded `physicsBody` payload.
BINDING: Input/run/output/status controls bind loaded physics body and step result.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit run/load actions.
FAIL_IF:
  - Body input empty while loaded success reported.
  - Step output sourced from defaults instead of loaded body.

TOOL: asset-pipeline-tool

CONTROL: pipeline-input-run-output-status (#assetPipelineInput/#runAssetPipelineButton/#assetPipelineOutput/#assetPipelineStatus)
REQUIRES: loaded pipeline payload (`gameId`, `domainInputs`) from preset/workspace context.
BINDING: Input/run/output/status controls bind and execute loaded pipeline payload.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit run/load actions.
FAIL_IF:
  - Run starts with missing required payload fields.
  - Status shows loaded success with empty required domain inputs.

TOOL: tile-model-converter

CONTROL: converter-input-run-output-status (#converterInput/#runConverterButton/#converterOutput/#converterStatus)
REQUIRES: loaded converter payload (`candidate`, `conversion`) from preset.
BINDING: Input/run/output/status controls bind loaded conversion payload and result.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit run/load actions.
FAIL_IF:
  - Candidate/conversion payload missing while status reports loaded success.
  - Output derived from fallback/default payload.

TOOL: 3d-json-payload-normalizer

CONTROL: input-normalize-output-status (#map3dInput/#normalize3dMapButton/#map3dOutput/#map3dStatus)
REQUIRES: loaded `mapPayload.points[]` and `mapPayload.segments[]`.
BINDING: Input/normalize/output/status controls bind loaded 3D map payload and normalized result.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit normalize/load actions.
FAIL_IF:
  - Required points/segments are missing or empty with reported success.
  - Normalize output is produced from fallback values.

TOOL: 3d-asset-viewer

CONTROL: input-inspect-output-status (#asset3dInput/#inspect3dAssetButton/#asset3dOutput/#asset3dStatus)
REQUIRES: loaded `asset3d.vertices` payload.
BINDING: Input/inspect/output/status controls bind loaded 3D asset payload and inspection results.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit inspect/load actions.
FAIL_IF:
  - Vertices missing while status reports loaded success.
  - Inspection output comes from default/demo data.

TOOL: 3d-camera-path-editor

CONTROL: input-add-normalize-output-status (#cameraPathInput/#addCameraPointButton/#normalizeCameraPathButton/#cameraPathOutput/#cameraPathStatus)
REQUIRES: loaded `cameraPath.waypoints[]` payload.
BINDING: Input/edit/output/status controls bind loaded camera path payload and normalized path output.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit add/normalize/load actions.
FAIL_IF:
  - Waypoints missing/empty while status reports loaded success.
  - Output path generated from fallback/default state.

TOOL: parallax-editor

CONTROL: layer-list-and-controls (#layerList/#layerNameInput/#layerDrawOrderInput/#layerVisibleSelect)
REQUIRES: loaded parallax `layers[]`.
BINDING: Layer list and controls bind loaded layer entries and selected-layer fields.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit layer actions.
FAIL_IF:
  - Layer list empty while loaded success reported.
  - Controls populated from seeded defaults instead of loaded layers.

TOOL: parallax-editor

CONTROL: camera-controls (#cameraXInput/#cameraYInput/#cameraReadout)
REQUIRES: loaded map/camera metadata.
BINDING: Camera controls/readout bind loaded scene camera state.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after load; update on explicit camera/simulation actions.
FAIL_IF:
  - Camera readout mismatches loaded map metadata.
  - Camera state is overwritten without user action.

TOOL: parallax-editor

CONTROL: viewport-canvas (#previewCanvas/#previewMeta/#previewDetailsText)
REQUIRES: loaded parallax scene layers + camera.
BINDING: Preview surfaces render loaded scene.
DEFAULT_ALLOWED: false
LIFECYCLE: Update on explicit layer/camera/simulation actions.
FAIL_IF:
  - Preview canvas empty with successful load.
  - Preview is driven by fallback scene data.

TOOL: parallax-editor

CONTROL: save-export-package-status (#saveProjectButton/#exportParallaxPatchButton/#packageProjectButton/#statusText)
REQUIRES: loaded parallax document.
BINDING: Save/export/package/status controls bind loaded scene and output lifecycle.
DEFAULT_ALLOWED: false
LIFECYCLE: Enable after required load and control readiness.
FAIL_IF:
  - Save/export enabled with unresolved required inputs.
  - Status claims success before required controls are populated.

TOOL: skin-editor

CONTROL: object-workbench (#skinEditorObjectList/#skinEditorObjectControls)
REQUIRES: loaded skin object payload + game context.
BINDING: Workbench binds loaded object list and selected object controls.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after context/payload load; update on explicit object actions.
FAIL_IF:
  - Workbench empty while status reports loaded success.
  - Object controls are populated from fallback/demo values.

TOOL: skin-editor

CONTROL: palette-and-preview (#skinEditorPaletteList/#skinEditorPreviewCanvas)
REQUIRES: loaded/shared palette context + loaded skin object state.
BINDING: Palette list and preview canvas consume context palette and loaded object state.
DEFAULT_ALLOWED: false
LIFECYCLE: Update on explicit palette/object actions.
FAIL_IF:
  - Palette context missing while tool reports ready.
  - Preview renders default object data instead of loaded state.

TOOL: skin-editor

CONTROL: status-context-fields (#skinEditorStatus/#skinEditorSummary/#skinEditorContextGame/#skinEditorContextSource)
REQUIRES: load/context classification and active game/sample source fields.
BINDING: Context/status fields report required source and readiness outcomes.
DEFAULT_ALLOWED: false
LIFECYCLE: Set during initialization; update on explicit load/context changes.
FAIL_IF:
  - Context fields do not match loaded launch context.
  - Status reports success with missing required palette/context.

TOOL: workspace-manager

CONTROL: tool-pager-and-current-label ([data-tool-host-prev]/[data-tool-host-next]/[data-tool-host-current-label])
REQUIRES: active tools list + selected tool context.
BINDING: Pager controls navigate valid tool ids and update current mounted label.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize at page load and query parse; update on explicit pager/popstate actions.
FAIL_IF:
  - Pager navigates to unavailable tool id.
  - Current label does not reflect active mounted surface.

TOOL: workspace-manager

CONTROL: mount-container-and-diagnostic ([data-tool-host-mount-container]/[data-tool-host-mount-diagnostic])
REQUIRES: valid selected tool/game context + mount result details.
BINDING: Mount container hosts selected surface; diagnostic panel renders mount validation failures.
DEFAULT_ALLOWED: false
LIFECYCLE: Update on explicit mount/unmount/navigation actions.
FAIL_IF:
  - Mount fails and diagnostic panel omits actionable failure details.
  - Diagnostic/success states are overwritten without user action.

TOOL: workspace-manager

CONTROL: forwarded-launch-query-summary (launchParams flow from URL/query)
REQUIRES: forwarded `sampleId`, `samplePresetPath`, `gameId`, `gameHref`, `returnTo`, `workspaceHref` as applicable.
BINDING: Launch params are sanitized and forwarded to mounted tool runtime launch state.
DEFAULT_ALLOWED: false
LIFECYCLE: Read at init/mount; update on popstate/reload.
FAIL_IF:
  - Required forwarded input key is dropped silently.
  - Launch proceeds with missing required downstream input summary.

TOOL: samples-launch-tiles

CONTROL: tile-metadata-and-launch-links (#samples-phase-list + roundtrip links)
REQUIRES: loaded sample metadata + `resolveSampleToolLaunchHref` results.
BINDING: Tile titles/descriptions/links bind metadata and resolved launch href.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after metadata fetch; update on explicit filter/search actions.
FAIL_IF:
  - Launch href missing/invalid while tile appears launchable.
  - Tile links omit required sample launch source fields.

TOOL: samples-launch-tiles

CONTROL: launch-validation-readout (#samples-phase-filter-status + per-card launch issue section)
REQUIRES: resolved launch issues count/details.
BINDING: Status and per-card validation sections report launch routing readiness/errors.
DEFAULT_ALLOWED: false
LIFECYCLE: Update after metadata and filter changes.
FAIL_IF:
  - Validation issue exists but is not surfaced.
  - Status indicates healthy launch path when launch resolver failed.

TOOL: games-launch-tiles

CONTROL: game-tile-metadata-and-workspace-link (#games-index-list + workspace link)
REQUIRES: loaded game metadata + `resolveGameWorkspaceLaunchHref` result.
BINDING: Tile metadata and workspace-launch action bind loaded game fields and resolved workspace href.
DEFAULT_ALLOWED: false
LIFECYCLE: Initialize after metadata fetch; update on explicit filter/search actions.
FAIL_IF:
  - Workspace launch link missing/invalid while game tile appears launchable.
  - Launch action omits required `gameId`/mount context.

TOOL: games-launch-tiles

CONTROL: launch-validation-readout (#games-filter-status + workspace launch error text)
REQUIRES: workspace launch error classification/count.
BINDING: Status and per-card launch-error readouts surface workspace launch readiness/errors.
DEFAULT_ALLOWED: false
LIFECYCLE: Update after metadata and filter changes.
FAIL_IF:
  - Launch error exists but is hidden from UI.
  - Status reports healthy launch when resolver returns error.

## Explicit Coverage Notes
- Standalone manifest/data-flow inspector surface was not discovered in active launch registry/metadata and is tracked as a gap in the companion gap report.
- Palette SSoT expectation is one canonical `*.palette.json` source per sample; duplicate required palette payloads in `*.palette-browser.json` are treated as gaps.
