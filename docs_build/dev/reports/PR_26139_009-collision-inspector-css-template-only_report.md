# PR_26139_009-collision-inspector-css-template-only

## Scope
- Added the official First-Class Tool Starter V2 stylesheet to Collision Inspector V2.
- Removed Collision Inspector V2 CSS rules that restyled Tool Starter/template foundations.
- Kept only tool-specific Collision Inspector layout, result, canvas, legend, scroll, and fullscreen rules.
- Preserved A/B rotate inputs, fixed three-decimal Origins output, scale normalization, and shared engine collision behavior from PR_26139_008.

## Template CSS Cleanup
- Removed local `:root` theme variable declarations from `tools/collision-inspector-v2/styles/collisionInspectorV2.css`.
- Removed local body/page shell styling.
- Removed local global `button`, `input`, `select`, and `textarea` styling.
- Removed local Tool Starter header, menu, panel, field, and output base styling.
- Removed local accordion base styling.
- Collision Inspector V2 now consumes `../templates-v2/styles/toolStarter.css` as the visual source of truth.

## Remaining Tool-Specific CSS
- Equal-height open accordion groups for the left and right Collision Inspector panels.
- Manifest summary, result badge, metrics, canvas viewport, canvas physical-size normalization, legend markers, scroll containers, and fullscreen Collision Inspector grid placement.
- These rules are scoped to `collision-inspector-v2` selectors or specific tool element IDs.

## Validation
- PASS: `node --check tests/playwright/tools/CollisionInspectorV2.spec.mjs`
- PASS: `npx playwright test tests/playwright/tools/CollisionInspectorV2.spec.mjs --project=playwright --workers=1 --reporter=list`
  - Validates the template stylesheet link is present.
  - Validates Collision Inspector V2 uses Tool Starter structure/classes.
  - Validates Collision Inspector CSS does not redefine `:root`, body/page shell, global controls, Tool Starter base selectors, or accordion base selectors.
  - Validates left/right accordions still share vertical space evenly.
  - Validates A/B rotate inputs, fixed Origins output, scale normalization, collision modes, drag collision, zoom, logs accordion, missing dimensions failure, and workspace launch behavior.
- PASS: `npm run build:manifest`
  - This repo does not define a plain `npm run build`; `build:manifest` is the available build script.
  - Removed generated `docs/build` output after validation.
- PASS: `git diff --check`
  - Only CRLF working-copy warnings were reported.

## Full Samples Smoke Test
- Skipped as requested. This PR is limited to Collision Inspector V2 CSS/template alignment and targeted visual/layout validation.

## Changed Files
- `tools/collision-inspector-v2/index.html`
- `tools/collision-inspector-v2/styles/collisionInspectorV2.css`
- `tests/playwright/tools/CollisionInspectorV2.spec.mjs`
