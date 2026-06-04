# APPLY_PR - PR_26124_049-palette-manager-swatch-tags-and-selected-layout

## Applied Changes
- Updated the palette swatch schema to allow optional `tags` as an array of non-empty strings while preserving required `symbol`, `hex`, and `name`, `additionalProperties: false`, and `#RRGGBB` / `#RRGGBBAA` hex support.
- Split the left column into separate Selected Swatch and User Defined Swatch accordions.
- Made Selected Swatch details read-only for symbol, hex, name, and source, with tags editable from the selected detail panel.
- Moved add/update/remove/clear form actions into User Defined Swatch.
- Added dependency-free tag suggestions from tags already used in the active user palette.
- Preserved source tracking:
  - User-created swatches use `User Added`.
  - Browsed source swatches display the active source palette id.
  - Pinned source swatches retain their source palette id.
- Preserved pin/unpin, sort, search, size, import/export, accordionV2, and shared/tool shell behavior.

## Files Changed
- `src/shared/schemas/tools/palette-browser.schema.json`
- `toolbox/palette-manager-v2/index.html`
- `toolbox/palette-manager-v2/README.md`
- `toolbox/palette-manager-v2/how_to_use.html`
- `toolbox/palette-manager-v2/controls/PaletteEditorControl.js`
- `toolbox/palette-manager-v2/modules/PaletteManagerApp.js`
- `toolbox/palette-manager-v2/modules/PaletteValidationService.js`
- `toolbox/palette-manager-v2/modules/SwatchRow.js`
- `toolbox/palette-manager-v2/modules/paletteUtils.js`
- PR workflow docs and report artifacts.

## Validation
- `node --check` on changed Palette Manager JS files: PASS.
- Palette schema/import validation with positive and negative tag/hex samples: PASS.
- Targeted served-browser Palette Manager V2 behavior check: PASS.
- `git diff --check`: PASS with Git LF-to-CRLF warnings for changed HTML/schema files.
- `git diff --cached --check`: PASS.
- `npm run test:workspace-v2`: FAILED because `package.json` has no `test:workspace-v2` script.
- Full samples smoke test: skipped by instruction.

## ZIP
- `tmp/PR_26124_049-palette-manager-swatch-tags-and-selected-layout_delta.zip`
