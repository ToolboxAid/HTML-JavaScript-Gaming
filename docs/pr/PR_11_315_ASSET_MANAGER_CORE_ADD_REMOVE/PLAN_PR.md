# PLAN_PR_11_315

## Purpose
Enable core asset management actions in Asset Manager V2 by adding/removing entries in `payloadJson.assetCatalog.entries`.

## Scope
- `tools/asset-manager-v2/index.html`
- `tools/asset-manager-v2/index.js`
- `docs/dev/reports/PR_11_315_report.md`
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt`

## Steps
1. Add minimal add-asset form UI (`id`, `label`, `kind`, `path`) in Asset Manager V2.
2. Validate add inputs strictly (all required fields; no guessed values).
3. Add remove-by-id action per asset row.
4. Persist updated valid catalog through existing Workspace V2 session write-back path.
5. Keep invalid payloads blocked from write-back.
6. Run targeted syntax and legacy-id zero-occurrence checks.
