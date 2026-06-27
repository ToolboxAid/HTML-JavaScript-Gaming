# PR_26168_212-assets-real-storage-mode

## Branch Validation
- PASS - Current branch was `main` before and during implementation.

## Summary
- Wired the Assets DEV storage upload flow through the Local API repository and configured project asset storage contract.
- Removed the test-owned browser mock boundary for the affected storage path; the targeted test now uses the real Assets page, Local API repository calls, Local DB persistence, and API-owned storage read/list endpoints.
- Preserved server-side storage secrets: the browser receives read/list API routes and object keys, not access keys or secret keys.

## Requirement Checklist
- PASS - Hard stop unless current branch is `main`; branch guard passed.
- PASS - PR scope stayed on Assets real storage mode and the Local API/storage contract.
- PASS - Preserved Web UI -> API/Service Contract -> Database/Storage.
- PASS - Affected asset storage path no longer uses page-local product data arrays or browser-owned product-data behavior.
- PASS - Browser uploads through the Local API repository/service contract.
- PASS - Object writes use configured storage prefix `/dev/projects/` in the targeted storage validation.
- PASS - No storage secrets are rendered in the browser; the targeted Playwright test asserts access key and secret key text are absent.
- PASS - No fake login, MEM DB, custom auth, silent fallback, start_of_day edits, sample JSON edits, or inline HTML script/style/event handlers were added.
- PASS - DEV user-facing language uses Local API, Local DB, and SQLite terminology where touched.

## Validation Lane Report
- PASS - `node --check assets/theme-v2/js/owner-operations.js`
- PASS - `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS - `node --check tests/helpers/playwrightRepoServer.mjs`
- PASS - `node --check tests/playwright/tools/AdminPlatformToolsWireframes.spec.mjs`
- PASS - `node --check tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- PASS - `npx playwright test tests/playwright/tools/AssetToolMockRepository.spec.mjs -g "Assets DEV storage upload list and read"`
- INFO - `docs_build/dev/reports/playwright_v8_coverage_report.txt` included as the advisory Playwright V8 coverage report for changed runtime JavaScript.
- PASS/SKIP - `node .\scripts\validate-storage-config.mjs`: `.env` loaded; live DEV storage values were not configured, so live storage validation skipped.
- FAIL (known unrelated lane failures) - `npm run test:workspace-v2`: 3 passed, 2 failed in `RootToolsFutureState.spec.mjs` due root tools page error `Cannot read properties of undefined (reading 'length')` and unrelated Game Design/Controls repository 500s. This command name is legacy; user-facing language remains Project Workspace.

## Manual Validation Notes
- Targeted storage test wrote `SMALL_PNG` through the Assets page and Local API to fake R2 storage.
- Evidence: storage server observed a `PUT` under `/dev/projects/<projectId>/image/<uploadFileName>.png`.
- Evidence: `GET /api/storage/project-assets/list?projectId=<projectId>` returned the stored key and `/dev/projects/` prefix.
- Evidence: `GET /api/storage/project-assets/read?key=<objectKey>` returned the uploaded bytes with `application/octet-stream`.
- Local DB persistence now writes only the asset runtime rows and the project row needed for the asset FK chain, not a broad browser-owned product snapshot.

## Full Samples Decision
- SKIP - Full samples smoke was not run because this PR changed a targeted Assets storage/API path and did not require shared samples runtime coverage.
