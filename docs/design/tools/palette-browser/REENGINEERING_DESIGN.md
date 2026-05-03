# Palette Browser / Manager Reengineering Design (palette-browser)

## Purpose
- Shared palette browsing and management surface for engine palettes and local editable palette workflows.

## Current V1 Capability
- Active in registry-driven tools surface.
- Runtime entry point: `Palette Browser/index.html`.
- Runtime implementation file: `tools/Palette Browser/main.js`.

## Current V2 / Workspace Status
- Legacy/first-class tool present in registry; not fully mapped into Workspace V2 toolState lane.
- Workspace integration classification:
  - global tool: yes
  - toolState-capable tool: no
  - published `tools.*` output candidate: yes
- Readiness: In active lane

## Expected JSON Schema/Input
- Schema ref: `tools/schemas/tools/palette-browser.schema.json`. Required root keys: `schema`, `version`, `name`, `swatches`. Defined root properties: `$schema`, `schema`, `version`, `id`, `name`, `source`, `sourceId`, `locked`, `swatches`.

## Valid JSON Load Behavior (Target)
- Parse incoming tool payload once.
- Validate against the tool schema/contract before rendering.
- Render the fully valid state and expose clear contract readout text.

## Invalid JSON Rejection Behavior (Target)
- Reject before rendering domain state.
- Show one clear actionable invalid message.
- Avoid fallback/default injections and avoid mutating inbound payload structure.

## Current Components/Functions
- Top-level functions: `normalizeSamplePresetPath()`, `buildPresetLoadedStatus()`, `setSelectionText()`, `isWorkspaceContext()`, `hasDeleteOverrideParam()`, `applyLaunchContext()`, `loadCustomPalettes()`, `saveCustomPalettes()`, `loadHiddenBuiltInPaletteIds()`, `saveHiddenBuiltInPaletteIds()`, `getBuiltInPalettes()`, `getAllPalettes()`, `getVisiblePalettes()`, `getSelectedPalette()`, `normalizeHandoffEntries()`, `findPaletteBySharedHandoff()`, `createSharedPaletteMirror()`, `selectSharedPaletteFromHandoff()`, `syncSelectionFromSharedHandoff()`, `isCustomPalette()`, `normalizePaletteNameForReservedCheck()`, `isReadOnlyPalette()`, `validatePalette()`, `formatSwatchNameForDisplay()`, `hasReservedPaletteKeyword()`, `renderPaletteList()`, `renderSelectedPalette()`, `setSelectedPalette()`, `createCustomPalette()`, `makeUniquePaletteName()`, `buildPaletteDocumentPayload()`, `normalizeImportedPalette()`, `importPaletteFromPresetPayload()`, `createNewPalette()`, `duplicateSelectedPalette()`, `renameSelectedPalette()`, `addSwatchToSelectedPalette()`, `updateSelectedSwatchFromInputs()`, `deleteSelectedSwatch()`, `exportPaletteJson()`, `usePaletteInActiveTools()`, `deleteSelectedPalette()`, `renderStoredSelection()`, `bindEvents()`, `init()`, `bootPaletteBrowser()`.

## Target Components/Functions
- Separate explicit JSON contract functions (`import`, `validate`, `load`, `export`) from view-only rendering methods.
- Keep tool-specific logic inside the tool runtime; avoid Workspace V2 owning tool-specific compare/merge/edit behavior.
- Keep one visible invalid-state path that blocks render before any partial state draws.

## Tool-Owned JSON Functions
- Import: `buildPresetLoadedStatus()`, `loadCustomPalettes()`, `loadHiddenBuiltInPaletteIds()`, `isReadOnlyPalette()`, `buildPaletteDocumentPayload()`, `normalizeImportedPalette()`, `importPaletteFromPresetPayload()`
- Validate: `normalizeSamplePresetPath()`, `normalizeHandoffEntries()`, `normalizePaletteNameForReservedCheck()`, `validatePalette()`, `normalizeImportedPalette()`
- Edit/process: `applyLaunchContext()`, `renderPaletteList()`, `renderSelectedPalette()`, `addSwatchToSelectedPalette()`, `updateSelectedSwatchFromInputs()`, `renderStoredSelection()`
- Export: `findPaletteBySharedHandoff()`, `createSharedPaletteMirror()`, `selectSharedPaletteFromHandoff()`, `syncSelectionFromSharedHandoff()`, `exportPaletteJson()`
- Add/copy to Workspace toolState: Not yet explicit in current tool runtime.
- Publish to `tools.palette-browser`: Supported as target ownership in design; concrete publish path varies by tool.
- Compare/merge for own schema: Not currently tool-local; Workspace V2 has cross-toolState compare/merge UI today.

## Workspace Integration Contract
- Input from Workspace V2 export/import: `tools.palette-browser`.
- Output/publish: global active palette only; not a Workspace V2 toolState library entry.

## Playwright Expectations
- Valid payload path should show visible valid-state surface.
- Invalid payload path should show visible invalid-state surface and hide valid state.
- Workspace launch handoff should open the tool with hostContext/toolState payload when applicable.

## Manual Test Expectations
- Launch from `tools/index.html` and confirm baseline UI renders.
- Launch from Workspace V2 when applicable and confirm payload handoff path.
- Provide an invalid JSON contract and confirm the tool blocks render with explicit error.

## Known Gaps
- No additional gaps recorded in this pass beyond normal contract hardening and test expansion.
