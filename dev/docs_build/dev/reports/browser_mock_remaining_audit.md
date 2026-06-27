# PR_26158_027 Browser Mock Remaining Audit

## Scope

Focused audit for replacing Local DB JSON storage with SQLite behind the server API boundary:

- `src/dev-runtime/server/mock-api-router.mjs`
- `src/dev-runtime/persistence/mock-db-store.js`
- `tests/playwright/tools/AdminDbViewer.spec.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`

## Static Import Boundary

| Check | Status | Evidence |
| --- | --- | --- |
| Browser files import `node:sqlite` directly. | PASS | Focused `rg` for `node:sqlite` outside `src/dev-runtime/**` returned no matches. |
| Browser files import `DatabaseSync` directly. | PASS | Focused `rg` for `DatabaseSync` outside `src/dev-runtime/**` returned no matches. |
| Browser files import `LocalDbAdapter` directly. | PASS | Focused `rg` for `LocalDbAdapter` outside `src/dev-runtime/**` returned no matches. |
| Browser files import `src/dev-runtime` directly. | PASS | Focused `rg` excluding dev-runtime and repository implementation files returned no matches. |
| Browser files import mock repositories directly. | PASS | Focused `rg` excluding repository implementation files returned no matches. |

## SQLite Boundary

| Check | Status | Evidence |
| --- | --- | --- |
| Local DB remains behind the server API boundary only. | PASS | SQLite is imported only in `src/dev-runtime/server/mock-api-router.mjs`; browser callers continue through `/api/session/*` and `/api/mock-db/*`. |
| Local Mem behavior is preserved. | PASS | AdminDbViewer Local Mem Playwright coverage passed. |
| Admin DB Viewer Local DB read-only inspection is preserved. | PASS | AdminDbViewer Local DB Playwright coverage passed against SQLite-backed state. |
| Local DB initializes required tables deterministically. | PASS | SQLite contract probe inspected physical SQLite tables and schema columns. |
| Empty tables remain visible with headers. | PASS | SQLite contract probe and AdminDbViewer Playwright verified empty table schemas/headers. |
| SQLite initialization/read/write/snapshot failures fail visibly. | PASS | Contract probe verified disabled snapshot and write diagnostics. |
| UAT/Prod are not local login choices. | PASS | `/api/session/modes` probe in SQLite contract validation returned `Local Mem|Local DB`; UAT/Prod remain server-side deployment metadata only. |

## Remaining Internal Matches

- UAT/Prod strings remain only in the server adapter contract as deployment-only metadata.
- `node:sqlite` currently emits a Node experimental warning during validation; no browser bundle or user-facing page imports it.
- `/api/mock-db/*` route names and `mock-db-*` module filenames remain stable internal API contracts.
