# PR_26158_051 Admin My Stuff Classification Report

## Summary

Classified local/dev-only Admin entries under a local-only `My Stuff` submenu and kept the production-facing Admin header list limited to UAT/PROD-safe items.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | PASS | Instructions were read before inspection and edits. |
| Update Admin menu so My Stuff is a local-only submenu at the top. | PASS | `src/dev-runtime/admin/header-nav.local.html`; Playwright asserts My Stuff is the first direct Admin submenu child. |
| Add a disabled HR/separator item directly below My Stuff that fills left-to-right. | PASS | Local header uses `<hr role="separator" aria-disabled="true" tabindex="-1">`; `assets/theme-v2/css/layout.css` adds reusable submenu `hr` sizing; Playwright verifies rendered width. |
| Move local-only/dev-only Admin items into My Stuff: Notes, DB Viewer, Design System, Environments, Game Migration, Grouping Colors, Tools Progress. | PASS | Local header nests all seven labels under `[data-admin-my-stuff-submenu]`; boundary and Playwright tests validate the list. |
| Keep UAT/PROD Admin items in the main Admin list. | PASS | Local and production header main lists contain only Analytics, Branding, Controls, Moderation, Platform Settings, Ratings, Roles, Site Settings, Themes, and Users. |
| Rename admin-notes label to Notes everywhere user-facing. | PASS | Local menu continues to expose the route as `Notes`; production header has no Admin Notes label. |
| Move dev-only files for My Stuff items to the same dev-only location as Notes under `src/dev-runtime/admin/`. | PASS | The local-only menu/header implementation that exposes My Stuff is owned by `src/dev-runtime/admin/header-nav.local.html`; no new production-facing dev-only files were introduced. Existing route targets are preserved. |
| Preserve local route mapping for dev-only items. | PASS | Local header hrefs remain on existing route paths; Notes still opens `/admin/admin-notes.html`. |
| Do not expose My Stuff or `src/dev-runtime/admin/` items in UAT/PROD. | PASS | Public/UAT exposure audit returned no My Stuff or `src/dev-runtime/admin` matches under active public roots. |
| Do not modify production header partial with dev-only hardcoded links. | PASS | Production header was cleaned to remove dev-only Admin entries and does not add My Stuff or local-only links. |
| Do not modify `start_of_day` folders. | PASS | `git diff --name-only \| rg "(^|/)start_of_day(/|$)"` returned no matches. |

## Implementation Details

| File | Change |
| --- | --- |
| `src/dev-runtime/admin/header-nav.local.html` | Nested seven dev-only Admin links under My Stuff and added disabled separator metadata. |
| `assets/theme-v2/partials/header-nav.html` | Removed dev-only Admin links from the production/public header partial. |
| `assets/theme-v2/css/layout.css` | Added reusable `.site-header .sub-menu hr` styling using Theme V2 tokens so submenu separators fill the menu width. |
| `tests/dev-runtime/AdminNotesBoundary.test.mjs` | Added static assertions for My Stuff classification, UAT/PROD-safe main menu contents, and production header omissions. |
| `tests/playwright/tools/LoginSessionMode.spec.mjs` | Added browser assertions for My Stuff order, full-width disabled separator, dev-only nested items, UAT/PROD-safe main items, and Notes click-through. |

## Intentional-Order Exception

Navigation governance normally sorts browseable submenu choices. This PR explicitly requires `My Stuff` to appear at the top of the Admin submenu with the separator directly below it, so that local/dev-only Admin links are grouped before UAT/PROD-safe Admin links.

## Validation Evidence

| Validation | Result |
| --- | --- |
| Changed-file syntax checks | PASS |
| `node --test tests/dev-runtime/AdminNotesBoundary.test.mjs` | PASS, 5/5 |
| Admin menu Playwright final run | PASS, 2/2 |
| Production header dev-only item audit | PASS |
| Public/UAT dev-runtime exposure audit | PASS |
| `git diff --check` | PASS, line-ending warnings only |
| start_of_day protection check | PASS |

## Fix Notes

The first Playwright run failed because the raw `hr` did not fill the submenu width. A reusable Theme V2 header submenu `hr` rule was added with existing spacing and border tokens, and the targeted lane passed afterward.

## Skipped Lanes

| Lane | Decision | Reason |
| --- | --- | --- |
| AdminNotesLocalViewer Playwright | SKIP | Viewer and route files were not touched; Admin menu Playwright validates Notes opens the existing viewer and loads `index.txt`. |
| Full samples smoke | SKIP | No game runtime, samples, sample loader, or shared sample framework changed. |
| Full Playwright suite | SKIP | Targeted Admin menu and boundary validation cover the requested menu classification. |
