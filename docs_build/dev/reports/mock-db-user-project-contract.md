# PR_26155_041 Mock DB User Project Contract

## Purpose

Define the mock SQL-shaped user/project ownership contract needed before the Project Workspace rebuild starts.

This PR is contract-only. It does not implement a real database, auth, cloud sync, persistence, save/load, or Project Workspace runtime behavior.

## Mock SQL-Shaped Tables

### `users`

| column | type | notes |
| --- | --- | --- |
| `id` | text primary key | Stable mock user id. |
| `displayName` | text | User-facing name. |
| `email` | text | Mock email address. |
| `role` | text | Guest, Creator, or Admin. |

### `projects`

| column | type | notes |
| --- | --- | --- |
| `id` | text primary key | Stable mock project id. |
| `ownerUserId` | text foreign key to `users.id` | Owner for single-user implementation and future multi-user support. |
| `name` | text | Project name. |
| `status` | text | Wireframe project status. |

### `project_members`

| column | type | notes |
| --- | --- | --- |
| `projectId` | text foreign key to `projects.id` | Project membership link. |
| `userId` | text foreign key to `users.id` | User membership link. |
| `permission` | text | Owner, Editor, Viewer, or Admin. |

## Permissions

Allowed mock permissions:
- Owner
- Editor
- Viewer
- Admin

## Seed Records

### Users

| id | displayName | email | role |
| --- | --- | --- | --- |
| `admin-user` | Admin User | `admin@example.test` | Admin |
| `creator-user` | Creator User | `creator@example.test` | Creator |
| `guest-preview-user` | Guest Preview User | `guest@example.test` | Guest |

### Projects

| id | ownerUserId | name | status |
| --- | --- | --- | --- |
| `demo-project` | `creator-user` | Demo Project | Wireframe |

### Project Members

| projectId | userId | permission |
| --- | --- | --- |
| `demo-project` | `creator-user` | Owner |
| `demo-project` | `admin-user` | Admin |
| `demo-project` | `guest-preview-user` | Viewer |

## Mock Data Actions

Wireframe/dev-mode actions:
- Reset Project Data
- Seed Demo Project
- Clear Test Data

These actions are declared for upcoming Project Workspace rebuild planning only. They must not perform destructive behavior until a later implementation PR explicitly scopes the mock repository behavior.

## Implementation Guidance

Design for multi-user ownership now, but implement single-user behavior first in a later Project Workspace implementation PR.

The first implementation PR should use a mock SQL-shaped repository interface so the data shape can later map cleanly to a real SQL database.

## Validation Notes

Impacted lane: `workspace-contract` through `npm run test:workspace-v2`.

Skipped lanes:
- runtime
- integration
- engine
- samples
- recovery/UAT

Skipped-lane rationale: this bundle adds a docs contract and inert Toolbox header controls only. It does not change engine runtime, parsers, real DB behavior, samples, or cross-tool integrations.

Full suite is required when shared runtime, shared parser, shared DB, shared Theme V2, or cross-tool integration behavior changes.

Theme V2 gap findings: none.
