# SVG Asset Studio Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-04
Source folder: `toolbox/SVG Asset Studio`
Publish target: `tools.svg-asset-studio`

## Tool Purpose
SVG Asset Studio owns vector asset document import, validation, element editing, export, and publish to `tools.svg-asset-studio`.

## Folder/Files Inspected
- `toolbox/SVG Asset Studio/how_to_use.html`
- `toolbox/SVG Asset Studio/index.html`
- `toolbox/SVG Asset Studio/main.js`
- `toolbox/SVG Asset Studio/README.md`
- `toolbox/SVG Asset Studio/svgBackgroundEditor.css`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `toolbox/SVG Asset Studio/index.html`: `input[file]#loadSvgInput` - loadSvgInput | Chooses a local file for SVG asset document import/load. | Replaces or merges tool-owned SVG asset document only after the import validates. |
| `toolbox/SVG Asset Studio/index.html`: `input[number]#canvasWidthInput` - 1600 | Edits the active vector asset element field. | Updates the draft SVG asset document field represented by `canvasWidthInput` before validation. |
| `toolbox/SVG Asset Studio/index.html`: `input[number]#canvasHeightInput` - 900 | Edits the active vector asset element field. | Updates the draft SVG asset document field represented by `canvasHeightInput` before validation. |
| `toolbox/SVG Asset Studio/index.html`: `input[number]#zoomPercentInput` - 100 | Edits the current SVG asset document through `zoomPercentInput`. | Updates draft SVG asset document data and requires validation before tools.svg-asset-studio publish. |
| `toolbox/SVG Asset Studio/index.html`: `input[number]#strokeWidthInput` - 2 | Edits the active vector asset element field. | Updates the draft SVG asset document field represented by `strokeWidthInput` before validation. |
| `toolbox/SVG Asset Studio/index.html`: `input[number]#gradientAngleInput` - 45 | Edits the current SVG asset document through `gradientAngleInput`. | Updates draft SVG asset document data and requires validation before tools.svg-asset-studio publish. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#newSvgButton` - New SVG | Creates or resets a draft SVG asset document. | Initializes tool-owned SVG asset document data; tools.svg-asset-studio is unchanged until validation and publish/export. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#loadSvgButton` - Load SVG | Starts SVG asset document import/load. | Reads incoming JSON into the tool-owned SVG asset document only after validation succeeds. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#saveSvgButton` - Save SVG | Exports the validated SVG asset document. | Serializes the validated SVG asset document as the tools.svg-asset-studio output shape. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#applyCanvasSizeButton` - Apply Canvas Size | Publishes or applies the validated SVG asset document. | Writes the validated output shape to tools.svg-asset-studio. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#zoomOutButton` - Zoom - | Triggers the current SVG asset document UI action for `Zoom -`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#zoomInButton` - Zoom + | Triggers the current SVG asset document UI action for `Zoom +`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#resetViewButton` - Reset View | Creates or resets a draft SVG asset document. | Initializes tool-owned SVG asset document data; tools.svg-asset-studio is unchanged until validation and publish/export. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]` - Select | Triggers the current SVG asset document UI action for `Select`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]` - Rectangle | Triggers the current SVG asset document UI action for `Rectangle`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]` - Ellipse/Circle | Triggers the current SVG asset document UI action for `Ellipse/Circle`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]` - Line | Triggers the current SVG asset document UI action for `Line`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]` - Polyline | Triggers the current SVG asset document UI action for `Polyline`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]` - Path | Triggers the current SVG asset document UI action for `Path`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#finishPolylineButton` - Finish Polyline | Triggers the current SVG asset document UI action for `Finish Polyline`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `select#paletteSelect` - paletteSelect | Edits the current SVG asset document through `paletteSelect`. | Updates draft SVG asset document data and requires validation before tools.svg-asset-studio publish. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#setPaletteTargetPaintButton` - Paint | Triggers the current SVG asset document UI action for `Paint`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#setPaletteTargetStrokeButton` - Stroke | Triggers the current SVG asset document UI action for `Stroke`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#applyFillButton` - Apply Fill to Selected | Publishes or applies the validated SVG asset document. | Writes the validated output shape to tools.svg-asset-studio. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#applyStyleButton` - Apply Style to Selected | Publishes or applies the validated SVG asset document. | Writes the validated output shape to tools.svg-asset-studio. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#setPaletteTargetGradientStartButton` - Start Color | Triggers the current SVG asset document UI action for `Start Color`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#setPaletteTargetGradientEndButton` - End Color | Triggers the current SVG asset document UI action for `End Color`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#applyGradientToSelectedButton` - Apply to Selected | Publishes or applies the validated SVG asset document. | Writes the validated output shape to tools.svg-asset-studio. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#Resize north-west` - Resize north-west | Triggers the current SVG asset document UI action for `Resize north-west`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#Resize north-east` - Resize north-east | Triggers the current SVG asset document UI action for `Resize north-east`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#Resize south-west` - Resize south-west | Triggers the current SVG asset document UI action for `Resize south-west`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#Resize south-east` - Resize south-east | Triggers the current SVG asset document UI action for `Resize south-east`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#sendBackwardButton` - Send Backward | Publishes or applies the validated SVG asset document. | Writes the validated output shape to tools.svg-asset-studio. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#bringForwardButton` - Bring Forward | Triggers the current SVG asset document UI action for `Bring Forward`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#toggleElementVisibilityButton` - Show/Hide | Triggers the current SVG asset document UI action for `Show/Hide`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#toggleAllVisibilityButton` - Hide All | Triggers the current SVG asset document UI action for `Hide All`. | May update draft SVG asset document data; tools.svg-asset-studio publish must wait for validation. |
| `toolbox/SVG Asset Studio/index.html`: `button[button]#deleteSelectedButton` - Delete Selected | Removes or clears the selected vector asset element. | Deletes that data from the draft SVG asset document; publish waits for validation. |

