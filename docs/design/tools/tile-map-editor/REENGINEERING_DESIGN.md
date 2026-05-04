# Tilemap Studio Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-07
Source folder: `tools/Tilemap Studio`
Publish target: `tools.tile-map-editor`

## Tool Purpose
Tile map document authoring. Tilemap Studio owns `tileMapDocument`, optional `tilemapDocumentPath`, optional `parallaxDocument`, map/layer editing, validation, export, and publish to `tools.tile-map-editor`.

## Exact Folder/Files Inspected
- `tools/Tilemap Studio/how_to_use.html`
- `tools/Tilemap Studio/index.html`
- `tools/Tilemap Studio/main.js`
- `tools/Tilemap Studio/README.md`
- `tools/Tilemap Studio/tileMapEditor.css`

## Exact Current Controls Found
- `tools/Tilemap Studio/index.html`: `button[button]#loadAssetRegistryButton` - Load Assets Registry
- `tools/Tilemap Studio/index.html`: `input[file]#loadAssetRegistryInput` - loadAssetRegistryInput
- `tools/Tilemap Studio/index.html`: `button[button]#saveAssetRegistryButton` - Save Assets Registry
- `tools/Tilemap Studio/index.html`: `button[button]#simulateButton` - Simulate
- `tools/Tilemap Studio/index.html`: `button[button]#playSimulationButton` - Play
- `tools/Tilemap Studio/index.html`: `button[button]#pauseSimulationButton` - Pause
- `tools/Tilemap Studio/index.html`: `button[button]#restartSimulationButton` - Restart Position
- `tools/Tilemap Studio/index.html`: `button[button]#exitSimulationButton` - Exit Simulation
- `tools/Tilemap Studio/index.html`: `button[button]#exportRuntimeButton` - Export Runtime
- `tools/Tilemap Studio/index.html`: `button[button]#packageProjectButton` - Package Project
- `tools/Tilemap Studio/index.html`: `input[text]#mapNameInput` - mapNameInput
- `tools/Tilemap Studio/index.html`: `input[number]#mapWidthInput` - mapWidthInput
- `tools/Tilemap Studio/index.html`: `input[number]#mapHeightInput` - mapHeightInput
- `tools/Tilemap Studio/index.html`: `input[number]#tileSizeInput` - tileSizeInput
- `tools/Tilemap Studio/index.html`: `button[button]#applyMapSizeButton` - Apply Size
- `tools/Tilemap Studio/index.html`: `select#activeToolSelect` - Paint Erase Picker Marker
- `tools/Tilemap Studio/index.html`: `button[button]#loadTilesetPngButton` - Load Tileset PNG
- `tools/Tilemap Studio/index.html`: `input[file]#loadTilesetPngInput` - loadTilesetPngInput
- `tools/Tilemap Studio/index.html`: `button[button]#loadTilePngAssetsButton` - Load Tile PNG(s)
- `tools/Tilemap Studio/index.html`: `input[file]#loadTilePngAssetsInput` - loadTilePngAssetsInput
- `tools/Tilemap Studio/index.html`: `button[button]#generateTilesetButton` - Generate Tile Grid
- `tools/Tilemap Studio/index.html`: `input[number]#tilesetTileWidthInput` - tilesetTileWidthInput
- `tools/Tilemap Studio/index.html`: `input[number]#tilesetTileHeightInput` - tilesetTileHeightInput
- `tools/Tilemap Studio/index.html`: `input[number]#tilesetSpacingInput` - tilesetSpacingInput
- `tools/Tilemap Studio/index.html`: `input[number]#tilesetMarginInput` - tilesetMarginInput
- `tools/Tilemap Studio/index.html`: `select#markerTypeSelect` - Spawn Object
- `tools/Tilemap Studio/index.html`: `input[text]#markerNameInput` - markerNameInput
- `tools/Tilemap Studio/index.html`: `button[button]#clearMarkersButton` - Clear Markers
- `tools/Tilemap Studio/index.html`: `input[range]#canvasZoomInput` - canvasZoomInput
- `tools/Tilemap Studio/index.html`: `button[button]` - + Tileset
- `tools/Tilemap Studio/index.html`: `button[button]` - + Markers
- `tools/Tilemap Studio/index.html`: `button[button]` - + Layers
- `tools/Tilemap Studio/index.html`: `button[button]` - + Usage
- `tools/Tilemap Studio/index.html`: `button[button]` - + Remediation
- `tools/Tilemap Studio/index.html`: `input[text]#newLayerNameInput` - newLayerNameInput
- `tools/Tilemap Studio/index.html`: `select#newLayerKindSelect` - Tile Collision Data
- `tools/Tilemap Studio/index.html`: `button[button]#addLayerButton` - Add Layer
- `tools/Tilemap Studio/index.html`: `button[button]#removeLayerButton` - Remove Layer
- `tools/Tilemap Studio/index.html`: `button[button]#layerVisibilityToggle` - Toggle Visibility
- `tools/Tilemap Studio/index.html`: `button[button]#inspectRemediationButton` - Inspect Issues
- `tools/Tilemap Studio/index.html`: `button[button]#jumpToProblemButton` - Jump to Problem
- `tools/Tilemap Studio/index.html`: `button[button]#applyRemediationButton` - Apply Suggested Fix
- `tools/Tilemap Studio/index.html`: `button[button]#refreshExperienceButton` - Refresh Pipeline View
- `tools/Tilemap Studio/index.html`: `button[button]#refreshDebugVisualizationButton` - Refresh Debug View
- `tools/Tilemap Studio/main.js`: `newProjectButton` via newProjectButton
- `tools/Tilemap Studio/main.js`: `loadProjectButton` via loadProjectButton
- `tools/Tilemap Studio/main.js`: `loadProjectInput` via loadProjectInput
- `tools/Tilemap Studio/main.js`: `saveProjectButton` via saveProjectButton
- `tools/Tilemap Studio/main.js`: `loadAssetRegistryButton` via loadAssetRegistryButton
- `tools/Tilemap Studio/main.js`: `loadAssetRegistryInput` via loadAssetRegistryInput
- `tools/Tilemap Studio/main.js`: `saveAssetRegistryButton` via saveAssetRegistryButton
- `tools/Tilemap Studio/main.js`: `simulateButton` via simulateButton
- `tools/Tilemap Studio/main.js`: `playSimulationButton` via playSimulationButton
- `tools/Tilemap Studio/main.js`: `pauseSimulationButton` via pauseSimulationButton
- `tools/Tilemap Studio/main.js`: `restartSimulationButton` via restartSimulationButton
- `tools/Tilemap Studio/main.js`: `exitSimulationButton` via exitSimulationButton
- `tools/Tilemap Studio/main.js`: `exportRuntimeButton` via exportRuntimeButton
- `tools/Tilemap Studio/main.js`: `packageProjectButton` via packageProjectButton
- `tools/Tilemap Studio/main.js`: `remediationSummaryText` via remediationSummaryText
- `tools/Tilemap Studio/main.js`: `experienceSummaryText` via experienceSummaryText
- `tools/Tilemap Studio/main.js`: `experienceDetailsText` via experienceDetailsText
- `tools/Tilemap Studio/main.js`: `refreshExperienceButton` via refreshExperienceButton
- `tools/Tilemap Studio/main.js`: `debugSummaryText` via debugSummaryText
- `tools/Tilemap Studio/main.js`: `debugDetailsText` via debugDetailsText
- `tools/Tilemap Studio/main.js`: `refreshDebugVisualizationButton` via refreshDebugVisualizationButton
- `tools/Tilemap Studio/main.js`: `inspectRemediationButton` via inspectRemediationButton
- `tools/Tilemap Studio/main.js`: `jumpToProblemButton` via jumpToProblemButton
- `tools/Tilemap Studio/main.js`: `applyRemediationButton` via applyRemediationButton
- `tools/Tilemap Studio/main.js`: `mapNameInput` via mapNameInput
- `tools/Tilemap Studio/main.js`: `mapWidthInput` via mapWidthInput
- `tools/Tilemap Studio/main.js`: `mapHeightInput` via mapHeightInput
- `tools/Tilemap Studio/main.js`: `tileSizeInput` via tileSizeInput
- `tools/Tilemap Studio/main.js`: `applyMapSizeButton` via applyMapSizeButton
- `tools/Tilemap Studio/main.js`: `activeToolSelect` via activeToolSelect
- `tools/Tilemap Studio/main.js`: `selectedLayerKindBadge` via selectedLayerKindBadge
- `tools/Tilemap Studio/main.js`: `activeLayerName` via activeLayerName
- `tools/Tilemap Studio/main.js`: `canvasZoomInput` via canvasZoomInput
- `tools/Tilemap Studio/main.js`: `canvasZoomReadout` via canvasZoomReadout
- `tools/Tilemap Studio/main.js`: `canvasMeta` via canvasMeta
- `tools/Tilemap Studio/main.js`: `simulationContext` via simulationContext
- `tools/Tilemap Studio/main.js`: `tilePalette` via tilePalette
- `tools/Tilemap Studio/main.js`: `loadTilesetPngButton` via loadTilesetPngButton
- `tools/Tilemap Studio/main.js`: `loadTilesetPngInput` via loadTilesetPngInput
- `tools/Tilemap Studio/main.js`: `loadTilePngAssetsButton` via loadTilePngAssetsButton
- `tools/Tilemap Studio/main.js`: `loadTilePngAssetsInput` via loadTilePngAssetsInput
- `tools/Tilemap Studio/main.js`: `tilesetTileWidthInput` via tilesetTileWidthInput
- `tools/Tilemap Studio/main.js`: `tilesetTileHeightInput` via tilesetTileHeightInput
- `tools/Tilemap Studio/main.js`: `tilesetSpacingInput` via tilesetSpacingInput
- `tools/Tilemap Studio/main.js`: `tilesetMarginInput` via tilesetMarginInput
- `tools/Tilemap Studio/main.js`: `generateTilesetButton` via generateTilesetButton
- `tools/Tilemap Studio/main.js`: `tilesetMeta` via tilesetMeta
- `tools/Tilemap Studio/main.js`: `layerList` via layerList
- `tools/Tilemap Studio/main.js`: `newLayerNameInput` via newLayerNameInput
- `tools/Tilemap Studio/main.js`: `newLayerKindSelect` via newLayerKindSelect
- `tools/Tilemap Studio/main.js`: `addLayerButton` via addLayerButton
- `tools/Tilemap Studio/main.js`: `removeLayerButton` via removeLayerButton
- `tools/Tilemap Studio/main.js`: `layerVisibilityToggle` via layerVisibilityToggle
- `tools/Tilemap Studio/main.js`: `markerTypeSelect` via markerTypeSelect
- `tools/Tilemap Studio/main.js`: `markerNameInput` via markerNameInput
- `tools/Tilemap Studio/main.js`: `clearMarkersButton` via clearMarkersButton
- `tools/Tilemap Studio/main.js`: `markerList` via markerList
- `tools/Tilemap Studio/main.js`: `statusText` via statusText
- `tools/Tilemap Studio/main.js`: `mapCanvas` via mapCanvas
- `tools/Tilemap Studio/main.js`: `leftSidebar` via leftSidebar
- `tools/Tilemap Studio/main.js`: `rightSidebar` via rightSidebar

