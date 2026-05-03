# SVG Asset Studio Reengineering Design (svg-asset-studio)

## Purpose
- Create and edit reusable vector (SVG) assets. Build shapes, icons, and asset components.

## Current V1 Capability
- Active in registry-driven tools surface.
- Runtime entry point: `SVG Asset Studio/index.html`.
- Runtime implementation file: `tools/SVG Asset Studio/main.js`.

## Current V2 / Workspace Status
- Legacy/first-class tool present in registry; not fully mapped into Workspace V2 toolState lane.
- Workspace integration classification:
  - global tool: no
  - toolState-capable tool: no
  - published `tools.*` output candidate: yes
- Readiness: Needs additional schema/contract alignment

## Expected JSON Schema/Input
- Schema ref: `tools/schemas/tools/svg-asset-studio.schema.json`. Required root keys: `vectorAssetDocument`. Defined root properties: `vectorAssetDocument`.

## Valid JSON Load Behavior (Target)
- Parse incoming tool payload once.
- Validate against the tool schema/contract before rendering.
- Render the fully valid state and expose clear contract readout text.

## Invalid JSON Rejection Behavior (Target)
- Reject before rendering domain state.
- Show one clear actionable invalid message.
- Avoid fallback/default injections and avoid mutating inbound payload structure.

## Current Components/Functions
- Top-level functions: `isHostedSvgWorkspaceMode()`, `normalizeSamplePresetPath()`, `buildPresetLoadedStatus()`, `normalizeSampleId()`, `normalizeToolId()`, `findVectorAssetPresetMapping()`, `setVectorAssetLifecycle()`, `clamp()`, `round2()`, `setStatus()`, `hasErrorStatus()`, `normalizeHexColor()`, `normalizeColorValue()`, `getOrCreateEditorDefs()`, `clearEditorDefs()`, `computeGradientVector()`, `createLinearGradientDefinition()`, `pruneUnusedEditorGradients()`, `isPaintSelectionRequired()`, `isStrokeSelectionRequired()`, `hasRequiredStyleSelection()`, `hasFillSelection()`, `getEditingGateMessage()`, `hasPaletteSelection()`, `updateSelectionChecklistOverlay()`, `getPaletteLibrary()`, `collectPaletteEntries()`, `upsertPaletteOption()`, `loadPaletteCatalogFromExistingWorkflow()`, `getVisiblePaletteEntries()`, `renderPaletteSelect()`, `ensurePaletteSelectControl()`, `createSwatchButton()`, `getTargetColorByName()`, `renderMainPaletteGrid()`, `renderUsedColorStrip()`, `refreshUsedColors()`, `updatePaletteReadout()`, `applyEnablementState()`, `setPaletteTarget()`, `resetPaletteSelectionState()`, `applyPaletteColorSelection()`, `createSvgElement()`, `getDrawableElements()`, `ensureEditorIdentity()`, `getSelectedElement()`, `syncVectorAssetUxContract()`, `isElementHidden()`, `setElementVisibility()`, `areAllDrawableElementsHidden()`, `setActiveTool()`, `updateCanvasMeta()`, `updateViewReadout()`, `setViewTransform()`, `getScenePoint()`, `safeGetBBox()`, `getSelectionViewportRect()`, `clearSelection()`, `selectElement()`, `updateSelectionOverlay()`, `renderElementList()`, `setCanvasSize()`, `createNewDocument()`, `setZoom()`, `resetView()`, `applyCurrentStyle()`, `applyFillStyle()`, `applyGradientFillStyle()`, `getLineStrokeColor()`, `applyLineStyle()`, `updatePolylineActionState()`, `createShapeForTool()`, `updateDragShape()`, `parsePointsAttribute()`, `pointsToAttribute()`, `pointsToPath()`, `parsePathPoints()`, `captureGeometry()`, `translateGeometry()`, `mapPointToNewBounds()`, `resizeGeometry()`, `computeResizeBounds()`, `findDrawableElementFromTarget()`, `finalizePendingPolyline()`, `handlePolylineClick()`, `updatePolylinePreview()`, `startFreehandPath()`, `appendFreehandPoint()`, `finalizeFreehandPath()`, `onSvgPointerDown()`, `onSvgPointerMove()`, `finalizeDragOperation()`, `onCanvasWheel()`, `deleteSelectedElement()`, `moveSelectedForward()`, `moveSelectedBackward()`, `toggleSelectedElementVisibility()`, `toggleAllElementsVisibility()`, `nudgeSelectedElementBy()`, `applyStyleToSelection()`, `applyFillToSelection()`, `applyGradientToSelection()`, `stripEditorAttributes()`, `serializeCurrentSvg()`, `downloadTextFile()`, `parseDimension()`, `sanitizeImportNode()`, `loadSvgFromText()`, `resolvePaletteIdFromConfig()`, `getPaletteEntryColors()`, `normalizeColorFromPalette()`, `applySampleEditorOptions()`, `readEmbeddedEditorOptionsFromSvgRoot()`, `extractVectorAssetPresetFromSamplePreset()`, `registerPaletteFromPresetEditorOptions()`, `collectDrawablePaletteEntriesFromLoadedSvg()`, `ensureDerivedPaletteSelectionFromLoadedSvg()`, `ensurePaletteSelectionFromDeclaredInputs()`, `bindPaintAndStrokeFromLoadedData()`, `emitVectorAssetControlReadiness()`, `readHostedVectorAssetDocumentFromContext()`, `tryLoadHostedVectorAssetFromContext()`, `bindEvents()`, `bootVectorAssetStudio()`.

