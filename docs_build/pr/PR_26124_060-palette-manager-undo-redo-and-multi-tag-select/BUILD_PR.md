# BUILD_PR - PR_26124_060-palette-manager-undo-redo-and-multi-tag-select

## Purpose
Implement one scoped Palette Manager V2 update: local undo/redo history for user palette mutations plus User Palette multi-select and batch tag application.

## Scope
- `tools/palette-manager-v2/index.html`
- `tools/palette-manager-v2/modules/PaletteManagerApp.js`
- `tools/palette-manager-v2/modules/SwatchRow.js`
- `tools/palette-manager-v2/modules/PaletteHistoryStack.js`
- `tools/palette-manager-v2/controls/PaletteEditorControl.js`
- `tools/palette-manager-v2/controls/UserPaletteControl.js`
- `tools/palette-manager-v2/paletteManagerV2.css`
- PR workflow docs and required review artifacts only.

## Source History Search Result
Search `src/` for undo/history/command stack classes before changing runtime files.

Result: no reusable undo/history/command stack class suitable for Palette Manager V2 user palette mutations was found under `src/`; implement the smallest local Palette Manager V2 history stack.

## Implementation
1. Add `Undo` and `Redo` buttons to the existing `menuSample` button group.
2. Add a local `PaletteHistoryStack` module under `tools/palette-manager-v2/modules/`.
3. Snapshot and restore:
   - user swatches
   - selected user swatch index
   - available unused tag list
4. Record history for:
   - add user swatch
   - update user swatch
   - remove/unpin swatch
   - pin source swatch
   - Pin All source swatches
   - add/remove tag
   - batch add/remove tag
   - delete unused tag
5. Do not record view-only changes such as sort, search, size, accordion open/close, or source swatch browse.
6. Add a checkbox to each User Palette tile with click handling isolated from tile selection.
7. Add selected-count display near User Palette controls.
8. Preserve single selected-swatch tag behavior when no User Palette checkboxes are selected.
9. When one or more User Palette checkboxes are selected, apply Add Tag and existing tag clicks across checked swatches.
10. Avoid duplicate tags and preserve lowercase tag normalization.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Do not broadly refactor Palette Manager V2.

## Validation
- Syntax check changed JavaScript files.
- Run targeted served-browser Palette Manager V2 undo/redo, multi-select, and batch tag validation.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
