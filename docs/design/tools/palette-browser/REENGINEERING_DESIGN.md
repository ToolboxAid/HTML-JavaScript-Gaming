# Palette Browser Reengineering Design

Task: PR_26124_024
Classification: global tool
Core priority: core-01
Source folder: `tools/Palette Browser`
Publish target: `tools.palette-browser`

## Tool Purpose
Global palette authoring only. Palette Browser owns palette JSON import, validation, swatch editing, export, and publish to `tools.palette-browser`.

## Folder/Files Inspected
- `tools/Palette Browser/how_to_use.html`
- `tools/Palette Browser/index.html`
- `tools/Palette Browser/main.js`
- `tools/Palette Browser/paletteBrowser.css`
- `tools/Palette Browser/README.md`

## Controls: Control -> Action -> JSON Effect
| Control | Action | JSON effect |
|---|---|---|
| `tools/Palette Browser/index.html`: `input[search]#paletteSearchInput` - Find a palette | Filters the visible palette or swatch list. | No tools.palette-browser JSON change; affects the current view filter only. |
| `tools/Palette Browser/index.html`: `input[text]#paletteNameInput` - paletteNameInput | Edits the active palette or swatch field. | Updates the draft palette payload field represented by `paletteNameInput` before validation. |
| `tools/Palette Browser/index.html`: `input[color]#swatchColorInput` - #ffffff | Edits the active palette or swatch color/value field. | Updates the draft palette payload field represented by `swatchColorInput` before validation. |
| `tools/Palette Browser/index.html`: `input[text]#swatchNameInput` - Color name | Edits the active palette or swatch color/value field. | Updates the draft palette payload field represented by `swatchNameInput` before validation. |
| `tools/Palette Browser/index.html`: `input[text]#swatchSymbolInput` - A | Edits the active palette or swatch color/value field. | Updates the draft palette payload field represented by `swatchSymbolInput` before validation. |
| `tools/Palette Browser/index.html`: `input[file]#importPaletteJsonInput` - importPaletteJsonInput | Chooses a local file for palette payload import/load. | Replaces or merges tool-owned palette payload only after the import validates. |
| `tools/Palette Browser/index.html`: `button[button]#newPaletteButton` - New Palette | Creates or resets a draft palette payload. | Initializes tool-owned palette payload data; tools.palette-browser is unchanged until validation and publish/export. |
| `tools/Palette Browser/index.html`: `button[button]#duplicatePaletteButton` - Duplicate Selected | Duplicates the selected palette or swatch. | Adds a copied palette or swatch to the draft palette payload; publish waits for validation. |
| `tools/Palette Browser/index.html`: `button[button]#renamePaletteButton` - Rename Palette | Renames the selected palette or swatch. | Updates the draft palette payload name/id field before validation. |
| `tools/Palette Browser/index.html`: `button[button]#deletePaletteButton` - Delete Palette | Removes or clears the selected palette or swatch. | Deletes that data from the draft palette payload; publish waits for validation. |
| `tools/Palette Browser/index.html`: `button[button]#addSwatchButton` - Add Swatch | Adds a new palette or swatch. | Appends schema-owned data to the draft palette payload; publish waits for validation. |
| `tools/Palette Browser/index.html`: `button[button]#deleteSwatchButton` - Delete Swatch | Removes or clears the selected palette or swatch. | Deletes that data from the draft palette payload; publish waits for validation. |
| `tools/Palette Browser/index.html`: `button[button]#importPaletteJsonButton` - Import Palette JSON | Starts palette payload import/load. | Reads incoming JSON into the tool-owned palette payload only after validation succeeds. |
| `tools/Palette Browser/index.html`: `button[button]#exportPaletteJsonButton` - Export Palette JSON | Exports the validated palette payload. | Serializes the validated palette payload as the tools.palette-browser output shape. |
| `tools/Palette Browser/index.html`: `button[button]#copyPaletteJsonButton` - Copy Palette JSON | Copies the current validated palette payload. | Copies the tools.palette-browser output shape without changing draft JSON. |
| `tools/Palette Browser/index.html`: `button[button]#usePaletteButton` - Use in Workspace Manager | Publishes or applies the validated palette payload. | Writes the validated output shape to tools.palette-browser. |

## Panels And Surfaces Found
- `tools/Palette Browser/how_to_use.html`: `.tools-platform-surface`
- `tools/Palette Browser/index.html`: `.app-shell`
- `tools/Palette Browser/index.html`: `.palette-browser__editor`
- `tools/Palette Browser/index.html`: `.palette-browser__editor-grid`
- `tools/Palette Browser/index.html`: `.palette-browser__json-preview`
- `tools/Palette Browser/index.html`: `.palette-browser__layout`
- `tools/Palette Browser/index.html`: `.palette-browser__list`
- `tools/Palette Browser/index.html`: `.palette-browser__panel`
- `tools/Palette Browser/index.html`: `.panel`
- `tools/Palette Browser/index.html`: `.tools-platform-layout-grid`
- `tools/Palette Browser/index.html`: `.tools-platform-resize-panel`

