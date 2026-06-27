# PR_26158_023 Server API Migration Pass 3 Login Environments Report

## Summary

Implemented the Local login environment update while preserving the Browser -> Server API -> Data Source boundary. The local login page now exposes only Local Mem and Local DB. Local Mem uses the server/dev MockDbAdapter-backed memory data source, and Local DB uses the same adapter contract but fails visibly with `Local DB adapter not configured` until a physical local DB implementation is provided.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | PASS | Read before implementation. |
| Use PR_26158_022 delta as context. | PASS | Continued existing server API router, session API client, DB Viewer, and browser API-client migration patterns. |
| Continue Browser -> Server API -> Data Source migration. | PASS | Browser login/header/shared shell modules call session/registry API clients; server owns adapter routing in `src/dev-runtime/server/mock-api-router.mjs`. |
| Remove DEV/LOCAL naming from login UI. | PASS | `login.html` has only `data-login-mode="local-mem"` and `data-login-mode="local-db"`. |
| Local login page shows only Local Mem and Local DB. | PASS | Playwright login lane asserted exactly `Local Mem`, `Local DB`. |
| Do not show UAT or Prod on local login page. | PASS | Playwright asserted no DEV/UAT/Prod login buttons. UAT/Prod exist only in server adapter contract metadata as deployment-only. |
| Local Mem uses MockDbAdapter backed by in-memory lists. | PASS | `MOCK_DB_SESSION_MODES` declares `MockDbAdapter`, `Persistence: Memory`; server API defaults to `local-mem`. |
| Local DB uses LocalDbAdapter contract/stub. | PASS | Server adapter contract includes `LocalDbAdapter`; Local DB read/write attempts return `Local DB adapter not configured`. |
| UAT and Prod are physical deployments only. | PASS | `/api/data-source/adapter-contract` marks UAT/Prod `selectableOnLocalLogin: false`. |
| Show environment and persistence diagnostic text. | PASS | `assets/theme-v2/js/login-session.js` renders `Environment: ...` and `Persistence: ...`; Playwright asserted both. |
| Local Mem may use Guest/User 1/User 2/User 3/Admin. | PASS | Login Playwright asserted those Local Mem session buttons. |
| Guest remains unauthenticated and not stored in users. | PASS | Login and Project Journey lanes asserted Guest is unauthenticated and absent from users table. |
| Local DB uses same DB adapter contract as Local Mem. | PASS | `DB_ADAPTER_CONTRACT` lists both local adapters under one `GameFoundryDbAdapter` contract. |
| Browser code calls API clients only. | PASS | Static import audit found no active browser direct imports of `src/dev-runtime`, mock repositories, or `toolRegistry.js`. |
| No browser direct dev-runtime/mock repo/static registry imports. | PASS | Shared toolbox browser modules now import `toolbox/tool-registry-api-client.js`. |
| Server/dev runtime may use mock repositories behind API routes. | PASS | Mock repository imports remain in `src/dev-runtime/server/mock-api-router.mjs` and repository implementation modules only. |
| DB Viewer remains Local-only and admin-only. | PASS | `admin/db-viewer.js` gates on `local-mem`; Admin DB Viewer Playwright passed. |
| DB Viewer renders server-backed data only. | PASS | DB Viewer lane passed live server-backed snapshot checks. |
| No hardcoded DB Viewer snapshots. | PASS | DB Viewer still reads `/api/mock-db/snapshot`. |
| No fallback auth/session/user data. | PASS | Local DB does not expose local users; `POST /api/session/user` fails in Local DB instead of switching adapters. |
| One DB adapter contract supports Local Mem, Local DB, UAT, Prod. | PASS | Contract probe asserted Local Mem, Local DB, UAT, Prod entries. |
| Tool code must not change when adapter changes. | PASS | Project Journey runtime lane passed using unchanged tool API-client behavior. |
| Local DB must not silently fall back to Local Mem. | PASS | API contract probe asserted `/api/mock-db/snapshot` and `/api/session/user` return 500 with `Local DB adapter not configured` after selecting Local DB. |

## Validation Evidence

| Lane | Result |
| --- | --- |
| Login/auth/header Playwright | PASS, `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs`, 5/5 |
| DB Viewer Playwright | PASS, `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs`, 5/5 |
| Project Journey Playwright | PASS, `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs`, 13/13 |
| Server API contract | PASS, custom Node assertion against `/api/session/modes`, `/api/data-source/adapter-contract`, `/api/mock-db/snapshot`, and `/api/session/user` |
| Changed-file syntax | PASS, `node --check` on touched runtime/test JS files |
| Browser import boundary | PASS, focused `rg` checks for direct browser imports of dev-runtime, mock repositories, and static `toolRegistry.js` |

## Skipped Lanes

| Lane | Decision | Reason |
| --- | --- | --- |
| Full samples smoke | SKIP | No shared sample loader/framework or sample JSON changed. |
| Full Playwright suite | SKIP | Scope was limited to login environment, server API adapter contract, DB Viewer, Project Journey, and browser import boundary; targeted lanes covered changed surfaces. |

## Artifacts

- `docs_build/dev/reports/browser_mock_remaining_audit.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26158_023-server-api-migration-pass-3-login-environments_delta.zip`
