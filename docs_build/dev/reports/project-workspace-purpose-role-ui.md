# Project Workspace Purpose Role UI

Stacked PR:
- PR_26155_063-project-workspace-purpose-role-ui

## Summary

Updated Project Workspace to expose the new mock/wireframe fields:
- Project Purpose
- Current User Role

UI changes:
- Added a Project Purpose select in Project Setup.
- Added a Current User Role select in Project Setup.
- Added Project Purpose and Current User Role to the active project summary.
- Updated Project Members table to show Role and Permission.
- Updated open project list metadata to include purpose.

Behavior boundaries:
- Single-user behavior remains first.
- Creator User is Owner of Demo Project.
- Guest Preview User is Viewer in seeded memberships.
- No real DB/auth/cloud/persistence was added.
- No CSS was added.

## Validation

Covered by `npm run test:lane:project-workspace`.

Manual notes:
- Project Purpose and Current User Role are editable wireframe/mock fields.
- Editing these fields updates the in-memory mock repository only.
- Create/open/delete behavior still works.
