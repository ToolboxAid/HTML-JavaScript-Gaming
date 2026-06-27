# BUILD_PR - PR_26124_065-palette-manager-validation-clear-in-viewer

## Purpose
Implement one scoped Palette Manager V2 UI placement fix: move Validation/Error Viewer Clear into the Validation/Error Viewer header/control area without changing clear behavior.

## Scope
- `toolbox/palette-manager-v2/index.html`
- `toolbox/palette-manager-v2/paletteManagerV2.css`
- PR workflow docs and required review artifacts only.

## Implementation
1. Wrap the Validation/Error Viewer accordion header in a local header/action container, matching the existing User Palette and Sample Palette Swatch pattern.
2. Move `#clearValidationViewerButton` into that Validation/Error Viewer header/action container.
3. Remove the old in-content `palette-manager-v2__viewer-actions` wrapper.
4. Keep `#clearValidationViewerButton` unchanged so `PaletteValidationErrorControl.js` continues to bind it without runtime logic changes.
5. Add only scoped CSS needed for the Validation/Error Viewer header/action layout.
6. Preserve existing Clear behavior:
   - Clear removes displayed validation/error history.
   - Clear does not change palette state, swatch state, tags, sorting, pinning, or import/export data.
   - The next validation/error event displays normally.

## Boundaries
- Do not change Clear tag checkbox behavior.
- Do not change tag sorting.
- Do not change source/sample pin scroll preservation.
- Do not change pin button size.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Do not broadly refactor Palette Manager V2.

## Validation
- Syntax check changed files if any JavaScript changes are made.
- Run targeted served-browser Palette Manager V2 Validation/Error Viewer Clear placement and behavior validation.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
