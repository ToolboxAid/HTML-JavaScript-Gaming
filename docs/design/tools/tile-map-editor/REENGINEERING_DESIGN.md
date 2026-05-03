# Tilemap Studio Reengineering Design (tile-map-editor)

## Purpose
- Tile map layout studio for layered map authoring, sample playback, simulation, and packaging flows.

## Current V1 Capability
- Active in registry-driven tools surface.
- Runtime entry point: `Tilemap Studio/index.html`.
- Runtime implementation file: `tools/Tilemap Studio/main.js`.

## Current V2 / Workspace Status
- Legacy/first-class tool present in registry; not fully mapped into Workspace V2 toolState lane.
- Workspace integration classification:
  - global tool: no
  - toolState-capable tool: no
  - published `tools.*` output candidate: yes
- Readiness: Needs additional schema/contract alignment

## Expected JSON Schema/Input
- Schema ref: `tools/schemas/tools/tile-map-editor.schema.json`. Required root keys: none. Defined root properties: `tileMapDocument`, `tilemapDocumentPath`, `parallaxDocument`.

## Valid JSON Load Behavior (Target)
- Parse incoming tool payload once.
- Validate against the tool schema/contract before rendering.
- Render the fully valid state and expose clear contract readout text.

## Invalid JSON Rejection Behavior (Target)
- Reject before rendering domain state.
- Show one clear actionable invalid message.
- Avoid fallback/default injections and avoid mutating inbound payload structure.

## Current Components/Functions
- Class `TileMapEditorApp` in `tools/Tilemap Studio/main.js`.
- Class methods: `constructor()`, `setUxLifecycleState()`, `markInteracting()`, `syncUxContractState()`, `clearTransientImageSources()`, `setTransientImageSource()`, `getTransientImageSource()`, `getOrderedImageSourcesForName()`, `init()`, `captureRefs()`, `attachEvents()`, `syncFullscreenState()`, `setCanvasZoomFromPercent()`, `updateCanvasZoomReadout()`, `applyCanvasZoom()`, `syncOverlayToggleButtons()`, `getOverlaySidebar()`, `getOverlayPanels()`, `toggleOverlayPanel()`, `handleOverlayAccordionToggle()`, `handleNewProject()`, `syncAssetRegistryFromDocument()`, `resolveAssetRefsFromRegistry()`, `handleSaveProject()`, `handleSaveAssetRegistry()`, `handleExportRuntime()`, `handlePackageProject()`, `handleLoadProject()`, `handleLoadAssetRegistry()`, `findFirstNonEmptyTileId()`, `getSelectableTiles()`, `hasTileSelection()`, `ensureFirstTileSelection()`, `syncTileSelectionControlState()`, `readTilesetAtlasSettingsFromInputs()`, `applyTilesetAtlasSettingsFromInputs()`, `getNextTileId()`, `getPreservedTilesForAtlasRegeneration()`, `composeTilesetWithAtlasTiles()`, `applyMapSizing()`, `getSelectedLayer()`, `ensureEditable()`, `addLayer()`, `removeSelectedLayer()`, `toggleSelectedLayerVisibility()`, `handleCanvasPointerDown()`, `handleCanvasPointerMove()`, `handleCanvasPointerLeave()`, `getCellFromMouseEvent()`, `applyCellEdit()`, `placeMarkerAtCell()`, `removeMarkerAtCell()`, `touchDocument()`, `bindRuntimeStateSync()`, `publishLivePreviewSync()`, `queueLivePreviewSync()`, `syncInputsFromDocument()`, `refreshSimulationActionState()`, `emitTilemapControlReadiness()`, `getSimulationStartCell()`, `getSimulationRouteIndexFromCell()`, `setSimulationProbeFromRouteIndex()`, `inspectSimulationCell()`, `buildSimulationCellSummaryFromDetails()`, `resetSimulationTraversalState()`, `ensureSimulationProbeVisible()`, `updateSimulationContext()`, `enterSimulationMode()`, `pauseSimulation()`, `resumeSimulation()`, `restartSimulationPosition()`, `exitSimulationMode()`, `startSimulationLoop()`, `advanceSimulationProbe()`, `buildSimulationCellSummary()`, `renderAll()`, `renderLayerMeta()`, `getTileSourceDrawInfo()`, `renderTileset()`, `renderTilesetMeta()`, `renderLayerList()`, `renderMarkerList()`, `renderCanvas()`, `drawSimulationOverlay()`, `drawCheckerboard()`, `drawTileLayer()`, `drawCollisionLayer()`, `drawDataLayer()`, `drawGrid()`, `drawMarkers()`, `updateStatus()`, `validateProjectAssets()`, `updateRemediationUI()`, `updateEditorExperienceUI()`, `updateDebugVisualizationUI()`, `refreshExperienceSnapshot()`, `refreshDebugVisualizationSnapshot()`, `inspectRemediationActions()`, `jumpToRemediationProblem()`, `applyRemediationAction()`.
- Top-level functions: `normalizeSamplePresetPath()`, `buildPresetLoadedStatus()`, `extractTileMapDocumentFromSamplePreset()`, `createDefaultTilesetAtlas()`, `clampInteger()`, `createGrid()`, `normalizeCellValue()`, `createLayer()`, `cloneDeep()`, `loadImageElement()`, `toProjectAssetUrl()`, `getOrderedImageSources()`, `getPrimaryImageSource()`, `createPersistableTileMapDocument()`, `computeAtlasGridMetrics()`, `buildTilesetFromAtlas()`, `createInitialDocument()`, `ensureGridSize()`, `sanitizeLayer()`, `sanitizeTileset()`, `sanitizeTilesetAtlas()`, `sanitizeMarkers()`, `sanitizeAssetRefs()`, `sanitizeDocument()`, `generateLayerId()`, `createRuntimeExport()`, `downloadTextFile()`, `summarizeGraphFindings()`, `isStrictWorkspaceTilemapSnapshot()`, `bootTileMapStudio()`.

