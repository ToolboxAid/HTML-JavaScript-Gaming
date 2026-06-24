# PR_26174_ALFA_021-idea-board-status-filter-table-polish

## Summary

Polished the Idea Board status filter and parent table display while preserving the existing table-first notes model.

## Changes

- Applied the Idea Board theme treatment to the status filter checkbox group.
- Removed the Updated column from the Idea Board parent table and adjusted expanded-row colspans.
- Updated the Idea column label styling so long ideas can wrap.
- Removed Project and Archived from editable Status dropdowns while leaving them available in the filter.
- Updated impacted Playwright expectations for the new table columns, wrapping behavior, filter theme, and editable status options.

## Notes

- No API/service contract changes were made.
- No browser-owned product data or fallback arrays were added.
- Notes child rows and inline edit Save/Cancel behavior remain intact.
