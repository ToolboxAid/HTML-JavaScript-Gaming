# BUILD_PR - PR_26124_055-palette-manager-center-menu-actions

## Purpose
Implement one scoped Palette Manager V2 CSS update: center the JSON action buttons in the `menuSample` nav.

## Scope
- `tools/palette-manager-v2/paletteManagerV2.css`
- PR workflow docs and required review artifacts only.

## Implementation
1. Update the `menuSample` container to use flex centering for the menu action group.
2. Horizontally center the Import JSON, Copy JSON, and Export JSON button group.
3. Keep buttons on one row when space allows.
4. Allow wrapping only if the viewport is too small.
5. Maintain existing spacing and button behavior.

## Boundaries
- Do not modify `tools/shared`.
- Do not change button IDs, markup, or JavaScript behavior.
- Do not affect other layout sections.
- Do not add dependencies.
- Do not refactor beyond `menuSample` layout CSS.

## Validation
- Syntax check changed files. No JavaScript files are expected to change.
- Run targeted served-browser Palette Manager V2 menu alignment check.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
