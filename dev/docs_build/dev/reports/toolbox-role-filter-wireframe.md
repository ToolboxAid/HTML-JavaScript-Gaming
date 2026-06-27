# Toolbox Role Filter Wireframe

PR bundle:
- `PR_26155_019-admin-creator-view-banner`
- `PR_26155_020-deep-tool-name-cleanup`
- `PR_26155_021-toolbox-role-filter-wireframe`

## Summary

Added wireframe-only role filtering to the current transitional Toolbox renderer.

## Behavior

Creator view:
- Default view.
- Also selected by `?role=user`.
- Hides hidden capability tools.
- Hides admin-only planned tools.

Admin view:
- Selected by `?role=admin`.
- Shows creator tools.
- Shows hidden capability tools.
- Shows admin-only planned tools.

No login, auth, database, persistence, save, load, or real runtime behavior was added.

## Current Architecture

- `toolbox/index.html` remains transitional.
- `toolbox/tools-page-accordions.js` still owns current Toolbox rendering, view modes, and the temporary role filter.
- This PR does not replace the renderer with a registry-driven runtime.

## Validation Notes

Passed:
- `npm run test:workspace-v2` (legacy command name; user-facing naming remains Project Workspace).
- Targeted browser sweep for 30 affected routes:
  - Toolbox index default/admin/user views.
  - Renamed Toolbox routes.
  - New planned/admin shell routes.
- Verified no console errors.
- Verified no failed requests.
- Verified creator view hides admin-only and hidden capability cards.
- Verified admin view shows admin-only and hidden capability cards.
- Verified Order, Group, Progress, and Build Path controls remain visible.
- Verified copied/generated shells preserve header, footer, ToolDisplayMode host, tool workspace, left/right columns, and center panel.
- Verified no inline script/style/event handlers in checked tool shells.

Manual test notes:
- Open `/toolbox/index.html`.
- Confirm creator banner and creator-facing cards.
- Open `/toolbox/index.html?role=admin`.
- Confirm Users, Environments, Game Migration, Platform Settings, Cloud, and Custom Extensions appear.
- Open `/toolbox/index.html?role=user`.
- Confirm admin-only and hidden capability cards are hidden again.

Theme V2 gap findings:
- None. Existing Theme V2 classes supported the wireframe.
