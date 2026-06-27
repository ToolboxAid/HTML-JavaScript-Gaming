# PR_26157_019 Dev Runtime Final Isolation Fix Report

## Summary

Status: PASS

This PR finishes the PR_26157_018 dev-runtime boundary by moving the remaining DB Viewer and login/session mock implementations under `src/dev-runtime/`, replacing the direct engine re-export with a named adapter facade, and making audit-user fallback fail visibly outside controlled seed initialization.

Full samples smoke: SKIP. The scope is auth/login, DB Viewer, shared mock DB, import/static validation, and Project Journey regression coverage; samples were not changed.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first | PASS | Read before implementation. |
| Use PR_26157_018 delta as context | PASS | Continued from existing `src/dev-runtime/` structure and PR018 auth/mock DB files. |
| Fix remaining PR_26157_018 issues before packaging | PASS | Dev-only DB Viewer/login moved, engine direct re-export removed, fallback audit behavior hardened. |
| Include 100% requested-work checklist | PASS | This table maps every requested item. |
| Keep `admin/db-viewer.html` as route/page shell | PASS | HTML unchanged; JS route file is gateway only. |
| Move DB Viewer implementation out of `admin/db-viewer.js` | PASS | Implementation now in `src/dev-runtime/admin/db-viewer.js`; `admin/db-viewer.js` only gates and dynamically loads. |
| `admin/db-viewer.js` has no DB business/render/clear/seed logic | PASS | Gateway only checks dev runtime/local mode and calls `startDevRuntimeDbViewer`. |
| DB Viewer remains Local-only and admin-only | PASS | Local-mode gate in `admin/db-viewer.js`; admin role protection validated by `LoginSessionMode.spec.mjs` and `AdminDbViewer.spec.mjs`. |
| DEV/UAT/PROD do not expose DB Viewer implementation | PASS | Gateway imports dev-runtime only on file/localhost or explicit `GameFoundryDevRuntime.enabled`; DEV mode shows Local-only status instead of loading viewer. |
| Keep `login.html` as route/page shell | PASS | HTML unchanged; public login JS is gateway only. |
| Move mock login/session selector out of `assets/theme-v2/js/login-session.js` | PASS | Implementation now in `src/dev-runtime/auth/login-session.js`; asset JS only gates and dynamically imports local dev runtime. |
| Public login gateway has no mock users/Local selector/fallback behavior | PASS | `assets/theme-v2/js/login-session.js` contains only dev-runtime gate and dynamic import. |
| Login still works in Local mode | PASS | `LoginSessionMode.spec.mjs` passed 5/5 in final combined run. |
| UAT/PROD must not import Local mock login implementation | PASS | Gateway refuses dev-runtime import outside file/localhost unless explicitly enabled. |
| Replace direct engine dev-runtime re-export | PASS | `src/engine/persistence/mock-db-store.js` is no longer `export *`; it is a named adapter facade with `configureMockDbRuntimeAdapter`. |
| Active tools import stable engine contract paths only | PASS | Boundary scan: `rg ... toolbox` returned no `src/dev-runtime` imports. |
| UAT/PROD can swap gateway to server/API adapter without tool-code changes | PASS | Engine facade exposes `configureMockDbRuntimeAdapter(adapter)` while tools keep importing `src/engine/persistence/mock-db-store.js`. |
| Gateway does not expose dev seed/clear/session-selector APIs | PASS | Engine facade no longer exports seed/clear/all-snapshot/session-mode/session-selector helpers. |
| Review and remove silent `normalizeUserKey(value, fallbackUserKey)` behavior | PASS | Signature changed; invalid audit users now throw unless `allowSeedAuditFallback` is explicitly set. |
| Invalid audit users fail visibly or produce diagnostics outside seed creation | PASS | `AdminDbViewer.spec.mjs` verifies DB Viewer visible error; unit assertion verifies invalid audit user throws. |
| Seed fallback, if present, is isolated under `src/dev-runtime/` | PASS | Seed-only fallback lives in `src/dev-runtime/persistence/mock-db-store.js`. |
| Seed fallback emits diagnostic and never runs for normal writes | PASS | Controlled seed fallback emits diagnostics; normal `saveMockDbTables` path is strict. |
| No fallback admin/user/forge-bot/static auth map | PASS | Scans found no `localSessionUsers`, legacy audit map, role query fallback, accountType/isSystemUser, or actor code. |
| Verify `admin/db-viewer.js` shell/loader only | PASS | Syntax and diff review; file only contains runtime/local gate and dynamic import. |
| Verify DB Viewer implementation under `src/dev-runtime/admin/` | PASS | `src/dev-runtime/admin/db-viewer.js`. |
| Verify `assets/theme-v2/js/login-session.js` shell/gateway only | PASS | Syntax and diff review; file only contains runtime gate and dynamic import. |
| Verify mock login implementation under `src/dev-runtime/auth/` | PASS | `src/dev-runtime/auth/login-session.js`. |
| Verify engine file is not direct dev-runtime re-export | PASS | Static scan found no `export * from .*dev-runtime`. |
| Verify no active tool imports `src/dev-runtime` directly | PASS | `rg ... toolbox` returned no matches. |
| Verify no fallback auth/user/session remains | PASS | Removed-field/fallback scan returned no matches. |
| Verify invalid audit users fail visibly outside controlled seed creation | PASS | New Admin DB Viewer visible diagnostic test passed. |
| Verify Local login still works | PASS | `LoginSessionMode.spec.mjs` final combined run. |
| Verify DB Viewer Local-only/admin-only | PASS | `AdminDbViewer.spec.mjs` and `LoginSessionMode.spec.mjs` final combined run. |
| Verify DEV cannot access DB Viewer | PASS | Login/session lane verifies DEV mode and protected page behavior; gateway blocks non-Local mode. |
| Verify Guest unauthenticated and not stored in users | PASS | `LoginSessionMode.spec.mjs` and `ProjectJourneyTool.spec.mjs` final combined run. |
| Run changed-file/static validation | PASS | `npm run test:playwright:static` PASS and `git diff --check` PASS. |
| Do not run full samples smoke | PASS | Samples smoke skipped intentionally; no sample scope. |

## Validation

| Lane | Command | Result |
| --- | --- | --- |
| Auth/header/login lane | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs tests/playwright/tools/AdminDbViewer.spec.mjs tests/playwright/tools/ProjectJourneyTool.spec.mjs --project=playwright --reporter=list --workers=1` | PASS, 23/23 |
| DB Viewer lane | Same final combined command; DB Viewer tests 5/5 | PASS |
| Shared mock DB lane | Same final combined command; live persistence, DB-shaped Palette/Asset rows, invalid audit behavior covered | PASS |
| Project Journey lane | Same final combined command; Project Journey tests 13/13 | PASS |
| Import/static validation lane | `npm run test:playwright:static`; `git diff --check`; boundary `rg` scans | PASS |
| Runtime JS syntax | `node --check` on changed runtime/test modules | PASS |

Seed-only diagnostic note: final Playwright output intentionally included seed diagnostics for Palette source seed rows and the invalid-audit test seed. These are controlled `src/dev-runtime/` seed-initialization diagnostics, not normal write fallbacks.

## Artifacts

- `docs_build/dev/reports/dev-runtime-final-isolation-fix-report.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
