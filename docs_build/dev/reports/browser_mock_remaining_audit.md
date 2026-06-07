# PR_26158_024 Browser Mock Remaining Audit

## Scope

Focused audit for browser-visible files and adjacent server/API cleanup touched in PR_26158_024:

- `admin/db-viewer.html`
- `admin/db-viewer.js`
- `src/engine/api/mock-db-api-client.js`
- `src/engine/api/mock-db-viewer-ui.js`
- `src/dev-runtime/server/mock-api-router.mjs`
- `src/dev-runtime/persistence/mock-db-store.js`
- `tests/playwright/tools/AdminDbViewer.spec.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`

## Static Import Boundary

| Check | Status | Evidence |
| --- | --- | --- |
| Browser files import `src/dev-runtime` directly. | PASS | `rg -n '^import .*src/dev-runtime|import\\(.*src/dev-runtime' assets admin toolbox src -g '*.js' -g '!src/dev-runtime/**' ...` returned no matches. |
| Browser files import static `toolRegistry.js` directly. | PASS | `rg -n '^import .*toolRegistry\\.js|import\\(.*toolRegistry\\.js' ...` returned no matches. |
| Browser files import mock repositories directly. | PASS | Refined `rg` excluding repository implementation files returned no matches. |

## Local Mode Cleanup

| Check | Status | Evidence |
| --- | --- | --- |
| Local login shows only Local Mem and Local DB. | PASS | Login Playwright lane asserts exact labels. |
| DEV/UAT/Prod are not local login buttons. | PASS | Login Playwright lane asserts no DEV, UAT, or Prod buttons. |
| Server rejects legacy `modeId: "local"`. | PASS | API contract probe returned 500 with `Unknown local login environment: local`. |
| Local DB does not fall back to Local Mem. | PASS | API contract probe verified Local DB snapshot fails with `Local DB adapter not configured`. |
| DB Viewer user-facing wording says Local Mem DB. | PASS | Admin DB Viewer Playwright asserts Local Mem DB headings, status text, clear/seed controls, and dialogs. |

## Remaining Internal Matches

- `toolbox/*/*-mock-repository.js` and `toolbox/colors/palette-workspace-repository.js` remain server/data-source implementation modules, not active browser entry imports.
- `/api/mock-db/*` route names and `mock-db-*` module filenames remain stable internal API contracts.
- Internal exception text `Invalid mock DB audit user key` remains in non-user-facing audit validation.
