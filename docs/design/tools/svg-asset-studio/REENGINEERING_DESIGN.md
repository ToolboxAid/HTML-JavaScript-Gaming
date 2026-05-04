# SVG Asset Studio Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-04
Source folder: `tools/SVG Asset Studio`
Publish target: `tools.svg-asset-studio`

## Tool Purpose
Vector asset document authoring. SVG Asset Studio owns `vectorAssetDocument`, vector editing, SVG preview, export, and publish to `tools.svg-asset-studio`.

## Exact Folder/Files Inspected
- `tools/SVG Asset Studio/how_to_use.html`
- `tools/SVG Asset Studio/index.html`
- `tools/SVG Asset Studio/main.js`
- `tools/SVG Asset Studio/README.md`
- `tools/SVG Asset Studio/svgBackgroundEditor.css`

## Exact Current Controls Found
- `tools/SVG Asset Studio/index.html`: `button[button]#newSvgButton` - New SVG
- `tools/SVG Asset Studio/index.html`: `button[button]#loadSvgButton` - Load SVG
- `tools/SVG Asset Studio/index.html`: `input[file]#loadSvgInput` - loadSvgInput
- `tools/SVG Asset Studio/index.html`: `button[button]#saveSvgButton` - Save SVG
- `tools/SVG Asset Studio/index.html`: `input[number]#canvasWidthInput` - canvasWidthInput
- `tools/SVG Asset Studio/index.html`: `input[number]#canvasHeightInput` - canvasHeightInput
- `tools/SVG Asset Studio/index.html`: `button[button]#applyCanvasSizeButton` - Apply Canvas Size
- `tools/SVG Asset Studio/index.html`: `button[button]#zoomOutButton` - Zoom -
- `tools/SVG Asset Studio/index.html`: `input[number]#zoomPercentInput` - zoomPercentInput
- `tools/SVG Asset Studio/index.html`: `button[button]#zoomInButton` - Zoom +
- `tools/SVG Asset Studio/index.html`: `button[button]#resetViewButton` - Reset View
- `tools/SVG Asset Studio/index.html`: `button[button]` - Select
- `tools/SVG Asset Studio/index.html`: `button[button]` - Rectangle
- `tools/SVG Asset Studio/index.html`: `button[button]` - Ellipse/Circle
- `tools/SVG Asset Studio/index.html`: `button[button]` - Line
- `tools/SVG Asset Studio/index.html`: `button[button]` - Polyline
- `tools/SVG Asset Studio/index.html`: `button[button]` - Path
- `tools/SVG Asset Studio/index.html`: `button[button]#finishPolylineButton` - Finish Polyline
- `tools/SVG Asset Studio/index.html`: `select#paletteSelect` - paletteSelect
- `tools/SVG Asset Studio/index.html`: `button[button]#setPaletteTargetPaintButton` - Paint
- `tools/SVG Asset Studio/index.html`: `button[button]#setPaletteTargetStrokeButton` - Stroke
- `tools/SVG Asset Studio/index.html`: `input[number]#strokeWidthInput` - strokeWidthInput
- `tools/SVG Asset Studio/index.html`: `button[button]#applyFillButton` - Apply Fill to Selected
- `tools/SVG Asset Studio/index.html`: `button[button]#applyStyleButton` - Apply Style to Selected
- `tools/SVG Asset Studio/index.html`: `button[button]#setPaletteTargetGradientStartButton` - Start Color
- `tools/SVG Asset Studio/index.html`: `button[button]#setPaletteTargetGradientEndButton` - End Color
- `tools/SVG Asset Studio/index.html`: `input[number]#gradientAngleInput` - gradientAngleInput
- `tools/SVG Asset Studio/index.html`: `button[button]#applyGradientToSelectedButton` - Apply to Selected
- `tools/SVG Asset Studio/index.html`: `button[button]` - button
- `tools/SVG Asset Studio/index.html`: `button[button]#sendBackwardButton` - Send Backward
- `tools/SVG Asset Studio/index.html`: `button[button]#bringForwardButton` - Bring Forward
- `tools/SVG Asset Studio/index.html`: `button[button]#toggleElementVisibilityButton` - Show/Hide
- `tools/SVG Asset Studio/index.html`: `button[button]#toggleAllVisibilityButton` - Hide All
- `tools/SVG Asset Studio/index.html`: `button[button]#deleteSelectedButton` - Delete Selected
- `tools/SVG Asset Studio/main.js`: `newSvgButton` via newSvgButton
- `tools/SVG Asset Studio/main.js`: `loadSvgButton` via loadSvgButton
- `tools/SVG Asset Studio/main.js`: `loadSvgInput` via loadSvgInput
- `tools/SVG Asset Studio/main.js`: `saveSvgButton` via saveSvgButton
- `tools/SVG Asset Studio/main.js`: `canvasWidthInput` via canvasWidthInput
- `tools/SVG Asset Studio/main.js`: `canvasHeightInput` via canvasHeightInput
- `tools/SVG Asset Studio/main.js`: `applyCanvasSizeButton` via applyCanvasSizeButton
- `tools/SVG Asset Studio/main.js`: `zoomOutButton` via zoomOutButton
- `tools/SVG Asset Studio/main.js`: `zoomPercentInput` via zoomPercentInput
- `tools/SVG Asset Studio/main.js`: `zoomInButton` via zoomInButton
- `tools/SVG Asset Studio/main.js`: `resetViewButton` via resetViewButton
- `tools/SVG Asset Studio/main.js`: `finishPolylineButton` via finishPolylineButton
- `tools/SVG Asset Studio/main.js`: `toolGrid` via toolGrid
- `tools/SVG Asset Studio/main.js`: `setPaletteTargetPaintButton` via setPaletteTargetPaintButton
- `tools/SVG Asset Studio/main.js`: `setPaletteTargetStrokeButton` via setPaletteTargetStrokeButton
- `tools/SVG Asset Studio/main.js`: `setPaletteTargetGradientStartButton` via setPaletteTargetGradientStartButton
- `tools/SVG Asset Studio/main.js`: `setPaletteTargetGradientEndButton` via setPaletteTargetGradientEndButton
- `tools/SVG Asset Studio/main.js`: `paletteStateReadout` via paletteStateReadout
- `tools/SVG Asset Studio/main.js`: `activePaintSwatch` via activePaintSwatch
- `tools/SVG Asset Studio/main.js`: `activePaintLabel` via activePaintLabel
- `tools/SVG Asset Studio/main.js`: `activeStrokeSwatch` via activeStrokeSwatch
- `tools/SVG Asset Studio/main.js`: `activeStrokeLabel` via activeStrokeLabel
- `tools/SVG Asset Studio/main.js`: `activeGradientStartSwatch` via activeGradientStartSwatch
- `tools/SVG Asset Studio/main.js`: `activeGradientStartLabel` via activeGradientStartLabel
- `tools/SVG Asset Studio/main.js`: `activeGradientEndSwatch` via activeGradientEndSwatch
- `tools/SVG Asset Studio/main.js`: `activeGradientEndLabel` via activeGradientEndLabel
- `tools/SVG Asset Studio/main.js`: `paletteSelect` via paletteSelect
- `tools/SVG Asset Studio/main.js`: `usedColorStrip` via usedColorStrip
- `tools/SVG Asset Studio/main.js`: `mainPaletteGrid` via mainPaletteGrid
- `tools/SVG Asset Studio/main.js`: `strokeWidthInput` via strokeWidthInput
- `tools/SVG Asset Studio/main.js`: `gradientAngleInput` via gradientAngleInput
- `tools/SVG Asset Studio/main.js`: `applyFillButton` via applyFillButton
- `tools/SVG Asset Studio/main.js`: `applyStyleButton` via applyStyleButton
- `tools/SVG Asset Studio/main.js`: `applyGradientToSelectedButton` via applyGradientToSelectedButton
- `tools/SVG Asset Studio/main.js`: `deleteSelectedButton` via deleteSelectedButton
- `tools/SVG Asset Studio/main.js`: `selectionReadout` via selectionReadout
- `tools/SVG Asset Studio/main.js`: `pointerReadout` via pointerReadout
- `tools/SVG Asset Studio/main.js`: `viewReadout` via viewReadout
- `tools/SVG Asset Studio/main.js`: `canvasMeta` via canvasMeta
- `tools/SVG Asset Studio/main.js`: `canvasViewport` via canvasViewport
- `tools/SVG Asset Studio/main.js`: `selectionChecklistOverlay` via selectionChecklistOverlay
- `tools/SVG Asset Studio/main.js`: `editorSvg` via editorSvg
- `tools/SVG Asset Studio/main.js`: `sceneRoot` via sceneRoot
- `tools/SVG Asset Studio/main.js`: `selectionOverlay` via selectionOverlay
- `tools/SVG Asset Studio/main.js`: `selectionBounds` via selectionBounds
- `tools/SVG Asset Studio/main.js`: `statusText` via statusText
- `tools/SVG Asset Studio/main.js`: `elementList` via elementList
- `tools/SVG Asset Studio/main.js`: `sendBackwardButton` via sendBackwardButton
- `tools/SVG Asset Studio/main.js`: `bringForwardButton` via bringForwardButton
- `tools/SVG Asset Studio/main.js`: `toggleElementVisibilityButton` via toggleElementVisibilityButton
- `tools/SVG Asset Studio/main.js`: `toggleAllVisibilityButton` via toggleAllVisibilityButton

