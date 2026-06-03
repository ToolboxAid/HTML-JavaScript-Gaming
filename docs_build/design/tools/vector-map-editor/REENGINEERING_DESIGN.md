# Vector Map Editor Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-10
Source folder: `toolbox/Vector Map Editor`
Publish target: `tools.vector-map-editor`

## Tool Purpose
Vector Map Editor owns vector map document import, validation, geometry editing, export, and publish to `tools.vector-map-editor`.

## Folder/Files Inspected
- `toolbox/Vector Map Editor/editor/VectorMapCollisionTester.js`
- `toolbox/Vector Map Editor/editor/VectorMapDocument.js`
- `toolbox/Vector Map Editor/editor/VectorMapEditorApp.js`
- `toolbox/Vector Map Editor/editor/VectorMapFullscreenController.js`
- `toolbox/Vector Map Editor/editor/VectorMapHistoryManager.js`
- `toolbox/Vector Map Editor/editor/VectorMapInteractionController.js`
- `toolbox/Vector Map Editor/editor/VectorMapJsonEditor.js`
- `toolbox/Vector Map Editor/editor/VectorMapRenderer2D.js`
- `toolbox/Vector Map Editor/editor/VectorMapRenderer3D.js`
- `toolbox/Vector Map Editor/editor/VectorMapRuntimeExporter.js`
- `toolbox/Vector Map Editor/editor/VectorMapSelectionModel.js`
- `toolbox/Vector Map Editor/editor/VectorMapSerializer.js`
- `toolbox/Vector Map Editor/editor/VectorMapTransformController.js`
- `toolbox/Vector Map Editor/how_to_use.html`
- `toolbox/Vector Map Editor/index.html`
- `toolbox/Vector Map Editor/main.js`
- `toolbox/Vector Map Editor/README.md`
- `toolbox/Vector Map Editor/TOOLS_INDEX_ENTRY.html`
- `toolbox/Vector Map Editor/vectorMapEditor.css`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `toolbox/Vector Map Editor/index.html`: `input[file]#loadDocumentInput` - loadDocumentInput | Chooses a local file for vector map document import/load. | Replaces or merges tool-owned vector map document only after the import validates. |
| `toolbox/Vector Map Editor/index.html`: `input[number]#snapSizeInput` - 10 | Edits the active vector map feature or geometry field. | Updates the draft vector map document field represented by `snapSizeInput` before validation. |
| `toolbox/Vector Map Editor/index.html`: `input[text]#documentNameInput` - untitled | Edits the active vector map feature or geometry field. | Updates the draft vector map document field represented by `documentNameInput` before validation. |
| `toolbox/Vector Map Editor/index.html`: `input[number]#documentWidthInput` - 1280 | Edits the active vector map feature or geometry field. | Updates the draft vector map document field represented by `documentWidthInput` before validation. |
| `toolbox/Vector Map Editor/index.html`: `input[number]#documentHeightInput` - 720 | Edits the active vector map feature or geometry field. | Updates the draft vector map document field represented by `documentHeightInput` before validation. |
| `toolbox/Vector Map Editor/index.html`: `input[text]#documentBackgroundInput` - #000000 | Edits the current vector map document through `documentBackgroundInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[text]#selectedObjectNameInput` - selectedObjectNameInput | Edits the active vector map feature or geometry field. | Updates the draft vector map document field represented by `selectedObjectNameInput` before validation. |
| `toolbox/Vector Map Editor/index.html`: `input[text]#selectedObjectKindInput` - selectedObjectKindInput | Edits the active vector map feature or geometry field. | Updates the draft vector map document field represented by `selectedObjectKindInput` before validation. |
| `toolbox/Vector Map Editor/index.html`: `input[text]#selectedObjectSpaceInput` - selectedObjectSpaceInput | Edits the current vector map document through `selectedObjectSpaceInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[number]#centerXInput` - centerXInput | Edits the current vector map document through `centerXInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[number]#centerYInput` - centerYInput | Edits the current vector map document through `centerYInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[number]#centerZInput` - centerZInput | Edits the current vector map document through `centerZInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[number]#rotationXInput` - rotationXInput | Edits the current vector map document through `rotationXInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[number]#rotationYInput` - rotationYInput | Edits the current vector map document through `rotationYInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[number]#rotationZInput` - rotationZInput | Edits the current vector map document through `rotationZInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[number]#rotatePointsDegreesInput` - 15 | Edits the current vector map document through `rotatePointsDegreesInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[color]#objectStrokeInput` - #ffffff | Edits the current vector map document through `objectStrokeInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[text]#objectFillInput` - null or #rrggbb | Edits the current vector map document through `objectFillInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[number]#objectLineWidthInput` - 2 | Edits the active vector map feature or geometry field. | Updates the draft vector map document field represented by `objectLineWidthInput` before validation. |
| `toolbox/Vector Map Editor/index.html`: `input[color]#selectedPointColorInput` - #ffffff | Edits the active vector map feature or geometry color/value field. | Updates the draft vector map document field represented by `selectedPointColorInput` before validation. |
| `toolbox/Vector Map Editor/index.html`: `input[checkbox]#flagCollidableInput` - flagCollidableInput | Edits the current vector map document through `flagCollidableInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[checkbox]#flagDeadlyInput` - flagDeadlyInput | Edits the current vector map document through `flagDeadlyInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[checkbox]#flagTriggerInput` - flagTriggerInput | Edits the current vector map document through `flagTriggerInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[checkbox]#flagSpawnBlockerInput` - flagSpawnBlockerInput | Edits the current vector map document through `flagSpawnBlockerInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[checkbox]#flagProjectileBlockerInput` - flagProjectileBlockerInput | Edits the current vector map document through `flagProjectileBlockerInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[checkbox]#flagPlayerOnlyInput` - flagPlayerOnlyInput | Edits the current vector map document through `flagPlayerOnlyInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[checkbox]#flagEnemyOnlyInput` - flagEnemyOnlyInput | Edits the current vector map document through `flagEnemyOnlyInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `input[text]#flagTagInput` - wall / trigger / zone | Edits the current vector map document through `flagTagInput`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `button#newDocumentButton` - New | Creates or resets a draft vector map document. | Initializes tool-owned vector map document data; tools.vector-map-editor is unchanged until validation and publish/export. |
| `toolbox/Vector Map Editor/index.html`: `button[button]#undoButton` - Undo | Triggers the current vector map document UI action for `Undo`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]#redoButton` - Redo | Triggers the current vector map document UI action for `Redo`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#saveDocumentButton` - Save JSON | Exports the validated vector map document. | Serializes the validated vector map document as the tools.vector-map-editor output shape. |
| `toolbox/Vector Map Editor/index.html`: `button#exportRuntimeButton` - Export Runtime | Exports the validated vector map document. | Serializes the validated vector map document as the tools.vector-map-editor output shape. |
| `toolbox/Vector Map Editor/index.html`: `select#workspaceModeSelect` - 2D Edit 3D Wireframe JSON Edit | Edits the current vector map document through `workspaceModeSelect`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `select#toolModeSelect` - Select Point Line Polyline Polygon Move Rotate Set Center Collision Vector Pan Delete | Edits the current vector map document through `toolModeSelect`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `button#toggleJsonDockButton` - JSON Dock | Triggers the current vector map document UI action for `JSON Dock`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]#zoomOutButton` - Zoom Out | Triggers the current vector map document UI action for `Zoom Out`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]#zoomResetButton` - Reset Zoom | Creates or resets a draft vector map document. | Initializes tool-owned vector map document data; tools.vector-map-editor is unchanged until validation and publish/export. |
| `toolbox/Vector Map Editor/index.html`: `button[button]#zoomInButton` - Zoom In | Triggers the current vector map document UI action for `Zoom In`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#duplicateObjectButton` - Duplicate | Duplicates the selected vector map feature or geometry. | Adds a copied vector map feature or geometry to the draft vector map document; publish waits for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#deleteObjectButton` - Delete | Removes or clears the selected vector map feature or geometry. | Deletes that data from the draft vector map document; publish waits for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]` - + Objects | Triggers the current vector map document UI action for `+ Objects`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]` - + Document | Triggers the current vector map document UI action for `+ Document`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]` - + Collision Result | Triggers the current vector map document UI action for `+ Collision Result`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]` - + Keyboard &amp; Mouse | Triggers the current vector map document UI action for `+ Keyboard &amp; Mouse`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]` - + Selected Object | Triggers the current vector map document UI action for `+ Selected Object`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]` - + Center Point | Triggers the current vector map document UI action for `+ Center Point`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]` - + Rotation | Triggers the current vector map document UI action for `+ Rotation`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]` - + Appearance | Triggers the current vector map document UI action for `+ Appearance`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]` - + Collision Flags | Triggers the current vector map document UI action for `+ Collision Flags`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button[button]` - + Points | Triggers the current vector map document UI action for `+ Points`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#jsonValidateButton` - Validate | Validates the current vector map document. | Updates validation status; blocks tools.vector-map-editor output when errors are present. |
| `toolbox/Vector Map Editor/index.html`: `button#jsonApplyButton` - Apply | Publishes or applies the validated vector map document. | Writes the validated output shape to tools.vector-map-editor. |
| `toolbox/Vector Map Editor/index.html`: `button#jsonPrettyPrintButton` - Pretty Print | Triggers the current vector map document UI action for `Pretty Print`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#jsonRevertButton` - Revert | Triggers the current vector map document UI action for `Revert`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `textarea#jsonEditor` - jsonEditor | Edits or loads vector map document text. | Parses into the tool-owned vector map document; malformed or schema-invalid content must not publish. |
| `toolbox/Vector Map Editor/index.html`: `button#autoCenterBoundsButton` - Bounds | Triggers the current vector map document UI action for `Bounds`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#autoCenterCentroidButton` - Centroid | Triggers the current vector map document UI action for `Centroid`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#autoCenterOriginButton` - Origin | Triggers the current vector map document UI action for `Origin`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#autoCenterSelectionButton` - Selection | Triggers the current vector map document UI action for `Selection`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#applyCenterButton` - Apply XYZ | Publishes or applies the validated vector map document. | Writes the validated output shape to tools.vector-map-editor. |
| `toolbox/Vector Map Editor/index.html`: `button#setCenterFromSelectionButton` - Use Selected Point | Publishes or applies the validated vector map document. | Writes the validated output shape to tools.vector-map-editor. |
| `toolbox/Vector Map Editor/index.html`: `button#rotationXDownButton` - - | Triggers the current vector map document UI action for `-`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#rotationXUpButton` - + | Triggers the current vector map document UI action for `+`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#rotationYDownButton` - - | Triggers the current vector map document UI action for `-`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#rotationYUpButton` - + | Triggers the current vector map document UI action for `+`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#rotationZDownButton` - - | Triggers the current vector map document UI action for `-`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#rotationZUpButton` - + | Triggers the current vector map document UI action for `+`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#applyRotationButton` - Apply Rotation | Publishes or applies the validated vector map document. | Writes the validated output shape to tools.vector-map-editor. |
| `toolbox/Vector Map Editor/index.html`: `button#resetRotationButton` - Reset Rotation | Creates or resets a draft vector map document. | Initializes tool-owned vector map document data; tools.vector-map-editor is unchanged until validation and publish/export. |
| `toolbox/Vector Map Editor/index.html`: `button#rotatePointsDegreesButton` - Rotate Points | Triggers the current vector map document UI action for `Rotate Points`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `button#spinAllPointsButton` - Spin 360 | Triggers the current vector map document UI action for `Spin 360`. | May update draft vector map document data; tools.vector-map-editor publish must wait for validation. |
| `toolbox/Vector Map Editor/index.html`: `select#objectColorModeSelect` - Object Point-to-point | Edits the current vector map document through `objectColorModeSelect`. | Updates draft vector map document data and requires validation before tools.vector-map-editor publish. |
| `toolbox/Vector Map Editor/index.html`: `button#applyPointColorButton` - Apply Point Color | Publishes or applies the validated vector map document. | Writes the validated output shape to tools.vector-map-editor. |

