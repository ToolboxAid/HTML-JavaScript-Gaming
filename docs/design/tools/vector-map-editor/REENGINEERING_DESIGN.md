# Vector Map Editor Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `vector-map-editor`
Source folder: `tools/Vector Map Editor`

## 1. Tool Purpose
Author vector map documents, objects, geometry, transforms, and runtime export payloads.

## 2. Folder/Files Inspected
- `tools/Vector Map Editor/editor/VectorMapCollisionTester.js`
- `tools/Vector Map Editor/editor/VectorMapDocument.js`
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`
- `tools/Vector Map Editor/editor/VectorMapFullscreenController.js`
- `tools/Vector Map Editor/editor/VectorMapHistoryManager.js`
- `tools/Vector Map Editor/editor/VectorMapInteractionController.js`
- `tools/Vector Map Editor/editor/VectorMapJsonEditor.js`
- `tools/Vector Map Editor/editor/VectorMapRenderer2D.js`
- `tools/Vector Map Editor/editor/VectorMapRenderer3D.js`
- `tools/Vector Map Editor/editor/VectorMapRuntimeExporter.js`
- `tools/Vector Map Editor/editor/VectorMapSelectionModel.js`
- `tools/Vector Map Editor/editor/VectorMapSerializer.js`
- `tools/Vector Map Editor/editor/VectorMapTransformController.js`
- `tools/Vector Map Editor/how_to_use.html`
- `tools/Vector Map Editor/index.html`
- `tools/Vector Map Editor/main.js`
- `tools/Vector Map Editor/README.md`
- `tools/Vector Map Editor/TOOLS_INDEX_ENTRY.html`
- `tools/Vector Map Editor/vectorMapEditor.css`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 42, inputs 28, selects 3, textareas 1, tables 0, inferred DOM controls/panels 65.
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: panel #editorCanvas - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: panel #objectList - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #documentNameInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #documentWidthInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #documentHeightInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #documentBackgroundInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: select #workspaceModeSelect - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: select #toolModeSelect - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #snapSizeInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #zoomOutButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #zoomResetButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #zoomInButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #newDocumentButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #undoButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #redoButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #saveDocumentButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #exportRuntimeButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #loadDocumentInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #toggleJsonDockButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #duplicateObjectButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #deleteObjectButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #selectedObjectNameInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #selectedObjectKindInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #selectedObjectSpaceInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #centerXInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #centerYInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #centerZInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #applyCenterButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #setCenterFromSelectionButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #autoCenterBoundsButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #autoCenterCentroidButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #autoCenterOriginButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #autoCenterSelectionButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #rotationXInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #rotationYInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #rotationZInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #rotationXDownButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #rotationXUpButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #rotationYDownButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #rotationYUpButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #rotationZDownButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #rotationZUpButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #applyRotationButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #resetRotationButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #rotatePointsDegreesInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #rotatePointsDegreesButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #spinAllPointsButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #objectStrokeInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #objectFillInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #objectLineWidthInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: select #objectColorModeSelect - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #selectedPointColorInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #applyPointColorButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #flagCollidableInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #flagDeadlyInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #flagTriggerInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #flagSpawnBlockerInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #flagProjectileBlockerInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #flagPlayerOnlyInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #flagEnemyOnlyInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: input #flagTagInput - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #jsonValidateButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #jsonApplyButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #jsonPrettyPrintButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: button #jsonRevertButton - inferred from JS DOM lookup
- `tools/Vector Map Editor/index.html`: button #newDocumentButton - New
- `tools/Vector Map Editor/index.html`: button[button] #undoButton - Undo
- `tools/Vector Map Editor/index.html`: button[button] #redoButton - Redo
- `tools/Vector Map Editor/index.html`: button #saveDocumentButton - Save JSON
- `tools/Vector Map Editor/index.html`: button #exportRuntimeButton - Export Runtime
- `tools/Vector Map Editor/index.html`: input[file] #loadDocumentInput - loadDocumentInput
- `tools/Vector Map Editor/index.html`: select #workspaceModeSelect - 2D Edit 3D Wireframe JSON Edit
- `tools/Vector Map Editor/index.html`: select #toolModeSelect - Select Point Line Polyline Polygon Move Rotate Set Center Collision Vector Pan Delete
- `tools/Vector Map Editor/index.html`: button #toggleJsonDockButton - JSON Dock
- `tools/Vector Map Editor/index.html`: input[number] #snapSizeInput - 10
- `tools/Vector Map Editor/index.html`: button[button] #zoomOutButton - Zoom Out
- `tools/Vector Map Editor/index.html`: button[button] #zoomResetButton - Reset Zoom
- `tools/Vector Map Editor/index.html`: button[button] #zoomInButton - Zoom In
- `tools/Vector Map Editor/index.html`: button #duplicateObjectButton - Duplicate
- `tools/Vector Map Editor/index.html`: button #deleteObjectButton - Delete
- `tools/Vector Map Editor/index.html`: input[text] #documentNameInput - untitled
- `tools/Vector Map Editor/index.html`: input[number] #documentWidthInput - 1280
- `tools/Vector Map Editor/index.html`: input[number] #documentHeightInput - 720
- `tools/Vector Map Editor/index.html`: input[text] #documentBackgroundInput - #000000
- `tools/Vector Map Editor/index.html`: button[button] - + Objects
- `tools/Vector Map Editor/index.html`: button[button] - + Document
- `tools/Vector Map Editor/index.html`: button[button] - + Collision Result
- `tools/Vector Map Editor/index.html`: button[button] - + Keyboard & Mouse
- `tools/Vector Map Editor/index.html`: button[button] - + Selected Object
- `tools/Vector Map Editor/index.html`: button[button] - + Center Point
- `tools/Vector Map Editor/index.html`: button[button] - + Rotation
- `tools/Vector Map Editor/index.html`: button[button] - + Appearance
- `tools/Vector Map Editor/index.html`: button[button] - + Collision Flags
- `tools/Vector Map Editor/index.html`: button[button] - + Points
- `tools/Vector Map Editor/index.html`: button #jsonValidateButton - Validate
- `tools/Vector Map Editor/index.html`: button #jsonApplyButton - Apply
- `tools/Vector Map Editor/index.html`: button #jsonPrettyPrintButton - Pretty Print
- `tools/Vector Map Editor/index.html`: button #jsonRevertButton - Revert
- `tools/Vector Map Editor/index.html`: textarea #jsonEditor - jsonEditor
- `tools/Vector Map Editor/index.html`: input[text] #selectedObjectNameInput - selectedObjectNameInput
- `tools/Vector Map Editor/index.html`: input[text] #selectedObjectKindInput - selectedObjectKindInput
- `tools/Vector Map Editor/index.html`: input[text] #selectedObjectSpaceInput - selectedObjectSpaceInput
- `tools/Vector Map Editor/index.html`: button #autoCenterBoundsButton - Bounds
- `tools/Vector Map Editor/index.html`: button #autoCenterCentroidButton - Centroid
- `tools/Vector Map Editor/index.html`: button #autoCenterOriginButton - Origin
- `tools/Vector Map Editor/index.html`: button #autoCenterSelectionButton - Selection
- `tools/Vector Map Editor/index.html`: input[number] #centerXInput - centerXInput
- `tools/Vector Map Editor/index.html`: input[number] #centerYInput - centerYInput
- `tools/Vector Map Editor/index.html`: input[number] #centerZInput - centerZInput
- `tools/Vector Map Editor/index.html`: button #applyCenterButton - Apply XYZ
- `tools/Vector Map Editor/index.html`: button #setCenterFromSelectionButton - Use Selected Point
- `tools/Vector Map Editor/index.html`: button #rotationXDownButton - -
- `tools/Vector Map Editor/index.html`: input[number] #rotationXInput - rotationXInput
- `tools/Vector Map Editor/index.html`: button #rotationXUpButton - +
- `tools/Vector Map Editor/index.html`: button #rotationYDownButton - -
- `tools/Vector Map Editor/index.html`: input[number] #rotationYInput - rotationYInput
- `tools/Vector Map Editor/index.html`: button #rotationYUpButton - +
- `tools/Vector Map Editor/index.html`: button #rotationZDownButton - -
- `tools/Vector Map Editor/index.html`: input[number] #rotationZInput - rotationZInput
- `tools/Vector Map Editor/index.html`: button #rotationZUpButton - +
- `tools/Vector Map Editor/index.html`: button #applyRotationButton - Apply Rotation
- `tools/Vector Map Editor/index.html`: button #resetRotationButton - Reset Rotation
- `tools/Vector Map Editor/index.html`: input[number] #rotatePointsDegreesInput - 15
- `tools/Vector Map Editor/index.html`: button #rotatePointsDegreesButton - Rotate Points
- `tools/Vector Map Editor/index.html`: button #spinAllPointsButton - Spin 360
- `tools/Vector Map Editor/index.html`: input[color] #objectStrokeInput - #ffffff
- `tools/Vector Map Editor/index.html`: input[text] #objectFillInput - null or #rrggbb
- `tools/Vector Map Editor/index.html`: input[number] #objectLineWidthInput - 2
- `tools/Vector Map Editor/index.html`: select #objectColorModeSelect - Object Point-to-point
- `tools/Vector Map Editor/index.html`: input[color] #selectedPointColorInput - #ffffff
- `tools/Vector Map Editor/index.html`: button #applyPointColorButton - Apply Point Color
- `tools/Vector Map Editor/index.html`: input[checkbox] #flagCollidableInput - flagCollidableInput
- `tools/Vector Map Editor/index.html`: input[checkbox] #flagDeadlyInput - flagDeadlyInput
- `tools/Vector Map Editor/index.html`: input[checkbox] #flagTriggerInput - flagTriggerInput
- `tools/Vector Map Editor/index.html`: input[checkbox] #flagSpawnBlockerInput - flagSpawnBlockerInput
- `tools/Vector Map Editor/index.html`: input[checkbox] #flagProjectileBlockerInput - flagProjectileBlockerInput
- `tools/Vector Map Editor/index.html`: input[checkbox] #flagPlayerOnlyInput - flagPlayerOnlyInput
- `tools/Vector Map Editor/index.html`: input[checkbox] #flagEnemyOnlyInput - flagEnemyOnlyInput
- `tools/Vector Map Editor/index.html`: input[text] #flagTagInput - wall / trigger / zone
- Panels/surfaces found:
  - `tools/Vector Map Editor/index.html`: .toolbar
  - `tools/Vector Map Editor/index.html`: .toolbar-group
  - `tools/Vector Map Editor/index.html`: .tools-platform-control-cluster--preview
  - `tools/Vector Map Editor/index.html`: .toolbar-readout
  - `tools/Vector Map Editor/index.html`: .toolbar-link
  - `tools/Vector Map Editor/index.html`: .sidebar
  - `tools/Vector Map Editor/index.html`: .tools-platform-resize-panel
  - `tools/Vector Map Editor/index.html`: .panel-accordion
  - `tools/Vector Map Editor/index.html`: .panel-accordion__summary
  - `tools/Vector Map Editor/index.html`: .panel-accordion__body
  - `tools/Vector Map Editor/index.html`: .object-list
  - `tools/Vector Map Editor/index.html`: .field-grid
  - `tools/Vector Map Editor/index.html`: .canvas-shell
  - `tools/Vector Map Editor/index.html`: .canvas-layer
  - `tools/Vector Map Editor/index.html`: .tools-platform-dock-panel
  - `tools/Vector Map Editor/index.html`: .single-field-grid
  - `tools/Vector Map Editor/index.html`: .flag-grid
  - `tools/Vector Map Editor/index.html`: .statusbar

## 4. Current Component/Class/Function Inventory
- `tools/Vector Map Editor/editor/VectorMapCollisionTester.js`: class VectorMapCollisionTester; function buildSegments; function distance; function isCollisionEnabled; function segmentIntersection; method test
- `tools/Vector Map Editor/editor/VectorMapDocument.js`: class VectorMapDocument; function clone; function nextId; function normalizeDegrees; method addObject; method addPointToObject; method createEmptyDocument; method duplicateObject; method getData; method getObjectById; method getObjects; method normalizeDocument; method normalizeFlags; method normalizeObject; method normalizePoint; method removeObject; method removePoint; method renameObject; method replacePoints; method setData; method setDocumentProperties; method setMode; method setObjectCenter; method setObjectFlags; method setObjectRotation; method setObjectStyle; method setPointColor; method toJSON; method updatePoint
- `tools/Vector Map Editor/editor/VectorMapEditorApp.js`: class VectorMapEditorApp; function buildPresetLoadedStatus; function normalizeDegrees; function normalizeSamplePresetPath; function parseNumericInput; function step; method applyAbsoluteRotationFromInputs; method applyHistorySnapshot; method beginPointerHistoryEntry; method cacheElements; method cancelSpinAnimation; method commitHistorySnapshot; method completePendingHistoryEntry; method createHistorySnapshot; method createInteractionController; method emitVectorMapControlReadiness; method formatRotationReadout; method getCanvasCenter; method getCanvasPosition; method getDeleteHistoryLabel; method getInteractionMeta; method getOverlayPanels; method getOverlaySidebar; method getPointerHistoryLabel; method handleOverlayAccordionToggle; method markInteracting; method performHistoryAction; method readCenterInputs; method readFlagsInputs; method readStyleInputs; method redo; method render; method resizeCanvas; method setStatus; method setUxLifecycleState; method spinSelectedObject360; method start; method syncCollisionSummary; method syncDocumentFromInputs; method syncFullscreenLayoutHeight; method syncHistoryControls; method syncJsonEditor; method syncObjectList; method syncOverlayToggleButtons; method syncSelectionFields; method syncStatus; method syncUIFromDocument; method syncUxContractState; method toggleOverlayPanel; method tryLoadPresetFromQuery; method undo; method updateCursorStatus; method updateRotationDisplayFromInputs; method wireEvents; method wireSpinButton
- `tools/Vector Map Editor/editor/VectorMapFullscreenController.js`: class VectorMapFullscreenController; method syncBodyClass; method toggle
- `tools/Vector Map Editor/editor/VectorMapHistoryManager.js`: class VectorMapHistoryManager; function clone; method canRedo; method canUndo; method push; method redo; method reset; method undo
- `tools/Vector Map Editor/editor/VectorMapInteractionController.js`: class VectorMapInteractionController; function distanceSquared; function pointInBounds; method cancelPendingShape; method clearCollisionResult; method deleteSelection; method doubleClick; method getCollisionHit; method getCollisionVector; method getHitTarget; method getHoverPoint; method getView; method pointerDown; method pointerMove; method pointerUp; method resetView; method screenToWorld; method setToolMode; method setView; method snap; method stepZoom; method zoomAtPosition
- `tools/Vector Map Editor/editor/VectorMapJsonEditor.js`: class VectorMapJsonEditor; method getValue; method prettyPrint; method revert; method setValue; method validate
- `tools/Vector Map Editor/editor/VectorMapRenderer2D.js`: class VectorMapRenderer2D; method drawAxes; method drawCenter; method drawCollisionVector; method drawGrid; method drawHover; method drawObject; method render; method toScreen
- `tools/Vector Map Editor/editor/VectorMapRenderer3D.js`: class VectorMapRenderer3D; method drawAxes; method drawCenter; method drawCollisionVector; method drawGrid; method drawObject; method project; method render
- `tools/Vector Map Editor/editor/VectorMapRuntimeExporter.js`: class VectorMapRuntimeExporter; method build; method download
- `tools/Vector Map Editor/editor/VectorMapSelectionModel.js`: class VectorMapSelectionModel; method clear; method getSelection; method getSelectionBounds; method getSelectionCenter; method hasObject; method hasPoint; method isSelectedObject; method selectObject; method selectPoint
- `tools/Vector Map Editor/editor/VectorMapSerializer.js`: class VectorMapSerializer; method download; method parseJSON; method readFile; method toPrettyJSON
- `tools/Vector Map Editor/editor/VectorMapTransformController.js`: class VectorMapTransformController; function normalizeDegrees; function rotateAroundCenter; function toRadians; method applyRotation; method autoCenterByBounds; method autoCenterByCentroid; method autoCenterByOrigin; method autoCenterBySelection; method resetRotation; method setCenter; method translateSelection
- `tools/Vector Map Editor/main.js`: function applyHostedWorkspacePayload; function bootVectorMapEditor; function readHostedVectorMapDocument; function startVectorMapEditor; method destroy; method getApi

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/vector-map-editor.schema.json`. Title: Vector Map Editor Payload. Required top-level fields: vectorMapDocument. Allowed top-level fields: vectorMapDocument. Additional top-level properties: rejected.

JSON handling signals found: Blob/object URL, download/export, JSON.parse, JSON.stringify, validate.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the current schema baseline or tool-owned normalized shape, update the local editor/preview state, and remain exportable as path/file-field JSON without embedding `imageDataUrl`.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing required fields, unsupported top-level fields, wrong nested types, and empty required editor payloads must be rejected in the tool UI before export/save/publish.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.vector-map-editor` if applicable: yes, publish normalized output under `tools.vector-map-editor` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.vector-map-editor`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/Vector Map Editor/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/Vector Map Editor/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P14: Vector Map Editor. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
