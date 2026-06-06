# PR_26156_180 Palette Added Selection And Tooltip Source Report

## Result
PASS

## Summary
- Newly added Palette Colors now become selected immediately for user-defined adds, source pin/add, Source Pin All, harmony pin/add, and harmony Add All.
- Multi-add operations select the last newly added swatch while duplicate-only runs keep the prior selection unchanged.
- Swatch browser tooltips now use browser `title` text in the order Name, Hex, Source, Tags.
- Empty user-tag sets omit the Tags line instead of showing `Tags: None`.
- Active source labels now resolve to `custom` for user-defined swatches, the source palette label for copied source colors, and the harmony scheme label for generated harmony colors.

## Behavior Details
- `replaceSwatches` accepts an explicit selected symbol so add/update callers can persist the intended selected swatch after table writes.
- Source Pin All tracks the last successfully added swatch symbol and uses it as the selected item.
- Harmony swatches persist their scheme source, such as `complementary` or `triadic`, so active Palette Colors can display the scheme label as Source.
- Harmony rendered swatches suppress generated/source metadata tags in the tooltip; user palette colors still show only user-entered tags.

## Validation
- `node --check toolbox/colors/colors.js`
  - PASS
- `node --check toolbox/colors/palette-workspace-repository.js`
  - PASS
- `node --check tests/playwright/tools/PaletteToolMockRepository.spec.mjs`
  - PASS
- `rg -n "DEFAULT_SOURCE_PALETTES|style=|<style|onclick|onchange|oninput|onsubmit" toolbox/colors/index.html toolbox/colors/colors.js toolbox/colors/palette-workspace-repository.js tests/playwright/tools/PaletteToolMockRepository.spec.mjs`
  - PASS, no matches
- `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list`
  - PASS, 3 tests
- `npm run test:playwright:static`
  - PASS
- `git diff --check -- toolbox/colors/colors.js toolbox/colors/palette-workspace-repository.js tests/playwright/tools/PaletteToolMockRepository.spec.mjs`
  - PASS with Git LF-to-CRLF warning for the touched Playwright spec

## Verification Coverage
- Newly added swatches become selected immediately.
- Source Palette Browser direct pin/add selects the added swatch.
- Pin All selects the last newly added swatch and duplicate-only Pin All keeps selection unchanged.
- Harmony pin/add selects the added harmony swatch.
- Harmony Add All selects the last newly added swatch and duplicate-only Add All keeps selection unchanged.
- User Defined Swatch add selects the newly added custom swatch.
- Tooltip text includes Source before Tags.
- Color Harmony Source uses the scheme name.
- User Defined Source displays as `custom`.
- Tags line is omitted when the active user palette color has no user tags.

## Skipped
- Full samples smoke was not run, per BUILD instruction.
- Broad tool/runtime lanes were skipped because this PR changes only Palette Tool behavior and the targeted Palette Tool spec covers the affected runtime/UI paths.
