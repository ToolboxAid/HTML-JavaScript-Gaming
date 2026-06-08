# PR_26158_050 Admin My Stuff Submenu Report

## Summary

Added a local/dev-only `My Stuff` section at the top of the Admin submenu, placed a separator immediately below it, and moved the local Admin Notes menu entry under that section with the label `Notes`.

## Requirement Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` first. | PASS | File read before edits; menu intentional-order exception documented below. |
| Create a new Admin submenu section named `My Stuff` at the top of the Admin submenu list. | PASS | `src/dev-runtime/admin/header-nav.local.html` adds `[data-admin-my-stuff-menu]` as the first Admin submenu child; Playwright asserts order. |
| Add an HR/separator immediately below My Stuff. | PASS | `src/dev-runtime/admin/header-nav.local.html` adds `<hr data-admin-my-stuff-separator>` immediately after My Stuff; Playwright asserts order. |
| Move all local-only/dev-only Admin menu items that are not going to UAT/PROD into My Stuff. | PASS | The existing local-only Notes entry is nested under `[data-admin-my-stuff-submenu]`; no other local-only Admin items were present in the local header partial. |
| Keep local-only files in the same dev-only location as Notes under `src/dev-runtime/admin/`. | PASS | Only `src/dev-runtime/admin/admin-notes-menu.mjs` and `src/dev-runtime/admin/header-nav.local.html` were changed for runtime/menu behavior. |
| Rename Admin menu label from Admin Notes/Admin Notes (Local Dev) to Notes. | PASS | `ADMIN_NOTES_LOCAL_MENU_LABEL` is now `Notes`; Playwright asserts the visible link text. |
| Keep `/admin/admin-notes.html` mapped to `src/dev-runtime/admin/notes.html`. | PASS | Route constants remain unchanged; Playwright opens `/admin/admin-notes.html` and validates `index.txt` loads. |
| Do not expose My Stuff or local-only items in UAT/PROD. | PASS | Production header check and public/UAT exposure audits returned no matches. |
| Do not modify `assets/theme-v2/partials/header-nav.html` with production-visible local-only links. | PASS | The production header partial was not modified and static checks found no local-only links. |
| Do not modify `start_of_day` folders. | PASS | `git diff --name-only \| rg "(^|/)start_of_day(/|$)"` returned no matches. |

## Intentional-Order Exception

Navigation governance normally sorts browseable submenu choices, but this PR explicitly requires `My Stuff` to appear at the top of the Admin submenu. The local-only `My Stuff` section is therefore intentionally first, with the requested separator before the existing Admin links.

## Implementation Details

| File | Change |
| --- | --- |
| `src/dev-runtime/admin/admin-notes-menu.mjs` | Renamed the local Notes label to `Notes` and added the `My Stuff` menu label constant. |
| `src/dev-runtime/admin/header-nav.local.html` | Added local-only My Stuff popout, nested Notes link, and separator above the regular Admin submenu items. |
| `tests/dev-runtime/AdminNotesBoundary.test.mjs` | Added boundary assertions for My Stuff, separator order, nested Notes placement, and production clean checks. |
| `tests/playwright/tools/LoginSessionMode.spec.mjs` | Added local Admin menu assertions for My Stuff, separator, Notes label, Notes route, and viewer load. |

## Validation Evidence

| Validation | Result |
| --- | --- |
| Changed-file syntax checks | PASS |
| `node --test tests/dev-runtime/AdminNotesBoundary.test.mjs` | PASS, 5/5 |
| Admin menu Playwright lane | PASS, 2/2 |
| Production header/route clean check | PASS |
| Public/UAT exposure audit | PASS |
| Dev-runtime admin import audit | PASS |
| `git diff --check` | PASS, line-ending warnings only |
| start_of_day protection check | PASS |

## Skipped Lanes

| Lane | Decision | Reason |
| --- | --- | --- |
| AdminNotesLocalViewer Playwright | SKIP | The route and viewer files were not touched. The Admin menu lane still clicks the Notes link and validates the existing viewer loads `index.txt`. |
| Full samples smoke | SKIP | No samples, game runtime, or shared sample loader files changed. |
| Full Playwright suite | SKIP | Targeted Admin menu and boundary lanes cover this local-only menu change. |

## Remaining Notes

- No CSS was added.
- No archived V1/V2 files were modified.
- No production/public route file was created for Admin Notes.
