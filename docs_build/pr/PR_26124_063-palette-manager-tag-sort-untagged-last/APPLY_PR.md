# APPLY_PR - PR_26124_063-palette-manager-tag-sort-untagged-last

## Summary
Fixed Palette Manager V2 User Palette Tag descending sort so untagged swatches remain after tagged swatches.

## Applied Changes
- Updated `sortRowsByTag` in `tools/palette-manager-v2/modules/PaletteManagerApp.js`.
- Removed full-array reverse from Tag descending sort.
- Kept untagged swatches after tagged swatches for both ascending and descending.
- Preserved stable original order for equal tag keys and untagged rows.
- Did not change Clear checkbox behavior, pin sizing, source/sample pin scroll preservation, or Validation/Error Viewer behavior.

## Validation
- `node --check tools/palette-manager-v2/modules/PaletteManagerApp.js`: PASS.
- Targeted served-browser Palette Manager V2 Tag ascending/descending sort validation: PASS.
- `git diff --check`: PASS.
- `npm run test:workspace-v2`: FAIL, `package.json` does not define `test:workspace-v2`.
- Full samples smoke test: skipped by instruction.

## Artifacts
- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26124_063-palette-manager-tag-sort-untagged-last_delta.zip`
