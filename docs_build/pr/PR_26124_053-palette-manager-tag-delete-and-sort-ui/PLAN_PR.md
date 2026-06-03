# PLAN_PR - PR_26124_053-palette-manager-tag-delete-and-sort-ui

## Goal
Update Palette Manager V2 tag management and sorting UI without changing shared services or palette JSON contracts.

## Scope
- `toolbox/palette-manager-v2/*`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not modify shared accordionV2.
- Do not modify shared sort services.
- Do not add dependencies.
- Preserve pin/unpin, source search, swatch size, import/export, lowercase tag normalization, and duplicate user swatch guards.

## Implementation Plan
1. Restore the Add accordion title to `User Defined Swatch`.
2. Preserve the Add button label as `User Defined Swatch`.
3. Add a visible delete affordance for each tag in the Tags accordion.
4. Block tag deletion when any User Palette swatch still uses that tag and show a clear validation/error message.
5. Delete unused tags from the available tag list when no user swatch uses them.
6. Add `Tag` as a User Palette sort option.
7. Sort tagged swatches by normalized lowercase tag text and place swatches without tags after tagged swatches.
8. Keep Source Palette sort options unchanged.
9. Compact the Sample Palette Swatch source/search controls into label/input rows.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by the Palette Manager V2-only UI update.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Confirm the left Add accordion title reads `User Defined Swatch`.
3. Confirm the Add button still reads `User Defined Swatch`.
4. Add a swatch, add a tag, and confirm clicking the tag text still toggles it on/off for the selected swatch.
5. Confirm clicking the tag delete affordance blocks deletion while the tag is used.
6. Remove the tag from all swatches, then delete it from the Tags accordion.
7. Confirm User Palette sort includes `Tag` and orders tagged swatches before untagged swatches.
8. Confirm Sample Palette Swatch Source palette and Search source swatches controls render as compact label/input rows.
