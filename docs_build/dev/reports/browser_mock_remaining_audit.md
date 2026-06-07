# PR_26158_025 Browser Mock Remaining Audit

## Scope

Focused audit for the Local DB server adapter step:

- `admin/db-viewer.js`
- `src/dev-runtime/server/mock-api-router.mjs`
- `src/dev-runtime/persistence/mock-db-store.js`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`

## Static Import Boundary

| Check | Status | Evidence |
| --- | --- | --- |
| Browser files import `src/dev-runtime` directly. | PASS | `rg -n 'src/dev-runtime' admin assets toolbox src -g '*.js' -g '*.mjs' -g '!src/dev-runtime/**' -g '!**/*-mock-repository.js' -g '!toolbox/colors/palette-workspace-repository.js' ...` returned no matches. |
| Browser files import mock repositories directly. | PASS | `rg -n 'mock-.*repository' ...` excluding repository implementation files returned no matches. |
| Browser files import static `toolRegistry.js` directly. | PASS | `rg -n 'import .*toolRegistry\\.js|from .*toolRegistry\\.js|import\\(.*toolRegistry\\.js' ...` returned no matches. |

## Local DB Boundary

| Check | Status | Evidence |
| --- | --- | --- |
| Browser flow remains Browser -> API client -> server API -> data source. | PASS | Local DB implementation lives in `src/dev-runtime/server/mock-api-router.mjs`; login and DB Viewer continue to use `/api/session/*` and `/api/mock-db/*`. |
| Browser code does not import Local DB implementation modules. | PASS | No browser import-boundary matches were found. |
| Local Mem behavior remains available. | PASS | LoginSessionMode and AdminDbViewer Playwright lanes passed against Local Mem. |
| Local DB is configured behind the existing server API boundary. | PASS | API contract probe selected `local-db`, resolved users/roles, read snapshots, and verified persisted clear across server restart. |
| Local DB failure is visible and actionable. | PASS | API contract probe with `GAMEFOUNDRY_LOCAL_DB_DISABLE=1` returned a 500 diagnostic naming `Local DB adapter not configured` and the disabled storage cause. |
| UAT/Prod are not local login choices. | PASS | LoginSessionMode Playwright and API contract probe assert only Local Mem and Local DB selector modes. |

## Remaining Internal Matches

- `toolbox/*/*-mock-repository.js` and `toolbox/colors/palette-workspace-repository.js` remain server/data-source implementation modules, not active browser entry imports.
- `/api/mock-db/*` route names and `mock-db-*` module filenames remain stable internal API contracts.
