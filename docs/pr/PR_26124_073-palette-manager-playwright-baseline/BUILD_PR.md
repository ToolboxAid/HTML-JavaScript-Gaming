# BUILD_PR - PR_26124_073-palette-manager-playwright-baseline

## Purpose
Add one targeted Palette Manager V2 Playwright baseline test that protects current working behavior without runtime changes.

## Scope
- `tests/tools/PaletteManagerV2Baseline.test.mjs`
- Required PR workflow docs and review artifacts.

## Implementation
1. Add a Node-run Playwright test under `tests/tools`.
2. Use the existing repo static server helper.
3. Load `tools/palette-manager-v2/index.html`.
4. Assert no page errors or console errors occur during the baseline interactions.
5. Assert `menuSample` and JSON action buttons exist and are actionable.
6. Toggle each requested accordion closed and open using existing `accordion-v2` headers.
7. Assert Validation/Error Viewer Clear is inside the viewer header.
8. Select a scrollable source palette, scroll the source swatch grid, click an individual tile pin, and assert scrollTop is preserved after render.
9. Create test user swatches through the UI, add tags through the Tags control, and verify Tag ascending/descending sorts keep untagged swatches last.

## Boundaries
- Do not change Palette Manager V2 runtime behavior unless a tiny selector hook is required.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not change CSS layout or pin styling.
- Do not add dependencies.
- Do not run the full samples smoke test.

## Validation
- Run `node --check tests/tools/PaletteManagerV2Baseline.test.mjs`.
- Run `node tests/tools/PaletteManagerV2Baseline.test.mjs`.
- Run `npm run test:workspace-v2`.
- Run `git diff --check`.
- Skip the full samples smoke test.
