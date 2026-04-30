# PR 11.97 Expected Validation Report

Codex must fill this file with actual command outputs.

Required checks:

- Schema JSON parses.
- `asset-browser.assets` exists in schema.
- Asset entries require `path`, `kind`, and `source`.
- Optional `stretchOverride.uniformEdgeStretchPx` is accepted for bezel entries.
- No generic `preview` asset id remains for sample 1902 asset-browser assets.
- `image.sample1902.preview` exists where sample 1902 declares workspace preview assets.
- Nested `media` was not restored as the Asset Browser asset contract.
- Full samples test skipped unless a shared loader/framework was changed; reason must be recorded.
