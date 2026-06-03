# PLAN_PR_11_314

## Purpose
Persist valid Asset Manager V2 session payloads into the Workspace V2 manifest export path.

## Scope
- `toolbox/asset-manager-v2/index.js`
- `toolbox/workspace-v2/index.js`
- `tests/runtime/V2AssetManagerWorkspacePersistence.test.mjs`
- `docs_build/dev/reports/PR_11_314_report.md`
- `docs_build/dev/codex_commands.md`
- `docs_build/dev/commit_comment.txt`

## Steps
1. Add valid-session persistence write-back in Asset Manager V2 after strict `payloadJson.assetCatalog` validation.
2. Remove the deferred workspace-write message for valid Asset Manager sessions and replace with persistence status text.
3. Add Workspace V2 host-context restoration so `activeSession` is restored from `?hostContextId=` when it contains a valid `asset-manager-v2` payload.
4. Keep invalid payloads blocked from write-back/export.
5. Add targeted runtime validation for persistence/restore behavior.
6. Run targeted syntax checks and legacy-ID zero-match audit.
