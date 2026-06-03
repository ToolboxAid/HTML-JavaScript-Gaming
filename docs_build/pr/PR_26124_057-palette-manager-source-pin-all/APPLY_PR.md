# APPLY_PR - PR_26124_057-palette-manager-source-pin-all

## Summary
Implemented Palette Manager V2 Sample Palette Swatch `Pin All` for currently visible source swatches and removed `Tag` sorting from Sample Palette Swatch only.

## Applied Changes
- User Palette sort keeps Hue, Saturation, Brightness, Name, and Tag.
- Sample Palette Swatch sort now shows Hue, Saturation, Brightness, and Name only.
- Added a `Pin All` button to Sample Palette Swatch.
- `Pin All` pins only the currently visible/filtered source swatches.
- `Pin All` skips duplicates using the existing user duplicate guards for name, RGB/hex, and symbol.
- `Pin All` reports pinned and skipped counts in the status area.
- `Pin All` sits to the right of the Source palette dropdown with a compact local size bump.
- Source pins do not carry tags into User Palette export data.
- Individual source pin/unpin behavior remains intact.

## Validation
- `node --check tools/palette-manager-v2/modules/PaletteManagerApp.js`: PASS.
- `node --check tools/palette-manager-v2/controls/SourcePaletteBrowserControl.js`: PASS.
- `node --check tools/palette-manager-v2/controls/UserPaletteControl.js`: PASS.
- Targeted served-browser Palette Manager V2 source sort and `Pin All` validation: PASS.
- Targeted served-browser `Pin All` source dropdown placement and size validation: PASS.
- `git diff --check`: PASS with Git LF-to-CRLF warning for `tools/palette-manager-v2/index.html`.
- `npm run test:workspace-v2`: FAIL, `package.json` does not define `test:workspace-v2`.
- Full samples smoke test: skipped by instruction.

## Artifacts
- Review diff: `docs_build/dev/reports/codex_review.diff`
- Changed files: `docs_build/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26124_057-palette-manager-source-pin-all_delta_2.zip`
