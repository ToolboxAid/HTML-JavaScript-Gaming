# PLAN_PR_11_313

## Purpose
Complete Asset Browser V2 strict JSON behavior so it renders only validated `payloadJson.assetCatalog`, shows explicit valid-empty state, and rejects invalid/legacy payload shapes visibly.

## Scope
- `toolbox/asset-manager-v2/index.js`
- `tests/runtime/V2AssetBrowserStrictJson.test.mjs`
- `docs_build/dev/reports/PR_11_313_report.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`

## Steps
1. Tighten Asset Browser V2 session validation to reject legacy future-hint fields (`importName`, `importDestination`) and require `payloadJson.assetCatalog`.
2. Keep rendering sourced only from validated asset catalog entries.
3. Make valid-empty catalog behavior explicit on-screen with actionable text.
4. Add a focused runtime test for valid entries, valid empty catalog, and invalid payload cases.
5. Run targeted syntax/runtime validation plus targeted sample launch smoke for sample `1505`.
6. Record evidence and package the PR delta zip.
