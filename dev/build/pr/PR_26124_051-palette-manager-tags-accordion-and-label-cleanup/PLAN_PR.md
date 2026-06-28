# PLAN_PR - PR_26124_051-palette-manager-tags-accordion-and-label-cleanup

## Goal
Clean up Palette Manager V2 left-column labels and move tag management into a single Tags accordion.

## Scope
- `toolbox/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Do not modify shared accordionV2.
- Preserve pin/unpin, sort, search, size, import/export, and tag roundtrip behavior.

## Implementation Plan
1. Remove the duplicate `h2#editorTitle` inside Selected Swatch content.
2. Add a left-column `Tags` accordion that lists all tags from existing User Palette swatches.
3. Move Tag name input and Add Tag button into the `Tags` accordion.
4. Remove Tag name/Add Tag controls from Selected Swatch and User Defined Swatch.
5. Make tag list clicks toggle add/remove for the currently selected swatch.
6. Keep selected/user-defined tags as read-only displays.
7. Compact Selected Swatch and User Defined Swatch fields into label-left/input-right rows.
8. Rename User Defined Swatch accordion to `Add`, `Add User Swatch` to `Add`, and `Update Swatch` to `Update`.

## Playwright
- Command: `npm run test:workspace-v2`
- Expected pass behavior: Workspace V2 validation remains green after Palette Manager V2-only changes.
- Expected fail behavior: failures identify Workspace V2 regressions or a missing validation command.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2 through a local server.
2. Confirm Selected Swatch has no duplicate inner heading.
3. Confirm the left column contains Selected Swatch, Add, and Tags accordions.
4. Confirm Symbol/Hex/Name/Source/Tags rows use compact label-left/input-right layout.
5. Add a user swatch, add a tag through the Tags accordion, and confirm export contains it.
6. Click an existing tag in Tags accordion and confirm it toggles on/off for the selected swatch.
7. Select a source-palette swatch and confirm Tags accordion does not mutate data without a selected user swatch.
