# Tilemap Studio Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-07
Source folder: `tools/Tilemap Studio`
Publish target: `tools.tile-map-editor`

## Tool Purpose
Tilemap Studio owns tile map document import, validation, tile/layer editing, export, and publish to `tools.tile-map-editor`.

## Folder/Files Inspected
- `tools/Tilemap Studio/how_to_use.html`
- `tools/Tilemap Studio/index.html`
- `tools/Tilemap Studio/main.js`
- `tools/Tilemap Studio/README.md`
- `tools/Tilemap Studio/tileMapEditor.css`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/Tilemap Studio/index.html`: `input[file]#loadAssetRegistryInput` - loadAssetRegistryInput | Chooses a local file for tile map document import/load. | Replaces or merges tool-owned tile map document only after the import validates. |
| `tools/Tilemap Studio/index.html`: `input[text]#mapNameInput` - untitled-map | Edits the active tile, layer, or map property field. | Updates the draft tile map document field represented by `mapNameInput` before validation. |
| `tools/Tilemap Studio/index.html`: `input[number]#mapWidthInput` - 32 | Edits the active tile, layer, or map property field. | Updates the draft tile map document field represented by `mapWidthInput` before validation. |
| `tools/Tilemap Studio/index.html`: `input[number]#mapHeightInput` - 18 | Edits the active tile, layer, or map property field. | Updates the draft tile map document field represented by `mapHeightInput` before validation. |
| `tools/Tilemap Studio/index.html`: `input[number]#tileSizeInput` - 24 | Edits the active tile, layer, or map property field. | Updates the draft tile map document field represented by `tileSizeInput` before validation. |
| `tools/Tilemap Studio/index.html`: `input[file]#loadTilesetPngInput` - loadTilesetPngInput | Chooses a local file for tile map document import/load. | Replaces or merges tool-owned tile map document only after the import validates. |
| `tools/Tilemap Studio/index.html`: `input[file]#loadTilePngAssetsInput` - loadTilePngAssetsInput | Chooses a local file for tile map document import/load. | Replaces or merges tool-owned tile map document only after the import validates. |
| `tools/Tilemap Studio/index.html`: `input[number]#tilesetTileWidthInput` - 24 | Edits the active tile, layer, or map property field. | Updates the draft tile map document field represented by `tilesetTileWidthInput` before validation. |
| `tools/Tilemap Studio/index.html`: `input[number]#tilesetTileHeightInput` - 24 | Edits the active tile, layer, or map property field. | Updates the draft tile map document field represented by `tilesetTileHeightInput` before validation. |
| `tools/Tilemap Studio/index.html`: `input[number]#tilesetSpacingInput` - 0 | Edits the current tile map document through `tilesetSpacingInput`. | Updates draft tile map document data and requires validation before tools.tile-map-editor publish. |
| `tools/Tilemap Studio/index.html`: `input[number]#tilesetMarginInput` - 0 | Edits the current tile map document through `tilesetMarginInput`. | Updates draft tile map document data and requires validation before tools.tile-map-editor publish. |
| `tools/Tilemap Studio/index.html`: `input[text]#markerNameInput` - spawn-point | Edits the active tile, layer, or map property field. | Updates the draft tile map document field represented by `markerNameInput` before validation. |
| `tools/Tilemap Studio/index.html`: `input[range]#canvasZoomInput` - 100 | Edits the current tile map document through `canvasZoomInput`. | Updates draft tile map document data and requires validation before tools.tile-map-editor publish. |
| `tools/Tilemap Studio/index.html`: `input[text]#newLayerNameInput` - Layer | Edits the active tile, layer, or map property field. | Updates the draft tile map document field represented by `newLayerNameInput` before validation. |
| `tools/Tilemap Studio/index.html`: `button[button]#loadAssetRegistryButton` - Load Assets Registry | Starts tile map document import/load. | Reads incoming JSON into the tool-owned tile map document only after validation succeeds. |
| `tools/Tilemap Studio/index.html`: `button[button]#saveAssetRegistryButton` - Save Assets Registry | Exports the validated tile map document. | Serializes the validated tile map document as the tools.tile-map-editor output shape. |
| `tools/Tilemap Studio/index.html`: `button[button]#simulateButton` - Simulate | Processes the current tile map document. | Updates tool-owned derived data/report fields that must validate before tools.tile-map-editor publish. |
| `tools/Tilemap Studio/index.html`: `button[button]#playSimulationButton` - Play | Controls preview/playback for the current tile map document. | No tools.tile-map-editor JSON change unless a schema-owned playback setting is explicitly edited. |
| `tools/Tilemap Studio/index.html`: `button[button]#pauseSimulationButton` - Pause | Controls preview/playback for the current tile map document. | No tools.tile-map-editor JSON change unless a schema-owned playback setting is explicitly edited. |
| `tools/Tilemap Studio/index.html`: `button[button]#restartSimulationButton` - Restart Position | Triggers the current tile map document UI action for `Restart Position`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]#exitSimulationButton` - Exit Simulation | Triggers the current tile map document UI action for `Exit Simulation`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]#exportRuntimeButton` - Export Runtime | Exports the validated tile map document. | Serializes the validated tile map document as the tools.tile-map-editor output shape. |
| `tools/Tilemap Studio/index.html`: `button[button]#packageProjectButton` - Package Project | Triggers the current tile map document UI action for `Package Project`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]#applyMapSizeButton` - Apply Size | Publishes or applies the validated tile map document. | Writes the validated output shape to tools.tile-map-editor. |
| `tools/Tilemap Studio/index.html`: `select#activeToolSelect` - Paint Erase Picker Marker | Edits the current tile map document through `activeToolSelect`. | Updates draft tile map document data and requires validation before tools.tile-map-editor publish. |
| `tools/Tilemap Studio/index.html`: `button[button]#loadTilesetPngButton` - Load Tileset PNG | Starts tile map document import/load. | Reads incoming JSON into the tool-owned tile map document only after validation succeeds. |
| `tools/Tilemap Studio/index.html`: `button[button]#loadTilePngAssetsButton` - Load Tile PNG(s) | Starts tile map document import/load. | Reads incoming JSON into the tool-owned tile map document only after validation succeeds. |
| `tools/Tilemap Studio/index.html`: `button[button]#generateTilesetButton` - Generate Tile Grid | Processes the current tile map document. | Updates tool-owned derived data/report fields that must validate before tools.tile-map-editor publish. |
| `tools/Tilemap Studio/index.html`: `select#markerTypeSelect` - Spawn Object | Edits the active tile, layer, or map property field. | Updates the draft tile map document field represented by `markerTypeSelect` before validation. |
| `tools/Tilemap Studio/index.html`: `button[button]#clearMarkersButton` - Clear Markers | Removes or clears the selected tile, layer, or map property. | Deletes that data from the draft tile map document; publish waits for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]` - + Tileset | Triggers the current tile map document UI action for `+ Tileset`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]` - + Markers | Triggers the current tile map document UI action for `+ Markers`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]` - + Layers | Triggers the current tile map document UI action for `+ Layers`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]` - + Usage | Triggers the current tile map document UI action for `+ Usage`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]` - + Remediation | Triggers the current tile map document UI action for `+ Remediation`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |
| `tools/Tilemap Studio/index.html`: `select#newLayerKindSelect` - Tile Collision Data | Edits the active tile, layer, or map property field. | Updates the draft tile map document field represented by `newLayerKindSelect` before validation. |
| `tools/Tilemap Studio/index.html`: `button[button]#addLayerButton` - Add Layer | Adds a new tile, layer, or map property. | Appends schema-owned data to the draft tile map document; publish waits for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]#removeLayerButton` - Remove Layer | Removes or clears the selected tile, layer, or map property. | Deletes that data from the draft tile map document; publish waits for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]#layerVisibilityToggle` - Toggle Visibility | Triggers the current tile map document UI action for `Toggle Visibility`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]#inspectRemediationButton` - Inspect Issues | Triggers the current tile map document UI action for `Inspect Issues`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]#jumpToProblemButton` - Jump to Problem | Triggers the current tile map document UI action for `Jump to Problem`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]#applyRemediationButton` - Apply Suggested Fix | Publishes or applies the validated tile map document. | Writes the validated output shape to tools.tile-map-editor. |
| `tools/Tilemap Studio/index.html`: `button[button]#refreshExperienceButton` - Refresh Pipeline View | Triggers the current tile map document UI action for `Refresh Pipeline View`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |
| `tools/Tilemap Studio/index.html`: `button[button]#refreshDebugVisualizationButton` - Refresh Debug View | Triggers the current tile map document UI action for `Refresh Debug View`. | May update draft tile map document data; tools.tile-map-editor publish must wait for validation. |

