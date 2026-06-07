# PR_26157_017 Auth Lockdown And Audit Cleanup Report

## Executive Summary

Status: PASS

PR_26157_017 locks session selection to `login.html`, keeps protected page access behind persisted Memory DB users/roles, removes DB Viewer session switching, adds Account logout, and completes the requested audit cleanup around removed auth fields/selectors and Palette/Asset DB-shaped table output.

No requested item is marked FAIL or blocked.

## Source Of Truth Re-Read

- Re-read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Re-read the original PR_26157_017 request before packaging.
- Used PR_26157_015 audit and PR_26157_016 login/session delta as context.
- Applied the PR Completion Rule: every item below has explicit PASS evidence before packaging.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| `admin/**` requires admin role | PASS | `assets/theme-v2/js/gamefoundry-partials.js` protected page guard; `LoginSessionMode.spec.mjs` direct admin URL checks; `AdminDbViewer.spec.mjs` authorized DB Viewer checks. |
| `account/**` requires logged-in user role | PASS | `assets/theme-v2/js/gamefoundry-partials.js` protected page guard; `LoginSessionMode.spec.mjs` Guest account direct URL and logout direct URL checks. |
| No direct URL workaround | PASS | `LoginSessionMode.spec.mjs` verifies Guest/User 1 block admin direct URL, Guest blocks account direct URL, logged-out direct URLs block. |
| Admin page may not switch session to non-admin and remain usable | PASS | `admin/db-viewer.html` removed session controls; `admin/db-viewer.js` removed `setMockDbSessionUser` handling; `AdminDbViewer.spec.mjs` asserts zero DB Viewer session controls. |
| Remove session-user switching from `admin/db-viewer.html` | PASS | `admin/db-viewer.html` removed session accordion/buttons/header; `AdminDbViewer.spec.mjs` asserts no `[data-session-user-button]`, summary, or controls. |
| DB Viewer is admin-only and has no session switching | PASS | DB Viewer protected by shared admin guard; `AdminDbViewer.spec.mjs` authorized admin path passes with no switch controls. |
| Session selection belongs on `login.html` only | PASS | DB Viewer switch controls removed; remaining user selection selectors are only in `assets/theme-v2/js/login-session.js` and `LoginSessionMode.spec.mjs`. |
| Login page owns Local user selection | PASS | `assets/theme-v2/js/login-session.js`; `LoginSessionMode.spec.mjs` verifies Local mode users and DEV mode no-user state. |
| Header owns current session display | PASS | Removed page-level session headers from DB Viewer and Project Journey; `ProjectJourneyTool.spec.mjs` and `AdminDbViewer.spec.mjs` assert header account text. |
| Account menu owns user actions | PASS | `assets/theme-v2/partials/header-nav.html` adds Account Logout; `gamefoundry-partials.js` wires logout; `LoginSessionMode.spec.mjs` verifies submenu/logout behavior. |
| Remove static fallback authentication path | PASS | `gamefoundry-partials.js` removed static role fallbacks and requires persisted `users`, `roles`, and `user_roles` rows for Local users. |
| Require persisted Memory DB rows for Local users | PASS | `localDevLoginState()` resolves Local user roles only from persisted Memory DB; no fallback role slugs remain. |
| Visible diagnostic when users/roles are not seeded | PASS | `createAccessBlockedMain()` displays login/session diagnostics; `LoginSessionMode.spec.mjs` verifies unseeded Admin session is blocked with diagnostic text. |
| No fallback admin/user/forge-bot | PASS | Removed static role grants; `rg` scan confirms no `accountType`, `isSystemUser`, `createdByType`, `updatedByType`, or `actors` in active source/test paths. |
| Add Logout submenu item under Account | PASS | `assets/theme-v2/partials/header-nav.html` includes `data-account-logout`; `gamefoundry-partials.js` wires it. |
| Logout clears current session | PASS | `gamefoundry-partials.js` removes `gamefoundry.mockDb.sessionUser.v1`; `LoginSessionMode.spec.mjs` verifies header becomes Login. |
| Logout hides Account submenu and Admin nav | PASS | `LoginSessionMode.spec.mjs` verifies Account submenu and Admin nav hidden after logout. |
| Logout blocks protected account/admin direct URLs | PASS | `LoginSessionMode.spec.mjs` opens fresh direct pages after logout and verifies account/admin blocked. |
| Logout does not clear persisted Memory DB data | PASS | `LoginSessionMode.spec.mjs` verifies persisted users remain `User 1`, `User 2`, `User 3`, `Admin`, and `forge-bot`. |
| Add or preserve PR_26157_010 evidence, or document exact historical limitation | PASS | Added `docs_build/dev/reports/pr-26157-010-historical-limitation.md`; no PR_26157_010 report/ZIP was present locally. |
| Stop overwriting per-PR standard reports where practical | PASS | Current PR has unique `auth-lockdown-and-audit-cleanup-report.md`; standard fixed-name artifacts remain only where required by the request. |
| Palette raw `getTables()` returns DB-shaped rows directly | PASS | `toolbox/colors/palette-workspace-repository.js` now normalizes via `normalizeMockDbTables()`; `AdminDbViewer.spec.mjs` validates DB-shaped Palette rows. |
| Asset raw `getTables()` returns DB-shaped rows directly | PASS | `toolbox/assets/assets-mock-repository.js` now normalizes via `normalizeMockDbTables()`; `AdminDbViewer.spec.mjs` validates DB-shaped Asset rows. |
| Remove old role/project-data selectors from active Playwright tests | PASS | Removed obsolete test/assertions; `rg` scan returns no old selector matches in `tests/playwright/tools`. |
| Remove obsolete compatibility scrubber code where no longer needed | PASS | `mock-db-store.js` replaced removed-field/table special cases with schema-based field sanitization and schema-owned table filtering. |
| Confirm removed fields/tables remain absent | PASS | `rg -n "createdByType|updatedByType|accountType|isSystemUser|actors" src admin toolbox assets/theme-v2 tests/playwright/tools -g "*.js" -g "*.mjs" -g "*.html"` returned no matches. |
| No page-local CSS, inline styles, style blocks, script blocks, or inline event handlers added | PASS | No page-local CSS/script additions; existing Theme V2/partials and external JS patterns used. |
| Do not modify archived V1/V2 or start_of_day folders | PASS | Changed file list excludes `archive/v1-v2` and `docs_build/dev/start_of_day`. |

