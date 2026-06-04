# Project Purpose Model

Stacked PR:
- PR_26155_061-project-purpose-model

## Summary

Added Project Purpose to the Project Workspace mock SQL-shaped contract.

Supported purposes:
- Game Project
- Capability Demo
- Learning Project
- Template Project

Contract change:
- `projects` now includes `purpose`.
- Existing Demo Project uses `purpose: "Game Project"`.
- New projects default to `Game Project` unless the UI or caller supplies another supported purpose.

Project Purpose describes what the project is. It does not add real database, auth, cloud, or persistence behavior.

## Validation

Covered by `npm run test:lane:project-workspace`.

The targeted lane verifies:
- Project Purpose appears in Project Workspace.
- Purpose options include all supported values.
- Created projects can use `Capability Demo`.
- Existing create/open/delete behavior remains intact.
