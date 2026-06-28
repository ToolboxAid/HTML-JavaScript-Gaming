# APPLY_PR - PR_26124_073-palette-manager-playwright-baseline

## Summary
Added a targeted Node-run Playwright baseline test for Palette Manager V2.

## Applied Changes
- Added `tests/tools/PaletteManagerV2Baseline.test.mjs`.
- The test uses the existing repo static server helper and drives the live Palette Manager V2 page.
- No Palette Manager runtime, CSS, workspace/toolState/session, sample JSON, or `toolbox/shared` files were changed.

## Coverage
- Tool loads without page/runtime/console errors.
- `menuSample` exists.
- Import JSON, Copy JSON, and Export JSON buttons are visible, enabled, and actionable.
- User Palette, Sample Palette Swatch, Tags, Selected Swatch, User Defined Swatch, Palette JSON, and Validation/Error Viewer accordions collapse and reopen.
- Validation/Error Viewer Clear button exists inside its viewer header.
- Individual source palette pinning preserves source grid scroll position.
- User Palette Tag sort keeps untagged swatches after tagged swatches for ascending and descending sort.

## Validation
- PASS: `node --check tests/tools/PaletteManagerV2Baseline.test.mjs`
- PASS: `node tests/tools/PaletteManagerV2Baseline.test.mjs`
- PASS: `git diff --check`
- FAIL: `npm run test:workspace-v2` is unavailable because `package.json` does not define a `test:workspace-v2` script.
- SKIPPED: full samples smoke test, by instruction.

## Manual Test
1. Open `toolbox/palette-manager-v2/index.html`.
2. Confirm the tool loads without visible errors.
3. Confirm Import JSON, Copy JSON, and Export JSON remain centered in `menuSample`.
4. Collapse and reopen each Palette Manager accordion.
5. Scroll Sample Palette Swatch and pin an individual source swatch; confirm scroll position stays stable.
6. Add tagged and untagged user swatches, sort by Tag ascending and descending, and confirm untagged swatches remain last.
