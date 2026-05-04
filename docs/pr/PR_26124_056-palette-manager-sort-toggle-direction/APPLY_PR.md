# APPLY_PR - PR_26124_056-palette-manager-sort-toggle-direction

## Summary
Implemented independent sort key and direction toggles for Palette Manager V2 User Palette and Source Palette controls.

## Applied Changes
- User Palette now tracks sort key and direction independently.
- Source Palette now tracks sort key and direction independently.
- Both sort controls include Hue, Saturation, Brightness, Name, and Tag.
- First click on a sort option applies ascending sort.
- Repeated clicks on the active sort option toggle descending and ascending.
- Clicking a different sort option resets that palette direction to ascending.
- Active sort buttons show `▲` for ascending and `▼` for descending.
- Non-Tag sorting preserves the existing shared ascending sort behavior and reverses for descending.
- Tag sorting uses normalized lowercase tag text and reverses correctly for descending.

## Validation
- `node --check tools/palette-manager-v2/modules/PaletteManagerApp.js`: PASS.
- `node --check tools/palette-manager-v2/controls/UserPaletteControl.js`: PASS.
- `node --check tools/palette-manager-v2/controls/SourcePaletteBrowserControl.js`: PASS.
- Targeted served-browser Palette Manager V2 sort toggle validation: PASS.
- `git diff --check`: PASS with Git LF-to-CRLF warnings for changed HTML/CSS files already in the working tree.
- `npm run test:workspace-v2`: FAIL, `package.json` does not define `test:workspace-v2`.
- Full samples smoke test: skipped by instruction.

## Artifacts
- Review diff: `docs/dev/reports/codex_review.diff`
- Changed files: `docs/dev/reports/codex_changed_files.txt`
- Delta ZIP: `tmp/PR_26124_056-palette-manager-sort-toggle-direction_delta.zip`
