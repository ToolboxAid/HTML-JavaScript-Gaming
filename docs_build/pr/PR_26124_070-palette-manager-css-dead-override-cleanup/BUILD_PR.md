# BUILD_PR - PR_26124_070-palette-manager-css-dead-override-cleanup

## Purpose
Perform one scoped Palette Manager V2 CSS cleanup by removing only confirmed dead or duplicate override blocks from `paletteManagerV2.css`.

## Scope
- `tools/palette-manager-v2/paletteManagerV2.css`
- PR workflow docs and required review artifacts.

## Implementation
1. Inspect `tools/palette-manager-v2/paletteManagerV2.css` and the shared accordionV2 CSS for direct duplicate coverage.
2. Remove only these confirmed dead/duplicate blocks:
   - `.palette-manager-v2__right-accordion--import`
     - closed-state `flex`, `min-height`, and `overflow` are already covered by shared accordionV2 closed/base rules; open behavior remains in `.palette-manager-v2__right-accordion--import.is-open`.
   - `.palette-manager-v2__right-accordion--import .accordion-v2__content`
     - duplicates shared `.accordion-v2__content` `flex`, `min-height`, and `overflow` values.
   - `.palette-manager-v2__right-accordion--validation.is-open`
     - duplicates the base `.palette-manager-v2__right-accordion--validation` flex value.
   - `.palette-manager-v2__panel--center .accordion-v2__content .palette-manager-v2__tile-grid`
     - duplicates the base `.palette-manager-v2__tile-grid` flex value and only restates default `max-height: none`.
3. Keep all active sizing/layout rules that are not fully duplicated.
4. Keep the final append-only `.palette-manager-v2__pin-button--tile` override at EOF untouched.

## Boundaries
- Do not modify HTML or JavaScript.
- Do not refactor class names.
- Do not merge rules.
- Do not change layout, spacing, sizing, pin styling, or pin size.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.

## Validation
- Run a CSS structural syntax check.
- Run targeted CSS cleanup validation confirming removed dead selectors are absent and the append-only pin override remains at EOF.
- Run `git diff --check`.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
