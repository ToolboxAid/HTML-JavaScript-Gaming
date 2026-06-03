# APPLY_PR - PR_26124_047-palette-manager-right-column-and-hex-fixes

## Applied Change
Updated Palette Manager V2 only to fix right-column accordion sizing, user-added swatch source handling, and 8-digit hex input support.

## Runtime Files Changed
- `toolbox/palette-manager-v2/README.md`
- `toolbox/palette-manager-v2/controls/PaletteEditorControl.js`
- `toolbox/palette-manager-v2/how_to_use.html`
- `toolbox/palette-manager-v2/index.html`
- `toolbox/palette-manager-v2/modules/PaletteManagerApp.js`
- `toolbox/palette-manager-v2/modules/PaletteValidationService.js`
- `toolbox/palette-manager-v2/modules/paletteUtils.js`
- `toolbox/palette-manager-v2/paletteManagerV2.css`

## Behavior
- Collapsed Import/Export uses `flex: 0 0 auto` and no longer consumes the right-column free height.
- Open Import/Export uses `flex: 1 1 auto` and fills the remaining space above Validation/Error Viewer.
- Validation/Error Viewer remains non-growing, capped, and scrollable.
- Validation/Error Viewer sits directly below collapsed Import/Export.
- Add User Swatch stores `source: "User Added"` for user-created swatches.
- The selected swatch Source input is readonly.
- Updating a selected swatch preserves the existing stored source.
- Hex input placeholder is `#RRGGBBAA`.
- Hex validation accepts and preserves both `#RRGGBB` and `#RRGGBBAA`.

## Validation
- JavaScript syntax checks: PASS.
- Targeted served-browser Palette Manager V2 check: PASS.
- `git diff --check`: PASS with Git line-ending warnings for changed files.
- `npm run test:workspace-v2`: FAILED because the repository has no `test:workspace-v2` script.
- Full samples smoke test: skipped by instruction.

## Manual Test
1. Open Palette Manager V2.
2. Collapse Import/Export and confirm Validation/Error Viewer sits directly below it with no floating dead space.
3. Open Import/Export and confirm it fills available height above Validation/Error Viewer.
4. Add a user swatch with `#11223344` and confirm the stored source is exactly `User Added`.
5. Confirm Source is visible but not editable in Selected Swatch.
6. Update the swatch with `#445566` and confirm six-digit hex still persists.
7. Pin a source-palette swatch, update editable fields, and confirm its source value is preserved.