## Panels And Surfaces Found
- `toolbox/Vector Map Editor/how_to_use.html`: `.tools-platform-surface`
- `toolbox/Vector Map Editor/index.html`: `.canvas-layer`
- `toolbox/Vector Map Editor/index.html`: `.canvas-shell`
- `toolbox/Vector Map Editor/index.html`: `.field-grid`
- `toolbox/Vector Map Editor/index.html`: `.flag-grid`
- `toolbox/Vector Map Editor/index.html`: `.json-editor`
- `toolbox/Vector Map Editor/index.html`: `.object-list`
- `toolbox/Vector Map Editor/index.html`: `.panel-accordion`
- `toolbox/Vector Map Editor/index.html`: `.panel-accordion__body`
- `toolbox/Vector Map Editor/index.html`: `.panel-accordion__summary`
- `toolbox/Vector Map Editor/index.html`: `.sidebar`
- `toolbox/Vector Map Editor/index.html`: `.single-field-grid`
- `toolbox/Vector Map Editor/index.html`: `.toolbar`
- `toolbox/Vector Map Editor/index.html`: `.toolbar-group`
- `toolbox/Vector Map Editor/index.html`: `.toolbar-link`
- `toolbox/Vector Map Editor/index.html`: `.toolbar-readout`
- `toolbox/Vector Map Editor/index.html`: `.tools-platform-control-cluster--preview`
- `toolbox/Vector Map Editor/index.html`: `.tools-platform-dock-panel`
- `toolbox/Vector Map Editor/index.html`: `.tools-platform-resize-panel`
- `toolbox/Vector Map Editor/index.html`: `.vector-editor-page`
- `toolbox/Vector Map Editor/index.html`: `.vector-editor-page-root`
- `toolbox/Vector Map Editor/index.html`: `.zoom-controls`