## Current Component/Class/Function Inventory
- `tools/Palette Browser/main.js`: addSwatchToSelectedPalette; applyLaunchContext; applyProjectState; bindEvents; bootPaletteBrowser; buildPaletteDocumentPayload; buildPresetLoadedStatus; captureProjectState; copyPaletteJson; createCustomPalette; createNewPalette; createSharedPaletteMirror; deleteSelectedPalette; deleteSelectedSwatch; duplicateSelectedPalette; exportPaletteJson; findPaletteBySharedHandoff; formatSwatchNameForDisplay; getAllPalettes; getApi; getBuiltInPalettes; getSelectedPalette; getVisiblePalettes; hasDeleteOverrideParam; hasReservedPaletteKeyword; importPaletteFromPresetPayload; importPaletteJsonFromFile; init; isCustomPalette; isReadOnlyPalette; isWorkspaceContext; isWorkspaceManagerParent; loadCustomPalettes; loadHiddenBuiltInPaletteIds; makeUniquePaletteName; normalizeHandoffEntries; normalizeImportedPalette; normalizePaletteNameForReservedCheck; normalizeSamplePresetPath; registerToolBootContract; renameSelectedPalette; renderPaletteList; renderSelectedPalette; renderStoredSelection; saveCustomPalettes; saveHiddenBuiltInPaletteIds; selectSharedPaletteFromHandoff; setSelectedPalette; setSelectionText; syncSelectionFromSharedHandoff; tryLoadPresetFromQuery; updateSelectedSwatchFromInputs; usePaletteInActiveTools; validatePalette

## Target Controls
Keep:
- palette search/list
- palette name editing
- swatch color/name/symbol fields
- new/duplicate/rename/delete palette
- add/delete swatch
- import/copy/export palette JSON

Remove or rename:
- rename the current `Use in Workspace Manager` command to a neutral publish action

Add:
- Validate Palette
- Publish `tools.palette-browser`
- field-level palette validation status

## JSON Schema/Input Contract Currently Expected
Tool receives validated payload and owns behavior for palette payload. Current contract baseline: `tools/schemas/tools/palette-browser.schema.json` (Palette Browser Direct Palette Payload).
Required keys: `schema`, `version`, `name`, `swatches`.
Optional keys: `$schema`, `id`, `source`, `sourceId`, `locked`.

Tool-owned JSON responsibilities:
- import/load: parse incoming palette payload and reject it before mutation when invalid
- validate: apply the current palette payload contract before export, copy, or publish
- edit/process: mutate only palette payload fields owned by Palette Browser
- export/save: serialize the validated palette payload as the tools.palette-browser output shape
- publish: write only the validated tools.palette-browser value produced by Palette Browser
- copy/create payload: create copied payload text from the validated palette payload, not from unvalidated draft UI state

## Valid JSON Behavior
- accepts a direct palette payload with `schema`, `version`, `name`, and `swatches`
- normalizes swatch symbol/name/color edits before export
- publishes only the validated palette payload

## Invalid JSON Rejection Behavior
- malformed JSON
- missing `schema`, `version`, `name`, or `swatches`
- `swatches` that is not an array
- swatches with invalid symbol/name/color values
- unsupported top-level fields

## Published Output
Published Output:
```jsonc
tools.palette-browser = {
  "$schema": "string", // optional
  "schema": "html-js-gaming.palette",
  "version": 1,
  "id": "string", // optional
  "name": "string",
  "source": "string", // optional
  "sourceId": "string", // optional
  "locked": false, // optional
  "swatches": [
    {
      "symbol": "string",
      "hex": "#RRGGBB",
      "name": "string"
    }
  ]
}
```

## Playwright Expectations
- load `tools/Palette Browser/index.html` without console errors
- create a palette, add a swatch, validate, copy, export, and import it back
- confirm publish output is only `tools.palette-browser`

## Manual Test Expectations
- Open `tools/Palette Browser/index.html` and confirm built-in palettes render first.
- Create a custom palette, add a swatch, validate, export, copy, and re-import it.
- Try malformed JSON, a palette without `swatches`, and an invalid color; each must block export/publish.

## Known Gaps
- Publish action naming still references the older manager wording in the current button label.
- Dedicated validate button/status should be added during rebuild.

## Rebuild Order Priority
core-01: rebuild in the core tool lane after earlier priorities are stable.
