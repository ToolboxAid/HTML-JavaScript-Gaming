# PR_26158_035 Local API URL Guidance Report

## Executive Summary

Updated the static-only login disabled state to tell users exactly how to start and open the API-backed local login server:

`npm run dev:local-api`

`http://127.0.0.1:5501/login.html`

Local Mem and Local DB remain disabled from static-only `127.0.0.1:5500`, and API-backed Local Mem / Local DB behavior is preserved when opened from the correct server URL.

## Implementation

| Area | Change | Evidence |
| --- | --- | --- |
| Repo script | Added `dev:local-api` as the repo-owned API-backed local server command. | `package.json` |
| Local API server entrypoint | Added a small local server wrapper using the existing mock API router and static repo file serving at fixed port `5501`. | `src/dev-runtime/server/local-api-server.mjs`; `scripts/start-local-api-server.mjs` |
| Login page disabled guidance | Updated the visible static-only disabled message with the exact command and URL. | `login.html`; `assets/theme-v2/js/login-session.js` |
| Shared static/protected-page diagnostic | Updated the shared static login diagnostic to the same exact command and URL. | `assets/theme-v2/js/gamefoundry-partials.js` |
| Static Playwright | Added assertions for the exact command and URL in both visible disabled-message locations. | `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` |

## Server Command Discovery

| Finding | Result |
| --- | --- |
| Pre-existing fixed local API-backed login npm script | No fixed user-facing script/port existed before this PR; existing Playwright helpers used ephemeral ports. |
| Exact repo script established by this PR | `npm run dev:local-api` |
| Exact API-backed login URL established by this PR | `http://127.0.0.1:5501/login.html` |
| Server probe | PASS; `/login.html` and `/api/session/current` both returned HTTP 200 from `127.0.0.1:5501`. |

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | Read before implementation and validation. | PASS |
| Update static-only login disabled message to include exact local API-backed server start command and URL from repo scripts. | Message now includes `npm run dev:local-api` and `http://127.0.0.1:5501/login.html`; `package.json` owns the command. | PASS |
| Discover actual npm script and port used by the local API-backed server. | Found no fixed repo script/port; added `dev:local-api` using port `5501` and validated it by server probe. | PASS |
| Keep Local Mem and Local DB disabled on static-only 5500. | Static Playwright verifies Local Mem and Local DB buttons are disabled and unselected. | PASS |
| Preserve API-backed Local Mem and Local DB behavior when opened from the correct server URL. | `LoginSessionMode.spec.mjs` passed 5/5. | PASS |
| Do not add fallback behavior. | Static-only lane verifies no `/api/session/current` or `/api/session/` requests are made and login modes remain unusable from 5500. | PASS |
| Run changed-file syntax checks. | `node --check` passed for changed JS/MJS/spec files; `package.json` parsed successfully. | PASS |
| Run LoginSessionMode Playwright with API-backed server running. | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` passed 5/5. | PASS |
| Run static-only login Playwright proving disabled buttons and exact guidance are visible. | `npx playwright test tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` passed 1/1 and verifies command/URL text. | PASS |
| Required reports and review artifacts generated. | This report, `testing_lane_execution_report.md`, V8 coverage report, review diff, changed files, and ZIP artifact generated for PR closeout. | PASS |

## Validation Commands

| Command | Result |
| --- | --- |
| `node --check assets/theme-v2/js/login-session.js` | PASS |
| `node --check assets/theme-v2/js/gamefoundry-partials.js` | PASS |
| `node --check tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` | PASS |
| `node --check scripts/start-local-api-server.mjs` | PASS |
| `node --check src/dev-runtime/server/local-api-server.mjs` | PASS |
| `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"` | PASS |
| Inline `startLocalApiServer` probe for `http://127.0.0.1:5501/login.html` and `/api/session/current` | PASS, both 200 |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS, 5/5 |
| `npx playwright test tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` | PASS, 1/1 |
| `git diff --check` | PASS, with Git line-ending warnings only |

## Skipped Lanes

| Lane | Decision | Reason |
| --- | --- | --- |
| ToolboxRoutePages Playwright | SKIP | No toolbox route/page rendering files were changed. |
| AdminDbViewer Playwright | SKIP | Admin DB Viewer behavior and DB adapter rendering were not changed. |
| ProjectJourneyTool Playwright | SKIP | Project Journey files and persistence paths were not changed. |
| Full samples smoke | SKIP | No samples, sample loader, or shared sample framework changed. |

## Notes

- No CSS was added.
- No fallback login behavior was added.
- Existing SQLite experimental warnings and seed-only audit diagnostics appeared during API-backed validation; they were existing runtime diagnostics and did not affect the PR requirement results.
