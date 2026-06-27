# PLAN_PR - PR_26124_063-palette-manager-tag-sort-untagged-last

## Goal
Fix Palette Manager V2 User Palette Tag descending sort so untagged swatches stay after tagged swatches.

## Scope
- `toolbox/palette-manager-v2/modules/PaletteManagerApp.js`
- PR workflow docs and required review artifacts only.

## Boundaries
- Do not change Clear checkbox behavior.
- Do not change pin button size.
- Do not change source/sample pin scroll preservation.
- Do not change Validation/Error Viewer behavior.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `toolbox/shared`.
- Do not add dependencies.
- Avoid broad refactor.

## Implementation Plan
1. Update only User Palette Tag sort comparison logic in `PaletteManagerApp.js`.
2. Keep tagged swatches before untagged swatches for both ascending and descending.
3. Sort tagged swatches A-Z for ascending.
4. Sort tagged swatches Z-A for descending.
5. Preserve original order for equivalent tag keys and untagged swatches.

## Playwright
- Command: `npm run test:workspace-v2`
- What Playwright validates: Workspace V2/tool lifecycle coverage remains unchanged by this Palette Manager V2-only sort update.
- Expected pass behavior: Workspace V2 validation remains green.
- Expected fail behavior: missing script or Workspace V2 regression is reported.
- Full samples smoke test: skipped by instruction.

## Manual Validation
1. Open Palette Manager V2.
2. Create or import User Palette swatches with tags `alpha`, `zulu`, and at least one untagged swatch.
3. Click User Palette `Tag` sort once.
4. Confirm tagged swatches sort A-Z and untagged swatches remain last.
5. Click User Palette `Tag` sort again.
6. Confirm tagged swatches sort Z-A and untagged swatches remain last.
7. Confirm Clear checkbox behavior, pin button size, source/sample pin scroll preservation, and Validation/Error Viewer behavior are unchanged.
