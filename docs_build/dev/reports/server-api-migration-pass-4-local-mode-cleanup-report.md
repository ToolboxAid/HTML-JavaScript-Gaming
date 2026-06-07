# PR_26158_024 Server API Migration Pass 4 Local Mode Cleanup Report

## Summary

Cleaned up the remaining legacy local/DEV ambiguity after PR_26158_023. Local browser-selectable environments remain Local Mem and Local DB only. The explicit legacy `local` mode alias is rejected by the server session API, Local DB still fails visibly without falling back, and the admin DB Viewer now uses Local Mem DB wording for user-facing text.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Do not add CSS unless absolutely required. | PASS | No CSS files changed. |
| Do not use archive/reference code except as reference. | PASS | No archive/start_of_day files modified or copied. |
| No browser direct imports of `src/dev-runtime`, mock repositories, or static `toolRegistry.js`. | PASS | Focused browser import `rg` checks returned no matches after excluding server/data-source implementation modules. |
| Browser continues Browser -> Server API -> Data Source. | PASS | Login uses session API client; shared toolbox registry access uses `toolbox/tool-registry-api-client.js`; DB Viewer reads server-backed API state. |
| Remove or isolate legacy `local` mode aliases where safe. | PASS | Server `POST /api/session/mode` rejects `modeId: "local"` with an unknown environment diagnostic. Explicit alias mapping was removed. |
| Document any remaining alias compatibility. | PASS | No explicit `local` alias remains. Dev-runtime persistence still generically defaults unknown stored mode values to Local Mem, which is server/dev-only resilience and not user-facing. |
| Replace user-facing Mock DB wording where it should say Local Mem DB. | PASS | `admin/db-viewer.html`, `admin/db-viewer.js`, `mock-db-viewer-ui.js`, and Admin DB Viewer tests now use Local Mem DB labels, status text, clear/seed buttons, and dialogs. |
| DB Viewer remains admin-only and Local Mem only until Local DB is configured. | PASS | `admin/db-viewer.js` still requires admin guard and `payload.data.mode === "local-mem"`. |
| Local DB fails visibly with `Local DB adapter not configured`. | PASS | API contract probe verified Local DB snapshot fails with this diagnostic and does not fall back. |
| Login page shows Local Mem and Local DB only. | PASS | Login Playwright asserted Local Mem/Local DB buttons and no DEV/UAT/Prod buttons. |
| Add/update Playwright checks proving no DEV/UAT/Prod buttons on local login. | PASS | `LoginSessionMode.spec.mjs` asserts no DEV, UAT, or Prod role buttons. |
| Add/update static import boundary audit. | PASS | `docs_build/dev/reports/browser_mock_remaining_audit.md` updated with PR_024 checks. |
| Update reports with changed files, diff, lanes, and remaining migration notes. | PASS | This report, testing lane report, browser audit, `codex_review.diff`, and `codex_changed_files.txt` updated. |

## Validation Evidence

| Lane | Result |
| --- | --- |
| Changed JS syntax | PASS, `node --check` on changed JS files |
| LoginSessionMode Playwright | PASS, `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs`, 5/5 |
| AdminDbViewer Playwright | PASS, `npx playwright test tests/playwright/tools/AdminDbViewer.spec.mjs`, 5/5 |
| ProjectJourneyTool Playwright | PASS, `npx playwright test tests/playwright/tools/ProjectJourneyTool.spec.mjs`, 13/13 |
| Server API contract probe | PASS, Local Mem/Local DB only, UAT/Prod deployment-only, legacy `local` rejected, Local DB no fallback |
| Static browser import boundary | PASS, no active browser direct imports of dev-runtime, mock repositories, or static `toolRegistry.js` |

## Remaining Migration Notes

- API route names such as `/api/mock-db/*` and module names such as `mock-db-api-client.js` remain stable internal contract names for now.
- Server/dev repository implementation modules still contain mock repository imports because they are the server-side LOCAL/DEV data source owner.
- The internal audit exception text `Invalid mock DB audit user key` remains non-user-facing diagnostic code and was not renamed in this PR.
- Full samples smoke was not run because no shared sample loader/framework or sample JSON changed.

## Artifacts

- `docs_build/dev/reports/browser_mock_remaining_audit.md`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`
- `tmp/PR_26158_024-server-api-migration-pass-4-local-mode-cleanup_delta.zip`
