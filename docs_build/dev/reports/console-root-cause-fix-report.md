# PR_26158_031 Console Root Cause Fix Report

## Executive Summary

Root cause was split:

- `ShowOneChild.js` / `ActionableCoachmark` is not repo-owned and is not loaded by repo HTML/JS. Repo references are limited to test guards and historical reports. No global `ActionableCoachmark` shim was added.
- Repeated static-only `/api/session/current` 404s were repo-owned. `gamefoundry-partials.js` and the module session API client could independently probe the same missing endpoint while rendering login/header state. The fix shares one visible static API diagnostic and prevents later session reads from repeating the network miss.

## Implementation

| Area | Change | Evidence |
| --- | --- | --- |
| Header/session partials | Added shared `GameFoundryStaticApiUnavailableDiagnostic` handling, returned a visible unauthenticated diagnostic from cache, and stopped unprotected pages from calling the session API through page-protection enforcement. | `assets/theme-v2/js/gamefoundry-partials.js` |
| Server API client | Added session-route static API diagnostic caching, deduped repeated diagnostic entries, and shared the same browser diagnostic key with the header partial. | `src/engine/api/server-api-client.js` |
| Static-only Playwright | Added assertions for exactly one `/api/session/current` failure, no follow-up session API failures after mode clicks, and no repo-owned `ShowOneChild` / `ActionableCoachmark` error text. | `tests/playwright/tools/StaticOnlyLoginFallback.spec.mjs` |

## ShowOneChild / ActionableCoachmark Audit

| Audit | Evidence | Result |
| --- | --- | --- |
| Locate every repo reference to `ShowOneChild`, `showOneChild`, and `ActionableCoachmark`. | `rg -n "ShowOneChild\|showOneChild\|ActionableCoachmark" .` found only `tests/helpers/browserExtensionNoise.mjs`, `tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs`, the new static-only assertion, and historical reports. | PASS |
| Locate any repo-owned `ShowOneChild.js` file. | `Get-ChildItem -Path . -Recurse -Filter ShowOneChild.js -File` returned no files. | PASS |
| Check active HTML/JS loads. | Scoped active HTML/JS `rg` found only test helper/spec references, no active runtime HTML or JS script load. | PASS |
| Determine source. | Exact repo source is none: there is no repo file and no active repo load path for `ShowOneChild.js`. Any runtime `ShowOneChild.js` console message is therefore external to the repo, such as an extension-injected script. | PASS |
| Avoid masking repo-owned errors. | `tests/helpers/browserExtensionNoise.mjs` only treats named scripts as extension noise when an extension URL scheme is present; the new static-only test also fails on bare `ShowOneChild` / `ActionableCoachmark` errors. | PASS |

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | Read before implementation. | PASS |
| Root-cause and fix repeated console errors instead of fallback-only patch. | Root cause identified as duplicated static session probes; fixed shared diagnostic/cache and public-page guard behavior. | PASS |
| Locate every repo reference to `ShowOneChild`, `showOneChild`, and `ActionableCoachmark`. | Full `rg` plus scoped active HTML/JS `rg` documented above. | PASS |
| If `ShowOneChild.js` is repo-owned or loaded by repo HTML, fix dependency or remove load. | Not repo-owned and not loaded by repo HTML/JS. | PASS |
| If `ShowOneChild.js` is not repo-owned, prove exact source in report. | Proof is repo-negative: no file, no active load path, only tests/reports. Runtime occurrence cannot be served by this repo and is external. | PASS |
| Fix `gamefoundry-partials.js` so static-only `127.0.0.1:5500` does not repeatedly call `/api/session/current`. | Partial now skips session calls for unprotected pages and reuses shared static diagnostic after first miss. | PASS |
| Fix `server-api-client` / `session-api-client` behavior so missing static API is handled once with visible diagnostics. | `server-api-client.js` caches session-route 404/405 diagnostics. `session-api-client.js` already routes through that client. Static test asserts one `/api/session/current` failure only. | PASS |
| Preserve Local Mem clickability without API. | Static-only Playwright verifies Local Mem is enabled/clickable after missing API. | PASS |
| Preserve Local DB API-required diagnostic when API unavailable. | Static-only Playwright verifies Local DB diagnostic says API-backed server and SQLite-backed Local DB are required. | PASS |
| Preserve SQLite-backed Local DB when API server is running. | `LoginSessionMode.spec.mjs` passed Local DB login/session behavior. | PASS |
| Do not add UAT/Prod behavior. | No UAT/Prod login options or adapter behavior changed. | PASS |
| Do not modify `start_of_day` folders. | `git status --short` shows no `start_of_day` files. | PASS |
| Run changed-file syntax checks. | `node --check` passed for changed JS/spec files. | PASS |
| Run LoginSessionMode Playwright. | `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` passed 5/5 on serialized rerun. | PASS |
| Run static-only login Playwright. | `npx playwright test tests/playwright/tools/StaticOnlyLoginFallback.spec.mjs` passed 1/1. | PASS |
| Run ToolboxRoutePages Playwright. | `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs` passed 1/1. | PASS |
| Add console-error assertion proving no repo-owned ShowOneChild/ActionableCoachmark error and no repeated `/api/session/current` spam. | `StaticOnlyLoginFallback.spec.mjs` asserts no matching page/console error text and exactly one `/api/session/current` failure. | PASS |
| Do not run full samples smoke unless directly impacted. | Full samples smoke skipped; samples were not touched. | PASS |

## Validation Commands

| Command | Result |
| --- | --- |
| `node --check assets/theme-v2/js/gamefoundry-partials.js` | PASS |
| `node --check src/engine/api/server-api-client.js` | PASS |
| `node --check tests/playwright/tools/StaticOnlyLoginFallback.spec.mjs` | PASS |
| `npx playwright test tests/playwright/tools/StaticOnlyLoginFallback.spec.mjs` | PASS, 1/1 |
| `npx playwright test tests/playwright/tools/LoginSessionMode.spec.mjs` | PASS, 5/5 on serialized rerun |
| `npx playwright test tests/playwright/tools/ToolboxRoutePages.spec.mjs` | PASS, 1/1 |
| `git diff --check` | PASS, with Git line-ending warnings only |

## Skipped Lanes

| Lane | Decision | Reason |
| --- | --- | --- |
| AdminDbViewer Playwright | SKIP | DB Viewer routes and rendering were not changed. |
| Full samples smoke | SKIP | No sample files, sample loader, or shared sample framework changed. |
| Full Playwright suite | SKIP | Requested targeted lanes cover the changed static login, API-backed login, and toolbox route behavior. |

## Remaining Notes

- The first parallel validation attempt ran `LoginSessionMode` and `ToolboxRoutePages` at the same time and produced a Playwright trace artifact `ENOENT` in the login lane. `LoginSessionMode` passed 5/5 when rerun alone, so the final lane evidence is the serialized PASS.
- Playwright emitted Node SQLite experimental warnings from the existing Local DB path. They are not introduced by this PR and did not fail validation.
