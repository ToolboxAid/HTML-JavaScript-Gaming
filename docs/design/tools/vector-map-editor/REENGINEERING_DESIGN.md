# Vector Map Editor Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: rebuildable tool
Core priority: core-10
Source folder: `tools/Vector Map Editor`
Publish target: `tools.vector-map-editor`

## Tool Purpose
Vector map authoring. Vector Map Editor owns `vectorMapDocument`, object geometry, transforms, collision preview/export, validation, and publish to `tools.vector-map-editor`.

## Exact Folder/Files Inspected
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

## Exact Current Controls Found
- `tools/Vector Map Editor/index.html`: `button#newDocumentButton` - New
- `tools/Vector Map Editor/index.html`: `button[button]#undoButton` - Undo
- `tools/Vector Map Editor/index.html`: `button[button]#redoButton` - Redo
- `tools/Vector Map Editor/index.html`: `button#saveDocumentButton` - Save JSON
- `tools/Vector Map Editor/index.html`: `button#exportRuntimeButton` - Export Runtime
- `tools/Vector Map Editor/index.html`: `input[file]#loadDocumentInput` - loadDocumentInput
- `tools/Vector Map Editor/index.html`: `select#workspaceModeSelect` - 2D Edit 3D Wireframe JSON Edit
- `tools/Vector Map Editor/index.html`: `select#toolModeSelect` - Select Point Line Polyline Polygon Move Rotate Set Center Collision Vector Pan Delete
- `tools/Vector Map Editor/index.html`: `button#toggleJsonDockButton` - JSON Dock
- `tools/Vector Map Editor/index.html`: `input[number]#snapSizeInput` - snapSizeInput
- `tools/Vector Map Editor/index.html`: `button[button]#zoomOutButton` - Zoom Out
- `tools/Vector Map Editor/index.html`: `button[button]#zoomResetButton` - Reset Zoom
- `tools/Vector Map Editor/index.html`: `button[button]#zoomInButton` - Zoom In
- `tools/Vector Map Editor/index.html`: `button#duplicateObjectButton` - Duplicate
- `tools/Vector Map Editor/index.html`: `button#deleteObjectButton` - Delete
- `tools/Vector Map Editor/index.html`: `input[text]#documentNameInput` - documentNameInput
- `tools/Vector Map Editor/index.html`: `input[number]#documentWidthInput` - documentWidthInput
- `tools/Vector Map Editor/index.html`: `input[number]#documentHeightInput` - documentHeightInput
- `tools/Vector Map Editor/index.html`: `input[text]#documentBackgroundInput` - documentBackgroundInput
- `tools/Vector Map Editor/index.html`: `button[button]` - + Objects
- `tools/Vector Map Editor/index.html`: `button[button]` - + Document
- `tools/Vector Map Editor/index.html`: `button[button]` - + Collision Result
- `tools/Vector Map Editor/index.html`: `button[button]` - + Keyboard & Mouse
- `tools/Vector Map Editor/index.html`: `button[button]` - + Selected Object
- `tools/Vector Map Editor/index.html`: `button[button]` - + Center Point
- `tools/Vector Map Editor/index.html`: `button[button]` - + Rotation
- `tools/Vector Map Editor/index.html`: `button[button]` - + Appearance
- `tools/Vector Map Editor/index.html`: `button[button]` - + Collision Flags
- `tools/Vector Map Editor/index.html`: `button[button]` - + Points
- `tools/Vector Map Editor/index.html`: `button#jsonValidateButton` - Validate
- `tools/Vector Map Editor/index.html`: `button#jsonApplyButton` - Apply
- `tools/Vector Map Editor/index.html`: `button#jsonPrettyPrintButton` - Pretty Print
- `tools/Vector Map Editor/index.html`: `button#jsonRevertButton` - Revert
- `tools/Vector Map Editor/index.html`: `textarea#jsonEditor` - jsonEditor
- `tools/Vector Map Editor/index.html`: `input[text]#selectedObjectNameInput` - selectedObjectNameInput
- `tools/Vector Map Editor/index.html`: `input[text]#selectedObjectKindInput` - selectedObjectKindInput
- `tools/Vector Map Editor/index.html`: `input[text]#selectedObjectSpaceInput` - selectedObjectSpaceInput
- `tools/Vector Map Editor/index.html`: `button#autoCenterBoundsButton` - Bounds
- `tools/Vector Map Editor/index.html`: `button#autoCenterCentroidButton` - Centroid
- `tools/Vector Map Editor/index.html`: `button#autoCenterOriginButton` - Origin
- `tools/Vector Map Editor/index.html`: `button#autoCenterSelectionButton` - Selection
- `tools/Vector Map Editor/index.html`: `input[number]#centerXInput` - centerXInput
- `tools/Vector Map Editor/index.html`: `input[number]#centerYInput` - centerYInput
- `tools/Vector Map Editor/index.html`: `input[number]#centerZInput` - centerZInput
- `tools/Vector Map Editor/index.html`: `button#applyCenterButton` - Apply XYZ
- `tools/Vector Map Editor/index.html`: `button#setCenterFromSelectionButton` - Use Selected Point
- `tools/Vector Map Editor/index.html`: `button#rotationXDownButton` - -
- `tools/Vector Map Editor/index.html`: `input[number]#rotationXInput` - rotationXInput
- `tools/Vector Map Editor/index.html`: `button#rotationXUpButton` - +
- `tools/Vector Map Editor/index.html`: `button#rotationYDownButton` - -
- `tools/Vector Map Editor/index.html`: `input[number]#rotationYInput` - rotationYInput
- `tools/Vector Map Editor/index.html`: `button#rotationYUpButton` - +
- `tools/Vector Map Editor/index.html`: `button#rotationZDownButton` - -
- `tools/Vector Map Editor/index.html`: `input[number]#rotationZInput` - rotationZInput
- `tools/Vector Map Editor/index.html`: `button#rotationZUpButton` - +
- `tools/Vector Map Editor/index.html`: `button#applyRotationButton` - Apply Rotation
- `tools/Vector Map Editor/index.html`: `button#resetRotationButton` - Reset Rotation
- `tools/Vector Map Editor/index.html`: `input[number]#rotatePointsDegreesInput` - rotatePointsDegreesInput
- `tools/Vector Map Editor/index.html`: `button#rotatePointsDegreesButton` - Rotate Points
- `tools/Vector Map Editor/index.html`: `button#spinAllPointsButton` - Spin 360
- `tools/Vector Map Editor/index.html`: `input[color]#objectStrokeInput` - objectStrokeInput
- `tools/Vector Map Editor/index.html`: `input[text]#objectFillInput` - null or #rrggbb
- `tools/Vector Map Editor/index.html`: `input[number]#objectLineWidthInput` - objectLineWidthInput
- `tools/Vector Map Editor/index.html`: `select#objectColorModeSelect` - Object Point-to-point
- `tools/Vector Map Editor/index.html`: `input[color]#selectedPointColorInput` - selectedPointColorInput
- `tools/Vector Map Editor/index.html`: `button#applyPointColorButton` - Apply Point Color
- `tools/Vector Map Editor/index.html`: `input[checkbox]#flagCollidableInput` - flagCollidableInput
- `tools/Vector Map Editor/index.html`: `input[checkbox]#flagDeadlyInput` - flagDeadlyInput
- `tools/Vector Map Editor/index.html`: `input[checkbox]#flagTriggerInput` - flagTriggerInput
- `tools/Vector Map Editor/index.html`: `input[checkbox]#flagSpawnBlockerInput` - flagSpawnBlockerInput
- `tools/Vector Map Editor/index.html`: `input[checkbox]#flagProjectileBlockerInput` - flagProjectileBlockerInput
- `tools/Vector Map Editor/index.html`: `input[checkbox]#flagPlayerOnlyInput` - flagPlayerOnlyInput
- `tools/Vector Map Editor/index.html`: `input[checkbox]#flagEnemyOnlyInput` - flagEnemyOnlyInput
- `tools/Vector Map Editor/index.html`: `input[text]#flagTagInput` - wall / trigger / zone

