# PR_26158_034 Static Login Disabled Message Report

## Executive Summary

Improved the static-only `127.0.0.1:5500` login state by adding a visible message next to the disabled Local Mem / Local DB buttons:

`Use the API-backed local server for login. Local Mem and Local DB are disabled until the local API server is running.`

No fallback behavior was added. API-backed Local Mem and Local DB behavior remains unchanged.

## Implementation

| Area | Change | Evidence |
| --- | --- | --- |
| Login mode sidebar | Added a hidden Theme V2 `status` paragraph near the Local Mem / Local DB buttons. | `login.html` |
| Login runtime | Shows the sidebar message only for the static 5500 API-required state; hides it again on API-backed success. | `assets/theme-v2/js/login-session.js` |
| Static Playwright | Verifies the message is visible beside the disabled mode controls. | `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` |

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | Read before implementation. | PASS |
| Improve static-only login page state from `127.0.0.1:5500`. | Added a nearby disabled-mode status message in the login sidebar. | PASS |
| Keep Local Mem and Local DB disabled when required API server is unavailable. | Static Playwright verifies both mode buttons are disabled. | PASS |
| Add visible text near disabled login mode buttons explaining API-backed local server is required. | Static Playwright verifies `[data-login-mode-disabled-message]` is visible and contains the API-backed server text. | PASS |
| Do not add fallback behavior. | Static path still does not call session routes and does not enable controls. | PASS |
| Do not make static-only 5500 login usable. | Static Playwright verifies buttons remain disabled and unselected. | PASS |
| Preserve API-backed login behavior unchanged. | `LoginSessionMode.spec.mjs` passed 5/5. | PASS |
| Run changed-file syntax checks. | `node --check` passed for changed JS/spec files. | PASS |
| Run LoginSessionMode Playwright with API server running. | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` passed 5/5. | PASS |
| Run static-only login Playwright proving buttons are disabled and API-required message is visible. | `npx playwright test tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` passed 1/1. | PASS |

## Validation Commands

| Command | Result |
| --- | --- |
| `node --check assets/theme-v2/js/login-session.js` | PASS |
| `node --check tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` | PASS |
| `npx playwright test tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` | PASS, 1/1 |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS, 5/5 |
| `git diff --check` | PASS, with Git line-ending warnings only |

## Skipped Lanes

| Lane | Decision | Reason |
| --- | --- | --- |
| ToolboxRoutePages Playwright | SKIP | Toolbox route rendering was not touched. |
| AdminDbViewer Playwright | SKIP | DB Viewer routes and rendering were not touched. |
| Full samples smoke | SKIP | No sample files, sample loader, or shared sample framework changed. |

## Notes

- No CSS was added; the new message uses existing Theme V2 `status` styling.
- Playwright emitted existing Node SQLite experimental warnings during the API-backed login lane; they did not fail validation.
