# PR_26156_174 Palette Fullscreen Accordion Flex Fix Report

## Result
PASS

## Summary
- Fixed the Palette Tool fullscreen accordion layout regression with reusable Theme V2 layout classes.
- Active Project Palette and Source Palette Browser now share available fullscreen vertical space evenly when both accordions are expanded.
- Collapsing either accordion lets the remaining expanded accordion take the available space.
- Scrolling is contained to the swatch grid wrappers; accordion headers, filter rows, and sort/size controls remain visible.

## Theme V2 Gap
Theme V2 did not have a reusable pattern for a fullscreen stacked accordion group where open accordions split remaining height and inner content scrolls independently from the accordion header and controls.

Reusable classes were added to fill that gap:
- `tool-center-panel--scroll-contained`
- `accordion-fill-stack`
- `accordion-fill-panel`
- `accordion-scroll-body`
- `scroll-region`

## Implementation Notes
- The Palette Tool center panel uses `tool-center-panel--scroll-contained` in focus mode to keep the center column height bounded by the fullscreen grid row.
- The fullscreen accordion stack uses `accordion-fill-stack` and `accordion-fill-panel` so expanded panels share available height while collapsed panels keep only their header height.
- Open accordion bodies use `accordion-scroll-body` and the swatch wrappers use `scroll-region` so only the palette grids scroll.
- Existing Source Palette Browser loading, search, sort, size, Pin All, pin behavior, and empty-state behavior were preserved.
- Existing Active Project Palette selected swatch, remove/unpin, sort, size, and tag behavior were preserved.

## Validation
- `node --check tests/playwright/tools/PaletteToolMockRepository.spec.mjs`
  - PASS
- `rg "style=|<style|onclick|onchange|oninput|onsubmit" toolbox/colors/index.html assets/theme-v2/css/accordion.css assets/theme-v2/css/layout.css tests/playwright/tools/PaletteToolMockRepository.spec.mjs`
  - PASS, no matches
- `npx playwright test tests/playwright/tools/PaletteToolMockRepository.spec.mjs --project=playwright --workers=1 --reporter=list`
  - PASS, 3 tests
- `npm run test:playwright:static`
  - PASS

## Manual Verification Coverage
- Both expanded accordions share fullscreen vertical space 50/50.
- Collapsing Source Palette Browser expands Active Project Palette into the remaining space.
- Collapsing Active Project Palette expands Source Palette Browser into the remaining space.
- Swatch wrappers scroll independently while headers and control rows stay visible.
- Source Palette Browser source data, Pin All, pin/unpin, sort, size, and search behavior remain covered by the targeted Palette Tool lane.
- Active Project Palette selected swatch, remove/unpin, sort, size, and tag behavior remain covered by the targeted Palette Tool lane.

## Skipped
- Full samples smoke was not run, per BUILD instruction.
