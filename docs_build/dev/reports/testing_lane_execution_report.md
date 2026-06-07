# Testing Lane Execution Report

PR: PR_26157_017-auth-lockdown-and-audit-cleanup

## Impacted Lanes

- Theme V2 header/session state
- Login page Local/DEV session selection
- Account logout
- Admin protected page direct URL lockdown
- Account protected page direct URL lockdown
- Admin DB Viewer read-only/mock DB behavior
- Project Journey session/search/filter regression
- Palette/Asset mock DB table shape
- Active Playwright selector cleanup
- changed-file/static validation

## Commands Run

| Command | Result |
| --- | --- |
| `node --check assets/theme-v2/js/gamefoundry-partials.js; node --check assets/theme-v2/js/login-session.js; node --check admin/db-viewer.js; node --check src/engine/persistence/mock-db-store.js; node --check toolbox/colors/palette-workspace-repository.js; node --check toolbox/assets/assets-mock-repository.js; node --check toolbox/project-journey/project-journey.js` | PASS |
| `node --check tests/playwright/tools/LoginSessionMode.spec.mjs; node --check tests/playwright/tools/AdminDbViewer.spec.mjs; node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs; node --check tests/playwright/tools/RootToolsFutureState.spec.mjs; node --check tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs` | PASS |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 5/5 |
| `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 3/3 |
| `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 13/13 |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/ProjectJourneyTool.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 21/21 |
| `npm run test:playwright:static` | PASS |
| `git diff --check` | PASS, line-ending warnings only |
| `rg -n "createdByType|updatedByType|accountType|isSystemUser|actors" src admin toolbox assets/theme-v2 tests/playwright/tools -g "*.js" -g "*.mjs" -g "*.html"` | PASS, no matches |
| `rg -n "data-toolbox-role-banner|data-project-data-menu|data-project-data-action|data-project-data-status|Toolbox role simulation" tests/playwright/tools` | PASS, no matches |

## Behavior Covered

- Login page is the only active Local session user selector.
- DEV mode exposes no users.
- Guest remains unauthenticated and is not stored in the users table.
- Header shows Login for Guest/unauthenticated state.
- Header shows persisted Memory DB user display names for logged-in Local users.
- Account submenu appears only for logged-in users and includes Logout.
- Logout clears only the current session, preserves persisted Memory DB data, hides protected navigation, and blocks account/admin direct URLs.
- Local user/admin auth requires persisted `users`, `roles`, and `user_roles` rows.
- Missing seeded users/roles produce a visible login/session diagnostic instead of fallback auth.
- Admin DB Viewer is admin-only and has no session-user switching controls.
- Project Journey continues to honor selected session user, filters, search, active project handoff, ownership, and persistence behavior.
- Palette and Asset raw mock DB `getTables()` outputs are DB-shaped before DB Viewer normalization.
- Removed role/project-data selectors are gone from active Playwright tests.
- Removed fields/tables stay absent from active source and test paths.

## Skipped Lanes

- Full samples smoke: SKIP per request.
- Full broad Playwright suite: SKIP because targeted Login Session Mode, Admin DB Viewer, Project Journey, static validation, and cleanup scans cover the requested PR017 surfaces.
