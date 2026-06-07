# PR_26158_022 Server API Migration Pass 2 Report

## Scope

Continue the Browser -> Server API -> Data Source migration for active browser/tool files changed by or adjacent to PR_26158_020 and PR_26158_021.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Continue migration to Browser -> Server API -> Data Source. | PASS | `src/dev-runtime/server/mock-api-router.mjs` serves session, Mock DB, toolbox repository, function, constants, and registry endpoints; browser files use `src/engine/api/*` clients. |
| Audit active browser/tool files changed or adjacent to PR_26158_020/021. | PASS | See `docs_build/dev/reports/browser_mock_remaining_audit.md`. |
| Move remaining active mock data behind server/dev API endpoints. | PASS | Login, DB Viewer, toolbox registry, Project Journey suggested tools, Toolbox page, and Admin Tools Progress now call API clients or API-backed registry client. |
| Browser code must call API clients only for migrated data. | PASS | `admin/db-viewer.js`, `assets/theme-v2/js/login-session.js`, `toolbox/tools-page-accordions.js`, `assets/theme-v2/js/tool-display-mode.js`, `admin/tools-progress.js`, and `toolbox/project-journey/project-journey.js` no longer import `src/dev-runtime` or `toolbox/toolRegistry.js` directly. |
| Server code may use dev-runtime mock repositories for LOCAL/DEV only. | PASS | `src/dev-runtime/server/mock-api-router.mjs` owns Local/DEV API routing and imports mock repositories/persistence. |
| UAT/PROD must not import or bundle `src/dev-runtime`. | PASS | Active browser imports of `src/dev-runtime` were removed; `src/engine/persistence/mock-db-store.js` direct dev-runtime shim was deleted. |
| Remove browser fallbacks that hide missing server responses. | PASS | `src/engine/api/server-api-client.js`, `session-api-client.js`, and `mock-db-api-client.js` now require server `data`; missing/malformed responses throw. |
| Missing server/API data must fail visibly with actionable diagnostics. | PASS | Login page renders session API unavailable status; DB Viewer render errors show actionable diagnostics; Toolbox registry consumers render visible status messages when registry API is unavailable. |
| DB Viewer reads server-backed mock state only. | PASS | DB Viewer UI moved to `src/engine/api/mock-db-viewer-ui.js` and reads only `getMockDbSnapshot`, `clearMockDb`, and `seedMockDb` API clients. |
| Mock login/session resolves through server/dev auth endpoint only. | PASS | `assets/theme-v2/js/login-session.js` uses only `src/engine/api/session-api-client.js`; old `src/dev-runtime/auth/login-session.js` was removed. |
| Do not add CSS. | PASS | No CSS files changed and no page-local CSS was added. |
| Do not copy archive/v1-v2 code. | PASS | No archive paths read or copied for implementation. |
| Do not touch samples unless directly required. | PASS | No sample files changed. |

## Implementation Notes

- Added `toolbox/tool-registry-api-client.js` and `/api/toolbox/registry/snapshot` so active Toolbox registry consumers no longer import browser-side registry records directly.
- Moved DB Viewer browser rendering out of `src/dev-runtime/admin/db-viewer.js` into `src/engine/api/mock-db-viewer-ui.js`; `admin/db-viewer.js` remains the Local-mode route shell.
- Removed obsolete browser dev-runtime login and DB Viewer modules.
- Mock repository modules now import dev persistence directly because they are server/dev-only data source implementations.

## Validation Summary

- PASS: changed-file syntax checks with `node --check`.
- PASS: API contract validation script for session, Mock DB, toolbox registry, constants, repository creation, repository methods, and palette function endpoint.
- PASS: targeted Playwright set, 53 tests across Login, Admin DB Viewer, Project Journey, Project Workspace, Palette, Asset, Game Design, Game Configuration, and Tool Image Registry.
- PASS: focused Admin Tools Progress hydration check.
- PASS: `npm run test:playwright:static`.
- PASS: `git diff --check` with line-ending warnings only.

## Skipped Lanes

- Full samples smoke: SKIP because no shared sample loader/framework or sample JSON changed.
- Full ToolsProgressHydration/BuildPath legacy assertions: SKIP as packaging gate. An exploratory broad run surfaced existing expectation drift around Project Journey registry order and planned-tool card visibility; focused Admin Tools Progress hydration and Tool Image Registry passed for the API migration surfaces.
