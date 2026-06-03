# PR_26126_090 Asset Manager V2 Asset ID Naming Notes

Date: 2026-05-06

## ID Structure

- Asset Manager V2 now generates IDs as `assets.<type>.<role>.<filenamePart>`.
- `assets` is the namespace.
- `<type>` is the selected asset kind/type, such as `image` or `audio`.
- `<role>` is the selected role for that kind/type.
- `<filenamePart>` is normalized from the selected filename.

## Filename Part Normalization

- Filename extensions are removed before ID generation.
- Filename parts are lowercased.
- Non-alphanumeric runs are replaced with `-`.
- Leading and trailing separators are removed.
- The Playwright validation covers `Fire Boom!.WAV` generating `assets.audio.sound.fire-boom`.

## Schema And Validation

- `toolbox/schemas/tools/asset-browser.schema.json` now accepts the `assets.<type>.<role>.<filenamePart>` key structure.
- Asset Manager V2 schema validation enforces that the ID type segment matches `kind`.
- Asset Manager V2 schema validation enforces that the ID role segment matches `role`.
- Bezel entries use `assets.image.bezel.<filenamePart>`.
- `stretchOverride` remains limited to `assets.image.bezel.*` IDs.

## Validation

- `npm run test:workspace-v2`: passed, 10 tests.
- Playwright validates generated IDs, status messages, Output Summary keys, role-edit ID updates, and Workspace V2 insertion with the new ID structure.
- No sample JSON files were modified.
