# Toolbox Creator Grouping

Stack item: `PR_26155_025-toolbox-creator-grouping`

## Summary

- Reworked Toolbox groupings around creator goals:
  - Build
  - Media
  - Test
  - Share
  - Account
  - Admin
- Updated `toolbox/tools-page-accordions.js` rendering data to use the six groups.
- Updated `toolbox/toolRegistry.js` category metadata to match the six groups.
- Updated the shared Toolbox header menu to use the same creator-goal group labels.
- Preserved existing role simulation for `?role=guest`, `?role=user`, and `?role=admin`.

## Role Behavior

- Guest and Creator views show the public preview-safe tool groups: Build, Media, Test, Share, and Account.
- Admin view shows Build, Media, Test, Share, Account, and Admin.
- The Admin group remains hidden outside admin role view.
- Arcade remains outside Toolbox.

## Validation Notes

- Read `docs_build/dev/PROJECT_INSTRUCTIONS.md` before changes.
- Ran `node scripts/validate-active-tools-surface.mjs`: passed.
- Ran `node scripts/validate-tool-registry.mjs`: passed.
- Ran `npm run test:workspace-v2`: passed. This is the legacy command name for the Project Workspace validation lane.

## Manual Test Notes

- `/toolbox/index.html?role=guest` shows Build, Media, Test, Share, and Account groups.
- `/toolbox/index.html?role=user` keeps Admin hidden.
- `/toolbox/index.html?role=admin` shows the Admin group and planned/admin tiles.
- Banner switch links continue Guest -> Creator, Creator -> Admin, and Admin -> Creator.