## Current Component/Class/Function Inventory
- `toolbox/Vector Map Editor/editor/VectorMapCollisionTester.js`: VectorMapCollisionTester; buildSegments; distance; isCollisionEnabled; segmentIntersection; test
- `toolbox/Vector Map Editor/editor/VectorMapDocument.js`: VectorMapDocument; addObject; addPointToObject; clone; createEmptyDocument; duplicateObject; getData; getObjectById; getObjects; nextId; normalizeDegrees; normalizeDocument; normalizeFlags; normalizeObject; normalizePoint; removeObject; removePoint; renameObject; replacePoints; setData; setDocumentProperties; setMode; setObjectCenter; setObjectFlags; setObjectRotation; setObjectStyle; setPointColor; toJSON; updatePoint
- `toolbox/Vector Map Editor/editor/VectorMapEditorApp.js`: VectorMapEditorApp; applyAbsoluteRotationFromInputs; applyHistorySnapshot; beginPointerHistoryEntry; buildPresetLoadedStatus; cacheElements; cancelSpinAnimation; commitHistorySnapshot; completePendingHistoryEntry; createHistorySnapshot; createInteractionController; emitVectorMapControlReadiness; formatRotationReadout; getCanvasCenter; getCanvasPosition; getDeleteHistoryLabel; getInteractionMeta; getOverlayPanels; getOverlaySidebar; getPointerHistoryLabel; handleOverlayAccordionToggle; markInteracting; normalizeDegrees; normalizeSamplePresetPath; parseNumericInput; performHistoryAction; readCenterInputs; readFlagsInputs; readStyleInputs; redo; render; resizeCanvas; setStatus; setUxLifecycleState; spinSelectedObject360; start; step; syncCollisionSummary; syncDocumentFromInputs; syncFullscreenLayoutHeight; syncHistoryControls; syncJsonEditor; syncObjectList; syncOverlayToggleButtons; syncSelectionFields; syncStatus; syncUIFromDocument; syncUxContractState; toggleOverlayPanel; tryLoadPresetFromQuery; undo; updateCursorStatus; updateRotationDisplayFromInputs; wireEvents; wireSpinButton
- `toolbox/Vector Map Editor/editor/VectorMapFullscreenController.js`: VectorMapFullscreenController; syncBodyClass; toggle
- `toolbox/Vector Map Editor/editor/VectorMapHistoryManager.js`: VectorMapHistoryManager; canRedo; canUndo; clone; push; redo; reset; undo
- `toolbox/Vector Map Editor/editor/VectorMapInteractionController.js`: VectorMapInteractionController; cancelPendingShape; clearCollisionResult; deleteSelection; distanceSquared; doubleClick; getCollisionHit; getCollisionVector; getHitTarget; getHoverPoint; getView; pointInBounds; pointerDown; pointerMove; pointerUp; resetView; screenToWorld; setToolMode; setView; snap; stepZoom; zoomAtPosition
- `toolbox/Vector Map Editor/editor/VectorMapJsonEditor.js`: VectorMapJsonEditor; getValue; prettyPrint; revert; setValue; validate
- `toolbox/Vector Map Editor/editor/VectorMapRenderer2D.js`: VectorMapRenderer2D; drawAxes; drawCenter; drawCollisionVector; drawGrid; drawHover; drawObject; render; toScreen
- `toolbox/Vector Map Editor/editor/VectorMapRenderer3D.js`: VectorMapRenderer3D; drawAxes; drawCenter; drawCollisionVector; drawGrid; drawObject; project; render
- `toolbox/Vector Map Editor/editor/VectorMapRuntimeExporter.js`: VectorMapRuntimeExporter; build; download
- `toolbox/Vector Map Editor/editor/VectorMapSelectionModel.js`: VectorMapSelectionModel; clear; getSelection; getSelectionBounds; getSelectionCenter; hasObject; hasPoint; isSelectedObject; selectObject; selectPoint
- `toolbox/Vector Map Editor/editor/VectorMapSerializer.js`: VectorMapSerializer; download; parseJSON; readFile; toPrettyJSON
- `toolbox/Vector Map Editor/editor/VectorMapTransformController.js`: VectorMapTransformController; applyRotation; autoCenterByBounds; autoCenterByCentroid; autoCenterByOrigin; autoCenterBySelection; normalizeDegrees; resetRotation; rotateAroundCenter; setCenter; toRadians; translateSelection
- `toolbox/Vector Map Editor/main.js`: applyHostedWorkspacePayload; bootVectorMapEditor; getApi; readHostedVectorMapDocument; registerToolBootContract; startVectorMapEditor

