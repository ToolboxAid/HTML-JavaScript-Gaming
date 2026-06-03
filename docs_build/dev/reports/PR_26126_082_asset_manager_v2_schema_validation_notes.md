# PR_26126_082 Asset Manager V2 Schema Validation Notes

## Schema Changes

- `tools/schemas/tools/asset-browser.schema.json` now limits asset ids and `kind` values to `image`, `audio`, and `font`.
- `svg`, `data`, and `other` asset ids/kinds are rejected by the schema patterns and enum.
- `asset-manager-v2` is an allowed asset entry `source` so Asset Manager V2 can create entries without reusing the legacy Asset Browser source value.
- `stretchOverride` remains restricted to `image.*.bezel` entries.

## Direct Schema Check

Command:

```text
node -e equivalent inline schema check
```

Result: PASS

Observed summary:

```json
{
  "kindEnum": ["image", "audio", "font"],
  "validIdsAccepted": true,
  "invalidIdsRejected": true,
  "assetManagerSourceAllowed": true
}
```

## Tool Schema Inventory

Command:

```text
node scripts/validate-json-contracts.mjs --mode=tools --reportDir docs_build/dev/reports/PR_26126_082_schema_validation
```

Result: completed with exit code 0 and wrote:

- `docs_build/dev/reports/PR_26126_082_schema_validation/schema_strictness_inventory.csv`
- `docs_build/dev/reports/PR_26126_082_schema_validation/schema_strictness_inventory.md`
- `docs_build/dev/reports/PR_26126_082_schema_validation/tool_payload_schema_validation.csv`
- `docs_build/dev/reports/PR_26126_082_schema_validation/schema_usage_code_updates.md`

Note: the existing tool payload inventory reports payload-only schemas as missing `tool/version`; that is existing inventory behavior and not a new Asset Manager V2 runtime failure.
