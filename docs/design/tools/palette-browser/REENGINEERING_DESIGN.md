# Palette Browser Reengineering Design

Task: PR_26124_021-tool-folder-design-reset
Tool ID: `palette-browser`
Source folder: `tools/Palette Browser`

## 1. Tool Purpose
Own the global palette authoring and browsing surface, including swatch editing, palette JSON validation, import/load, export/save, and the publishable palette entry.

## 2. Folder/Files Inspected
- `tools/Palette Browser/how_to_use.html`
- `tools/Palette Browser/index.html`
- `tools/Palette Browser/main.js`
- `tools/Palette Browser/paletteBrowser.css`
- `tools/Palette Browser/README.md`

Skipped from inspection for this design reset: sample/data JSON, image assets, generated preview assets, and schema history notes outside the current contract baseline.

## 3. Current Controls/Buttons/Inputs/Selects/Textareas/Tables/Panels
Counts found: buttons 12, inputs 6, selects 0, textareas 0, tables 0, inferred DOM controls/panels 18.
- `tools/Palette Browser/index.html`: input[search] #paletteSearchInput - Find a palette
- `tools/Palette Browser/index.html`: input[text] #paletteNameInput - paletteNameInput
- `tools/Palette Browser/index.html`: input[color] #swatchColorInput - #ffffff
- `tools/Palette Browser/index.html`: input[text] #swatchNameInput - Color name
- `tools/Palette Browser/index.html`: input[text] #swatchSymbolInput - A
- `tools/Palette Browser/index.html`: button[button] #newPaletteButton - New Palette
- `tools/Palette Browser/index.html`: button[button] #duplicatePaletteButton - Duplicate Selected
- `tools/Palette Browser/index.html`: button[button] #renamePaletteButton - Rename Palette
- `tools/Palette Browser/index.html`: button[button] #deletePaletteButton - Delete Palette
- `tools/Palette Browser/index.html`: button[button] #addSwatchButton - Add Swatch
- `tools/Palette Browser/index.html`: button[button] #deleteSwatchButton - Delete Swatch
- `tools/Palette Browser/index.html`: button[button] #importPaletteJsonButton - Import Palette JSON
- `tools/Palette Browser/index.html`: input[file] #importPaletteJsonInput - importPaletteJsonInput
- `tools/Palette Browser/index.html`: button[button] #exportPaletteJsonButton - Export Palette JSON
- `tools/Palette Browser/index.html`: button[button] #copyPaletteJsonButton - Copy Palette JSON
- `tools/Palette Browser/index.html`: button[button] #usePaletteButton - Use in Workspace Manager
- `tools/Palette Browser/main.js`: button[button] #${palette.id} - ${palette.name} (${palette.swatches.length}) swatches | ${palette.source}
- `tools/Palette Browser/main.js`: button[button] - ${formatSwatchNameForDisplay(entry.name || "Unnamed")} ${entry.symbol || "-"}
- `tools/Palette Browser/main.js`: input #paletteSearchInput - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: panel #paletteList - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: input #paletteNameInput - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: input #swatchColorInput - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: input #swatchNameInput - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: input #swatchSymbolInput - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: button #newPaletteButton - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: button #duplicatePaletteButton - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: button #renamePaletteButton - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: button #deletePaletteButton - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: button #addSwatchButton - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: button #deleteSwatchButton - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: panel #paletteJsonPreview - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: button #importPaletteJsonButton - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: input #importPaletteJsonInput - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: button #copyPaletteJsonButton - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: button #exportPaletteJsonButton - inferred from JS DOM lookup
- `tools/Palette Browser/main.js`: button #usePaletteButton - inferred from JS DOM lookup
- Panels/surfaces found:
  - `tools/Palette Browser/index.html`: .app-shell
  - `tools/Palette Browser/index.html`: .tools-platform-layout-grid
  - `tools/Palette Browser/index.html`: .panel
  - `tools/Palette Browser/index.html`: .palette-browser__panel
  - `tools/Palette Browser/index.html`: .tools-platform-resize-panel
  - `tools/Palette Browser/index.html`: .palette-browser__list
  - `tools/Palette Browser/index.html`: .palette-browser__editor-grid
  - `tools/Palette Browser/index.html`: .palette-browser__json-preview

