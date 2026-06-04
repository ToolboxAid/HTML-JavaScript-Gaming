# Project Workspace Mock Repository

Stack item: PR_26155_045-project-workspace-mock-repository

## Summary
- Added `toolbox/project-workspace/project-workspace-mock-repository.js`.
- Implemented an in-memory, SQL-shaped mock repository for Project Workspace only.
- No real database, auth, cloud, or persistence was added.

## Tables
- `users`: `id`, `displayName`, `email`, `role`.
- `projects`: `id`, `ownerUserId`, `name`, `status`.
- `project_members`: `projectId`, `userId`, `permission`.

## Seed Records
- `Admin User`
- `Creator User`
- `Guest Preview User`
- `Demo Project`, owned by `Creator User`

## Actions
- `resetProjectData()` resets users, projects, memberships, and the open project to the seeded demo state.
- `seedDemoProject()` restores the demo project and its memberships without creating duplicate seed rows.
- `clearTestData()` keeps seed users and removes mock projects and memberships.

## Notes
- The repository supports single-user Project Workspace behavior through `creator-user` while keeping the multi-user-ready `project_members` table shape.
- Project progress is derived from the active mock project state.
