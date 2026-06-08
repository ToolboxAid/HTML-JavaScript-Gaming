# PR_26158_047 Admin Notes Menu Route Fix Report

## Summary

PR_26158_047 fixes the Admin Notes menu visibility path for the API-backed local server. The production `assets/theme-v2/partials/header-nav.html` stays clean, and the local server now serves a dedicated dev-only header partial from `src/dev-runtime/admin/header-nav.local.html` when local pages request the normal header partial.

## Implementation

| File | Change |
| --- | --- |
| `src/dev-runtime/admin/header-nav.local.html` | Added dev/local-only header partial containing `Admin Notes (Local Dev)` under Admin. |
| `src/dev-runtime/admin/admin-notes-menu.mjs` | Replaced runtime string replacement with `localAdminNotesHeaderPartialPath(...)`, which maps the normal header partial request to the dev-only partial path. |
| `src/dev-runtime/server/local-api-server.mjs` | Serves the dev-only Admin Notes header partial through the API-backed local server. |
| `tests/helpers/playwrightRepoServer.mjs` | Mirrors the local server partial routing for targeted Playwright validation. |
| `tests/dev-runtime/AdminNotesBoundary.test.mjs` | Updated boundary coverage to validate dedicated partial routing and production-clean header behavior. |
| `tests/playwright/tools/LoginSessionMode.spec.mjs` | Added fixed-port `http://127.0.0.1:5501/login.html` Admin menu validation. |

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | PASS | Read before implementation. |
| Fix Admin Notes not appearing from `http://127.0.0.1:5501/login.html`. | PASS | Fixed-port Playwright test opens that exact URL and validates the Admin Notes item. |
| Do not rely on fragile string replacement against `assets/theme-v2/partials/header-nav.html`. | PASS | Removed the string replacement injector; local server maps the normal partial request to `src/dev-runtime/admin/header-nav.local.html`. |
| Add a dev/local-only served header partial or local-only menu route that includes Admin Notes. | PASS | Added `src/dev-runtime/admin/header-nav.local.html`. |
| Ensure local pages load the dev/local header partial when running the API-backed local server. | PASS | `src/dev-runtime/server/local-api-server.mjs` routes the normal header partial request to the dev-only partial. |
| Keep `assets/theme-v2/partials/header-nav.html` production-clean with no hardcoded Admin Notes link. | PASS | Static header check found no Admin Notes strings. |
| Admin Notes menu item is visible under Admin as `Admin Notes (Local Dev)`. | PASS | Fixed-port Playwright validates visible link text under Admin. |
| Admin Notes opens `/src/dev-runtime/admin/admin-notes.html`. | PASS | Fixed-port Playwright clicks the link and verifies the viewer route and loaded `index.txt` status. |
| Do not expose Admin Notes in UAT/PROD. | PASS | Public exposure and dev-runtime admin import audits returned no matches in production-facing paths. |
| Do not modify `start_of_day` folders. | PASS | `git diff --name-only \| rg "(^|/)start_of_day(/|$)"` returned no matches. |

## Validation

| Validation | Status | Evidence |
| --- | --- | --- |
| Changed-file syntax checks. | PASS | `node --check` passed for changed JS/MJS files; `node --test tests/dev-runtime/AdminNotesBoundary.test.mjs` passed 5/5. |
| AdminNotesLocalViewer Playwright. | PASS | Targeted run passed the viewer test. |
| Admin menu Playwright against `http://127.0.0.1:5501/login.html`. | PASS | Targeted run passed the fixed-port Admin menu test. |
| Production/public header partial remains clean. | PASS | `Select-String` found no Admin Notes strings in the production header partial. |
| UAT/PROD paths do not expose `src/dev-runtime/admin/`. | PASS | Static `rg` audits returned no matches. |

## Rerun Notes

- Initial Playwright run hit `EADDRINUSE` on `127.0.0.1:5501`. The fixed-port test harness now uses an already-running API-backed local server when present and still validates the exact 5501 URL.
- Second run corrected a test expectation from absolute URL to raw `href="/src/dev-runtime/admin/admin-notes.html"`; click-through still validates the full page URL.

## Skipped Lanes

| Lane | Decision | Reason |
| --- | --- | --- |
| Full samples smoke | SKIP | No sample loader/framework, sample data, or game runtime changed. |
| Full Playwright suite | SKIP | Targeted Admin Notes viewer and local Admin menu lanes cover the changed behavior. |

## Result

PASS. All requested PR_26158_047 requirements are implemented and validated.
