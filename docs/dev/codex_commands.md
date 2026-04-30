# Codex Command - PR 11.97

Model: GPT-5.4
Reasoning: high

```text
Run BUILD_PR_LEVEL_11_97_FIX_ASSET_BROWSER_SCHEMA_PROPERLY.

Goal:
Fix the Asset Browser schema to match the flat asset-browser.assets contract and update sample 1902 workspace data accordingly.

Requirements:
- Update tools/schemas/tools/asset-browser.schema.json.
- asset-browser.assets must be a flat map of asset ids to entries.
- Asset ids must follow <kind>.<domain>.<name>, for example image.sample1902.preview.
- Asset entries require path, kind, and source.
- Allow optional stretchOverride.uniformEdgeStretchPx on image.*.bezel asset entries.
- Do not restore nested media.
- Do not remove existing compatibility properties unless proven obsolete.
- Fix sample 1902 preview asset to image.sample1902.preview.
- Search for generic asset-browser asset id preview and fix if found.
- Add/update docs/dev/reports/PR_11_97_schema_validation.md with exact validation results.
- Run targeted validation only; do not run full sample suite.

Return a ZIP artifact at <project folder>/tmp/PR_11_97_FIX_ASSET_BROWSER_SCHEMA_PROPERLY.zip.
```
