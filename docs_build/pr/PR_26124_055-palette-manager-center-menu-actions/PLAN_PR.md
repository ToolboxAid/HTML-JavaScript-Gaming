# PLAN_PR - PR_26124_055-palette-manager-center-menu-actions

## Goal
Center the Palette Manager V2 JSON action buttons in the `menuSample` nav without changing button behavior or other layout sections.

## Scope
- `tools/palette-manager-v2/paletteManagerV2.css`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not modify `tools/shared`.
- Do not change Import JSON, Copy JSON, or Export JSON behavior.
- Do not affect other Palette Manager layout sections.
- Do not add dependencies.
- Do not refactor beyond `menuSample` layout CSS.

## Implementation Plan
1. Update `.palette-manager-v2__menu-sample` to center its content with flex layout.
2. Keep the `menuSample` label visible.
3. Center `.palette-manager-v2__menu-actions` horizontally in the nav.
4. Keep the action buttons on one row when space allows.
5. Allow wrapping only on narrow viewports.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by the Palette Manager V2 CSS-only menu alignment update.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Confirm `menuSample` remains immediately above the tool shell.
3. Confirm Import JSON, Copy JSON, and Export JSON are horizontally centered in the menu.
4. Confirm the buttons remain on one row at normal desktop width.
5. Confirm the buttons wrap only when the viewport is too narrow.
6. Confirm Import JSON, Copy JSON, and Export JSON behavior is unchanged.
