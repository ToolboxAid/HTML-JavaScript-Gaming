# Skin Editor Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `skin-editor`
Source folder: `tools/Skin Editor`

## 1. Tool Purpose
Edit primitive skin metadata and style controls, validate skin JSON, and export skin payloads.

## 2. Folder/Files Inspected
- `tools/Skin Editor/how_to_use.html`
- `tools/Skin Editor/index.html`
- `tools/Skin Editor/main.js`
- `tools/Skin Editor/README.md`
- `tools/Skin Editor/skinEditor.css`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 13, inputs 2, selects 1, textareas 1, tables 0, inferred DOM controls/panels 19.
- `tools/Skin Editor/index.html`: button[button] #skinEditorLoadButton - Load Active Skin
- `tools/Skin Editor/index.html`: button[button] #skinEditorSaveOverrideButton - Apply Skin Override
- `tools/Skin Editor/index.html`: button[button] #skinEditorClearOverrideButton - Clear Override
- `tools/Skin Editor/index.html`: input[file] #skinEditorImportInput - skinEditorImportInput
- `tools/Skin Editor/index.html`: button[button] #skinEditorExportButton - Export Skin JSON
- `tools/Skin Editor/index.html`: button[button] #skinEditorOpenGameButton - Open Game
- `tools/Skin Editor/index.html`: button[button] #skinEditorHowToUseButton - How to Use
- `tools/Skin Editor/index.html`: select #skinEditorNewShapeType - Arc Capsule Circle HUD Color Line Oval Polygon Rectangle Ring Sector Square Star Triangle Wal...
- `tools/Skin Editor/index.html`: input[text] #skinEditorNewShapeName - example: paddle, hudText, hudPanel
- `tools/Skin Editor/index.html`: button[button] #skinEditorAddShapeButton - Add
- `tools/Skin Editor/index.html`: button[button] #skinEditorRenameObjectButton - Rename
- `tools/Skin Editor/index.html`: button[button] #skinEditorDeleteObjectButton - Delete
- `tools/Skin Editor/index.html`: button[button] #skinEditorFlattenObjectsButton - Flatten
- `tools/Skin Editor/index.html`: button[button] #skinEditorMoveObjectUpButton - Move Up
- `tools/Skin Editor/index.html`: button[button] #skinEditorMoveObjectDownButton - Move Down
- `tools/Skin Editor/index.html`: textarea #skinEditorInput - skinEditorInput
- `tools/Skin Editor/index.html`: button[button] #skinEditorSyncVisualButton - Sync Visual From JSON
- `tools/Skin Editor/main.js`: button #skinEditorLoadButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: button #skinEditorSaveOverrideButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: button #skinEditorClearOverrideButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: input #skinEditorImportInput - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: button #skinEditorExportButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: button #skinEditorOpenGameButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: button #skinEditorHowToUseButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: button #skinEditorSyncVisualButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: panel #skinEditorStatus - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: input #skinEditorInput - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: button #skinEditorAddShapeButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: button #skinEditorRenameObjectButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: button #skinEditorDeleteObjectButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: button #skinEditorFlattenObjectsButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: button #skinEditorMoveObjectUpButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: button #skinEditorMoveObjectDownButton - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: panel #skinEditorObjectList - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: panel #skinEditorPaletteList - inferred from JS DOM lookup
- `tools/Skin Editor/main.js`: panel #skinEditorPreviewCanvas - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/Skin Editor/index.html`: .debug-tool-shell
  - `tools/Skin Editor/index.html`: .app-shell
  - `tools/Skin Editor/index.html`: .panel
  - `tools/Skin Editor/index.html`: .debug-tool-panel
  - `tools/Skin Editor/index.html`: .skin-editor-object-list
  - `tools/Skin Editor/index.html`: .skin-editor-canvas-panel
  - `tools/Skin Editor/index.html`: .skin-editor-canvas-wrap
  - `tools/Skin Editor/index.html`: .skin-editor-preview-canvas
  - `tools/Skin Editor/index.html`: .skin-editor-palette-list
  - `tools/Skin Editor/index.html`: .skin-editor-list

## 4. Current Component/Class/Function Inventory
- `tools/Skin Editor/main.js`: function addShapeFromControls; function applyPaletteColorToSelectedObject; function applySkinOverride; function bindEvents; function bootSkinEditor; function buildNormalizedSkinDocument; function clampNumericProperty; function clearSkinOverride; function createBasicField; function createShapePreset; function deepClone; function deleteObjectFromControls; function downloadTextFile; function drawObjectInPreview; function drawRegularPolygonPath; function drawSelectedObjectPreview; function drawStarPath; function ensureSelectedObjectKey; function ensureUniqueObjectKey; function exportSkinJson; function extractPresetPayload; function extractRawSkinForValidation; function flattenSelectedObjects; function formatSummary; function getGameOptionById; function getObjectKeys; function getRawSkinShapeIssues; function getSelectedGameOption; function getSelectedObjectColorPropertyKeys; function getSelectedObjectColorValue; function getSelectedObjectKeysInObjectOrder; function getSelectedShapeTypeValue; function getSkinShapeIssues; function getValidSelectedObjectKeys; function hasObjectKey; function importSkinJsonFromFile; function inferShapeTypeFromObjectKey; function inferShapeTypeFromSelectedObject; function isFlattenIneligibleObjectKey; function isPositiveDimensionKey; function loadActiveSkinForSelectedGame; function loadPresetFromQuery; function moveSelectedObjectByOffset; function normalizeObjectKey; function normalizeObjectKeyPreserveCase; function normalizeSamplePresetPath; function normalizeText; function numberStep; function openSelectedGame; function parseEditorSkin; function parseHexForPicker; function renameObjectFromControls; function renderObjectControls; function renderObjectList; function renderPaletteList; function renderWorkbench; function resolveActiveGameOption; function resolveCurrentSkinDocument; function sanitizePositiveDimensionsInDocument; function selectObjectKey; ... 22 more

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/skin-editor.schema.json`. Title: skin-editor Payload. Required top-level fields: (none listed). Allowed top-level fields: projectId, skin. Additional top-level properties: rejected.

JSON handling signals found: Blob/object URL, download/export, JSON.parse, JSON.stringify, safeParseJson, schema, validate.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the current schema baseline or tool-owned normalized shape, update the local editor/preview state, and remain exportable as path/file-field JSON without embedding `imageDataUrl`.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing required fields, unsupported top-level fields, wrong nested types, and empty required editor payloads must be rejected in the tool UI before export/save/publish.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.skin-editor` if applicable: yes, publish normalized output under `tools.skin-editor` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.skin-editor`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/Skin Editor/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/Skin Editor/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Controls need cleanup during the tool rebuild so import, validate, edit/process, export/save, and publish actions are explicit.
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P09: Skin Editor. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
