# PR_26157_018 Dev Runtime And PR017 Cleanup Report

## Executive Summary

Status: PASS

PR_26157_018 creates the `src/dev-runtime/` boundary, moves the mock DB implementation under that boundary behind the existing engine persistence contract, removes PR017 fallback/session issues, and locks DB Viewer to Local admin-only shared Memory DB state without repository side-effect population.

## Source Of Truth Re-Read

- Re-read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before implementation.
- Re-read the original PR_26157_018 request before packaging.
- Used PR_26157_017 delta as context.
- Applied the PR Completion Rule: every requested item below has explicit PASS evidence.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Fix all identified PR_26157_017 issues | PASS | Removed local session identity map, old alias session storage, DB Viewer repository side effects, legacy audit key scrubber, and active `?role=` tests. |
| Create/enforce `src/dev-runtime/` structure | PASS | Added `src/dev-runtime/auth/`, `src/dev-runtime/persistence/`, `src/dev-runtime/admin/`, `src/dev-runtime/testing/`, and `src/dev-runtime/guest-seeds/`. |
| Add PROJECT_INSTRUCTIONS dev-runtime rule | PASS | Added `DEV RUNTIME BOUNDARY` section to `docs_build/dev/PROJECT_INSTRUCTIONS.md`. |
| All mock/dev-only runtime lives under `src/dev-runtime/` | PASS | Moved mock DB implementation to `src/dev-runtime/persistence/mock-db-store.js`; `src/engine/persistence/mock-db-store.js` is now a one-line contract shim. |
| UAT/PROD must never import, bundle, or deploy `src/dev-runtime/` | PASS | Governance rule added; active tools do not import `src/dev-runtime/` directly. |
| No fallback auth/session/user data | PASS | `assets/theme-v2/js/gamefoundry-partials.js` resolves selected user and roles only from persisted Memory DB rows; `src/dev-runtime/persistence/mock-db-store.js` removed static session users. |
| Missing users/roles fail visibly | PASS | Login/access guard shows visible diagnostics for missing seeded DB, missing selected user key, and missing roles. |
| Remove active Playwright `?role=user/admin/guest` usage | PASS | `rg -n "\?role=|role=user|role=admin|role=guest" tests/playwright/tools toolbox assets src admin -g "*.mjs" -g "*.js" -g "*.html"` returned no matches. |
| Remove hardcoded `localSessionUsers` from shared header | PASS | `assets/theme-v2/js/gamefoundry-partials.js` no longer contains `localSessionUsers`; scan returned no matches. |
| Session stores selected user key only | PASS | Login buttons store `users.key` values; Logout/Guest remove the session key; tests seed `gamefoundry.mockDb.sessionUser.v1` with `MOCK_DB_KEYS.users.*`. |
| User display/roles resolve from persisted DB | PASS | Header and dev runtime read `users`, `roles`, and `user_roles`; Login/Auth lane verifies User 1/Admin header display and role gates. |
| Remove `LEGACY_AUDIT_KEY_TO_USER_KEY` and obsolete compatibility scrubber logic | PASS | Legacy constant and remap removed; scan returned no legacy symbols. |
| DB Viewer reads shared DB state only | PASS | `admin/db-viewer.js` removed Project Journey/Palette/Asset repository imports and `getTables()` side-effect calls. |
| DB Viewer must not populate data by repository side effects | PASS | `AdminDbViewer.spec.mjs` first-open assertions show tool-owned tables as empty until tools write shared DB records. |
| DB Viewer read-only except Local-only clear/seed controls | PASS | DB table surface has no inputs/selects/edit buttons; clear/seed remains outside table viewer and is available only after Local admin access. |
| DB Viewer admin-only | PASS | Shared page guard protects `admin/**`; Login lane verifies Guest/User blocks and Admin unlock. |
| DB Viewer Local-only, not DEV | PASS | `LoginSessionMode.spec.mjs` verifies DEV mode blocks `/admin/db-viewer.html` and the DB Viewer UI does not render. |
| DEV mode has no DB Viewer | PASS | DEV DB Viewer direct URL is blocked with visible read-only/demo diagnostic. |
| DEV mode has no local user switching | PASS | Login lane verifies DEV mode hides local user controls and shows no users. |
| DEV mode is JSON/demo read-only only | PASS | Login lane verifies DEV mode disables persistence and no user selector is shown. |
| Local mode has persisted Memory DB, login user selection, DB Viewer, clear/seed | PASS | Login lane verifies Local users; DB Viewer lane verifies persisted records, filters, clear/seed. |
| Verify no active tool imports `src/dev-runtime` directly | PASS | `rg -n "src/dev-runtime|\.\./.*dev-runtime|dev-runtime" admin toolbox assets tests/playwright/tools -g "*.js" -g "*.mjs" -g "*.html"` returned no matches. |
| Verify DB Viewer reads shared DB without repository side-effect population | PASS | DB Viewer lane first test and live persisted records test passed. |
| Run changed-file/static validation and targeted Playwright | PASS | Static validation passed; targeted runtime passed 21/21. |
| Do not run full samples smoke | PASS | Full samples smoke skipped per request. |
| Required reports exist | PASS | This report, testing lane report, V8 coverage report, review diff, and changed files report were produced. |

