# Skin Editor Reengineering Design

Task: PR_26124_024
Classification: rebuildable tool
Core priority: core-06
Source folder: `tools/Skin Editor`
Publish target: `tools.skin-editor`

## Tool Purpose
Skin Editor owns primitive skin import, validation, editing, export, and publish to `tools.skin-editor`.

## Folder/Files Inspected
- `tools/Skin Editor/how_to_use.html`
- `tools/Skin Editor/index.html`
- `tools/Skin Editor/main.js`
- `tools/Skin Editor/README.md`
- `tools/Skin Editor/skinEditor.css`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/Skin Editor/index.html`: `input[file]#skinEditorImportInput` - skinEditorImportInput | Chooses a local file for skin payload import/load. | Replaces or merges tool-owned skin payload only after the import validates. |
| `tools/Skin Editor/index.html`: `input[text]#skinEditorNewShapeName` - example: paddle, hudText, hudPanel | Edits the active skin primitive or property field. | Updates the draft skin payload field represented by `skinEditorNewShapeName` before validation. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorLoadButton` - Load Active Skin | Starts skin payload import/load. | Reads incoming JSON into the tool-owned skin payload only after validation succeeds. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorSaveOverrideButton` - Apply Skin Override | Exports the validated skin payload. | Serializes the validated skin payload as the tools.skin-editor output shape. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorClearOverrideButton` - Clear Override | Removes or clears the selected skin primitive or property. | Deletes that data from the draft skin payload; publish waits for validation. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorExportButton` - Export Skin JSON | Exports the validated skin payload. | Serializes the validated skin payload as the tools.skin-editor output shape. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorOpenGameButton` - Open Game | Starts skin payload import/load. | Reads incoming JSON into the tool-owned skin payload only after validation succeeds. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorHowToUseButton` - How to Use | Publishes or applies the validated skin payload. | Writes the validated output shape to tools.skin-editor. |
| `tools/Skin Editor/index.html`: `select#skinEditorNewShapeType` - Arc Capsule Circle HUD Color Line Oval Polygon Rectangle Ring Sector Square Star Triangle Walls (1-4) -------------------- Flattened | Edits the active skin primitive or property field. | Updates the draft skin payload field represented by `skinEditorNewShapeType` before validation. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorAddShapeButton` - Add | Adds a new skin primitive or property. | Appends schema-owned data to the draft skin payload; publish waits for validation. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorRenameObjectButton` - Rename | Renames the selected skin primitive or property. | Updates the draft skin payload name/id field before validation. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorDeleteObjectButton` - Delete | Removes or clears the selected skin primitive or property. | Deletes that data from the draft skin payload; publish waits for validation. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorFlattenObjectsButton` - Flatten | Triggers the current skin payload UI action for `Flatten`. | May update draft skin payload data; tools.skin-editor publish must wait for validation. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorMoveObjectUpButton` - Move Up | Triggers the current skin payload UI action for `Move Up`. | May update draft skin payload data; tools.skin-editor publish must wait for validation. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorMoveObjectDownButton` - Move Down | Triggers the current skin payload UI action for `Move Down`. | May update draft skin payload data; tools.skin-editor publish must wait for validation. |
| `tools/Skin Editor/index.html`: `textarea#skinEditorInput` - skinEditorInput | Edits the current skin payload through `skinEditorInput`. | Updates draft skin payload data and requires validation before tools.skin-editor publish. |
| `tools/Skin Editor/index.html`: `button[button]#skinEditorSyncVisualButton` - Sync Visual From JSON | Triggers the current skin payload UI action for `Sync Visual From JSON`. | May update draft skin payload data; tools.skin-editor publish must wait for validation. |

## Panels And Surfaces Found
- `tools/Skin Editor/how_to_use.html`: `.tools-platform-surface`
- `tools/Skin Editor/index.html`: `.app-shell`
- `tools/Skin Editor/index.html`: `.debug-tool-panel`
- `tools/Skin Editor/index.html`: `.debug-tool-shell`
- `tools/Skin Editor/index.html`: `.panel`
- `tools/Skin Editor/index.html`: `.skin-editor-canvas-panel`
- `tools/Skin Editor/index.html`: `.skin-editor-canvas-wrap`
- `tools/Skin Editor/index.html`: `.skin-editor-chip`
- `tools/Skin Editor/index.html`: `.skin-editor-column`
- `tools/Skin Editor/index.html`: `.skin-editor-column--left`
- `tools/Skin Editor/index.html`: `.skin-editor-column--right`
- `tools/Skin Editor/index.html`: `.skin-editor-context`
- `tools/Skin Editor/index.html`: `.skin-editor-empty`
- `tools/Skin Editor/index.html`: `.skin-editor-field`
- `tools/Skin Editor/index.html`: `.skin-editor-json`
- `tools/Skin Editor/index.html`: `.skin-editor-list`
- `tools/Skin Editor/index.html`: `.skin-editor-object-list`
- `tools/Skin Editor/index.html`: `.skin-editor-object-order-actions`
- `tools/Skin Editor/index.html`: `.skin-editor-palette-list`
- `tools/Skin Editor/index.html`: `.skin-editor-preview-canvas`
- `tools/Skin Editor/index.html`: `.skin-editor-section`
- `tools/Skin Editor/index.html`: `.skin-editor-section--shape-add`
- `tools/Skin Editor/index.html`: `.skin-editor-shape-add-row`
- `tools/Skin Editor/index.html`: `.skin-editor-workbench`

