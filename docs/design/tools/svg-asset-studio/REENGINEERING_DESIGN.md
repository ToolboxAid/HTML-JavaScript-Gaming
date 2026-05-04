# SVG Asset Studio Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `svg-asset-studio`
Source folder: `tools/SVG Asset Studio`

## 1. Tool Purpose
Create and inspect vector asset documents, preview SVG output, and export schema-backed vector asset JSON.

## 2. Folder/Files Inspected
- `tools/SVG Asset Studio/how_to_use.html`
- `tools/SVG Asset Studio/index.html`
- `tools/SVG Asset Studio/main.js`
- `tools/SVG Asset Studio/README.md`
- `tools/SVG Asset Studio/svgBackgroundEditor.css`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 30, inputs 6, selects 1, textareas 0, tables 0, inferred DOM controls/panels 32.
- `tools/SVG Asset Studio/index.html`: button[button] #newSvgButton - New SVG
- `tools/SVG Asset Studio/index.html`: button[button] #loadSvgButton - Load SVG
- `tools/SVG Asset Studio/index.html`: input[file] #loadSvgInput - loadSvgInput
- `tools/SVG Asset Studio/index.html`: button[button] #saveSvgButton - Save SVG
- `tools/SVG Asset Studio/index.html`: input[number] #canvasWidthInput - 1600
- `tools/SVG Asset Studio/index.html`: input[number] #canvasHeightInput - 900
- `tools/SVG Asset Studio/index.html`: button[button] #applyCanvasSizeButton - Apply Canvas Size
- `tools/SVG Asset Studio/index.html`: button[button] #zoomOutButton - Zoom -
- `tools/SVG Asset Studio/index.html`: input[number] #zoomPercentInput - 100
- `tools/SVG Asset Studio/index.html`: button[button] #zoomInButton - Zoom +
- `tools/SVG Asset Studio/index.html`: button[button] #resetViewButton - Reset View
- `tools/SVG Asset Studio/index.html`: button[button] - Select
- `tools/SVG Asset Studio/index.html`: button[button] - Rectangle
- `tools/SVG Asset Studio/index.html`: button[button] - Ellipse/Circle
- `tools/SVG Asset Studio/index.html`: button[button] - Line
- `tools/SVG Asset Studio/index.html`: button[button] - Polyline
- `tools/SVG Asset Studio/index.html`: button[button] - Path
- `tools/SVG Asset Studio/index.html`: button[button] #finishPolylineButton - Finish Polyline
- `tools/SVG Asset Studio/index.html`: select #paletteSelect - paletteSelect
- `tools/SVG Asset Studio/index.html`: button[button] #setPaletteTargetPaintButton - Paint
- `tools/SVG Asset Studio/index.html`: button[button] #setPaletteTargetStrokeButton - Stroke
- `tools/SVG Asset Studio/index.html`: input[number] #strokeWidthInput - 2
- `tools/SVG Asset Studio/index.html`: button[button] #applyFillButton - Apply Fill to Selected
- `tools/SVG Asset Studio/index.html`: button[button] #applyStyleButton - Apply Style to Selected
- `tools/SVG Asset Studio/index.html`: button[button] #setPaletteTargetGradientStartButton - Start Color
- `tools/SVG Asset Studio/index.html`: button[button] #setPaletteTargetGradientEndButton - End Color
- `tools/SVG Asset Studio/index.html`: input[number] #gradientAngleInput - 45
- `tools/SVG Asset Studio/index.html`: button[button] #applyGradientToSelectedButton - Apply to Selected
- `tools/SVG Asset Studio/index.html`: button[button] - Resize north-west
- `tools/SVG Asset Studio/index.html`: button[button] - Resize north-east
- `tools/SVG Asset Studio/index.html`: button[button] - Resize south-west
- `tools/SVG Asset Studio/index.html`: button[button] - Resize south-east
- `tools/SVG Asset Studio/index.html`: button[button] #sendBackwardButton - Send Backward
- `tools/SVG Asset Studio/index.html`: button[button] #bringForwardButton - Bring Forward
- `tools/SVG Asset Studio/index.html`: button[button] #toggleElementVisibilityButton - Show/Hide
- `tools/SVG Asset Studio/index.html`: button[button] #toggleAllVisibilityButton - Hide All
- `tools/SVG Asset Studio/index.html`: button[button] #deleteSelectedButton - Delete Selected
- `tools/SVG Asset Studio/main.js`: button #newSvgButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #loadSvgButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: input #loadSvgInput - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #saveSvgButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: input #canvasWidthInput - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: input #canvasHeightInput - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #applyCanvasSizeButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #zoomOutButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: input #zoomPercentInput - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #zoomInButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #resetViewButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #finishPolylineButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #setPaletteTargetPaintButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #setPaletteTargetStrokeButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #setPaletteTargetGradientStartButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #setPaletteTargetGradientEndButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: panel #paletteStateReadout - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: select #paletteSelect - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: input #strokeWidthInput - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: input #gradientAngleInput - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #applyFillButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #applyStyleButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #applyGradientToSelectedButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #deleteSelectedButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: panel #selectionReadout - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: panel #pointerReadout - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: panel #viewReadout - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: panel #elementList - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #sendBackwardButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #bringForwardButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #toggleElementVisibilityButton - inferred from JS DOM lookup
- `tools/SVG Asset Studio/main.js`: button #toggleAllVisibilityButton - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/SVG Asset Studio/index.html`: .app-shell
  - `tools/SVG Asset Studio/index.html`: .toolbar
  - `tools/SVG Asset Studio/index.html`: .toolbar-group
  - `tools/SVG Asset Studio/index.html`: .tools-platform-control-cluster--preview
  - `tools/SVG Asset Studio/index.html`: .workspace
  - `tools/SVG Asset Studio/index.html`: .tools-platform-layout-grid
  - `tools/SVG Asset Studio/index.html`: .sidebar
  - `tools/SVG Asset Studio/index.html`: .left-sidebar
  - `tools/SVG Asset Studio/index.html`: .tools-platform-resize-panel
  - `tools/SVG Asset Studio/index.html`: .panel
  - `tools/SVG Asset Studio/index.html`: .tool-grid
  - `tools/SVG Asset Studio/index.html`: .swatch-grid
  - `tools/SVG Asset Studio/index.html`: .palette-grid
  - `tools/SVG Asset Studio/index.html`: .used-color-grid
  - `tools/SVG Asset Studio/index.html`: .canvas-panel
  - `tools/SVG Asset Studio/index.html`: .tools-platform-dock-panel
  - `tools/SVG Asset Studio/index.html`: .canvas-toolbar
  - `tools/SVG Asset Studio/index.html`: .canvas-viewport
  - `tools/SVG Asset Studio/index.html`: .selection-checklist-overlay
  - `tools/SVG Asset Studio/index.html`: .status-text
  - `tools/SVG Asset Studio/index.html`: .right-sidebar
  - `tools/SVG Asset Studio/index.html`: .element-list
  - `tools/SVG Asset Studio/index.html`: .usage-list

