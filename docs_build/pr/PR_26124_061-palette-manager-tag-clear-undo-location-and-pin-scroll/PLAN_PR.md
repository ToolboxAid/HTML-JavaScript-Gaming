# PLAN_PR - PR_26124_061-palette-manager-tag-clear-undo-location-and-pin-scroll

## Goal
Refine Palette Manager V2 heading controls, User Palette selection clearing, and Sample Palette scroll preservation while pinning.

## Scope
- `toolbox/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Preserve accordionV2 behavior.
- Preserve import/export, sort, search, size, pin/unpin, Pin All, multi-select, and existing tag behavior.
- Avoid broad refactor.

## Implementation Plan
1. Add a `Clear` button to the User Palette heading action area.
2. Make the `Clear` button clear User Palette swatch checkboxes only.
3. Do not change tag Add behavior; it continues to add tags to the selected swatch or checked swatches.
4. Preserve lowercase tag normalization and duplicate tag avoidance.
5. Move `Undo` and `Redo` out of `menuSample`.
6. Place `Undo` and `Redo` in the User Palette accordion heading action area.
7. Preserve existing undo/redo behavior.
8. Move `Source palette` and `Pin All` into the Sample Palette Swatch accordion heading action area.
9. Preserve Sample Palette grid scroll position during individual pin/unpin actions.
10. Preserve Sample Palette grid scroll position for Pin All where possible.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by this Palette Manager V2-only UI behavior update.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Confirm `Undo` and `Redo` are in the User Palette accordion heading area and no longer appear in `menuSample`.
3. Add a user swatch and add a lowercase-normalized tag.
4. Check multiple User Palette swatches and confirm the selected count updates.
5. Click the User Palette `Clear` button and confirm all User Palette checkboxes are cleared.
6. Add a tag and confirm tag Add behavior still applies to the selected swatch or checked swatches.
7. Confirm `Source palette` and `Pin All` are in the Sample Palette Swatch accordion heading area.
8. Scroll the Sample Palette grid down and click an individual pin button.
9. Confirm the Sample Palette grid remains at the same scroll position after pinning.
10. Scroll the Sample Palette grid down and click `Pin All`.
11. Confirm the Sample Palette grid does not jump back to the top.
