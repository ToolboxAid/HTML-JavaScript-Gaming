# PR_26164_110-local-api-naming-cleanup

## Branch Validation

- PASS: Current branch is `main`.
- PASS: Expected branch is `main`.

## Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Start from PR109 final audit reports | PASS | PR109 final audit reports remain in `docs_build/dev/reports/`. |
| Scope to Local API / Local DB naming cleanup | PASS | Changes are limited to Local API router naming, preferred Local DB API client route use, tests, and reports. |
| Do not introduce Supabase | PASS | No Supabase code or configuration added. |
| Do not reintroduce MEM DB | PASS | Validation keeps Local DB mode; `local-mem` remains only in negative tests. |
| Do not change runtime behavior except compatibility | PASS | `/api/local-db/*` added as preferred route; `/api/mock-db/*` remains compatibility. |
| Rename `mock-api-router.mjs` | PASS | Active router is `src/dev-runtime/server/local-api-router.mjs`. |
| Rename `createMockApiRouter` | PASS | Active router factory is `createLocalApiRouter`. Deprecated shim remains for compatibility only. |
| Rename `LocalDevMockDataSource` | PASS | Active class is `LocalDevDataSource`. |
| Keep compatibility shims only if required | PASS | `src/dev-runtime/server/mock-api-router.mjs` remains as a deprecated shim exporting `createMockApiRouter`. |
| Add `/api/local-db/snapshot` | PASS | Local API startup validation returned 33 tables from `/api/local-db/snapshot`. |
| Add `/api/local-db/clear` | PASS | Router accepts preferred `local-db` group for clear. Login/session tests use preferred route. |
| Add `/api/local-db/seed` | PASS | Router accepts preferred `local-db` group for seed. Seed integrity tests pass through preferred route. |
| Update active consumers to Local DB route names | PASS | Browser Local DB API client now calls `/local-db/*`; active tests use `/api/local-db/*`. |
| Keep `/api/mock-db` temporary compatibility | PASS | Local API validation confirms `/api/mock-db/snapshot` still works. |
| Do not remove negative tests for `/login.html` or `local-mem` | PASS | Negative tests remain. |

## Naming Compatibility Audit

- Active name: `src/dev-runtime/server/local-api-router.mjs`.
- Active factory: `createLocalApiRouter`.
- Active data source: `LocalDevDataSource`.
- Active browser client: `src/engine/api/local-db-api-client.js`.
- Deprecated compatibility shim:
  - `src/dev-runtime/server/mock-api-router.mjs`
  - `createMockApiRouter`
  - Reason: compatibility for any older local tooling still importing the historical file/name.
  - Follow-up: remove after PR113 review cleanup resolves remaining mock/local terminology.
- Deferred naming cleanup:
  - `src/dev-runtime/persistence/mock-db-store.js` and repository names still use mock terminology. They are part of the PR113 Needs Review cleanup scope.
  - Final stack note: PR113 moved the active viewer module to `src/engine/api/local-db-viewer-ui.js`; `src/engine/api/mock-db-viewer-ui.js` is now a deprecated shim.

## Local API Route Migration Audit

- Preferred routes now supported:
  - `/api/local-db/snapshot`
  - `/api/local-db/clear`
  - `/api/local-db/seed`
- Compatibility routes still supported:
  - `/api/mock-db/snapshot`
  - `/api/mock-db/clear`
  - `/api/mock-db/seed`
- Active route validation:
  - PASS: `/api/local-db/snapshot` returned Local DB tables.
  - PASS: `/api/mock-db/snapshot` returned Local DB tables as compatibility.

## MEM Reintroduction Audit

- PASS: No MEM DB implementation was added.
- PASS: `local-mem` remains only in tests that assert retired mode rejection.
- PASS: `fake-login` was not introduced.

## Validation

- PASS: `git diff --check`
  - Windows LF/CRLF checkout warnings only.
- PASS: Syntax checks:
  - `src/dev-runtime/server/local-api-router.mjs`
  - `src/dev-runtime/server/mock-api-router.mjs`
  - `src/dev-runtime/server/local-api-server.mjs`
  - `src/engine/api/local-db-api-client.js`
  - `src/engine/api/mock-db-api-client.js`
  - `src/engine/api/mock-db-viewer-ui.js`
  - `tests/helpers/playwrightRepoServer.mjs`
  - `tests/dev-runtime/DbSeedIntegrity.test.mjs`
  - `tests/dev-runtime/DevRuntimeBoundary.test.mjs`
- PASS: Local API startup validation:
  - `startLocalApiServer({ port: 5501 })`
  - `/api/local-db/snapshot`
  - `/api/mock-db/snapshot`
- PASS: `node --test tests/dev-runtime/DevRuntimeBoundary.test.mjs tests/dev-runtime/DbSeedIntegrity.test.mjs`
  - 5 passed.
- PASS: `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/LoginSessionMode.spec.mjs --reporter=line`
  - 16 passed.

## Playwright Impact

- Playwright impacted: Yes.
- DB Viewer still loads from Local DB.
- Admin Site Setup reseed still works through the server setup API.
- Sign-in/guest behavior remains production-safe.

## V8 Coverage

- PASS/WARN: `docs_build/dev/reports/playwright_v8_coverage_report.txt` exists.
- WARN: Server/dev-runtime Node modules are not collected by browser V8 coverage and remain advisory.

## Impacted Lanes

- runtime: Local API router and Local DB API route naming.
- admin/account: DB Viewer and Admin Site Setup.
- contract: Local DB API route compatibility.

## Skipped Lanes

- samples: SKIP. Samples were not in scope.
- engine: SKIP. Engine runtime behavior was not changed.

## Manual Validation Steps

1. Run `npm run dev:local-api`.
2. Open `http://127.0.0.1:5501/admin/db-viewer.html`.
3. Confirm DB Viewer loads Local DB tables.
4. Trigger Admin Site Setup reseed and confirm it completes through the server setup API.
5. Confirm `/api/local-db/snapshot` returns JSON with `ok: true`.
