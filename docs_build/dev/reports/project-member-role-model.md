# Project Member Role Model

Stacked PR:
- PR_26155_062-project-member-role-model

## Summary

Added Project Member Role to the Project Workspace mock SQL-shaped contract.

Supported member roles:
- Owner
- Designer
- World Builder
- Artist
- Audio Creator
- Translator
- Tester
- Publisher
- Viewer

Contract change:
- `project_members` now includes `role`.
- Existing `permission` is preserved for compatibility.
- New project owner membership writes both `permission: "Owner"` and `role: "Owner"`.

Model notes:
- Project Member Role describes what the user can work on.
- Owner is documented as full access for the wireframe model.
- Role-based tool visibility is Toolbox filtering only, not security enforcement.

## Validation

Covered by `npm run test:lane:project-workspace`.

The targeted lane verifies:
- Current User Role appears in Project Workspace.
- Role options include all supported values.
- Demo Project shows Creator User as Owner.
- Changing Current User Role updates the active Project Workspace display and member table.
