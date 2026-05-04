# Palette Browser Reengineering Design

Task: PR_26124_022-tighten-tool-design-docs
Classification: global tool
Core priority: core-01
Source folder: `tools/Palette Browser`
Publish target: `tools.palette-browser`

## Tool Purpose
Global palette authoring and selection. This tool owns palette JSON import, validation, swatch editing, export, and publish to `tools.palette-browser`.

## Exact Folder/Files Inspected
- `tools/Palette Browser/how_to_use.html`
- `tools/Palette Browser/index.html`
- `tools/Palette Browser/main.js`
- `tools/Palette Browser/paletteBrowser.css`
- `tools/Palette Browser/README.md`

## Exact Current Controls Found
- `tools/Palette Browser/index.html`: `input[search]#paletteSearchInput` - Find a palette
- `tools/Palette Browser/index.html`: `input[text]#paletteNameInput` - paletteNameInput
- `tools/Palette Browser/index.html`: `input[color]#swatchColorInput` - swatchColorInput
- `tools/Palette Browser/index.html`: `input[text]#swatchNameInput` - Color name
- `tools/Palette Browser/index.html`: `input[text]#swatchSymbolInput` - A
- `tools/Palette Browser/index.html`: `button[button]#newPaletteButton` - New Palette
- `tools/Palette Browser/index.html`: `button[button]#duplicatePaletteButton` - Duplicate Selected
- `tools/Palette Browser/index.html`: `button[button]#renamePaletteButton` - Rename Palette
- `tools/Palette Browser/index.html`: `button[button]#deletePaletteButton` - Delete Palette
- `tools/Palette Browser/index.html`: `button[button]#addSwatchButton` - Add Swatch
- `tools/Palette Browser/index.html`: `button[button]#deleteSwatchButton` - Delete Swatch
- `tools/Palette Browser/index.html`: `button[button]#importPaletteJsonButton` - Import Palette JSON
- `tools/Palette Browser/index.html`: `input[file]#importPaletteJsonInput` - importPaletteJsonInput
- `tools/Palette Browser/index.html`: `button[button]#exportPaletteJsonButton` - Export Palette JSON
- `tools/Palette Browser/index.html`: `button[button]#copyPaletteJsonButton` - Copy Palette JSON
- `tools/Palette Browser/index.html`: `button[button]#usePaletteButton` - Use in Workspace Manager
- `tools/Palette Browser/main.js`: `paletteSearchInput` via searchInput
- `tools/Palette Browser/main.js`: `launchContextText` via launchContextText
- `tools/Palette Browser/main.js`: `paletteCountText` via countText
- `tools/Palette Browser/main.js`: `paletteList` via paletteList
- `tools/Palette Browser/main.js`: `paletteTitle` via paletteTitle
- `tools/Palette Browser/main.js`: `paletteSummaryText` via paletteSummaryText
- `tools/Palette Browser/main.js`: `paletteSwatches` via paletteSwatches
- `tools/Palette Browser/main.js`: `paletteNameInput` via paletteNameInput
- `tools/Palette Browser/main.js`: `swatchColorInput` via swatchColorInput
- `tools/Palette Browser/main.js`: `swatchNameInput` via swatchNameInput
- `tools/Palette Browser/main.js`: `swatchSymbolInput` via swatchSymbolInput
- `tools/Palette Browser/main.js`: `newPaletteButton` via newPaletteButton
- `tools/Palette Browser/main.js`: `duplicatePaletteButton` via duplicatePaletteButton
- `tools/Palette Browser/main.js`: `renamePaletteButton` via renamePaletteButton
- `tools/Palette Browser/main.js`: `deletePaletteButton` via deletePaletteButton
- `tools/Palette Browser/main.js`: `addSwatchButton` via addSwatchButton
- `tools/Palette Browser/main.js`: `deleteSwatchButton` via deleteSwatchButton
- `tools/Palette Browser/main.js`: `paletteValidationText` via validationText
- `tools/Palette Browser/main.js`: `paletteSelectionText` via selectionText
- `tools/Palette Browser/main.js`: `paletteJsonPreview` via jsonPreview
- `tools/Palette Browser/main.js`: `importPaletteJsonButton` via importPaletteJsonButton
- `tools/Palette Browser/main.js`: `importPaletteJsonInput` via importPaletteJsonInput
- `tools/Palette Browser/main.js`: `copyPaletteJsonButton` via copyPaletteJsonButton
- `tools/Palette Browser/main.js`: `exportPaletteJsonButton` via exportPaletteJsonButton
- `tools/Palette Browser/main.js`: `usePaletteButton` via usePaletteButton

