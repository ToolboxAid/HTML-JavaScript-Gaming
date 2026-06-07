# PR_26157_016 Login Page Session Mode Lockdown Report

## Summary

Status: PASS

PR_26157_016 adds a Theme V2 `login.html` local/dev session page, wires DEV vs Local mock DB session mode, and locks protected Admin/Account pages behind the selected Local session user's persisted Memory DB roles.

The original PR request was re-read before packaging. Every requested item below has explicit PASS evidence.

## Implementation Notes

- Added `login.html` using existing Theme V2 header/footer partials and page/card/button classes.
- Added `assets/theme-v2/js/login-session.js` for DEV/Local mode selection and Local test user selection.
- Extended `src/engine/persistence/mock-db-store.js` with session mode APIs and persistence gating so DEV mode is read-only/non-persistent and forces Guest.
- Updated `assets/theme-v2/js/gamefoundry-partials.js` so the header reads Local user roles from persisted Memory DB `users`, `roles`, and `user_roles` rows, shows Login for unauthenticated sessions, and blocks direct Admin/Account page access without the required role.
- Added protected-page early exits to Admin runtime modules so blocked admin pages do not keep executing their tool/page scripts underneath the access message.
- Added targeted Playwright coverage for login mode switching, protected URL access, Account/Admin role unlocks, Guest toolbox access, DB Viewer regression, and Project Journey session behavior.

## Completion Checklist

| Requested Item | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Read before implementation; PR completion rule re-read before packaging. |
| Use PR_26157_012-015 context as needed | PASS | Session users, users/roles DB model, Project Journey search/session behavior, and PR completion rule context preserved in changed tests and implementation. |
| Add login page for local/dev session selection | PASS | `login.html`; `LoginSessionMode.spec.mjs` validates mode and user selection. |
| Create `login.html` using Theme V2 page/header patterns | PASS | `login.html` uses Theme V2 stylesheet, header/footer partials, page-title, section, container, card, action-group, status, and btn classes. |
| Add role/page protection for protected pages opened directly by URL | PASS | `gamefoundry-partials.js` adds `enforcePageProtection()`; `LoginSessionMode.spec.mjs` validates direct Admin and Account URL blocking. |
| DEV mode label is `DEV` | PASS | `login.html` mode button; Playwright validates DEV mode selection. |
| DEV description is `Only gets the JSON data.` | PASS | `MOCK_DB_SESSION_MODES`; Playwright validates rendered description. |
| DEV mode has no users selectable | PASS | Playwright validates zero `[data-login-user]` controls and hidden user control group. |
| DEV mode is read-only/demo JSON access only | PASS | `mockDbPersistenceEnabled()` returns false in DEV; Playwright validates DEV mode persistence disabled and session user forced to Guest. |
| Local mode label is `Local` | PASS | `login.html` mode button; Playwright validates Local mode selection. |
| Local description is `Uses the persisted Memory DB.` | PASS | `MOCK_DB_SESSION_MODES`; Playwright validates rendered description. |
| Local mode allows Guest, User 1, User 2, User 3, and Admin | PASS | `LoginSessionMode.spec.mjs` validates exact Local user buttons. |
| Guest is unauthenticated and not stored in users table | PASS | Guest session has `userKey: null`; Playwright validates users table names exclude Guest. |
| User/Admin selections use persisted Memory DB users/roles | PASS | Header role resolution requires persisted `users`, `roles`, and `user_roles`; tests seed Local Memory DB and validate User/Admin access. |
| Header shows Login when Guest/unauthenticated | PASS | Login, protected URL, and Guest toolbox tests assert Account top-level text is Login. |
| Header shows selected user displayName when logged in | PASS | Login and protected-page tests assert User 1/Admin display in header Account navigation. |
| Account menu appears only for logged-in users | PASS | Playwright validates Guest hides Account submenu and User 1 shows it. |
| Admin pages require admin role | PASS | Direct Admin URL blocks Guest and User 1; direct Admin URL opens for Admin. |
| Account pages require logged-in user | PASS | Direct Account URL blocks Guest and opens for User 1. |
| Guest may open Toolbox demo pages | PASS | Guest Project Journey page loads without access block. |
| Guest cannot persist data | PASS | Guest Project Journey controls are disabled and diagnostics remain visible. |
| User/Admin use persisted Memory DB | PASS | Local user/admin access tests seed and read the persisted Memory DB state; bare DEV mode disables persistence. |
| DEV mode must not show user selector | PASS | Playwright validates no user selector in DEV mode. |
| Direct URL access to admin pages blocks non-admin | PASS | `LoginSessionMode.spec.mjs`, 4/4 lane pass. |
| Direct URL access to account pages blocks Guest | PASS | `LoginSessionMode.spec.mjs`, protected URL test. |
| Guest can explore allowed Toolbox pages | PASS | `LoginSessionMode.spec.mjs`, Guest Project Journey test. |
| DEV mode shows no users | PASS | `LoginSessionMode.spec.mjs`, DEV mode test. |
| Local mode shows Guest/User 1/User 2/User 3/Admin | PASS | `LoginSessionMode.spec.mjs`, Local mode test. |
| Selected user appears in header | PASS | `LoginSessionMode.spec.mjs`, User 1/Admin assertions. |
| Admin role unlocks Admin pages | PASS | `LoginSessionMode.spec.mjs`, Admin direct URL test. |
| Guest is not in users table | PASS | `LoginSessionMode.spec.mjs`, Local Memory DB user names exclude Guest. |
| All requested items PASS before packaging | PASS | This checklist and targeted validation commands are all PASS. |

## Validation

| Command | Result |
| --- | --- |
| `node --check assets/theme-v2/js/gamefoundry-partials.js` | PASS |
| `node --check assets/theme-v2/js/login-session.js` | PASS |
| `node --check src/engine/persistence/mock-db-store.js` | PASS |
| `node --check admin/db-viewer.js` | PASS |
| `node --check admin/notes.js` | PASS |
| `node --check admin/tools-progress.js` | PASS |
| `node --check tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS |
| `node --check tests/playwright/tools/AdminDbViewer.spec.mjs` | PASS |
| `node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs` | PASS |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --reporter=list --workers=1` | PASS, 4/4 |
| `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --reporter=list --workers=1` | PASS, 2/2 |
| `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs --reporter=list --workers=1` | PASS, 13/13 |
| `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/ProjectJourneyTool.spec.mjs tests/playwright/tools/LoginSessionMode.spec.mjs --reporter=list --workers=1` | PASS, 19/19 |
| `npm run test:playwright:static` | PASS |
| `git diff --check` | PASS, line-ending warnings only |

## Coverage

- `docs_build/dev/reports/playwright_v8_coverage_report.txt` was regenerated by the combined targeted Playwright run.
- Relevant changed browser JS coverage includes `assets/theme-v2/js/gamefoundry-partials.js`, `assets/theme-v2/js/login-session.js`, `src/engine/persistence/mock-db-store.js`, and `admin/db-viewer.js`.

## Skipped Lanes

- Full samples smoke: SKIP per request.
- Broad full Playwright suite: SKIP because the affected surfaces are covered by targeted Login Session Mode, Admin DB Viewer, and Project Journey lanes.

## Notes

- The Mock DB clear/seed workflow remains usable on the already-authorized Admin DB Viewer page. A refreshed Admin URL after users/roles are cleared is blocked by design until valid Local role data exists again.
- No page-local CSS, tool-local CSS, inline styles, `<style>` blocks, `<script>` blocks, inline event handlers, archived V1/V2 files, or `start_of_day` files were added or modified.