## Current Panels And Surfaces Found
- `tools/Tilemap Studio/index.html`: `.app-shell`
- `tools/Tilemap Studio/index.html`: `.toolbar`
- `tools/Tilemap Studio/index.html`: `.toolbar-group`
- `tools/Tilemap Studio/index.html`: `.tools-platform-control-cluster--preview`
- `tools/Tilemap Studio/index.html`: `.tools-platform-layout-grid`
- `tools/Tilemap Studio/index.html`: `.sidebar`
- `tools/Tilemap Studio/index.html`: `.left-sidebar`
- `tools/Tilemap Studio/index.html`: `.tools-platform-resize-panel`
- `tools/Tilemap Studio/index.html`: `.panel-accordion`
- `tools/Tilemap Studio/index.html`: `.panel-accordion__summary`
- `tools/Tilemap Studio/index.html`: `.panel-accordion__body`
- `tools/Tilemap Studio/index.html`: `.tileset-config-grid`
- `tools/Tilemap Studio/index.html`: `.marker-list`
- `tools/Tilemap Studio/index.html`: `.canvas-panel`
- `tools/Tilemap Studio/index.html`: `.canvas-toolbar`
- `tools/Tilemap Studio/index.html`: `.canvas-zoom-control`
- `tools/Tilemap Studio/index.html`: `.canvas-wrap`
- `tools/Tilemap Studio/index.html`: `.status-text`
- `tools/Tilemap Studio/index.html`: `.right-sidebar`
- `tools/Tilemap Studio/index.html`: `.layer-list`
- `tools/Tilemap Studio/index.html`: `.usage-list`

