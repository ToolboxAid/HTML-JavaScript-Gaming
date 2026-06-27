# PR_26164_113-db-review-items-cleanup

## Branch Validation

- PASS: Current branch is `main`.
- PASS: Expected branch is `main`.

## Requirement Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| Start from final DB consumer audit | PASS | Used `db-consumer-audit-final.md` and `.csv`. |
| Scope to 25 Needs Review items | PASS | `db-consumer-audit-final-2.md` includes explicit cleanup matrix for all 25 prior Needs Review rows. |
| Do not introduce Supabase | PASS | No Supabase code or config added. |
| Do not change unrelated runtime behavior | PASS | Runtime naming changes are limited to Local DB viewer naming compatibility. |
| Resolve each Needs Review item | PASS | Final audit 2 has zero `Needs review` rows. |
| Do not refactor engine utilities unless active product-data SSoT | PASS | Engine storage/asset/runtime items are classified as Engine boundary follow-up. |
| Rename or document misleading mock/local terminology where safe | PASS | Active Admin DB Viewer now imports `local-db-viewer-ui.js`; deprecated shims document remaining compatibility names. |
| Produce updated final audit | PASS | Added `db-consumer-audit-final-2.md` and `.csv`. |
| Validate no active Needs Migration remains | PASS | Final audit 2 has zero `Needs migration` rows. |
| Validate no active MEM/local-mem/fake-login route exists | PASS | Searches show `local-mem` only in negative tests; no `fake-login` route. |
| Validate no `/login.html` route exists | PASS | `/login.html` appears only in negative tests. |

## Needs Review Cleanup Matrix

See `docs_build/dev/reports/db-consumer-audit-final-2.md`.

Summary:

- OK Local DB: 54
- Naming cleanup completed: 5
- Engine boundary follow-up: 13
- Explicit out-of-scope: 4
- Out of scope: 29
- Needs review: 0
- Needs migration: 0

## Naming Cleanup Completed

- `src/dev-runtime/server/local-api-router.mjs` is the active Local API router.
- `src/dev-runtime/server/mock-api-router.mjs` is a deprecated compatibility shim.
- `src/engine/api/local-db-api-client.js` is the active Local DB browser API client.
- `src/engine/api/mock-db-api-client.js` is a deprecated compatibility shim.
- `src/engine/api/local-db-viewer-ui.js` is the active Admin DB Viewer UI module.
- `src/engine/api/mock-db-viewer-ui.js` is a deprecated compatibility shim.
- `admin/db-viewer.js` imports `local-db-viewer-ui.js`.

## Engine Boundary Follow-Ups

The following are not active Local DB product-data migration blockers and should be handled only by future engine-boundary PRs:

- Engine persistence utilities.
- Engine save slot/release/recovery utilities.
- Engine asset registry/loader/runtime image helpers.
- Object vector runtime asset service.

## Validation

- PASS: `git diff --check`
  - Windows LF/CRLF checkout warnings only.
- PASS: Final audit 2 validation:
  - `db-consumer-audit-final-2.csv` contains no `Needs review` or `Needs migration` rows.
- PASS: Syntax checks:
  - `admin/db-viewer.js`
  - `src/engine/api/local-db-viewer-ui.js`
  - `src/engine/api/mock-db-viewer-ui.js`
  - `src/dev-runtime/server/local-api-router.mjs`
  - `src/dev-runtime/server/mock-api-router.mjs`
  - `src/engine/api/local-db-api-client.js`
  - `src/engine/api/mock-db-api-client.js`
- PASS: `node --test tests/dev-runtime/DevRuntimeBoundary.test.mjs tests/dev-runtime/DbSeedIntegrity.test.mjs`
  - 5 passed.
- PASS: `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/LoginSessionMode.spec.mjs --reporter=line`
  - 16 passed.
- PASS: `npm run test:workspace-v2`
  - 5 passed. Command name is legacy; it runs the workspace-contract validation lane.

## Guardrail Searches

- PASS: `/api/mock-db` is no longer used by active tests or browser callers; compatibility remains only in the deprecated router path.
- PASS: `local-mem` appears only in negative tests.
- PASS: `/login.html` appears only in negative tests.
- PASS: `fake-login` has no active route hits.

## Playwright Impact

- Playwright impacted: Yes because runtime JavaScript module naming changed.
- DB Viewer still loads.
- Admin Site Setup reseed still works.
- Sign-in and guest access behavior still pass.

## V8 Coverage

- PASS/WARN: `docs_build/dev/reports/playwright_v8_coverage_report.txt` exists.
- WARN: Some changed runtime JavaScript is server/dev-runtime code that browser V8 coverage cannot collect; this is advisory per project instructions.

## Impacted Lanes

- runtime: Local API/Local DB compatibility shims and Admin DB Viewer module naming.
- admin/account: DB Viewer and setup/sign-in validation.
- contract: DB consumer audit classification.

## Skipped Lanes

- samples: SKIP. Samples were not in scope.
- engine refactor lane: SKIP. Engine findings were classified as future boundary follow-ups, and no engine utility behavior was changed.

## Manual Validation Steps

1. Open `docs_build/dev/reports/db-consumer-audit-final-2.md` and confirm there are no Needs Review rows.
2. Run `npm run dev:local-api`.
3. Open `http://127.0.0.1:5501/admin/db-viewer.html`.
4. Confirm the DB Viewer loads Local DB tables.
5. Confirm browser devtools/network uses `/api/local-db/snapshot` for the DB Viewer route.

