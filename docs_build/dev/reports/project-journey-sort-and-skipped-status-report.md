# Project Journey Sort And Skipped Status Report

Generated: 2026-06-06

Status: PASS

## Summary

- Added active Summary Table sort indicators using existing sortable headers, `aria-sort`, `primary` button state, and asc/desc arrows.
- Increased reusable `.btn.btn--compact` minimum width through Theme V2 button CSS.
- Added the Skipped status to Project Journey as `[-] ⏭️ Skipped` after Complete.
- Added Skipped counts to Project Journey Summary Table and Statistics while keeping Open limited to Not Started, Blocker, Decide, and In Progress.
- Added a Skipped navigation filter and seeded one system-created skipped Project Journey item.
- Added Admin Notes parser and legend support for `[-] ⏭️ Skipped`.

## Status Order

Project Journey and Admin Notes now use this status order where applicable:

- ⬜ Not Started
- ⛔ Blocker
- ❓ Decide
- 🟡 In Progress
- ✅ Complete
- ⏭️ Skipped

## Count Rules

- Open = Not Started + Blocker + Decide + In Progress.
- Total = all statuses, including Complete and Skipped.
- Skipped is intentionally excluded from Open and included in Total.

## Validation

- Project Journey runtime/UI lane: PASS.
- Admin Notes parser/UI lane: PASS.
- Admin DB Viewer relationship-count check: PASS.
- Changed-file/static validation: PASS.
- Full samples smoke: SKIP per instructions.

## Design System Note

- The compact button width change is reusable Theme V2 styling in `assets/theme-v2/css/buttons.css`.
- Sort indicators reuse existing button states and do not add page-local or tool-local CSS.
