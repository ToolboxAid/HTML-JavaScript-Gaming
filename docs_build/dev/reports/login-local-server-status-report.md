# PR_26158_036 Login Local Server Status Report

## Executive Summary

Added a Local Development Status section near the bottom of `login.html`, below a new HR, so local developers can see the current URL, detected server mode, Local API availability, disabled reason, expected endpoint, correct API-backed URL, and startup command.

Static-only `127.0.0.1:5500` login remains disabled with no fallback behavior. API-backed Local Mem and Local DB remain enabled when the local API server is available.

## Implementation

| Area | Change | Evidence |
| --- | --- | --- |
| Login page markup | Added one HR and a `Local Development Status` card using existing Theme V2 classes. | `login.html` |
| Login runtime | Populates current URL, detected server mode, API availability, disabled reason, expected endpoint, local URL, and startup command from the existing render/error paths. | `assets/theme-v2/js/login-session.js` |
| Static Playwright | Verifies the diagnostics are visible and explain why Local Mem / Local DB are disabled without API. | `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` |
| API-backed Playwright | Verifies Local Mem / Local DB are enabled and diagnostics report API availability. | `tests/playwright/tools/LoginSessionMode.spec.mjs` |

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | Read before implementation and validation. | PASS |
| Add an HR near the bottom of `login.html`. | Added `main hr`; both Playwright lanes verify one HR in `main`. | PASS |
| Add a Local Development Status section below the HR. | Added `Local Development Status` H2 and status fields below the HR. | PASS |
| Display current URL. | `[data-login-status-current-url]` is populated from `window.location.href`; both Playwright lanes verify it. | PASS |
| Display detected server mode. | Static lane verifies `Static-only local server`; API-backed lane verifies Local Mem and Local DB server modes. | PASS |
| Display Local API availability status. | Static lane verifies `Unavailable`; API-backed lane verifies `Available` and `/api/session/current`. | PASS |
| Display why Local Mem and Local DB are disabled when API is unavailable. | Static lane verifies disabled reason text, command, and URL. | PASS |
| Display the expected API endpoint. | Both lanes verify `/api/session/current`. | PASS |
| Display the correct local API-backed URL and startup command if discoverable from repo scripts. | Both lanes verify `http://127.0.0.1:5501/login.html` and `npm run dev:local-api`, established by PR_26158_035. | PASS |
| Preserve disabled login behavior when API is unavailable. | Static lane verifies both login mode buttons are disabled and unselected. | PASS |
| Do not add fallback login behavior. | Static lane verifies no `/api/session/current` or `/api/session/` request is made from 5500. | PASS |
| Run changed-file syntax checks. | `node --check` passed for changed JS/spec files. | PASS |
| Run LoginSessionMode Playwright. | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` passed 5/5. | PASS |
| Run static-only login Playwright proving diagnostics are visible. | `npx playwright test tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` passed 1/1. | PASS |
| Verify Local Mem and Local DB become enabled when API is available. | LoginSessionMode verifies both `[data-login-mode]` buttons are enabled on API-backed login. | PASS |
| Required reports and review artifacts generated. | This report, `testing_lane_execution_report.md`, V8 coverage report, review diff, changed files, and ZIP artifact generated. | PASS |

## Validation Commands

| Command | Result |
| --- | --- |
| `node --check assets/theme-v2/js/login-session.js` | PASS |
| `node --check tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` | PASS |
| `node --check tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS |
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
- The V8 coverage helper includes HEAD-changed server files as advisory coverage context; this PR's current changed browser runtime file, `assets/theme-v2/js/login-session.js`, was collected by Playwright V8 coverage.
