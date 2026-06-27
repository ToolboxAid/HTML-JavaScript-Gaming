# PR_26174_ALFA_022-idea-board-status-dropdown-fix

## Summary

Split Idea Board status choices into explicit editable and filter option lists.

## Changes

- Added `editableStatusOptions` with New, Exploring, Refining, and Ready.
- Added `filterStatusOptions` with New, Exploring, Refining, Ready, Project, and Archived.
- Updated editable status dropdown rendering to use only editable statuses.
- Updated status filter rendering and Select All behavior to use filter statuses.
- Updated targeted Playwright coverage for filter options and editable dropdown options.

## Notes

- No unrelated cleanup was performed.
- Project and Archived remain available for filtering but do not appear in editable Status dropdowns.
