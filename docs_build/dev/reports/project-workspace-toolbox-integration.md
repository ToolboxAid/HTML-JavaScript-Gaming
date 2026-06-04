# Project Workspace Toolbox Integration

Stack item: PR_26155_048-project-workspace-toolbox-integration

## Summary
- Updated `toolbox/tools-page-accordions.js` to import the Project Workspace mock repository.
- Updated `toolbox/index.html` to load `tools-page-accordions.js` as a module and show a mock Project Data status line.
- Connected mock state into the existing Toolbox Progress and Build Path views where the current renderer allows.

## Role Simulation
- Guest and Creator views keep Project Data controls hidden.
- Admin view shows Project Data controls.
- Role switching remains URL-param based: `?role=guest`, `?role=user`, `?role=admin`.

## Project Data Controls
- Reset Project Data resets the mock repository to the seeded demo project.
- Seed Demo Project restores the seeded demo project.
- Clear Test Data removes mock projects and memberships while keeping seed users.
- Controls are dev-mode/mock-only and do not persist or perform destructive real-world actions.

## Toolbox Views
- Progress view now shows the active mock project name and project-derived progress copy.
- Build Path view now includes the active mock project in the Project Workspace path note.
- No unrelated Toolbox renderer rewrite was performed.
