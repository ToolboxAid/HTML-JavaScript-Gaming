# PR_26155_035 Toolbox Status System

## Summary

Added the Toolbox status model:
- Ready
- Wireframe
- Under Construction
- Planned
- Hidden
- Deprecated

The active Toolbox renderer keeps the existing wireframe data source and normalizes older static labels into the new status vocabulary at render time.

## Implementation Notes

- Added `toolboxStatusModel` in `toolbox/tools-page-accordions.js`.
- Added `TOOLBOX_STATUS_MODEL` in `toolbox/toolRegistry.js`.
- Updated progress view rendering to show the new status labels on existing tool tiles.
- Preserved role filtering:
  - Guest and creator views hide planned/hidden tools.
  - Admin view shows hidden planned tools with Hidden status.
- No DB, auth, persistence, save/load, or Project Workspace rebuild behavior was added.

## Manual Test Notes

- Progress view shows Ready, Wireframe, Under Construction, and Planned statuses in guest view where applicable.
- Admin view shows Hidden status for planned hidden tools.
- Deprecated is part of the declared model but no active Toolbox tool is currently marked Deprecated.
- Toolbox still renders without console errors.

## Validation Notes

- `node scripts/validate-active-tools-surface.mjs` passed.
- `node scripts/validate-tool-registry.mjs` passed.
- `npm run test:workspace-v2` passed: 3 Playwright tests.
- `git diff --check` passed.

## Theme V2 Gap Findings

None. No CSS was added or modified.