## Current Panels And Surfaces Found
- `tools/Palette Browser/index.html`: `.app-shell`
- `tools/Palette Browser/index.html`: `.tools-platform-layout-grid`
- `tools/Palette Browser/index.html`: `.panel`
- `tools/Palette Browser/index.html`: `.palette-browser__panel`
- `tools/Palette Browser/index.html`: `.tools-platform-resize-panel`
- `tools/Palette Browser/index.html`: `.palette-browser__list`
- `tools/Palette Browser/index.html`: `.palette-browser__editor-grid`
- `tools/Palette Browser/index.html`: `.palette-browser__json-preview`

## Exact Current Functions And Classes
- `tools/Palette Browser/main.js`: function addSwatchToSelectedPalette; function applyLaunchContext; function bindEvents; function bootPaletteBrowser; function buildPaletteDocumentPayload; function buildPresetLoadedStatus; function copyPaletteJson; function createCustomPalette; function createNewPalette; function createSharedPaletteMirror; function deleteSelectedPalette; function deleteSelectedSwatch; function duplicateSelectedPalette; function exportPaletteJson; function findPaletteBySharedHandoff; function formatSwatchNameForDisplay; function getAllPalettes; function getBuiltInPalettes; function getSelectedPalette; function getVisiblePalettes; function hasDeleteOverrideParam; function hasReservedPaletteKeyword; function importPaletteFromPresetPayload; function importPaletteJsonFromFile; function init; function isCustomPalette; function isReadOnlyPalette; function isWorkspaceContext; function isWorkspaceManagerParent; function loadCustomPalettes; function loadHiddenBuiltInPaletteIds; function makeUniquePaletteName; function normalizeHandoffEntries; function normalizeImportedPalette; function normalizePaletteNameForReservedCheck; function normalizeSamplePresetPath; function renameSelectedPalette; function renderPaletteList; function renderSelectedPalette; function renderStoredSelection; function saveCustomPalettes; function saveHiddenBuiltInPaletteIds; function selectSharedPaletteFromHandoff; function setSelectedPalette; function setSelectionText; function syncSelectionFromSharedHandoff; function tryLoadPresetFromQuery; function updateSelectedSwatchFromInputs; function usePaletteInActiveTools; function validatePalette; method applyProjectState; method captureProjectState; method getApi; method registerToolBootContract

## Target Controls
Keep:
- palette search/list
- palette name editing
- swatch color/name/symbol inputs
- new/duplicate/rename/delete palette
- add/delete swatch
- import/copy/export palette JSON

Remove or rename:
- replace `Use in Workspace Manager` wording with explicit publish/launch-payload wording

Add:
- dedicated Validate Palette action
- Publish `tools.palette-browser` action
- invalid JSON panel that names missing fields and unsupported top-level keys

## JSON Contract Owned By This Tool
Baseline schema: `tools/schemas/tools/palette-browser.schema.json`. Required top-level fields: schema, version, name, swatches. Allowed top-level fields: $schema, schema, version, id, name, source, sourceId, locked, swatches. Additional top-level properties are rejected by the current schema. The tool owns import/load, validation, edit/process, export/save, and publish of this payload. Workspace may pass a launch payload, but nested JSON remains tool-owned.

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
- Open the folder directly and confirm built-in palettes render.
- Create a custom palette, add a swatch, validate, export, copy, and re-import it.
- Try malformed JSON, a palette without `swatches`, and a swatch with an invalid hex color; each case must be rejected before publish.
