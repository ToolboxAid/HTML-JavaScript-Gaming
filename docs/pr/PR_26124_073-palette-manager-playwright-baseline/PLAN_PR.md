# PLAN_PR - PR_26124_073-palette-manager-playwright-baseline

## Goal
Add targeted Playwright baseline coverage for Palette Manager V2 without changing runtime behavior.

## Scope
- `tests/tools/PaletteManagerV2Baseline.test.mjs`
- Required PR workflow docs and review artifacts.

## Boundaries
- Update Palette Manager V2 tests only.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not change CSS layout or pin styling.
- Do not add dependencies.
- Do not run the full samples smoke test.

## Test Plan
The new targeted Playwright test will verify:
- Palette Manager V2 loads without page/runtime/console errors.
- `menuSample` exists.
- Import JSON, Copy JSON, and Export JSON buttons exist, are visible, enabled, and actionable.
- User Palette accordion opens and collapses.
- Sample Palette Swatch accordion opens and collapses.
- Tags accordion opens and collapses.
- Selected Swatch accordion opens and collapses.
- User Defined Swatch accordion opens and collapses.
- Palette JSON accordion opens and collapses.
- Validation/Error Viewer accordion opens and collapses.
- Validation/Error Viewer Clear button exists inside its viewer header.
- Individual source palette pinning preserves source grid scroll position.
- User Palette Tag sort keeps untagged swatches last for ascending and descending with test-created swatches.

## Playwright
- Targeted command: `node tests/tools/PaletteManagerV2Baseline.test.mjs`
- Expected pass behavior: the tool page loads, baseline controls are actionable, accordionV2 toggles work, source pin scroll is preserved, and tag sort keeps untagged swatches last in both directions.
- Expected fail behavior: the test fails with a specific assertion for missing controls, runtime errors, broken accordion state, scroll reset, or tag sort regression.
- Default gate: `npm run test:workspace-v2`

## Manual Validation
1. Open `tools/palette-manager-v2/index.html`.
2. Confirm the Palette Manager V2 page loads without visible errors.
3. Confirm Import JSON, Copy JSON, and Export JSON are centered in `menuSample`.
4. Collapse and reopen each Palette Manager accordion.
5. Scroll the Sample Palette Swatch grid and pin an individual source swatch; confirm the grid stays at the same scroll position.
6. Add user swatches with and without tags, sort by Tag ascending and descending, and confirm untagged swatches stay after tagged swatches.