## Panels And Surfaces Found
- `tools/Tilemap Studio/how_to_use.html`: `.tools-platform-surface`
- `tools/Tilemap Studio/index.html`: `.app-shell`
- `tools/Tilemap Studio/index.html`: `.canvas-panel`
- `tools/Tilemap Studio/index.html`: `.canvas-toolbar`
- `tools/Tilemap Studio/index.html`: `.canvas-wrap`
- `tools/Tilemap Studio/index.html`: `.canvas-zoom-control`
- `tools/Tilemap Studio/index.html`: `.layer-list`
- `tools/Tilemap Studio/index.html`: `.left-sidebar`
- `tools/Tilemap Studio/index.html`: `.marker-list`
- `tools/Tilemap Studio/index.html`: `.panel-accordion`
- `tools/Tilemap Studio/index.html`: `.panel-accordion__body`
- `tools/Tilemap Studio/index.html`: `.panel-accordion__summary`
- `tools/Tilemap Studio/index.html`: `.right-sidebar`
- `tools/Tilemap Studio/index.html`: `.sidebar`
- `tools/Tilemap Studio/index.html`: `.tile-map-editor-page`
- `tools/Tilemap Studio/index.html`: `.tile-map-editor-page-root`
- `tools/Tilemap Studio/index.html`: `.tileset-config-grid`
- `tools/Tilemap Studio/index.html`: `.toolbar`
- `tools/Tilemap Studio/index.html`: `.toolbar-group`
- `tools/Tilemap Studio/index.html`: `.tools-platform-control-cluster--preview`
- `tools/Tilemap Studio/index.html`: `.tools-platform-layout-grid`
- `tools/Tilemap Studio/index.html`: `.tools-platform-resize-panel`
- `tools/Tilemap Studio/index.html`: `.usage-list`