## Validation Evidence

| Lane | Command | Result |
| --- | --- | --- |
| Runtime syntax | `node --check src/dev-runtime/persistence/mock-db-store.js; node --check src/engine/persistence/mock-db-store.js; node --check assets/theme-v2/js/gamefoundry-partials.js; node --check assets/theme-v2/js/login-session.js; node --check admin/db-viewer.js` | PASS |
| Focused test syntax | `node --check tests/playwright/tools/LoginSessionMode.spec.mjs; node --check tests/playwright/tools/AdminDbViewer.spec.mjs; node --check tests/playwright/tools/ProjectJourneyTool.spec.mjs; node --check tests/playwright/tools/RootToolsFutureState.spec.mjs; node --check tests/playwright/tools/ToolNavigationPrevNext.spec.mjs; node --check tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs` | PASS |
| Role-query cleanup test syntax | `node --check` across all Playwright files touched by `?role=` cleanup | PASS |
| Auth/header/login/account | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 5/5 |
| Admin DB Viewer | `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 3/3 |
| Project Journey | `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 13/13 |
| Combined targeted runtime and coverage | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/ProjectJourneyTool.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 21/21 |
| Changed-file/static validation | `npm run test:playwright:static` | PASS |
| Whitespace | `git diff --check` | PASS, line-ending warnings only |
| Required folder check | `Test-Path src/dev-runtime/auth`, `persistence`, `admin`, `testing`, `guest-seeds` | PASS |
| Removed field scan | `rg -n "createdByType|updatedByType|accountType|isSystemUser|actors" src admin toolbox assets/theme-v2 tests/playwright/tools -g "*.js" -g "*.mjs" -g "*.html"` | PASS, no matches |
| Role query scan | `rg -n "\?role=|role=user|role=admin|role=guest" tests/playwright/tools toolbox assets src admin -g "*.mjs" -g "*.js" -g "*.html"` | PASS, no matches |
| Legacy session scan | `rg -n "localSessionUsers|LEGACY_AUDIT_KEY_TO_USER_KEY|MOCK_DB_SESSION_USERS|sessionUserFromId|selectedSessionUserId" src assets admin toolbox tests/playwright/tools -g "*.js" -g "*.mjs" -g "*.html"` | PASS, no matches |
| Direct dev-runtime import scan | `rg -n "src/dev-runtime|\.\./.*dev-runtime|dev-runtime" admin toolbox assets tests/playwright/tools -g "*.js" -g "*.mjs" -g "*.html"` | PASS, no matches |

## Files Changed

- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `src/engine/persistence/mock-db-store.js`
- `src/dev-runtime/persistence/mock-db-store.js`
- `src/dev-runtime/auth/.gitkeep`
- `src/dev-runtime/admin/.gitkeep`
- `src/dev-runtime/testing/.gitkeep`
- `src/dev-runtime/guest-seeds/.gitkeep`
- `assets/theme-v2/js/gamefoundry-partials.js`
- `assets/theme-v2/js/login-session.js`
- `admin/db-viewer.js`
- `tests/playwright/tools/AdminDbViewer.spec.mjs`
- `tests/playwright/tools/LoginSessionMode.spec.mjs`
- `tests/playwright/tools/ProjectJourneyTool.spec.mjs`
- `tests/playwright/tools/AssetToolMockRepository.spec.mjs`
- `tests/playwright/tools/BuildPathProgressSimplification.spec.mjs`
- `tests/playwright/tools/GameConfigurationMockRepository.spec.mjs`
- `tests/playwright/tools/GameDesignMockRepository.spec.mjs`
- `tests/playwright/tools/ProjectWorkspaceMockRepository.spec.mjs`
- `tests/playwright/tools/RootToolsFutureState.spec.mjs`
- `tests/playwright/tools/ToolCenterFullscreenAccordion.spec.mjs`
- `tests/playwright/tools/ToolDisplayModeNavigation.spec.mjs`
- `tests/playwright/tools/ToolImageRegistry.spec.mjs`
- `tests/playwright/tools/ToolNavigationPrevNext.spec.mjs`
- `tests/playwright/tools/ToolsProgressHydration.spec.mjs`
- Required report artifacts under `docs_build/dev/reports/`

## Manual Validation Notes

1. Open `login.html`, switch to DEV, confirm no local users appear.
2. In DEV, open `admin/db-viewer.html` directly and confirm it is blocked.
3. Switch Login to Local, choose Admin, open `admin/db-viewer.html`, and confirm Mock DB renders.
4. Open Project Journey as a Local user, add an item, refresh, then open DB Viewer and confirm the record appears.

Full samples smoke: SKIP per request.
