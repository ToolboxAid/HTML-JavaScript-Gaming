# PR_26126_092 Asset Manager V2 Color Asset Schema Notes

## Scope
- Added `color` as a first-class Asset Manager V2 type.
- Kept file-backed types as `audio`, `data`, `font`, `image`, `localization`, `shader`, and `video`.
- Color assets use `kind: "hex"` and IDs shaped as `assets.color.<role>.<filenamePart>`.

## Schema Behavior
- `toolbox/schemas/tools/asset-browser.schema.json` now accepts `assets.color.*.*` keys.
- Color entries require `path`, `type`, `kind`, `role`, `source`, and `color`.
- Color entries use `path: "palette://workspace/<palette-color-name-slug>"`.
- Color metadata is strict and allows only `hex`, `name`, `symbol`, `source`, and `tags`.
- `stretchOverride` remains blocked on color assets and remains scoped to `assets.image.bezel.*`.
- Non-color assets continue to reject `color` metadata.

## Validator Behavior
- `AssetSchemaValidator` validates color selections with the same payload path used by file-backed assets.
- Color selection validation requires the active type to be `color`, the kind to be `hex`, and the selected form color metadata to match the active Workspace V2 palette swatch.
- Workspace insertion writes validated color records only into `tools.asset-browser.assets`.

## Validation
- `npm run test:workspace-v2` passed.
- Workspace V2 insertion coverage validates `assets.color.hud.sky-blue` with `kind: "hex"` and palette swatch metadata.