## Target Controls
Keep:
- geometry editing controls
- map preview controls
- import/export controls

Remove or rename:
- unvalidated geometry publish paths

Add:
- Validate Vector Map
- Publish `tools.vector-map-editor`
- feature/geometry diagnostics

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for vector map document. Current contract baseline: `toolbox/schemas/tools/vector-map-editor.schema.json` (Vector Map Editor Payload).
Required keys: `vectorMapDocument`.
Optional keys: none identified for this contract.

Tool-owned JSON responsibilities:
- import/load: parse incoming vector map document and reject it before mutation when invalid
- validate: apply the current vector map document contract before export, copy, or publish
- edit/process: mutate only vector map document fields owned by Vector Map Editor
- export/save: serialize the validated vector map document as the tools.vector-map-editor output shape
- publish: write only the validated tools.vector-map-editor value produced by Vector Map Editor
- copy/create payload: create copied payload text from the validated vector map document, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts the schema-defined vector map document
- keeps feature/geometry edits inside the vector map payload
- publishes only validated vector map JSON

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `vector-map-editor.schema.json`
- invalid feature/geometry data
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.vector-map-editor = {
  "vectorMapDocument": "jsonValue"
}
```

## Playwright Expectations
- load `toolbox/Vector Map Editor/index.html` without console errors
- edit geometry and confirm output JSON updates
- reject invalid vector map JSON

## Manual Test Expectations
- Open `toolbox/Vector Map Editor/index.html` and confirm geometry controls render.
- Edit a vector feature/geometry, validate, export, and re-import.
- Try malformed JSON and invalid geometry; each must block publish.

## Known Gaps
- Geometry validation should identify the failing feature.
- Publish should be gated by map validation.

## Rebuild Order Priority
core-10: rebuild in the core tool lane after earlier priorities are stable.