## Target Components/Functions
- Separate explicit JSON contract functions (`import`, `validate`, `load`, `export`) from view-only rendering methods.
- Keep tool-specific logic inside the tool runtime; avoid Workspace V2 owning tool-specific compare/merge/edit behavior.
- Keep one visible invalid-state path that blocks render before any partial state draws.

## Tool-Owned JSON Functions
- Import: `buildPresetLoadedStatus()`, `loadPaletteCatalogFromExistingWorkflow()`, `updatePaletteReadout()`, `updateViewReadout()`, `parsePointsAttribute()`, `parsePathPoints()`, `downloadTextFile()`, `parseDimension()`, `sanitizeImportNode()`, `loadSvgFromText()`, `readEmbeddedEditorOptionsFromSvgRoot()`, `collectDrawablePaletteEntriesFromLoadedSvg()`, `ensureDerivedPaletteSelectionFromLoadedSvg()`, `bindPaintAndStrokeFromLoadedData()`, `emitVectorAssetControlReadiness()`, `readHostedVectorAssetDocumentFromContext()`, `tryLoadHostedVectorAssetFromContext()`
- Validate: `normalizeSamplePresetPath()`, `normalizeSampleId()`, `normalizeToolId()`, `normalizeHexColor()`, `normalizeColorValue()`, `sanitizeImportNode()`, `normalizeColorFromPalette()`
- Edit/process: `getOrCreateEditorDefs()`, `clearEditorDefs()`, `pruneUnusedEditorGradients()`, `getEditingGateMessage()`, `updateSelectionChecklistOverlay()`, `renderPaletteSelect()`, `renderMainPaletteGrid()`, `renderUsedColorStrip()`, `updatePaletteReadout()`, `applyEnablementState()`, `applyPaletteColorSelection()`, `ensureEditorIdentity()`, `updateCanvasMeta()`, `updateViewReadout()`, `updateSelectionOverlay()`, `renderElementList()`, `applyCurrentStyle()`, `applyFillStyle()`, `applyGradientFillStyle()`, `applyLineStyle()`, `updatePolylineActionState()`, `updateDragShape()`, `updatePolylinePreview()`, `applyStyleToSelection()`, `applyFillToSelection()`, `applyGradientToSelection()`, `stripEditorAttributes()`, `applySampleEditorOptions()`, `readEmbeddedEditorOptionsFromSvgRoot()`, `registerPaletteFromPresetEditorOptions()`
- Export: `serializeCurrentSvg()`, `downloadTextFile()`
- Add/copy to Workspace toolState: Not yet explicit in current tool runtime.
- Publish to `tools.svg-asset-studio`: Supported as target ownership in design; concrete publish path varies by tool.
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