## Panels And Surfaces Found
- `toolbox/SVG Asset Studio/how_to_use.html`: `.tools-platform-surface`
- `toolbox/SVG Asset Studio/index.html`: `.app-shell`
- `toolbox/SVG Asset Studio/index.html`: `.canvas-panel`
- `toolbox/SVG Asset Studio/index.html`: `.canvas-toolbar`
- `toolbox/SVG Asset Studio/index.html`: `.canvas-viewport`
- `toolbox/SVG Asset Studio/index.html`: `.element-list`
- `toolbox/SVG Asset Studio/index.html`: `.left-sidebar`
- `toolbox/SVG Asset Studio/index.html`: `.palette-grid`
- `toolbox/SVG Asset Studio/index.html`: `.panel`
- `toolbox/SVG Asset Studio/index.html`: `.right-sidebar`
- `toolbox/SVG Asset Studio/index.html`: `.selection-checklist-overlay`
- `toolbox/SVG Asset Studio/index.html`: `.sidebar`
- `toolbox/SVG Asset Studio/index.html`: `.svg-background-editor-page`
- `toolbox/SVG Asset Studio/index.html`: `.svg-background-editor-page-root`
- `toolbox/SVG Asset Studio/index.html`: `.swatch-grid`
- `toolbox/SVG Asset Studio/index.html`: `.tool-grid`
- `toolbox/SVG Asset Studio/index.html`: `.toolbar`
- `toolbox/SVG Asset Studio/index.html`: `.toolbar-group`
- `toolbox/SVG Asset Studio/index.html`: `.tools-platform-control-cluster--preview`
- `toolbox/SVG Asset Studio/index.html`: `.tools-platform-dock-panel`
- `toolbox/SVG Asset Studio/index.html`: `.tools-platform-layout-grid`
- `toolbox/SVG Asset Studio/index.html`: `.tools-platform-resize-panel`
- `toolbox/SVG Asset Studio/index.html`: `.usage-list`
- `toolbox/SVG Asset Studio/index.html`: `.used-color-grid`

