# PR_26126_085 Asset Manager V2 Schema Validation Notes

Date: 2026-05-06

## Scope

- No asset schema defaults were added.
- `toolbox/schemas/tools/asset-browser.schema.json` remains strict with `additionalProperties: false` on the payload root, asset map, asset entries, and nested `stretchOverride` object.
- Asset Manager V2 still writes `source: "asset-manager-v2"` at entry creation time even though Source is no longer visible in Asset Controls.

## Validation Rules

- The selected Kind radio supplies the asset entry `kind`.
- The Role dropdown is generated from schema-owned `assetRolesByKind` data and defaults to the first role for the selected kind.
- `AssetSchemaValidator.createEntry()` still validates every pending entry before insertion.
- `AssetSchemaValidator.validatePayload()` still validates the complete `assets` payload before export or Workspace V2 insertion.
- Invalid role/kind combinations remain rejected by schema-backed validation.

## Workspace Location

Validated assets are inserted only into:

```text
workspaceManifest.tools["asset-browser"].assets
```

No `asset-manager-v2` or `workspace-v2` workspace tool payloads are created.
