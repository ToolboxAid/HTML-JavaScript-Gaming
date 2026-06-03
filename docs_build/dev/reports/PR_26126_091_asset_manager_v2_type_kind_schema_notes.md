# PR_26126_091 Asset Manager V2 Type/Kind Schema Notes

Date: 2026-05-06

## Type And Kind Model

- `type` is now the broad asset category: `image`, `audio`, `font`, `video`, `shader`, `data`, or `localization`.
- `kind` is now the selected file format/extension, such as `png`, `wav`, `woff2`, `glsl`, `json`, `csv`, or `po`.
- Asset Manager V2 generated IDs remain `assets.<type>.<role>.<filenamePart>`.
- The left radio group visible label is now `Type`.

## Schema Updates

- `tools/schemas/tools/asset-browser.schema.json` requires `type`, `kind`, `role`, `path`, and `source`.
- The schema keeps strict `additionalProperties: false`.
- `$defs.assetRolesByType` maps allowed roles by broad type.
- `$defs.assetKindsByType` maps allowed file-format kinds by broad type.
- Asset Manager V2 validation enforces that ID type and role segments match the entry `type` and `role`.

## Validation

- `npm run test:workspace-v2`: passed, 10 tests.
- Playwright validates corrected Output Summary and Workspace V2 insertion entries with `type: audio` and `kind: wav`.
- No sample JSON files were modified.