## Current Panels And Surfaces Found
- `tools/SVG Asset Studio/index.html`: `.app-shell`
- `tools/SVG Asset Studio/index.html`: `.toolbar`
- `tools/SVG Asset Studio/index.html`: `.toolbar-group`
- `tools/SVG Asset Studio/index.html`: `.tools-platform-control-cluster--preview`
- `tools/SVG Asset Studio/index.html`: `.tools-platform-layout-grid`
- `tools/SVG Asset Studio/index.html`: `.sidebar`
- `tools/SVG Asset Studio/index.html`: `.left-sidebar`
- `tools/SVG Asset Studio/index.html`: `.tools-platform-resize-panel`
- `tools/SVG Asset Studio/index.html`: `.panel`
- `tools/SVG Asset Studio/index.html`: `.tool-grid`
- `tools/SVG Asset Studio/index.html`: `.swatch-grid`
- `tools/SVG Asset Studio/index.html`: `.palette-grid`
- `tools/SVG Asset Studio/index.html`: `.used-color-grid`
- `tools/SVG Asset Studio/index.html`: `.canvas-panel`
- `tools/SVG Asset Studio/index.html`: `.tools-platform-dock-panel`
- `tools/SVG Asset Studio/index.html`: `.canvas-toolbar`
- `tools/SVG Asset Studio/index.html`: `.canvas-viewport`
- `tools/SVG Asset Studio/index.html`: `.selection-checklist-overlay`
- `tools/SVG Asset Studio/index.html`: `.status-text`
- `tools/SVG Asset Studio/index.html`: `.right-sidebar`
- `tools/SVG Asset Studio/index.html`: `.element-list`
- `tools/SVG Asset Studio/index.html`: `.usage-list`