## Validation Evidence

| Lane | Command | Result |
| --- | --- | --- |
| Syntax | `node --check assets/theme-v2/js/gamefoundry-partials.js; node --check assets/theme-v2/js/login-session.js; node --check admin/db-viewer.js; node --check src/engine/persistence/mock-db-store.js; node --check toolbox/colors/palette-workspace-repository.js; node --check toolbox/assets/assets-mock-repository.js; node --check toolbox/project-journey/project-journey.js` | PASS |
| Test syntax | `node --check tests/playwright/tools/LoginSessionMode.spec.mjs; node --check tests/playwright/tools/AdminDbViewer.spec.mjs; node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs; node --check tests/playwright/tools/RootToolsFutureState.spec.mjs; node --check tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs` | PASS |
| Auth/header/login/account | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 5/5 |
| Admin lockdown and DB Viewer | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 3/3 |
| Project Journey | `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 13/13 |
| Combined targeted runtime and coverage | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/ProjectJourneyTool.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 21/21 |
| Changed-file/static validation | `npm run test:playwright:static` | PASS |
| Diff whitespace | `git diff --check` | PASS, line-ending warnings only |
| Removed field scan | `rg -n "createdByType|updatedByType|accountType|isSystemUser|actors" src admin toolbox assets/theme-v2 tests/playwright/tools -g "*.js" -g "*.mjs" -g "*.html"` | PASS, no matches |
| Old selector scan | `rg -n "data-toolbox-role-banner|data-project-data-menu|data-project-data-action|data-project-data-status|Toolbox role simulation" tests/playwright/tools` | PASS, no matches |

## Files Changed

- `admin/db-viewer.html`
- `admin/db-viewer.js`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `assets/theme-v2/partials/header-nav.html`
- `src/engine/persistence/mock-db-store.js`
- `toolbox/assets/assets-mock-repository.js`
- `toolbox/colors/palette-workspace-repository.js`
- `toolbox/project-journey/index.html`
- `toolbox/project-journey/project-journey.js`
- `tests/playwright/tools/AdminDbViewer.spec.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- `tests/playwright/tools/ProjectJourneyTool.spec.mjs`
- `tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`
- `tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `docs_build/dev/reports/auth-lockdown-and-audit-cleanup-report.md`
- `docs_build/dev/reports/pr-26157-010-historical-limitation.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Packaging

- Delta ZIP: `tmp/PR_26157_017-auth-lockdown-and-audit-cleanup_delta.zip`
- Full samples smoke: SKIP per request.
