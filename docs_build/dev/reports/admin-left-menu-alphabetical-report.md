# PR_26158_052 Admin Left Menu Alphabetical Report

## Summary

Sorted Admin navigation surfaces so local `My Stuff` stays first, its nested local-only items are alphabetical, UAT/PROD-safe Admin header items are alphabetical, and Admin page left menus use the same alphabetical UAT/PROD-safe list.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | PASS | Instructions were read before inspection and edits. |
| Sort all Admin page left-menu items alphabetically. | PASS | All `admin/*.html` side menus now use `Analytics`, `Branding`, `Controls`, `Moderation`, `Platform Settings`, `Ratings`, `Roles`, `Site Settings`, `Themes`, `Users`; boundary test validates every side menu. |
| Preserve My Stuff as the first local-only Admin submenu section with HR directly below it. | PASS | `src/dev-runtime/admin/header-nav.local.html`; Playwright validates `My Stuff` then separator as the first direct Admin submenu children. |
| Sort items inside My Stuff alphabetically. | PASS | Local My Stuff order is `DB Viewer`, `Design System`, `Environments`, `Game Migration`, `Grouping Colors`, `Notes`, `Tools Progress`; Playwright and boundary test validate the order. |
| Sort UAT/PROD-safe Admin menu items alphabetically. | PASS | Local and production Admin header lists use the same alphabetical safe list; Playwright and boundary test validate local order, static audit validates production header. |
| Keep Notes label as Notes. | PASS | Local menu link remains `Notes`; Admin menu Playwright clicks it successfully. |
| Keep dev-only items local-only under `src/dev-runtime/admin/`. | PASS | The local-only header/menu exposure remains owned by `src/dev-runtime/admin/header-nav.local.html`; production/public header and Admin side menus do not expose My Stuff or dev-only links. |
| Do not expose My Stuff or dev-only Admin items in UAT/PROD. | PASS | Production header audit and public/UAT exposure audit returned no My Stuff or local Admin Notes menu matches; Admin side menus omit the dev-only labels. |
| Do not modify `start_of_day` folders. | PASS | `git diff --name-only \| rg "(^|/)start_of_day(/|$)"` returned no matches. |

## Files Changed

| File/Pattern | Change |
| --- | --- |
| `admin/*.html` pages with Admin side menus | Replaced side-menu contents with the alphabetized UAT/PROD-safe Admin list and preserved active state for safe Admin pages. |
| `src/dev-runtime/admin/header-nav.local.html` | Sorted local My Stuff links alphabetically with `Notes` retained as the label. |
| `tests/dev-runtime/AdminNotesBoundary.test.mjs` | Added static assertions for My Stuff order, main Admin order, and every Admin page left-menu order. |
| `tests/playwright/tools/LoginSessionMode.spec.mjs` | Updated expected local My Stuff browser order. |

## Validation Evidence

| Validation | Result |
| --- | --- |
| Changed-file syntax checks | PASS |
| `node --test tests/dev-runtime/AdminNotesBoundary.test.mjs` | PASS, 6/6 |
| Admin menu Playwright lane | PASS, 2/2 |
| AdminNotesLocalViewer Playwright lane | PASS, 2/2 |
| Production header dev-only item audit | PASS |
| Public/UAT dev-runtime exposure audit | PASS |
| `git diff --check` | PASS, line-ending warnings only |
| start_of_day protection check | PASS |

## Intentional-Order Exception

Navigation governance requires alphabetical browseable choices. This PR preserves one explicit product exception from the request: `My Stuff` remains first in the local-only Admin submenu, followed immediately by the separator. Items inside `My Stuff` and the main Admin lists are alphabetical.

## Skipped Lanes

| Lane | Decision | Reason |
| --- | --- | --- |
| Full samples smoke | SKIP | No samples, game runtime, sample loader, or shared sample framework changed. |
| Full Playwright suite | SKIP | Targeted Admin menu and Admin Notes viewer lanes cover the changed navigation behavior. |