## Current Component/Class/Function Inventory
- `toolbox/SVG Asset Studio/main.js`: appendFreehandPoint; applyCurrentStyle; applyEnablementState; applyFillStyle; applyFillToSelection; applyGradientFillStyle; applyGradientToSelection; applyLineStyle; applyPaletteColorSelection; applyProjectState; applySampleEditorOptions; applyStyleToSelection; areAllDrawableElementsHidden; bindEvents; bindPaintAndStrokeFromLoadedData; bootVectorAssetStudio; buildPresetLoadedStatus; captureGeometry; captureProjectState; clamp; clearEditorDefs; clearSelection; collectDrawablePaletteEntriesFromLoadedSvg; collectPaletteEntries; computeGradientVector; computeResizeBounds; consumePalette; createLinearGradientDefinition; createNewDocument; createShapeForTool; createSvgElement; createSwatchButton; deleteSelectedElement; downloadTextFile; emitVectorAssetControlReadiness; ensureDerivedPaletteSelectionFromLoadedSvg; ensureEditorIdentity; ensurePaletteSelectControl; ensurePaletteSelectionFromDeclaredInputs; extractVectorAssetPresetFromSamplePreset; finalizeDragOperation; finalizeFreehandPath; finalizePendingPolyline; findDrawableElementFromTarget; findVectorAssetPresetMapping; getApi; getDrawableElements; getEditingGateMessage; getLineStrokeColor; getOrCreateEditorDefs; getPaletteEntryColors; getPaletteLibrary; getProjectName; getScenePoint; getSelectedElement; getSelectionViewportRect; getTargetColorByName; getVisiblePaletteEntries; handlePolylineClick; hasErrorStatus; hasFillSelection; hasPaletteSelection; hasRequiredStyleSelection; initialize; initializeHostedWorkspaceShellEntry; isElementHidden; isHostedSvgWorkspaceMode; isPaintSelectionRequired; isStrokeSelectionRequired; loadPaletteCatalogFromExistingWorkflow; loadSampleMetadataManifest; loadSvgFromText; mapPointToNewBounds; moveSelectedBackward; moveSelectedForward; normalizeColorFromPalette; normalizeColorValue; normalizeHexColor; normalizeSampleId; normalizeSamplePresetPath; normalizeToolId; nudgeSelectedElementBy; onCanvasWheel; onSvgPointerDown; onSvgPointerMove; parseDimension; parsePathPoints; parsePointsAttribute; pointsToAttribute; pointsToPath; pruneUnusedEditorGradients; pushColor; readEmbeddedEditorOptionsFromSvgRoot; readHostedVectorAssetDocumentFromContext; refreshUsedColors; registerPaletteFromPresetEditorOptions; registerToolBootContract; renderElementList; renderMainPaletteGrid; renderPaletteSelect; renderUsedColorStrip; resetPaletteSelectionState; resetView; resizeGeometry; resolvePaletteIdFromConfig; resolveVectorAssetPresetInput; round2; safeGetBBox; sanitizeImportNode; selectElement; serializeCurrentSvg; setActiveTool; setCanvasSize; setElementVisibility; setPaletteTarget; setStatus; setVectorAssetLifecycle; setViewTransform; setZoom; startFreehandPath; stripEditorAttributes; syncVectorAssetUxContract; toHex; toggleAllElementsVisibility; toggleSelectedElementVisibility; translateGeometry; tryLoadHostedVectorAssetFromContext; tryLoadPresetFromQuery; updateCanvasMeta; updateDragShape; updatePaletteReadout; updatePolylineActionState; updatePolylinePreview; updateSelectionChecklistOverlay; updateSelectionOverlay; updateViewReadout; upsertPaletteOption

## Target Controls
Keep:
- SVG editing controls
- preview/canvas controls
- import/export controls

Remove or rename:
- publish paths that skip SVG document validation

Add:
- Validate SVG Asset
- Publish `tools.svg-asset-studio`
- element-level validation messages

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for SVG asset document. Current contract baseline: `toolbox/schemas/tools/svg-asset-studio.schema.json` (SVG Asset Studio Payload).
Required keys: `vectorAssetDocument`.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: parse incoming SVG asset document and reject it before mutation when invalid
- validate: apply the current SVG asset document contract before export, copy, or publish
- edit/process: mutate only SVG asset document fields owned by SVG Asset Studio
- export/save: serialize the validated SVG asset document as the tools.svg-asset-studio output shape
- publish: write only the validated tools.svg-asset-studio value produced by SVG Asset Studio
- copy/create payload: create copied payload text from the validated SVG asset document, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts the schema-defined SVG asset document
- edits vector asset data only through tool controls
- exports/publishes a validated vector asset document

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `svg-asset-studio.schema.json`
- missing required vector asset document fields
- unsupported element data

## Published Output
Published Output:
```jsonc
tools.svg-asset-studio = {
  "vectorAssetDocument": "jsonValue"
}
```

## Playwright Expectations
- load `toolbox/SVG Asset Studio/index.html` without console errors
- edit the existing vector controls and confirm JSON preview/export updates
- reject a malformed vector asset document

## Manual Test Expectations
- Open `toolbox/SVG Asset Studio/index.html` and confirm the editor/preview surfaces render.
- Load or create a valid vector asset document, edit an element, validate, and export/publish it.
- Try malformed JSON and a required-field omission; each must block publish.

## Known Gaps
- Current SVG controls need a rebuild pass for explicit validate/publish separation.
- Element validation should identify the failing vector node.

## Rebuild Order Priority
core-04: rebuild in the core tool lane after earlier priorities are stable.
