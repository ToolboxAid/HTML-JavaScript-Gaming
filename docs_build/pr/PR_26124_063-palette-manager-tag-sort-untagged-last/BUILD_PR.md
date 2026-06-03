# BUILD_PR - PR_26124_063-palette-manager-tag-sort-untagged-last

## Purpose
Implement one scoped Palette Manager V2 sort fix: User Palette Tag descending sort keeps untagged swatches after tagged swatches.

## Scope
- `tools/palette-manager-v2/modules/PaletteManagerApp.js`
- PR workflow docs and required review artifacts only.

## Implementation
1. Update `sortRowsByTag` in `PaletteManagerApp.js`.
2. Do not call full-array reverse for Tag descending sort.
3. Keep untagged swatches after tagged swatches in both directions.
4. For tagged swatches:
   - ascending uses A-Z tag comparison,
   - descending uses Z-A tag comparison.
5. Preserve stable original order for equal tag keys and untagged rows.

## Boundaries
- Do not change Clear checkbox behavior.
- Do not change pin button size.
- Do not change source/sample pin scroll preservation.
- Do not change Validation/Error Viewer behavior.
- Do not touch workspace/toolState/session behavior.
- Do not touch sample JSON.
- Do not modify `tools/shared`.
- Do not add dependencies.
- Do not broadly refactor Palette Manager V2.

## Validation
- Syntax check changed JavaScript files.
- Run targeted served-browser Palette Manager V2 Tag ascending/descending sort validation.
- Run `npm run test:workspace-v2`.
- Skip the full samples smoke test.
