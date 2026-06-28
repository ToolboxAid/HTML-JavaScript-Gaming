# BUILD_PR - PR_26124_064-palette-manager-source-pin-scroll-preserve

## Purpose
Implement one scoped Palette Manager V2 source grid scroll preservation fix for individual source swatch pin/unpin.

## Scope
- `toolbox/palette-manager-v2/controls/SourcePaletteBrowserControl.js`
- PR workflow docs and required review artifacts only.

## Implementation
1. Update `preserveSourceScrollDuring` in `SourcePaletteBrowserControl.js`.
2. Capture `this.refs.sourceSwatchList.scrollTop` before executing the action.
3. Execute the existing action without changing pin/unpin behavior.
4. Restore `this.refs.sourceSwatchList.scrollTop` inside `requestAnimationFrame` after render.
5. Keep Pin All behavior unchanged except for natural benefit from the same helper if it uses that helper.

## Boundaries
- Do not change Clear checkbox behavior.
- Do not change tag sorting.
- Do not change pin button size.
- Do not change Validation/Error Viewer behavior.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Do not broadly refactor Palette Manager V2.

## Validation
- Syntax check changed JavaScript files.
- Run targeted served-browser Palette Manager V2 individual source pin/unpin scroll preservation validation.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
