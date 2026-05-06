# PR_26126_084 Asset Manager V2 Schema Validation Notes

Date: 2026-05-06

## Schema Changes

- Expanded `tools/schemas/tools/asset-browser.schema.json` asset id patterns and `kind` enum to include `image`, `audio`, `font`, `video`, `shader`, `data`, and `localization`.
- Added optional `role` to asset entries.
- Added schema-owned `assetRolesByKind` rules consumed by Asset Manager V2 validation:
  - image: `sprite`, `background`, `bezel`, `ui`
  - audio: `sound`, `music`
  - font: `ui`, `display`
  - video: `cutscene`, `loop`
  - shader: `fragment`, `vertex`, `compute`
  - data: `config`, `table`
  - localization: `strings`, `dialogue`

## Runtime Validation

- Asset Manager V2 loads allowed kinds, roles, and role-by-kind rules from `asset-browser.schema.json`.
- File selection derives a path and asset id, then validates the selected file entry through `AssetSchemaValidator.validateFileSelection()`.
- The selected file entry is also validated as an `assets` payload before the Add Asset button can persist it.
- Invalid picker selections are blocked before insertion. Example covered by Playwright: `notes.txt` selected through the image picker is rejected by accept validation.
- Invalid role combinations are rejected by schema-backed validation. Example covered by Playwright: `role: "background"` on an audio asset is rejected.
- Image `bezel` role requires an `image.*.bezel` asset id.
- `stretchOverride` remains allowed only on `image.*.bezel` assets.

## Workspace Location

Validated assets are inserted only into the Workspace V2 asset schema location:

```text
workspaceManifest.tools["asset-browser"].assets
```

No `asset-manager-v2` or `workspace-v2` tool payload is written into the Workspace V2 manifest.
