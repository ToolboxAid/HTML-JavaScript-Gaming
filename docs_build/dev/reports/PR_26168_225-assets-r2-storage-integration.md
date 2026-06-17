# PR_26168_225-assets-r2-storage-integration

## Branch Validation

PASS

- Current branch: `main`
- Expected branch: `main`

## Summary

Completed the Assets project asset object flow through Local API/service contract to configured project asset storage. Upload, list, read, and delete now validate against the configured R2-compatible storage provider while DB-backed asset metadata remains authoritative.

## Requirement Checklist

- PASS - Assets upload writes project asset objects through Local API -> storage provider.
- PASS - Assets list/read validation uses `/api/storage/project-assets/list` and `/api/storage/project-assets/read`.
- PASS - Assets delete now deletes the storage object through the server-side storage provider before removing DB metadata.
- PASS - Browser does not own authoritative product asset data; the Assets tool continues to use `createAssetToolApiRepository()`.
- PASS - Metadata remains DB-backed in `asset_library_items` and `asset_storage_objects`.
- PASS - Storage object keys remain server-owned metadata and are validated under `GAMEFOUNDRY_STORAGE_PROJECTS_PREFIX`.
- PASS - Guest browsing remains allowed; guest upload/save remains blocked with visible account guidance.
- PASS - No Supabase behavior was introduced.
- PASS - No sample JSON or `start_of_day` folders were modified.
- PASS - No inline HTML script/style/event handlers were added.

## Validation Lane Report

- Lane: runtime/API/storage plus targeted Assets tool behavior.
- PASS - Syntax checks passed for changed JS/MJS files.
- PASS - Static contract validation confirmed API repository ownership, no browser storage SSoT, storage-provider write/read/delete, DB metadata keys, no sample JSON changes, and no `start_of_day` changes.
- PASS - Targeted Assets Playwright validated upload, list, read, and delete against a fake R2-compatible server using `/dev/projects/`.
- PASS - Targeted guest validation confirmed guest upload shows account guidance and creates no record.
- PASS - `npm run test:workspace-v2` passed 5 RootToolsFutureState tests. The command name is legacy; user-facing language is Project Workspace.
- WARN - Playwright V8 coverage is advisory. Server-side Node files are reported as WARN because Chromium coverage does not collect Node runtime modules.

Commands:

- `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `node --check toolbox/assets/assets.js`
- `node --check toolbox/assets/assets-api-client.js`
- Static Node Assets storage/API contract validation.
- `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs -g "Assets DEV storage upload list read and delete use configured projects prefix"`
- `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs -g "Assets guest upload action shows account prompt and creates no record"`
- `npm run test:workspace-v2`
- `git diff --check`

## Manual Validation Notes

- Fake R2 validation object path: `/dev/projects/<projectId>/image/<uploaded-file>`.
- Evidence: fake storage server observed `PUT`, `GET` list/read, and `DELETE` for the configured prefix path.
- The delete path removes the R2 object before removing DB metadata, using the server-side asset record and storage object key.
- Real R2 credentials were not added to the repository.
- Full samples smoke: SKIP because sample JSON and sample runtime behavior were not touched.

