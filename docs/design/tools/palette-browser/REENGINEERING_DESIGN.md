# Palette Browser Reengineering Design

Task: PR_26124_023-finalize-tool-design-docs
Classification: global tool
Core priority: core-01
Source folder: `tools/Palette Browser`
Publish target: `tools.palette-browser`

## Tool Purpose
Global palette authoring only. Palette Browser owns palette JSON import, validation, swatch editing, export, and publish to `tools.palette-browser`.

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
- swatch color/name/symbol fields
- new/duplicate/rename/delete palette
- add/delete swatch
- import/copy/export palette JSON

Remove or rename:
- rename `Use in Workspace Manager` to a palette publish action

Add:
- Validate Palette
- Publish `tools.palette-browser`
- field-level palette validation status

## JSON Contract Owned By This Tool
Owned JSON is the Palette Browser direct palette payload. Required fields are `schema`, `version`, `name`, and `swatches`. Optional fields are `$schema`, `id`, `source`, `sourceId`, and `locked`. Each swatch must be palette data only: symbol/name/color values owned by Palette Browser.

## Publish Output
Publish only to `tools.palette-browser`. The published value must match the tool-owned contract above and must be produced by this folder's validation/export path.

## Invalid JSON Behavior
- malformed JSON
- missing `schema`, `version`, `name`, or `swatches`
- `swatches` that is not an array
- swatches with invalid symbol/name/color values
- unsupported top-level fields

## Manual Test Plan
- Open `tools/Palette Browser/index.html` and confirm built-in palettes render first.
- Create a custom palette, add a swatch, validate, export, copy, and re-import it.
- Confirm publish output is only `tools.palette-browser`.
- Try malformed JSON, a palette without `swatches`, and an invalid color; each must block export/publish.
