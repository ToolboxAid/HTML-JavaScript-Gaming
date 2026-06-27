# PR_26158_030 Static Server Login Fallback Report

## Summary

Added a UI-only static-server login fallback so `127.0.0.1:5500`-style static serving keeps Local Mem selectable while showing Local DB as API-required.

## Artifact

- Delta ZIP: `tmp/PR_26158_030-static-server-login-fallback_delta.zip`

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | PASS | Read before edits. |
| Fix static-only local serving from `127.0.0.1:5500` so `/api/session/current` 404 does not leave login modes disabled. | PASS | `assets/theme-v2/js/login-session.js` renders a static API-unavailable mode state, and `StaticOnlyLoginFallback.spec.mjs` verifies both mode buttons are enabled on a static-only `127.0.0.1` server with missing `/api`. |
| Local Mem remains enabled and clickable when the API server is unavailable. | PASS | Static-only Playwright clicks Local Mem and verifies it remains selected with an actionable API-backed server diagnostic. |
| Local DB shows a visible actionable diagnostic when API server is unavailable. | PASS | Static-only Playwright clicks Local DB and verifies the status says Local DB requires the API-backed local server for SQLite-backed Local DB. |
| Fix or remove repo-owned dependency causing `ShowOneChild.js` to throw `ActionableCoachmark is not defined`. | PASS | No active repo runtime dependency was found. No global was added. |
| If `ShowOneChild.js` is not repo-owned, prove that in report and do not mask repo-owned errors. | PASS | Focused search over active runtime roots found no `ShowOneChild` or `ActionableCoachmark`. `tests/helpers/browserExtensionNoise.mjs` now requires extension URL schemes before ignoring named script noise. |
| Preserve SQLite-backed Local DB behind API boundary when API server is running. | PASS | `LoginSessionMode.spec.mjs` passed 5/5 in API-backed mode; Local DB still resolves through API routes. |
| Do not add UAT/Prod API adapter behavior. | PASS | No adapter behavior was added. |
| Do not expose UAT or Prod as local login choices. | PASS | LoginSessionMode and static-only login coverage assert UAT/Prod controls are absent. |
| Do not modify `start_of_day` folders. | PASS | Changed-file list contains no `start_of_day` paths. |
| Run changed-file syntax checks. | PASS | `node --check` passed for changed JS/spec files. |
| Run LoginSessionMode Playwright in API-backed mode. | PASS | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` passed 5/5. |
| Add/run static-only login Playwright coverage for `127.0.0.1:5500`-style behavior with missing API. | PASS | `npx playwright test tests/playwright/tools/StaticOnlyLoginFallback.spec.mjs` passed 1/1. |
| Run ToolboxRoutePages Playwright. | PASS | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs` passed 1/1. |
| Do not run full samples smoke unless directly impacted. | PASS | Full samples smoke skipped because no samples or shared sample loader/framework changed. |

## Files Changed

- `assets/theme-v2/js/login-session.js`
- `tests/helpers/browserExtensionNoise.mjs`
- `tests/playwright/tools/StaticOnlyLoginFallback.spec.mjs`
- `docs_build/dev/reports/testing_lane_execution_report.md`
- `docs_build/dev/reports/static-server-login-fallback-report.md`
- `docs_build/dev/reports/playwright_v8_coverage_report.txt`
- `docs_build/dev/reports/coverage_changed_js_guardrail.txt`
- `docs_build/dev/reports/codex_review.diff`
- `docs_build/dev/reports/codex_changed_files.txt`

## Validation Commands

| Command | Result |
| --- | --- |
| `node --check assets/theme-v2/js/login-session.js` | PASS |
| `node --check tests/helpers/browserExtensionNoise.mjs` | PASS |
| `node --check tests/playwright/tools/StaticOnlyLoginFallback.spec.mjs` | PASS |
| `npx playwright test tests/playwright/tools/StaticOnlyLoginFallback.spec.mjs` | PASS, 1/1 |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS, 5/5 |
| `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS, 1/1 |
| `git diff --check` | PASS, with Git line-ending warnings only |

## Notes

- The static fallback is intentionally UI-only. It does not create local users, authenticate Guest, or persist data without the API-backed local server.
- Node emitted the standard experimental warning for `node:sqlite` during API-backed Playwright lanes; validation passed.
