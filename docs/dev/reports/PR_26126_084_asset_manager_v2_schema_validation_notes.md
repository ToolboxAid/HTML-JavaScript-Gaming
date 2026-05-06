# PR_26126_084 Asset Manager V2 Schema Validation Notes

Date: 2026-05-06

## Schema Changes

- Moved the canonical sample wrapper schema to `tools/schemas/samples/sample.tool-payload.schema.json`.
- Kept `tools/schemas/sample.tool-payload.schema.json` as a compatibility `$ref` pointer so existing sample JSON files remain unmodified.
- Expanded `tools/schemas/tools/asset-browser.schema.json` asset id patterns and `kind` enum to include `image`, `audio`, `font`, `video`, `shader`, `data`, and `localization`.
- Required `role` on asset entries and kept role validation schema-owned through `assetRolesByKind`.
- Kept `stretchOverride` optional and constrained to `image.*.bezel` assets only; generic asset records do not require Stretch.

## Runtime Validation

- Asset Manager V2 uses one `Pick Asset File` control for all asset types.
- File selection derives the approved kind from extension or MIME type before role selection.
- Role selection is required and limited to allowed roles for the derived kind.
- Asset IDs are auto-assigned from derived kind, filename, and selected role.
- Source is always written as `asset-manager-v2`.
- Invalid extensions, unsupported roles, duplicate asset IDs, and schema-invalid JSON are rejected before insertion.

## Workspace Location

Validated assets are inserted only into the Workspace V2 asset schema location:

```text
workspaceManifest.tools["asset-browser"].assets
```

No `asset-manager-v2` or `workspace-v2` tool payload is written into the Workspace V2 manifest.
