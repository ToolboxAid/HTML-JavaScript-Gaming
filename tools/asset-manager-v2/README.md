# Asset Manager V2

Asset Manager V2 is an asset-only First-Class Tool V2 surface. It creates and validates audio, color, data, font, image, localization, shader, and video entries against `tools/schemas/tools/asset-browser.schema.json`.

The Type radios choose the asset type before picking an asset. File-backed types use the selected type's accept filter, preserve the selected path filename exactly from the project root, default the role from the selected type, and persist only schema-valid `path`, `type`, `kind`, `role`, and `source` metadata. Color assets use only active Workspace V2 palette swatches and persist schema-valid palette color metadata. The visible Assets list and Output Summary use compact `id`, `type`, `kind`, `role`, and `path` display fields. The tool has no dependency on the legacy `tools/Asset Browser` implementation and does not discover or enumerate all tools. In Workspace V2 launch mode, validated entries are written only to `tools.asset-browser.assets` in the Workspace V2 manifest context.

Validation for this BUILD is covered by:

```text
npm run test:workspace-v2
```
