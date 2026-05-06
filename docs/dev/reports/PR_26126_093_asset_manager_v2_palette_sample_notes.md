# PR_26126_093 Asset Manager V2 Palette Sample Notes

## Temporary UAT Loader
- Added `tools/asset-manager-v2/js/services/TemporaryUatSamplePalette.js`.
- The loader is explicitly marked temporary UAT-only and isolated for later removal.
- It is activated only by `?palette=sample`.
- Normal Workspace V2 palette loading remains separate.

## Palette Format
- The sample palette uses the direct Palette Browser payload shape:
  - `schema: "html-js-gaming.palette"`
  - `version`
  - `id`
  - `name`
  - `source`
  - `sourceId`
  - `locked`
  - `swatches`
- Swatches include only schema-valid `symbol`, `hex`, `name`, `source`, and `tags` fields.

## Behavior
- `?palette=sample` loads the palette into memory and populates the Asset Manager V2 Color picker.
- The file picker stays hidden when Type is Color.
- Color asset IDs are generated from swatch names, for example `Signal Violet!` becomes `assets.color.hud.signal-violet`.

## Validation
- Playwright validates the UAT query loader, 20px swatches, Status entry, Color ID generation, path generation, and color asset insertion.
