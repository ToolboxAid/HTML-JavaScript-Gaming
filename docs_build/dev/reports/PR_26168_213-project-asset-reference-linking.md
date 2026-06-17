# PR_26168_213-project-asset-reference-linking

## Branch Validation
- PASS - Current branch was `main` before and during implementation.

## Summary
- Linked storage-backed asset metadata to API-owned object keys.
- Storage uploads now keep the configured object key as the durable `storedPath` for asset metadata and storage-object metadata.
- The Assets UI shows the storage object key as read-only metadata; the browser still does not generate or edit authoritative keys.

## Requirement Checklist
- PASS - Hard stop unless current branch is `main`; branch guard passed.
- PASS - PR scope stayed on project asset metadata/reference linking.
- PASS - Asset metadata records link to storage object metadata through `storageObjectId` and `asset_storage_objects.id`.
- PASS - Local DB metadata carries the API-owned object key in `storedPath` after a storage-backed upload.
- PASS - The Local API/storage service owns authoritative object keys through `objectKeyForProjectPath`.
- PASS - Browser receives object-key evidence for display/read calls only; it does not receive storage secrets or own key generation.
- PASS - Preserved Web UI -> API/Service Contract -> Database/Storage.
- PASS - No fake login, MEM DB, custom auth, silent fallback, start_of_day edits, sample JSON edits, or inline HTML script/style/event handlers were added.

## Validation Lane Report
- PASS - `node --check src/dev-runtime/persistence/tool-repositories/assets-mock-repository.js`
- PASS - `node --check toolbox/assets/assets.js`
- PASS - `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS - `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs -g "Assets DEV storage upload list and read"`
- INFO - `docs_build/dev/reports/playwright_v8_coverage_report.txt` included as the advisory Playwright V8 coverage report for changed runtime JavaScript.
- FAIL (known unrelated lane failures) - `npm run test:workspace-v2`: 3 passed, 2 failed in `RootToolsFutureState.spec.mjs` due root tools page error `Cannot read properties of undefined (reading 'length')` and unrelated Game Design/Controls repository 500s. This command name is legacy; user-facing language remains Project Workspace.

## Manual Validation Notes
- Targeted Playwright uploaded an image through the real Assets page and Local API storage path.
- Evidence: `GET /api/storage/project-assets/list?projectId=<projectId>` returned `/dev/projects/<projectId>/image/<fileName>.png`.
- Evidence: `GET /api/storage/project-assets/read?key=<objectKey>` returned the uploaded bytes.
- Evidence: Assets metadata displayed `Stored path: <objectKey>`, `Storage object key: <objectKey>`, and the API read URL.
- Evidence: `/api/product-data/snapshot` returned matching `asset_library_items.storedPath` and `asset_storage_objects.storedPath` for the uploaded object key.

## Full Samples Decision
- SKIP - Full samples smoke was not run because this PR changed the targeted asset metadata/storage-linking path and did not require shared samples runtime coverage.
