# APPLY_PR - PR_26124_052-palette-manager-tag-normalization-and-duplicate-guards

## Summary
Implemented the Palette Manager V2 tag normalization and duplicate guard cleanup.

## Applied Changes
- Tags are normalized to lowercase through Palette Manager V2 tag handling and export/import flows.
- Add accordion no longer exposes Source or Tags fields.
- Selected Swatch tag pills can be clicked to remove that tag from the selected swatch.
- Add and Update now reject duplicate user-defined swatch names, RGB/hex values, and symbols.
- Duplicate validation messages identify the duplicate field that blocked the action.
- Palette Manager V2 usage docs describe lowercase tags, duplicate guards, and selected-tag removal.

## Validation
- `node --check tools/palette-manager-v2/controls/PaletteEditorControl.js`: PASS.
- `node --check tools/palette-manager-v2/modules/PaletteManagerApp.js`: PASS.
- `node --check tools/palette-manager-v2/modules/paletteUtils.js`: PASS.
- `git diff --check`: PASS.
- `git diff --cached --check`: PASS.
- Targeted served-browser Palette Manager V2 validation: PASS.
- `npm run test:workspace-v2`: FAIL, `package.json` does not define `test:workspace-v2`.
- Full samples smoke test: skipped by instruction.

## Artifacts
- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26124_052-palette-manager-tag-normalization-and-duplicate-guards_delta.zip`
