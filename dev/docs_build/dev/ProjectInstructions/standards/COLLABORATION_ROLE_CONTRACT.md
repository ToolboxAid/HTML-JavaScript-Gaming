# Collaboration Role Contract

## Purpose

Collaboration Role records describe granted project-scoped access for users, Creator Profiles, or Organizations.

## Rules

- Every Collaboration Role requires `ownerId` and `projectId`.
- Subject type must be `user`, `creatorProfile`, or `organization`.
- Role must be `owner`, `admin`, `collaborator`, or `viewer`.
- Permissions must use approved identity permissions.
- Visibility must be `private`, `shared`, `project`, or `team`.
- Collaboration Role records do not contain auth session state, runtime state, toolState, or payment state.

## Validation

- Contract: `src/shared/contracts/collaborationRoleContract.js`
- Test: `tests/shared/CollaborationRoleContract.test.mjs`
- Fixture: `tests/fixtures/collaboration-roles/collaboration-role-scenarios.json`