## Current Component/Class/Function Inventory
- `tools/Tilemap Studio/main.js`: TileMapEditorApp; addLayer; advanceSimulationProbe; applyCanvasZoom; applyCellEdit; applyMapSizing; applyProjectSystemState; applyRemediationAction; applyTilesetAtlasSettingsFromInputs; attachEvents; bindRuntimeStateSync; bootTileMapStudio; buildPresetLoadedStatus; buildSimulationCellSummary; buildSimulationCellSummaryFromDetails; buildTilesetFromAtlas; captureRefs; clampInteger; clearTransientImageSources; cloneDeep; composeTilesetWithAtlasTiles; computeAtlasGridMetrics; createDefaultTilesetAtlas; createGrid; createInitialDocument; createLayer; createPersistableTileMapDocument; createRuntimeExport; downloadTextFile; drawCheckerboard; drawCollisionLayer; drawDataLayer; drawGrid; drawMarkers; drawSimulationOverlay; drawTileLayer; emitTilemapControlReadiness; ensureEditable; ensureFirstTileSelection; ensureGridSize; ensureSimulationProbeVisible; enterSimulationMode; exitSimulationMode; extractTileMapDocumentFromSamplePreset; findFirstNonEmptyTileId; generateLayerId; generateTilesetFromLoadedPng; getApi; getCellFromMouseEvent; getNextTileId; getOrderedImageSources; getOrderedImageSourcesForName; getOverlayPanels; getOverlaySidebar; getPreservedTilesForAtlasRegeneration; getPrimaryImageSource; getSelectableTiles; getSelectedLayer; getSimulationRouteIndexFromCell; getSimulationStartCell; getTileSourceDrawInfo; getTransientImageSource; handleCanvasPointerDown; handleCanvasPointerLeave; handleCanvasPointerMove; handleExportRuntime; handleLoadAssetRegistry; handleLoadProject; handleLoadTilePngAssets; handleLoadTilesetPng; handleNewProject; handleOverlayAccordionToggle; handlePackageProject; handleSaveAssetRegistry; handleSaveProject; hasTileSelection; init; inspectRemediationActions; inspectSimulationCell; isStrictWorkspaceTilemapSnapshot; jumpToRemediationProblem; loadImageElement; markInteracting; normalizeCellValue; normalizeSamplePresetPath; pauseSimulation; placeMarkerAtCell; preloadIndividualTileImages; publishLivePreviewSync; queueLivePreviewSync; readTilesetAtlasSettingsFromInputs; refreshDebugVisualizationSnapshot; refreshExperienceSnapshot; refreshSimulationActionState; registerToolBootContract; reloadTilesetImageFromDocument; removeMarkerAtCell; removeSelectedLayer; renderAll; renderCanvas; renderLayerList; renderLayerMeta; renderMarkerList; renderTileset; renderTilesetMeta; resetSimulationTraversalState; resolveAssetRefsFromRegistry; restartSimulationPosition; resumeSimulation; sanitizeAssetRefs; sanitizeDocument; sanitizeLayer; sanitizeMarkers; sanitizeTileSource; sanitizeTileset; sanitizeTilesetAtlas; setCanvasZoomFromPercent; setSimulationProbeFromRouteIndex; setTransientImageSource; setUxLifecycleState; startSimulationLoop; summarizeGraphFindings; syncAssetRegistryFromDocument; syncFullscreenState; syncInputsFromDocument; syncOverlayToggleButtons; syncTileSelectionControlState; syncUxContractState; tick; toProjectAssetUrl; toggleOverlayPanel; toggleSelectedLayerVisibility; touchDocument; tryLoadPresetFromQuery; updateCanvasZoomReadout; updateDebugVisualizationUI; updateEditorExperienceUI; updateRemediationUI; updateSimulationContext; updateStatus; validateProjectAssets

