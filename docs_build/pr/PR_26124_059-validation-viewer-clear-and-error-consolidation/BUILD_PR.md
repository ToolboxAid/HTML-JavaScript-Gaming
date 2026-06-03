# BUILD_PR - PR_26124_059-validation-viewer-clear-and-error-consolidation

## Purpose
Implement one scoped Palette Manager V2 validation viewer update: add display-only clearing and consolidate duplicate user swatch validation messages.

## Scope
- `toolbox/palette-manager-v2/index.html`
- `toolbox/palette-manager-v2/modules/PaletteManagerApp.js`
- `toolbox/palette-manager-v2/controls/PaletteValidationErrorControl.js`
- `toolbox/palette-manager-v2/paletteManagerV2.css`
- PR workflow docs and required review artifacts only.

## Implementation
1. Add a `Clear` button to Validation/Error Viewer.
2. Add the button to Palette Manager required refs.
3. Bind the `Clear` button in `PaletteValidationErrorControl`.
4. Clear only the visible viewer output; do not mutate the app validation/error state.
5. Let new validation/status changes render again after clearing.
6. Consolidate duplicate guard errors from `validateUniqueUserSwatchFields`.
7. Format duplicate guard output as:
   `Duplicate user swatch symbol: <symbol>.name: <name>.RGB/hex: <hex>.`
8. Only include fields that actually failed.
9. Preserve existing duplicate validation behavior for symbol, name, and RGB/hex.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Do not broadly refactor Palette Manager V2.

## Validation
- Syntax check changed JavaScript files.
- Run targeted served-browser Palette Manager V2 validation viewer and duplicate consolidation validation.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
