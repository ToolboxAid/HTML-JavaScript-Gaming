# BUILD_PR - PR_26124_061-palette-manager-tag-clear-undo-location-and-pin-scroll

## Purpose
Implement one scoped Palette Manager V2 refinement: Palette heading action controls, User Palette selection clear button, and Sample Palette scroll preservation during pin actions.

## Scope
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/modules/PaletteManagerApp.js`
- `tools/palette-manager-v2/controls/PaletteEditorControl.js`
- `tools/palette-manager-v2/controls/UserPaletteControl.js`
- `tools/palette-manager-v2/controls/SourcePaletteBrowserControl.js`
- `tools/palette-manager-v2/paletteManagerV2.css`
- PR workflow docs and required review artifacts only.

## Implementation
1. Move `Undo` and `Redo` out of the `menuSample` nav.
2. Add User Palette heading actions containing `Undo`, `Redo`, and `Clear` beside the accordion toggle header.
3. Preserve existing Undo/Redo refs and behavior.
4. Add a `Clear` button to the User Palette heading action area.
5. Add the `Clear` button to Palette Manager required refs.
6. Make `Clear` clear User Palette swatch checkboxes only.
7. Leave Add Tag behavior unchanged.
8. Preserve lowercase tag normalization and duplicate tag avoidance.
9. Move `Source palette` and `Pin All` into the Sample Palette Swatch heading action area.
10. Preserve Sample Palette grid scroll position around individual source pin/unpin actions.
11. Preserve Sample Palette grid scroll position around Pin All where possible.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Do not change shared accordionV2 behavior.
- Do not broadly refactor Palette Manager V2.

## Validation
- Syntax check changed JavaScript files.
- Run targeted served-browser Palette Manager V2 selection clear, heading action placement, tag add, and source scroll preservation validation.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
