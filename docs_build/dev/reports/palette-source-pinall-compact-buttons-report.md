# PR_26156_171 Palette Source Pin All Compact Buttons Report

## Result
PASS

## Scope
- Fixed Palette Tool source loading after removing `DEFAULT_SOURCE_PALETTES`.
- Source Palette Browser now reads source swatches from `palette_source_swatches` DB/mock-DB table rows.
- The normal mock-DB path renders visible source swatches.
- The empty diagnostic appears only when `palette_source_swatches` is explicitly empty.
- Added Source Palette Browser `Pin All`.
- Added reusable Theme V2 `.btn--compact` for dense controls.
- Applied compact styling to Hue, Sat, Brit, Name, Tag, Small, Medium, and Large buttons.

## Source Palette Behavior
- Added mock-DB seed rows through `createPaletteToolMockDbTables()`.
- `createProjectWorkspacePaletteRepository()` still accepts:
  - `options.sourcePaletteRows`
  - `options.tables.palette_source_swatches`
- Passing an empty `palette_source_swatches` table renders `No source palette`.
- No `DEFAULT_SOURCE_PALETTES`, `DEFAULT_SOURCE_PALETTE_LABELS`, `SOURCE_PALETTES`, or `paletteList` usage is present in Palette Tool targets.

## Pin All Behavior
- `pinSourceSwatches()` pins every visible source swatch supplied by the current source/filter/sort view.
- Already pinned source swatches are skipped by RGB key.
- Pin All returns one batch result and does not duplicate pinned swatches.
- The button is disabled only when there are no visible source swatches or no active project.

## Compact Button Behavior
- `.btn--compact` reduces margin, padding, font size, font weight, and line height.
- Active sort/size buttons keep the existing `primary` selected state.
- Active sort direction keeps the caret indicator.
- Active Project Palette and Source Swatches place sort controls on the left and size controls on the right in the same control row.
- The groups share the same visual baseline in the Palette Tool runtime lane.

## CSS
- Added reusable Theme V2 CSS in `assets/theme-v2/css/buttons.css`.
- No page-local CSS, tool-local CSS, inline styles, `<style>` blocks, or inline event handlers were added.

## Files Changed For Implementation
- `assets/theme-v2/css/buttons.css`
- `toolbox/colors/palette-workspace-repository.js`
- `toolbox/colors/colors.js`
- `toolbox/colors/index.html`
- `tests/playwright/tools/PaletteToolMockRepository.spec.mjs`

## Validation Summary
- Targeted Palette Tool runtime/UI lane: PASS.
- DB/mock-DB source swatches render visibly: PASS.
- Empty state appears only when source palette table is empty: PASS.
- Pin All pins visible source swatches without duplicates: PASS.
- Compact sort/size buttons fit one row and align left/right groups on the same baseline: PASS.
- Selected sort/size state remains visible with caret direction: PASS.
- Changed-file/static validation: PASS.
- Full samples smoke: not run per BUILD instruction.
