# BUILD_PR - PR_26124_051-palette-manager-tags-accordion-and-label-cleanup

## Purpose
Implement one scoped Palette Manager V2 cleanup: centralize tag actions in a left-column Tags accordion, remove duplicate selected heading text, compact field layout, and shorten user-facing labels.

## Scope
- `toolbox/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Implementation
1. Remove the repeated `h2#editorTitle` inside Selected Swatch content and remove matching runtime dependency.
2. Add a left-column `Tags` accordion:
   - displays all tags from existing User Palette swatches,
   - includes one Tag name input and one Add Tag button,
   - clicking an existing tag toggles add/remove for the currently selected swatch,
   - Add Tag adds typed text to the currently selected swatch,
   - duplicate tags on the same swatch are avoided.
3. Remove Tag name/Add Tag controls from Selected Swatch and User Defined Swatch.
4. Keep tags read-only in Selected Swatch and User Defined Swatch displays.
5. Apply compact label-left/input-right field rows to Selected Swatch and User Defined Swatch.
6. Rename:
   - `User Defined Swatch` accordion to `Add`,
   - `Add User Swatch` button to `Add`,
   - `Update Swatch` button to `Update`.
7. Preserve pin/unpin, sort, search, size, import/export, accordion behavior, and tag roundtrip.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Do not modify shared accordionV2.
- Do not broaden changes beyond Palette Manager V2 behavior and PR workflow docs.

## Validation
- Syntax check changed files.
- Run targeted served-browser Palette Manager V2 Tags accordion and label cleanup check.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
