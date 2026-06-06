# PR_26156_175 Palette Swatch Harmony and Tool Center Flex Report

## Result
PASS

## Summary
- Promoted fullscreen Tool Center accordion height behavior beyond Palette-only markup.
- Removed Palette Colors selected-summary symbols so the visible summary reads as the swatch name plus the existing `Selected` label.
- Stopped pinned/copied source and harmony colors from inheriting source metadata tags into user Palette Colors.
- Removed Harmony `Add Selected` and made harmony swatches use the same red/green pin behavior as other swatches.

## Theme V2 Gap
PR_26156_174 added reusable fill classes but Palette still opted into the center fullscreen containment directly. Theme V2 did not yet have a reusable Tool Center fullscreen pattern that automatically contains center accordion stacks, supports direct center accordions, and keeps accordion body scrolling separate from headers.

Reusable Theme V2 behavior was added in:
- `layout.css`: Tool Center panels with an accordion fill stack or direct center accordions become scroll-contained only in fullscreen.
- `accordion.css`: Direct Tool Center accordions flex-share fullscreen space and scroll only their accordion body.
- `panels.css`: Direct-accordion Tool Center intro media/copy compacts only in fullscreen so the accordion stack has usable vertical space.

## Palette Behavior
- Selected summary now shows only the selected swatch name, for example `Black` in the value cell beside the `Selected` label.
- Source swatch tags remain visible as source metadata, but pinned source colors enter Palette Colors with empty user tags.
- Harmony-generated colors enter Palette Colors with empty user tags.
- Harmony swatches show the same pin dot as source and Palette Colors swatches.
- Clicking an unpinned harmony swatch adds it to Palette Colors and turns the dot green.
- Clicking a pinned harmony swatch removes that color from Palette Colors and returns the dot to red.
- Harmony Add All still adds remaining unpinned harmony colors and skips duplicates.

## Validation
- `node --check toolbox/colors/colors.js`
  - PASS
- `node --check toolbox/colors/palette-workspace-repository.js`
  - PASS
- `node --check tests/playwright/tools/PaletteToolMockRepository.spec.mjs`
  - PASS
- `node --check tests/playwright/tools/ToolCenterFullscreenAccordion.spec.mjs`
  - PASS
- `rg "style=|<style|onclick|onchange|oninput|onsubmit" toolbox/colors/index.html toolbox/colors/colors.js toolbox/colors/palette-workspace-repository.js assets/theme-v2/css/layout.css assets/theme-v2/css/accordion.css assets/theme-v2/css/panels.css tests/playwright/tools/PaletteToolMockRepository.spec.mjs tests/playwright/tools/ToolCenterFullscreenAccordion.spec.mjs`
  - PASS, no matches
- `npx playwright test tests/playwright/tools/ToolCenterFullscreenAccordion.spec.mjs --project=playwright --workers=1 --reporter=list`
  - PASS, 1 test
- `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list`
  - PASS, 3 tests
- `npm run test:playwright:static`
  - PASS

## Verification Coverage
- Fullscreen Palette accordions still share available center height and keep controls visible.
- Fullscreen Publish Tool Center direct accordions share available height and expand when the other accordion collapses.
- Only accordion body/swatch content scrolls in the tested fullscreen accordion layouts.
- Palette selected summary omits the swatch symbol.
- Source-pinned user Palette Colors do not inherit source tags.
- Harmony-pinned user Palette Colors do not inherit harmony/source tags.
- Harmony swatches use red/green pinned state and click-to-add/click-to-remove behavior.
- Harmony Add All skips duplicates.

## Notes
- A broader exploratory run of `tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs` exposed existing identity-row copy expectation drift unrelated to this PR. The focused shared Tool Center fullscreen spec was added and passed as the targeted validation lane.

## Skipped
- Full samples smoke was not run, per BUILD instruction.
