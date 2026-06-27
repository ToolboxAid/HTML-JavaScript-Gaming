# PR_26178_ALFA_001-fix-tags-local-api-crash Report

## Scope
- Branch: PR_26178_ALFA_001-fix-tags-local-api-crash
- Purpose: recover the Tags API service read path so `listTags` does not crash Node when `readTables` encounters missing API database setup.
- Runtime boundary: Browser -> API -> Database remains the only active product-data path.

## Changes
- Added `TagsApiSetupError` wrapping in `src/dev-runtime/toolbox-api/alfa-tool-services.mjs`.
- Wrapped the shared Tags `readTables` flow used by `listTags`, snapshots, and tag write preflight reads.
- Preserved raw database/schema details in `operatorDiagnostic` while returning Creator-safe actionable error text through the API error message.
- Added `tests/dev-runtime/TagsApiService.test.mjs` for the Tags service read path.
- Added a Tags repository API response mapper in `src/dev-runtime/server/local-api-router.mjs` so Tags setup failures return controlled HTTP errors.
- Prevented Assets from eagerly calling the async Tags API service during Local API data-source startup by giving Assets a synchronous cached-tags facade.
- Added `tests/dev-runtime/TagsApiErrorResponse.test.mjs` to prove Tags method failures return HTTP 503 JSON responses and do not escape the router.

## Non-Goals
- No browser-owned product data.
- No silent fallback, MEM DB, fake data, page-local arrays, or JSON source of truth.
- No start_of_day changes.
- No individual Tags page changes.

## Validation Summary
- PASS: `node --check src/dev-runtime/toolbox-api/alfa-tool-services.mjs`
- PASS: `node --check src/dev-runtime/server/local-api-router.mjs`
- PASS: `node --check tests/dev-runtime/TagsApiService.test.mjs`
- PASS: `node --check tests/dev-runtime/TagsApiErrorResponse.test.mjs`
- PASS: `node ./scripts/run-node-test-files.mjs tests/dev-runtime/TagsApiService.test.mjs`
- PASS: `node ./scripts/run-node-test-files.mjs tests/dev-runtime/TagsApiErrorResponse.test.mjs tests/dev-runtime/TagsApiService.test.mjs`
- INFO: `node ./scripts/run-node-test-files.mjs tests/dev-runtime/DevRuntimeBoundary.test.mjs` was attempted and exposed an existing unrelated router assertion around the legacy `local-db` route. This branch does not modify `src/dev-runtime/server/local-api-router.mjs`.

## Result
PR-scoped validation is PASS. The Tags service now fails safely with actionable setup guidance when the API database adapter or Tags schema is missing, and the Local API route returns controlled HTTP errors without terminating the Node server.
