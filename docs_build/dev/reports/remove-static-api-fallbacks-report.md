# PR_26158_032 Remove Static API Fallbacks Report

## Executive Summary

Removed the PR_030/PR_031 static-only login fallback. A missing `/api/session/current` now leaves login/session mode unavailable with a visible API-required diagnostic instead of presenting Local Mem or Local DB as usable choices.

API-backed Local Mem and SQLite-backed Local DB behavior remains intact behind the server API boundary.

## Implementation

| Area | Change | Evidence |
| --- | --- | --- |
| Login session UI | Removed static fallback mode data/state and now disables Local Mem/Local DB controls when session API reads fail. | `assets/theme-v2/js/login-session.js` |
| Header/session partials | Removed the shared static diagnostic cache from PR_031; missing session API failures are not cached as success-like browser state. | `assets/theme-v2/js/gamefoundry-partials.js` |
| Server API client | Removed static API diagnostic cache and duplicate-suppression behavior; missing API requests throw visible diagnostics through the normal client path. | `src/engine/api/server-api-client.js` |
| Static-only Playwright | Replaced the fallback test with an API-required test that verifies disabled mode controls and actionable diagnostics. | `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` |

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | Read before implementation. | PASS |
| Remove static-only login fallback behavior added in PR_030/PR_031. | Removed `staticModeDetails`, `staticApiUnavailable`, `renderStaticApiUnavailable`, `GameFoundryStaticApiUnavailableDiagnostic`, and related cache logic. | PASS |
| Local Mem and Local DB require the correct local API server path when login/session state depends on `/api/session/current`. | Static-only test verifies both buttons are disabled when `/api/session/current` is unavailable. | PASS |
| If `/api/session/current` is unavailable, show a visible actionable API-required diagnostic. | Static-only test verifies `Session API required` and the route-unavailable diagnostic text. | PASS |
| Do not pretend login/session mode is usable. | Static-only test verifies Local Mem and Local DB are disabled and not selected. | PASS |
| Keep errors visible; do not suppress or cache missing API failures as success-like state. | Removed browser static API cache and diagnostic dedupe path from `gamefoundry-partials.js` and `server-api-client.js`. | PASS |
| Preserve SQLite-backed Local DB behind API boundary. | `LoginSessionMode.spec.mjs` passed 5/5, including Local DB mode. | PASS |
| Preserve real API-backed Local Mem/Local DB behavior when API server is running. | `LoginSessionMode.spec.mjs` passed 5/5. | PASS |
| Prove `ShowOneChild.js` / `ActionableCoachmark` is external if still not repo-owned; do not add shims. | `Get-ChildItem -Path . -Recurse -Filter ShowOneChild.js -File` returned no files; scoped active HTML/JS `rg` found only test guard references. No shim added. | PASS |
| Do not add UAT/Prod behavior. | No UAT/Prod login choices or adapter behavior changed; existing LoginSessionMode assertions still pass. | PASS |
| Do not modify `start_of_day` folders. | `git status --short` shows no `start_of_day` changes. | PASS |
| Run changed-file syntax checks. | `node --check` passed for changed JS/spec files. | PASS |
| Run LoginSessionMode Playwright with API server running. | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` passed 5/5. | PASS |
| Add/run static-only login test proving API-required diagnostic appears and login modes do not silently work. | `npx playwright test tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` passed 1/1. | PASS |
| Run ToolboxRoutePages Playwright. | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs` passed 1/1. | PASS |
| Do not run full samples smoke unless directly impacted. | Full samples smoke skipped; samples and sample loader/framework were not touched. | PASS |

## ShowOneChild / ActionableCoachmark Evidence

| Check | Evidence | Result |
| --- | --- | --- |
| Repo-owned file search | `Get-ChildItem -Path . -Recurse -Filter ShowOneChild.js -File` returned no files. | PASS |
| Active HTML/JS reference search | Scoped active HTML/JS `rg` found `tests/helpers/browserExtensionNoise.mjs`, `tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs`, and `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` only. | PASS |
| Shim check | No `ActionableCoachmark` global or shim was added. | PASS |

## Validation Commands

| Command | Result |
| --- | --- |
| `node --check assets/theme-v2/js/login-session.js` | PASS |
| `node --check assets/theme-v2/js/gamefoundry-partials.js` | PASS |
| `node --check src/engine/api/server-api-client.js` | PASS |
| `node --check tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` | PASS |
| `npx playwright test tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` | PASS, 1/1 |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS, 5/5 |
| `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS, 1/1 |
| `git diff --check` | PASS, with Git line-ending warning only |

## Skipped Lanes

| Lane | Decision | Reason |
| --- | --- | --- |
| AdminDbViewer Playwright | SKIP | DB Viewer routes and rendering were not changed. |
| Full samples smoke | SKIP | No sample files, sample loader, or shared sample framework changed. |
| Full Playwright suite | SKIP | Requested targeted lanes cover the changed login/session and toolbox-route surfaces. |

## Notes

- Playwright emitted Node SQLite experimental warnings from the existing Local DB path. They are not introduced by this PR and did not fail validation.
- Historical reports for PR_030/PR_031 still document the older fallback behavior; PR_032 supersedes that behavior in active runtime and test coverage.
