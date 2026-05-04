# APPLY_PR - PR_26124_064-palette-manager-source-pin-scroll-preserve

## Summary
Updated Palette Manager V2 source grid scroll preservation so individual source pin/unpin restores scroll position after render.

## Applied Changes
- Updated `preserveSourceScrollDuring` in `tools/palette-manager-v2/controls/SourcePaletteBrowserControl.js`.
- Preserved `sourceSwatchList.scrollTop` before the existing pin/unpin action.
- Restored `sourceSwatchList.scrollTop` inside `requestAnimationFrame` after render.
- Kept existing pin/unpin behavior unchanged.
- Did not change Clear checkbox behavior, tag sorting, pin button size, or Validation/Error Viewer behavior.

## Validation
- `node --check tools/palette-manager-v2/controls/SourcePaletteBrowserControl.js`: PASS.
- Targeted served-browser Palette Manager V2 individual source pin/unpin scroll preservation validation: PASS.
- `git diff --check`: PASS with Git LF-to-CRLF warning for generated review artifact.
- `npm run test:workspace-v2`: FAIL, `package.json` does not define `test:workspace-v2`.
- Full samples smoke test: skipped by instruction.

## Artifacts
- Review diff: `docs/dev/reports/codex_review.diff`
- Changed files: `docs/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26124_064-palette-manager-source-pin-scroll-preserve_delta.zip`