## 4. Current Component/Class/Function Inventory
- `tools/Palette Browser/main.js`: function addSwatchToSelectedPalette; function applyLaunchContext; function bindEvents; function bootPaletteBrowser; function buildPaletteDocumentPayload; function buildPresetLoadedStatus; function copyPaletteJson; function createCustomPalette; function createNewPalette; function createSharedPaletteMirror; function deleteSelectedPalette; function deleteSelectedSwatch; function duplicateSelectedPalette; function exportPaletteJson; function findPaletteBySharedHandoff; function formatSwatchNameForDisplay; function getAllPalettes; function getBuiltInPalettes; function getSelectedPalette; function getVisiblePalettes; function hasDeleteOverrideParam; function hasReservedPaletteKeyword; function importPaletteFromPresetPayload; function importPaletteJsonFromFile; function init; function isCustomPalette; function isReadOnlyPalette; function isWorkspaceContext; function isWorkspaceManagerParent; function loadCustomPalettes; function loadHiddenBuiltInPaletteIds; function makeUniquePaletteName; function normalizeHandoffEntries; function normalizeImportedPalette; function normalizePaletteNameForReservedCheck; function normalizeSamplePresetPath; function renameSelectedPalette; function renderPaletteList; function renderSelectedPalette; function renderStoredSelection; function saveCustomPalettes; function saveHiddenBuiltInPaletteIds; function selectSharedPaletteFromHandoff; function setSelectedPalette; function setSelectionText; function syncSelectionFromSharedHandoff; function tryLoadPresetFromQuery; function updateSelectedSwatchFromInputs; function usePaletteInActiveTools; function validatePalette; method applyProjectState; method captureProjectState; method getApi; method registerToolBootContract

## 5. JSON Schema/Input Contract Currently Expected
Schema baseline: `tools/schemas/tools/palette-browser.schema.json`. Title: Palette Browser Direct Palette Payload. Required top-level fields: schema, version, name, swatches. Allowed top-level fields: $schema, schema, version, id, name, source, sourceId, locked, swatches. Additional top-level properties: rejected.

JSON handling signals found: Blob/object URL, download/export, hostContextId, JSON.parse, JSON.stringify, localStorage, schema, tools.*, validate.

## 6. Valid JSON Behavior
Valid JSON must parse cleanly, match the current schema baseline or tool-owned normalized shape, update the local editor/preview state, and remain exportable as path/file-field JSON without embedding `imageDataUrl`.

## 7. Invalid JSON Rejection Behavior
Malformed JSON, missing required fields, unsupported top-level fields, wrong nested types, and empty required editor payloads must be rejected in the tool UI before export/save/publish.

## 8. Tool-Owned JSON Responsibilities
- import/load: tool-owned; load files, pasted JSON, or hosted session payloads inside the tool.
- validate: tool-owned validation against the current schema/input contract before state mutation.
- edit/process: tool-owned editor or processing state.
- export/save: tool-owned normalized JSON/export artifacts.
- publish to `tools.palette-browser` if applicable: yes, publish normalized output under `tools.palette-browser` when this tool is the producer.
- copy/create toolState if applicable: only if a future workspace flow copies a published `tools.*` entry into a toolState; the tool JSON remains tool-owned.

## 9. Workspace Integration Contract
- Workspace validates and launches only.
- Workspace may provide `hostContextId`, launch URL state, or a workspace manifest shell, but it does not manage tool JSON internals.
- The tool owns its JSON behavior after launch: import/load, validate, edit/process, export/save, publish output, and any copy/create `toolState` behavior listed above.
- Workspace rejection should stop at invalid launch/session/manifest envelope; nested payload rules stay with the tool.

## 10. Published `tools.*` Output Contract For Games/Samples
Published output key: `tools.palette-browser`. The value must match the current contract baseline, contain only JSON-safe values, use file/path/name fields for assets, and never persist `imageDataUrl`. Games and samples should consume the published payload as data, not as workspace-managed tool internals.

## 11. Playwright Expectations
Open `tools/Palette Browser/index.html`; verify the page renders without console errors, expected controls are present, valid JSON/session data reaches the success state, and invalid JSON/session data stays in the tool-owned rejection path. No Playwright run is expected for this documentation-only PR.

## 12. Manual Test Expectations
Manually launch `tools/Palette Browser/index.html`, exercise import/load controls or hosted launch parameters, confirm edit/process controls do not delegate JSON internals to workspace, export/save the normalized output, and confirm invalid JSON blocks export/save.

## 13. Known Gaps
- Playwright/manual checks are documented as expectations only; this PR does not change runtime behavior or add tests.

## 14. Rebuild Order Priority
P01: Palette Browser. This priority is used by `docs/dev/roadmaps/MASTER_ROADMAP_TOOLS.md` and keeps the rebuild anchored on Palette / Palette Browser first, then dependent tool families.