## Current Panels And Surfaces Found
- `tools/Vector Map Editor/index.html`: `.toolbar`
- `tools/Vector Map Editor/index.html`: `.toolbar-group`
- `tools/Vector Map Editor/index.html`: `.tools-platform-control-cluster--preview`
- `tools/Vector Map Editor/index.html`: `.toolbar-readout`
- `tools/Vector Map Editor/index.html`: `.toolbar-link`
- `tools/Vector Map Editor/index.html`: `.sidebar`
- `tools/Vector Map Editor/index.html`: `.tools-platform-resize-panel`
- `tools/Vector Map Editor/index.html`: `.panel-accordion`
- `tools/Vector Map Editor/index.html`: `.panel-accordion__summary`
- `tools/Vector Map Editor/index.html`: `.panel-accordion__body`
- `tools/Vector Map Editor/index.html`: `.object-list`
- `tools/Vector Map Editor/index.html`: `.field-grid`
- `tools/Vector Map Editor/index.html`: `.canvas-shell`
- `tools/Vector Map Editor/index.html`: `.canvas-layer`
- `tools/Vector Map Editor/index.html`: `.tools-platform-dock-panel`
- `tools/Vector Map Editor/index.html`: `.single-field-grid`
- `tools/Vector Map Editor/index.html`: `.flag-grid`
- `tools/Vector Map Editor/index.html`: `.statusbar`

## Exact Current Functions And Classes
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

## Target Controls
Keep:
- map metadata controls
- object list controls
- geometry editing controls
- style/transform controls
- 2D/3D preview surfaces
- JSON editor/export controls

Remove or rename:
- runtime/game assumptions from the contract authoring path

Add:
- Validate Vector Map Document
- Publish `tools.vector-map-editor`
- point/style/fill diagnostics

## JSON Contract Owned By This Tool
Owned JSON is the vector-map-editor payload. Required field is `vectorMapDocument`; no other top-level fields are allowed. The vector map document owns map dimensions, background, objects, object kinds, styles, transforms, and points.

## Publish Output
Publish only to `tools.vector-map-editor`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing `vectorMapDocument`
- nonnumeric map dimensions or points
- objects without name/kind/style/points
- closed objects without fill
- unsupported top-level fields

## Manual Test Plan
- Create or load a vector map document.
- Add/edit an object, change style/points, and export JSON.
- Try missing `vectorMapDocument`, nonnumeric points, and closed objects without fill; publish must stay blocked.