## Exact Current Functions And Classes
- `tools/Tilemap Studio/main.js`: class TileMapEditorApp; function applyProjectSystemState; function bootTileMapStudio; function buildPresetLoadedStatus; function buildTilesetFromAtlas; function clampInteger; function cloneDeep; function computeAtlasGridMetrics; function createDefaultTilesetAtlas; function createGrid; function createInitialDocument; function createLayer; function createPersistableTileMapDocument; function createRuntimeExport; function downloadTextFile; function ensureGridSize; function extractTileMapDocumentFromSamplePreset; function generateLayerId; function getOrderedImageSources; function getPrimaryImageSource; function isStrictWorkspaceTilemapSnapshot; function loadImageElement; function normalizeCellValue; function normalizeSamplePresetPath; function sanitizeAssetRefs; function sanitizeDocument; function sanitizeLayer; function sanitizeMarkers; function sanitizeTileset; function sanitizeTilesetAtlas; function sanitizeTileSource; function summarizeGraphFindings; function tick; function toProjectAssetUrl; method addLayer; method advanceSimulationProbe; method applyCanvasZoom; method applyCellEdit; method applyMapSizing; method applyRemediationAction; method applyTilesetAtlasSettingsFromInputs; method attachEvents; method bindRuntimeStateSync; method buildSimulationCellSummary; method buildSimulationCellSummaryFromDetails; method captureRefs; method clearTransientImageSources; method composeTilesetWithAtlasTiles; method destroy; method drawCheckerboard; method drawCollisionLayer; method drawDataLayer; method drawGrid; method drawMarkers; method drawSimulationOverlay; method drawTileLayer; method emitTilemapControlReadiness; method ensureEditable; method ensureFirstTileSelection; method ensureSimulationProbeVisible; method enterSimulationMode; method exitSimulationMode; method findFirstNonEmptyTileId; method generateTilesetFromLoadedPng; method getApi; method getCellFromMouseEvent; method getNextTileId; method getOrderedImageSourcesForName; method getOverlayPanels; method getOverlaySidebar; method getPreservedTilesForAtlasRegeneration; method getSelectableTiles; method getSelectedLayer; method getSimulationRouteIndexFromCell; method getSimulationStartCell; method getTileSourceDrawInfo; method getTransientImageSource; method handleCanvasPointerDown; method handleCanvasPointerLeave; method handleCanvasPointerMove; method handleExportRuntime; method handleLoadAssetRegistry; method handleLoadProject; method handleLoadTilePngAssets; method handleLoadTilesetPng; method handleNewProject; method handleOverlayAccordionToggle; method handlePackageProject; method handleSaveAssetRegistry; method handleSaveProject; method hasTileSelection; method init; method inspectRemediationActions; method inspectSimulationCell; method jumpToRemediationProblem; method markInteracting; method pauseSimulation; method placeMarkerAtCell; method preloadIndividualTileImages; method publishLivePreviewSync; method queueLivePreviewSync; method readTilesetAtlasSettingsFromInputs; method refreshDebugVisualizationSnapshot; method refreshExperienceSnapshot; method refreshSimulationActionState; method reloadTilesetImageFromDocument; method removeMarkerAtCell; method removeSelectedLayer; method renderAll; method renderCanvas; method renderLayerList; method renderLayerMeta; method renderMarkerList; method renderTileset; method renderTilesetMeta; method resetSimulationTraversalState; method resolveAssetRefsFromRegistry; method restartSimulationPosition; method resumeSimulation; method setCanvasZoomFromPercent; method setSimulationProbeFromRouteIndex; method setTransientImageSource; method setUxLifecycleState; method startSimulationLoop; method syncAssetRegistryFromDocument; method syncFullscreenState; method syncInputsFromDocument; method syncOverlayToggleButtons; method syncTileSelectionControlState; method syncUxContractState; method toggleOverlayPanel; method toggleSelectedLayerVisibility; method touchDocument; method tryLoadPresetFromQuery; method updateCanvasZoomReadout; method updateDebugVisualizationUI; method updateEditorExperienceUI; method updateRemediationUI; method updateSimulationContext; method updateStatus; method validateProjectAssets

## Target Controls
Keep:
- new/load/save project
- asset registry load/save
- map name/width/height/tile size controls
- layer/tool/zoom controls
- simulation controls
- runtime export

Remove or rename:
- packaging actions from the core tile map JSON authoring path unless they consume validated tile map output

Add:
- Validate Tile Map Document
- Publish `tools.tile-map-editor`
- layer and map dimension diagnostics

## JSON Contract Owned By This Tool
Owned JSON is the tile-map-editor payload. Allowed top-level fields are `tileMapDocument`, `tilemapDocumentPath`, and `parallaxDocument`. Tile Map Document owns map metadata, tile dimensions, layers, tile data, and optional parallax association edited in this folder.

## Publish Output
Publish only to `tools.tile-map-editor`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing tile map content when publishing
- invalid map width/height/tile size
- layers with invalid kind/name/data
- unsupported top-level fields

## Manual Test Plan
- Create a map, resize it, edit at least one layer, and export runtime JSON.
- Load an asset registry and save it back out.
- Try invalid dimensions, malformed layer data, and missing tile map document fields; publish must stay blocked.