## Target Controls
Keep:
- tile palette controls
- map grid/layer controls
- import/export controls

Remove or rename:
- any publish path that includes unvalidated map draft data

Add:
- Validate Tile Map
- Publish `tools.tile-map-editor`
- tile/layer validation diagnostics

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for tile map document. Current contract baseline: `tools/schemas/tools/tile-map-editor.schema.json` (tile-map-editor Payload).
Required keys: none assigned for this reference folder.
Optional keys: `tileMapDocument`, `tilemapDocumentPath`, `parallaxDocument`.

Tool-owned JSON responsibilities:
- import/load: parse incoming tile map document and reject it before mutation when invalid
- validate: apply the current tile map document contract before export, copy, or publish
- edit/process: mutate only tile map document fields owned by Tilemap Studio
- export/save: serialize the validated tile map document as the tools.tile-map-editor output shape
- publish: write only the validated tools.tile-map-editor value produced by Tilemap Studio
- copy/create payload: create copied payload text from the validated tile map document, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts the schema-defined tile map document
- allows schema-defined parallax/tilemap path fields when present
- publishes only validated tile map JSON

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `tile-map-editor.schema.json`
- invalid tile/layer dimensions or references
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.tile-map-editor = {
  "tileMapDocument": "jsonValue", // optional
  "tilemapDocumentPath": "jsonValue", // optional
  "parallaxDocument": "jsonValue" // optional
}
```

## Playwright Expectations
- load `tools/Tilemap Studio/index.html` without console errors
- edit a tile/layer and confirm output JSON updates
- reject invalid tile map JSON

## Manual Test Expectations
- Open `tools/Tilemap Studio/index.html` and confirm the map grid/layer controls render.
- Edit a tile or layer, validate, export, and re-import.
- Try malformed JSON and an invalid tile/layer reference; each must block publish.

## Known Gaps
- Tile/layer validation needs clearer publish blocking.
- Publish should be separate from map preview state.

## Rebuild Order Priority
core-07: rebuild in the core tool lane after earlier priorities are stable.
