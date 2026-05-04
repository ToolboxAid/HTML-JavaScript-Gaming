# Skin Editor Reengineering Design

Task: PR_26124_022-tighten-tool-design-docs
Classification: rebuildable tool
Core priority: core-06
Source folder: `tools/Skin Editor`
Publish target: `tools.skin-editor`

## Tool Purpose
Primitive skin editing. This tool owns `skin` plus optional `projectId`, object ordering, color/style editing, export, and publish to `tools.skin-editor`.

## Exact Folder/Files Inspected
- `tools/Skin Editor/how_to_use.html`
- `tools/Skin Editor/index.html`
- `tools/Skin Editor/main.js`
- `tools/Skin Editor/README.md`
- `tools/Skin Editor/skinEditor.css`

## Exact Current Controls Found
- `tools/Skin Editor/index.html`: `button[button]#skinEditorLoadButton` - Load Active Skin
- `tools/Skin Editor/index.html`: `button[button]#skinEditorSaveOverrideButton` - Apply Skin Override
- `tools/Skin Editor/index.html`: `button[button]#skinEditorClearOverrideButton` - Clear Override
- `tools/Skin Editor/index.html`: `input[file]#skinEditorImportInput` - skinEditorImportInput
- `tools/Skin Editor/index.html`: `button[button]#skinEditorExportButton` - Export Skin JSON
- `tools/Skin Editor/index.html`: `button[button]#skinEditorOpenGameButton` - Open Game
- `tools/Skin Editor/index.html`: `button[button]#skinEditorHowToUseButton` - How to Use
- `tools/Skin Editor/index.html`: `select#skinEditorNewShapeType` - Arc Capsule Circle HUD Color Line Oval Polygon Rectangle Ring Sector Square Star Triangle Walls (1-4) ---------------...
- `tools/Skin Editor/index.html`: `input[text]#skinEditorNewShapeName` - example: paddle, hudText, hudPanel
- `tools/Skin Editor/index.html`: `button[button]#skinEditorAddShapeButton` - Add
- `tools/Skin Editor/index.html`: `button[button]#skinEditorRenameObjectButton` - Rename
- `tools/Skin Editor/index.html`: `button[button]#skinEditorDeleteObjectButton` - Delete
- `tools/Skin Editor/index.html`: `button[button]#skinEditorFlattenObjectsButton` - Flatten
- `tools/Skin Editor/index.html`: `button[button]#skinEditorMoveObjectUpButton` - Move Up
- `tools/Skin Editor/index.html`: `button[button]#skinEditorMoveObjectDownButton` - Move Down
- `tools/Skin Editor/index.html`: `textarea#skinEditorInput` - skinEditorInput
- `tools/Skin Editor/index.html`: `button[button]#skinEditorSyncVisualButton` - Sync Visual From JSON
- `tools/Skin Editor/main.js`: `skinEditorLoadButton` via loadButton
- `tools/Skin Editor/main.js`: `skinEditorSaveOverrideButton` via saveOverrideButton
- `tools/Skin Editor/main.js`: `skinEditorClearOverrideButton` via clearOverrideButton
- `tools/Skin Editor/main.js`: `skinEditorImportInput` via importInput
- `tools/Skin Editor/main.js`: `skinEditorExportButton` via exportButton
- `tools/Skin Editor/main.js`: `skinEditorOpenGameButton` via openGameButton
- `tools/Skin Editor/main.js`: `skinEditorHowToUseButton` via howToUseButton
- `tools/Skin Editor/main.js`: `skinEditorSyncVisualButton` via syncVisualButton
- `tools/Skin Editor/main.js`: `skinEditorStatus` via statusText
- `tools/Skin Editor/main.js`: `skinEditorInput` via input
- `tools/Skin Editor/main.js`: `skinEditorSummary` via summary
- `tools/Skin Editor/main.js`: `skinEditorContextGame` via contextGame
- `tools/Skin Editor/main.js`: `skinEditorContextSchema` via contextSchema
- `tools/Skin Editor/main.js`: `skinEditorContextSource` via contextSource
- `tools/Skin Editor/main.js`: `skinEditorNewShapeType` via newShapeType
- `tools/Skin Editor/main.js`: `skinEditorNewShapeName` via newShapeName
- `tools/Skin Editor/main.js`: `skinEditorAddShapeButton` via addShapeButton
- `tools/Skin Editor/main.js`: `skinEditorRenameObjectButton` via renameObjectButton
- `tools/Skin Editor/main.js`: `skinEditorDeleteObjectButton` via deleteObjectButton
- `tools/Skin Editor/main.js`: `skinEditorFlattenObjectsButton` via flattenObjectsButton
- `tools/Skin Editor/main.js`: `skinEditorMoveObjectUpButton` via moveObjectUpButton
- `tools/Skin Editor/main.js`: `skinEditorMoveObjectDownButton` via moveObjectDownButton
- `tools/Skin Editor/main.js`: `skinEditorObjectList` via objectList
- `tools/Skin Editor/main.js`: `skinEditorPaletteList` via paletteList
- `tools/Skin Editor/main.js`: `skinEditorSelectedObjectName` via selectedObjectName
- `tools/Skin Editor/main.js`: `skinEditorSelectedObjectColor` via selectedObjectColor
- `tools/Skin Editor/main.js`: `skinEditorObjectControls` via objectControls
- `tools/Skin Editor/main.js`: `skinEditorPreviewCanvas` via previewCanvas
- `tools/Skin Editor/main.js`: `skinEditorPreviewNote` via previewNote