## 4. Current Component/Class/Function Inventory
- `tools/SVG Asset Studio/main.js`: function appendFreehandPoint; function applyCurrentStyle; function applyEnablementState; function applyFillStyle; function applyFillToSelection; function applyGradientFillStyle; function applyGradientToSelection; function applyLineStyle; function applyPaletteColorSelection; function applySampleEditorOptions; function applyStyleToSelection; function areAllDrawableElementsHidden; function bindEvents; function bindPaintAndStrokeFromLoadedData; function bootVectorAssetStudio; function buildPresetLoadedStatus; function captureGeometry; function clamp; function clearEditorDefs; function clearSelection; function collectDrawablePaletteEntriesFromLoadedSvg; function collectPaletteEntries; function computeGradientVector; function computeResizeBounds; function consumePalette; function createLinearGradientDefinition; function createNewDocument; function createShapeForTool; function createSvgElement; function createSwatchButton; function deleteSelectedElement; function downloadTextFile; function emitVectorAssetControlReadiness; function ensureDerivedPaletteSelectionFromLoadedSvg; function ensureEditorIdentity; function ensurePaletteSelectControl; function ensurePaletteSelectionFromDeclaredInputs; function extractVectorAssetPresetFromSamplePreset; function finalizeDragOperation; function finalizeFreehandPath; function finalizePendingPolyline; function findDrawableElementFromTarget; function findVectorAssetPresetMapping; function getDrawableElements; function getEditingGateMessage; function getLineStrokeColor; function getOrCreateEditorDefs; function getPaletteEntryColors; function getPaletteLibrary; function getScenePoint; function getSelectedElement; function getSelectionViewportRect; function getTargetColorByName; function getVisiblePaletteEntries; function handlePolylineClick; function hasErrorStatus; function hasFillSelection; function hasPaletteSelection; function hasRequiredStyleSelection; function initialize; ... 77 more

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/svg-asset-studio.schema.json`. Title: SVG Asset Studio Payload. Required top-level fields: vectorAssetDocument. Allowed top-level fields: vectorAssetDocument. Additional top-level properties: rejected.

JSON handling signals found: Blob/object URL, download/export, hostContextId, schema, tools.*.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the current schema baseline or tool-owned normalized shape, update the local editor/preview state, and remain exportable as path/file-field JSON without embedding `imageDataUrl`.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing required fields, unsupported top-level fields, wrong nested types, and empty required editor payloads must be rejected in the tool UI before export/save/publish.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.svg-asset-studio` if applicable: yes, publish normalized output under `tools.svg-asset-studio` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.svg-asset-studio`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/SVG Asset Studio/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/SVG Asset Studio/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P06: SVG Asset Studio. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