## Current Component/Class/Function Inventory
- `tools/Skin Editor/main.js`: addShapeFromControls; applyPaletteColorToSelectedObject; applySkinOverride; bindEvents; bootSkinEditor; buildNormalizedSkinDocument; clampNumericProperty; clearSkinOverride; createBasicField; createShapePreset; deepClone; deleteObjectFromControls; downloadTextFile; drawObjectInPreview; drawRegularPolygonPath; drawSelectedObjectPreview; drawStarPath; ensureSelectedObjectKey; ensureUniqueObjectKey; exportSkinJson; extractPresetPayload; extractRawSkinForValidation; flattenSelectedObjects; formatSummary; getApi; getGameOptionById; getObjectKeys; getRawSkinShapeIssues; getSelectedGameOption; getSelectedObjectColorPropertyKeys; getSelectedObjectColorValue; getSelectedObjectKeysInObjectOrder; getSelectedShapeTypeValue; getSkinShapeIssues; getValidSelectedObjectKeys; hasObjectKey; importSkinJsonFromFile; inferShapeTypeFromObjectKey; inferShapeTypeFromSelectedObject; isFlattenIneligibleObjectKey; isPositiveDimensionKey; loadActiveSkinForSelectedGame; loadPresetFromQuery; moveSelectedObjectByOffset; normalizeObjectKey; normalizeObjectKeyPreserveCase; normalizeSamplePresetPath; normalizeText; numberStep; openSelectedGame; parseEditorSkin; parseHexForPicker; registerToolBootContract; renameObjectFromControls; renderObjectControls; renderObjectList; renderPaletteList; renderWorkbench; resolveActiveGameOption; resolveCurrentSkinDocument; sanitizePositiveDimensionsInDocument; selectObjectKey; setCurrentSkinDocument; setObjectPropertyValue; setObjectSelected; setPreviewNote; setSelectedObjectColorLabel; setSelectedObjectNameLabel; setStatus; setSummary; syncSelectedObjectUiFromSelection; syncShapeTypeControlFromSelection; syncVisualFromJson; toDownloadName; toObject; toObjectCentricSkinDocument; updateAddShapeButtonState; updateContextChips; updateEditorFromState; updateFlattenButtonState; updateObjectOrderButtonState; wrapAngleDegrees

## Target Controls
Keep:
- skin primitive controls
- property editing controls
- preview/export controls

Remove or rename:
- implicit publish from preview-only changes

Add:
- Validate Skin
- Publish `tools.skin-editor`
- primitive/property validation messages

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for skin payload. Current contract baseline: `tools/schemas/tools/skin-editor.schema.json` (skin-editor Payload).
Required keys: none assigned for this reference folder.
Optional keys: `projectId`, `skin`.

Tool-owned JSON responsibilities:
- import/load: parse incoming skin payload and reject it before mutation when invalid
- validate: apply the current skin payload contract before export, copy, or publish
- edit/process: mutate only skin payload fields owned by Skin Editor
- export/save: serialize the validated skin payload as the tools.skin-editor output shape
- publish: write only the validated tools.skin-editor value produced by Skin Editor
- copy/create payload: create copied payload text from the validated skin payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts the schema-defined skin payload
- keeps primitive edits inside the tool-owned skin object
- publishes only validated skin JSON

## Invalid JSON Rejection Behavior
- malformed JSON
- payload shape outside `skin-editor.schema.json`
- missing required skin primitive/property data
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.skin-editor = {
  "projectId": "string", // optional
  "skin": "jsonValue" // optional
}
```

## Playwright Expectations
- load `tools/Skin Editor/index.html` without console errors
- edit a primitive/property and confirm output updates
- reject invalid skin JSON

## Manual Test Expectations
- Open `tools/Skin Editor/index.html` and confirm the skin editor and preview surfaces render.
- Edit a skin primitive/property, validate, export, and re-import.
- Try malformed JSON and an invalid primitive/property; each must block publish.

## Known Gaps
- Preview edits need explicit validation before publish.
- Primitive validation should identify the exact failing field.

## Rebuild Order Priority
core-06: rebuild in the core tool lane after earlier priorities are stable.
