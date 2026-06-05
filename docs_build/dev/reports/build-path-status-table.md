# Build Path Status Table

PR: PR_26155_089-build-path-status-table

## Summary
- Converted Build Path from accordion/card groups into a workflow-order table.
- The table columns are:
  - Order
  - Tool
  - Status
  - Complete
- Workflow rows render in explicit build order, not alphabetical order.

## Status Indicators
- 🟢 Complete
- 🟡 In Progress
- 🔴 Not Started
- ⚪ N/A

## Rules Applied
- Users work top-to-bottom and left-to-right.
- `Publish` is never allowed to render as `N/A`.
- `N/A` appears only for non-required tools in focused contributor views, such as a role-focused Audio Creator view.
- Project Workspace completion is derived from active project presence.

## Validation Notes
- `npm run test:lane:build-path` passed with 3 tests.
- Targeted checks verified table headers, row order, status text, completion values, contributor `N/A`, and `Publish` never rendering as `N/A`.
- Combined narrow coverage pass also passed with 11 tests across Build Path, Game Configuration, and Game Design.
- Manual test notes: open `toolbox/index.html?role=user&memberRole=Audio%20Creator`, click Build Path, confirm non-required rows can show `⚪ N/A` while Publish remains a required status row.
- Theme V2 gap findings: none; existing `table-wrapper` and `data-table` classes were sufficient.
