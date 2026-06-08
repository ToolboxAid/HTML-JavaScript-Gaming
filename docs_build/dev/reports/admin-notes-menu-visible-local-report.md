# PR_26158_046 Admin Notes Menu Visible Local Report

## Summary

Fixed the local API-backed Admin menu so Admin Notes is visibly available when the Admin menu is opened. The served local header now injects a normal `data-nav-link` Admin Notes entry that opens `/src/dev-runtime/admin/admin-notes.html`; the checked-in Theme V2 header partial remains production-clean.

## Requirement Checklist

| Requirement | Evidence | Status |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | Read before implementation. | PASS |
| Fix Admin Notes so it is visible in the Admin menu during local API-backed testing. | `src/dev-runtime/admin/admin-notes-menu.mjs` now injects `data-nav-link data-admin-notes-local-menu`; LoginSessionMode Playwright hovers Admin menu and validates visibility. | PASS |
| Preserve dev-only access to `/src/dev-runtime/admin/admin-notes.html`. | AdminNotesLocalViewer Playwright still loads the dev-runtime viewer and note content. | PASS |
| Do not rely on static 5500 partial loading for Admin Notes menu injection. | Injection is applied by the API-backed local server and Playwright local server helper, not by static-only serving. | PASS |
| Ensure the local server injects or renders the Admin Notes menu entry consistently. | `localAdminNotesMenuContent()` is used by `src/dev-runtime/server/local-api-server.mjs`; boundary test validates the served header content. | PASS |
| Keep `assets/theme-v2/partials/header-nav.html` production-clean with no hardcoded Admin Notes link. | Static partial check and public exposure audit returned no matches. | PASS |
| Do not expose Admin Notes in UAT/PROD. | Static audits over public/prod candidate paths returned no matches for Admin Notes exposure or `src/dev-runtime/admin` imports. | PASS |
| Do not modify `start_of_day` folders. | `git diff --name-only \| rg "(^|/)start_of_day(/|$)"` returned no matches. | PASS |
| Run changed-file syntax checks. | `node --check` and AdminNotesBoundary node test passed. | PASS |
| Run AdminNotesLocalViewer Playwright. | Scoped Playwright run passed. | PASS |
| Run Admin menu Playwright proving Admin Notes is visible locally and opens `/src/dev-runtime/admin/admin-notes.html`. | LoginSessionMode Playwright hovers Admin menu, sees the link, clicks it, and validates the viewer loaded `index.txt`. | PASS |
| Verify production/public header partial remains clean. | `Select-String` and `rg` audits returned no matches. | PASS |

## Changed Files

| File | Purpose |
| --- | --- |
| `src/dev-runtime/admin/admin-notes-menu.mjs` | Makes the injected local Admin Notes anchor a normal nav link. |
| `tests/dev-runtime/AdminNotesBoundary.test.mjs` | Validates the served header contains the local nav link marker while the source header stays clean. |
| `tests/playwright/tools/LoginSessionMode.spec.mjs` | Proves the Admin Notes menu item is visible locally and opens the viewer. |
| `docs_build/dev/reports/admin-notes-menu-visible-local-report.md` | PR046 requirement checklist and validation evidence. |
| `docs_build/dev/reports/testing_lane_execution_report.md` | PR046 executed validation lanes. |
| `docs_build/dev/reports/playwright_v8_coverage_report.txt` | Advisory V8 coverage from scoped Playwright. |
| `docs_build/dev/reports/coverage_changed_js_guardrail.txt` | Advisory changed-runtime-JS guardrail. |

## Validation Evidence

| Validation | Result |
| --- | --- |
| Changed-file `node --check` lane | PASS |
| `node --test tests/dev-runtime/AdminNotesBoundary.test.mjs` | PASS, 5/5 |
| `npx playwright test tests/playwright/tools/AdminNotesLocalViewer.spec.mjs tests/playwright/tools/LoginSessionMode.spec.mjs --grep "Admin Notes local viewer loads\|Local users unlock" --workers=1` | PASS, 2/2 |
| Public navigation exposure audit | PASS, no matches |
| UAT/PROD dev-runtime admin import audit | PASS, no matches |
| Production header partial clean check | PASS, no matches |
| `Test-Path admin/notes.html` | PASS, returned `False` |
| `git diff --check` | PASS, line-ending warnings only |

## Playwright Impact

Playwright impacted: Yes. This PR changes local API-backed Admin menu behavior. Expected pass behavior is that an Admin user can open the Admin menu, see `Admin Notes (Local Dev)`, click it, and land on `/src/dev-runtime/admin/admin-notes.html` with `docs_build/dev/admin-notes/index.txt` loaded. Expected fail behavior is a hidden menu item, a link that only exists in the DOM but cannot be seen/clicked, a wrong target, or any production/public Admin Notes exposure.

## Manual Test Notes

1. Start the API-backed local server with `npm run dev:local-api`.
2. Log in locally as Admin.
3. Open an Admin page and hover/open the Admin menu.
4. Confirm `Admin Notes (Local Dev)` is visible and opens `/src/dev-runtime/admin/admin-notes.html`.
5. Confirm `assets/theme-v2/partials/header-nav.html` does not contain an Admin Notes link.

## Skipped Lanes

- Full samples smoke: skipped because samples and game runtime were not touched.
- Full Playwright suite: skipped because targeted Admin menu and Admin Notes local viewer lanes cover the changed behavior.
