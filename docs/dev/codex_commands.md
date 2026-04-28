# CODEX COMMANDS

model: gpt-5.3-codex
reasoning: medium

Apply PR_10_20_TOOL_OWNED_JSON_ASSET_CATALOG_FIX.

Required:
- Fix samples 0204, 1413, and 1505 so Asset Browser / Import Hub reads and writes the JSON catalog directly.
- Fix flash-then-blank behavior where entries briefly show then clear/truncate.
- For 0204, stop using sample-local assetRegistry.js / AssetRegistryScene.js as a bridge or source for tool data.
- Normalize each sample JSON so the full asset list is in the schema-compatible location the tool expects.
- Preserve preset fields only as UI state, not asset source.
- Do not add fallback/default/hidden sample data.
- Do not scrape JS source.
- Do not modify start_of_day folders.
- Add validation report at docs/dev/reports/PR_10_20_TOOL_OWNED_JSON_ASSET_CATALOG_FIX_report.md.
- Return ZIP artifact at tmp/PR_10_20_TOOL_OWNED_JSON_ASSET_CATALOG_FIX_delta.zip.