## Exact Current Functions And Classes
- `tools/SVG Asset Studio/main.js`: function appendFreehandPoint; function applyCurrentStyle; function applyEnablementState; function applyFillStyle; function applyFillToSelection; function applyGradientFillStyle; function applyGradientToSelection; function applyLineStyle; function applyPaletteColorSelection; function applySampleEditorOptions; function applyStyleToSelection; function areAllDrawableElementsHidden; function bindEvents; function bindPaintAndStrokeFromLoadedData; function bootVectorAssetStudio; function buildPresetLoadedStatus; function captureGeometry; function clamp; function clearEditorDefs; function clearSelection; function collectDrawablePaletteEntriesFromLoadedSvg; function collectPaletteEntries; function computeGradientVector; function computeResizeBounds; function consumePalette; function createLinearGradientDefinition; function createNewDocument; function createShapeForTool; function createSvgElement; function createSwatchButton; function deleteSelectedElement; function downloadTextFile; function emitVectorAssetControlReadiness; function ensureDerivedPaletteSelectionFromLoadedSvg; function ensureEditorIdentity; function ensurePaletteSelectControl; function ensurePaletteSelectionFromDeclaredInputs; function extractVectorAssetPresetFromSamplePreset; function finalizeDragOperation; function finalizeFreehandPath; function finalizePendingPolyline; function findDrawableElementFromTarget; function findVectorAssetPresetMapping; function getDrawableElements; function getEditingGateMessage; function getLineStrokeColor; function getOrCreateEditorDefs; function getPaletteEntryColors; function getPaletteLibrary; function getScenePoint; function getSelectedElement; function getSelectionViewportRect; function getTargetColorByName; function getVisiblePaletteEntries; function handlePolylineClick; function hasErrorStatus; function hasFillSelection; function hasPaletteSelection; function hasRequiredStyleSelection; function initialize; function initializeHostedWorkspaceShellEntry; function isElementHidden; function isHostedSvgWorkspaceMode; function isPaintSelectionRequired; function isStrokeSelectionRequired; function loadPaletteCatalogFromExistingWorkflow; function loadSampleMetadataManifest; function loadSvgFromText; function mapPointToNewBounds; function moveSelectedBackward; function moveSelectedForward; function normalizeColorFromPalette; function normalizeColorValue; function normalizeHexColor; function normalizeSampleId; function normalizeSamplePresetPath; function normalizeToolId; function nudgeSelectedElementBy; function onCanvasWheel; function onSvgPointerDown; function onSvgPointerMove; function parseDimension; function parsePathPoints; function parsePointsAttribute; function pointsToAttribute; function pointsToPath; function pruneUnusedEditorGradients; function pushColor; function readEmbeddedEditorOptionsFromSvgRoot; function readHostedVectorAssetDocumentFromContext; function refreshUsedColors; function registerPaletteFromPresetEditorOptions; function renderElementList; function renderMainPaletteGrid; function renderPaletteSelect; function renderUsedColorStrip; function resetPaletteSelectionState; function resetView; function resizeGeometry; function resolvePaletteIdFromConfig; function resolveVectorAssetPresetInput; function round2; function safeGetBBox; function sanitizeImportNode; function selectElement; function serializeCurrentSvg; function setActiveTool; function setCanvasSize; function setElementVisibility; function setPaletteTarget; function setStatus; function setVectorAssetLifecycle; function setViewTransform; function setZoom; function startFreehandPath; function stripEditorAttributes; function syncVectorAssetUxContract; function toggleAllElementsVisibility; function toggleSelectedElementVisibility; function toHex; function translateGeometry; function tryLoadHostedVectorAssetFromContext; function tryLoadPresetFromQuery; function updateCanvasMeta; function updateDragShape; function updatePaletteReadout; function updatePolylineActionState; function updatePolylinePreview; function updateSelectionChecklistOverlay; function updateSelectionOverlay; function updateViewReadout; function upsertPaletteOption; method applyProjectState; method captureProjectState; method getApi; method getProjectName; method registerToolBootContract

## Target Controls
Keep:
- shape/layer editing controls
- color/style controls
- preview canvas/stage
- import/export vector asset behavior

Remove or rename:
- cross-tool vector assumptions from the contract authoring path

Add:
- Validate `vectorAssetDocument`
- Publish `tools.svg-asset-studio`
- vector document error list

## JSON Contract Owned By This Tool
Owned JSON is the SVG Asset Studio payload. Required field is `vectorAssetDocument`; no other top-level fields are allowed. The vector asset document owns source metadata, layer/shape data, style data, and SVG preview source generated by this folder.

## Publish Output
Publish only to `tools.svg-asset-studio`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing `vectorAssetDocument`
- vector asset document without usable source/layer/shape data
- style values the renderer cannot normalize
- unsupported top-level fields

## Manual Test Plan
- Create or load a vector asset document.
- Change shape/style controls and confirm preview plus exported JSON update.
- Try malformed vector JSON and invalid shape/style values; publish must stay blocked.