## Target Components/Functions
- Separate explicit JSON contract functions (`import`, `validate`, `load`, `export`) from view-only rendering methods.
- Keep tool-specific logic inside the tool runtime; avoid Workspace V2 owning tool-specific compare/merge/edit behavior.
- Keep one visible invalid-state path that blocks render before any partial state draws.

## Tool-Owned JSON Functions
- Import: `updateCanvasZoomReadout()`, `handleLoadProject()`, `handleLoadAssetRegistry()`, `readTilesetAtlasSettingsFromInputs()`, `emitTilemapControlReadiness()`, `buildPresetLoadedStatus()`, `loadImageElement()`, `downloadTextFile()`
- Validate: `validateProjectAssets()`, `normalizeSamplePresetPath()`, `normalizeCellValue()`, `sanitizeLayer()`, `sanitizeTileset()`, `sanitizeTilesetAtlas()`, `sanitizeMarkers()`, `sanitizeAssetRefs()`, `sanitizeDocument()`
- Edit/process: `updateCanvasZoomReadout()`, `applyCanvasZoom()`, `applyTilesetAtlasSettingsFromInputs()`, `applyMapSizing()`, `ensureEditable()`, `addLayer()`, `removeSelectedLayer()`, `applyCellEdit()`, `removeMarkerAtCell()`, `updateSimulationContext()`, `renderAll()`, `renderLayerMeta()`, `renderTileset()`, `renderTilesetMeta()`, `renderLayerList()`, `renderMarkerList()`, `renderCanvas()`, `updateStatus()`, `updateRemediationUI()`, `updateEditorExperienceUI()`, `updateDebugVisualizationUI()`, `applyRemediationAction()`
- Export: `handleExportRuntime()`, `createRuntimeExport()`, `downloadTextFile()`
- Add/copy to Workspace toolState: `publishLivePreviewSync()`
- Publish to `tools.tile-map-editor`: Supported as target ownership in design; concrete publish path varies by tool.
- Compare/merge for own schema: Not currently tool-local; Workspace V2 has cross-toolState compare/merge UI today.

## Workspace Integration Contract
- Workspace launch path exists via tools index/workspace-manager registry entry points.
- Explicit Workspace V2 toolState contract is not yet completed for this tool.

## Playwright Expectations
- Valid payload path should show visible valid-state surface.
- Invalid payload path should show visible invalid-state surface and hide valid state.
- Workspace launch handoff should open the tool with hostContext/toolState payload when applicable.

## Manual Test Expectations
- Launch from `tools/index.html` and confirm baseline UI renders.
- Launch from Workspace V2 when applicable and confirm payload handoff path.
- Provide an invalid JSON contract and confirm the tool blocks render with explicit error.

## Known Gaps
- Tool is not fully in the current Workspace V2 toolState-capable Playwright lane.