## Current Panels And Surfaces Found
- `tools/Skin Editor/index.html`: `.debug-tool-shell`
- `tools/Skin Editor/index.html`: `.app-shell`
- `tools/Skin Editor/index.html`: `.panel`
- `tools/Skin Editor/index.html`: `.debug-tool-panel`
- `tools/Skin Editor/index.html`: `.skin-editor-object-list`
- `tools/Skin Editor/index.html`: `.skin-editor-canvas-panel`
- `tools/Skin Editor/index.html`: `.skin-editor-canvas-wrap`
- `tools/Skin Editor/index.html`: `.skin-editor-preview-canvas`
- `tools/Skin Editor/index.html`: `.skin-editor-palette-list`
- `tools/Skin Editor/index.html`: `.skin-editor-list`

## Exact Current Functions And Classes
- `tools/Skin Editor/main.js`: function addShapeFromControls; function applyPaletteColorToSelectedObject; function applySkinOverride; function bindEvents; function bootSkinEditor; function buildNormalizedSkinDocument; function clampNumericProperty; function clearSkinOverride; function createBasicField; function createShapePreset; function deepClone; function deleteObjectFromControls; function downloadTextFile; function drawObjectInPreview; function drawRegularPolygonPath; function drawSelectedObjectPreview; function drawStarPath; function ensureSelectedObjectKey; function ensureUniqueObjectKey; function exportSkinJson; function extractPresetPayload; function extractRawSkinForValidation; function flattenSelectedObjects; function formatSummary; function getGameOptionById; function getObjectKeys; function getRawSkinShapeIssues; function getSelectedGameOption; function getSelectedObjectColorPropertyKeys; function getSelectedObjectColorValue; function getSelectedObjectKeysInObjectOrder; function getSelectedShapeTypeValue; function getSkinShapeIssues; function getValidSelectedObjectKeys; function hasObjectKey; function importSkinJsonFromFile; function inferShapeTypeFromObjectKey; function inferShapeTypeFromSelectedObject; function isFlattenIneligibleObjectKey; function isPositiveDimensionKey; function loadActiveSkinForSelectedGame; function loadPresetFromQuery; function moveSelectedObjectByOffset; function normalizeObjectKey; function normalizeObjectKeyPreserveCase; function normalizeSamplePresetPath; function normalizeText; function numberStep; function openSelectedGame; function parseEditorSkin; function parseHexForPicker; function renameObjectFromControls; function renderObjectControls; function renderObjectList; function renderPaletteList; function renderWorkbench; function resolveActiveGameOption; function resolveCurrentSkinDocument; function sanitizePositiveDimensionsInDocument; function selectObjectKey; function setCurrentSkinDocument; function setObjectPropertyValue; function setObjectSelected; function setPreviewNote; function setSelectedObjectColorLabel; function setSelectedObjectNameLabel; function setStatus; function setSummary; function syncSelectedObjectUiFromSelection; function syncShapeTypeControlFromSelection; function syncVisualFromJson; function toDownloadName; function toObject; function toObjectCentricSkinDocument; function updateAddShapeButtonState; function updateContextChips; function updateEditorFromState; function updateFlattenButtonState; function updateObjectOrderButtonState; function wrapAngleDegrees; method destroy; method getApi

## Target Controls
Keep:
- Load Active Skin
- Apply Skin Override
- Clear Override
- Export Skin JSON
- shape type/name controls
- add/rename/delete/flatten/move object controls
- Sync Visual From JSON

Remove or rename:
- `Open Game` as a required validation path for tool-owned JSON

Add:
- visible Import Skin JSON action
- Validate Skin JSON
- Publish `tools.skin-editor`

## JSON Contract Owned By This Tool
Baseline schema: `tools/schemas/tools/skin-editor.schema.json`. Required top-level fields: (none). Allowed top-level fields: projectId, skin. Additional top-level properties are rejected by the current schema. The tool owns import/load, validation, edit/process, export/save, and publish of this payload. Workspace may pass a launch payload, but nested JSON remains tool-owned.

## Hosted/Launch Payload Boundary
- Launch payloads may seed this tool, but they do not become workspace-owned internals.
- toolState copies may be created later from the published output, but the copied JSON must still match this tool contract.
- Use file/path/name fields for assets. Do not persist `imageDataUrl`.

## Invalid JSON Behavior
- Reject malformed JSON before state mutation.
- Reject missing required fields from the schema baseline.
- Reject unsupported top-level fields when the schema disallows extras.
- Keep export/save/publish disabled until the current payload validates.
- Show a tool-specific error that names the failing field or control group.

## Manual Test Plan
- Load or paste a valid skin JSON payload.
- Add, rename, move, recolor, and export a shape.
- Try malformed JSON, a missing `skin` object, and invalid object geometry; publish must stay blocked.
