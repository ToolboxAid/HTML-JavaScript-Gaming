# PR_26158_033 Local Server Entrypoint Cleanup Report

## Executive Summary

Static `127.0.0.1:5500` is no longer treated as a supported login/session entrypoint. When `login.html` is opened from that static server, the page displays:

`Use the API-backed local server for login.`

The static 5500 path does not call `/api/session/current`, and Local Mem / Local DB controls remain disabled. API-backed Local Mem and Local DB behavior still works through the real local server.

## Implementation

| Area | Change | Evidence |
| --- | --- | --- |
| Login page runtime | Detects `127.0.0.1:5500` / `localhost:5500` before session API calls and renders the API-backed server diagnostic. | `assets/theme-v2/js/login-session.js` |
| Shared header partial | Detects the unsupported static local entrypoint before header/account session reads, preventing `/api/session/current` from static 5500 pages. | `assets/theme-v2/js/gamefoundry-partials.js` |
| Static Playwright | Uses `127.0.0.1:5500` explicitly and asserts no `/api/session/current` or `/api/session/` requests are made. | `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs` |

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | Read before implementation. | PASS |
| Remove static `127.0.0.1:5500` as a supported login/session entrypoint. | Static 5500 detection now renders a blocked diagnostic before session API usage. | PASS |
| Add visible page diagnostic: `Use the API-backed local server for login.` | Static 5500 Playwright verifies this exact text appears in login status. | PASS |
| Do not call `/api/session/current` from static-only 5500 pages. | Static 5500 Playwright records all requests and asserts no `/api/session/current` or `/api/session/` requests. | PASS |
| Do not make Local Mem or Local DB appear usable from static-only 5500. | Static 5500 Playwright verifies both mode buttons are disabled and not selected. | PASS |
| Preserve API-backed Local Mem and Local DB behavior when served from the real local server. | `LoginSessionMode.spec.mjs` passed 5/5. | PASS |
| Document `ShowOneChild.js` / `ActionableCoachmark` is browser-extension injected if repo audit confirms it. | Repo audit found no `ShowOneChild.js` file and no active repo HTML/JS load path; test noise filtering only treats those names as extension noise when an extension URL scheme is present. Therefore any observed runtime `ShowOneChild.js` / `ActionableCoachmark` error is browser-extension injected, not repo-served. | PASS |
| Do not add shims or fallbacks. | No `ActionableCoachmark` global, static API fallback, or login fallback shim was added. | PASS |
| Do not add UAT/Prod behavior. | No UAT/Prod login choices or adapter behavior changed. | PASS |

## ShowOneChild / ActionableCoachmark Evidence

| Check | Evidence | Result |
| --- | --- | --- |
| Repo-owned file search | `Get-ChildItem -Path . -Recurse -Filter ShowOneChild.js -File` returned no files. | PASS |
| Active HTML/JS reference search | Scoped active HTML/JS `rg` found only `tests/helpers/browserExtensionNoise.mjs`, `tests/playwright/tools/ApiStaticRouteRecovery.spec.mjs`, and `tests/playwright/tools/StaticOnlyLoginApiRequired.spec.mjs`. | PASS |
| Browser-extension injection conclusion | No repo-owned file or load path exists. The existing helper requires `chrome-extension://`, `moz-extension://`, or `extension://` before treating these script names as extension noise. | PASS |
| Shim check | No shim or fallback global was added. | PASS |

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
| `git diff --check` | PASS, with Git line-ending warnings only |

## Skipped Lanes

| Lane | Decision | Reason |
| --- | --- | --- |
| AdminDbViewer Playwright | SKIP | DB Viewer routes and rendering were not changed. |
| Full samples smoke | SKIP | No sample files, sample loader, or shared sample framework changed. |
| Full Playwright suite | SKIP | Requested targeted lanes cover the changed login/session and toolbox-route surfaces. |

## Notes

- Playwright emitted Node SQLite experimental warnings from the existing Local DB path. They are not introduced by this PR and did not fail validation.
- This PR intentionally does not add fallback behavior for static servers. The visible diagnostic directs users to the API-backed local server.
