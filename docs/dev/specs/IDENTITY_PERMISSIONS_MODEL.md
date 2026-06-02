# Identity Permissions Model

## Status

This is a planning document for GameFoundryStudio identity, roles, permissions, visibility, and security boundaries.

It stays focused on ownership and security. It does not define storage schema, database tables, API routes, authentication implementation, authorization middleware, page behavior, or runtime behavior.

This document does not authorize runtime changes, database implementation, authentication implementation, page changes, CSS changes, JavaScript changes, or schema migrations.

## Core Rules

- No database object can be created without an owner.
- No shareable object can exist without visibility.
- No editable object can exist without permissions.
- Owner has full control unless restricted by platform policy.
- Admin can administer platform-level records.
- Moderator can moderate community/public records.
- Contributor can edit only granted scopes.
- Reviewer can review/approve only granted scopes.
- Guest can view only public content.
- Permissions must be evaluated against the object and scope, not only against the current route or UI surface.
- Visibility must be explicit and must not be inferred from missing data.
- Platform policy can restrict any role when required for safety, legal, moderation, abuse prevention, or operational integrity.

## Identity

Identity is the security foundation that connects a person or platform actor to platform-owned and user-owned records.

Identity components:
- User
- Profile
- External identity provider
- Account status

### User

Purpose:
- User is the primary platform account record.
- User owns identity-linked data and may own projects, assets, comments, ratings, marketplace items, and other records.

Security notes:
- Every User must have a stable internal id.
- User identity data is private by default.
- User-owned data must not become public unless a shareable object with explicit visibility exposes it.
- User records are not portable manifests.

### Profile

Purpose:
- Profile is the user-facing identity surface.
- Profile may expose display name, creator identity, avatar, public biography, links, badges, and public activity summaries.

Security notes:
- Profile visibility must be explicit.
- Profile data should not expose private User, credential, provider, or account-status data.
- Moderator or Admin actions may restrict a public Profile under platform policy.

### External Identity Provider

Purpose:
- External identity provider links a User to an authentication source such as OAuth, SSO, email provider, or future identity service.

Security notes:
- Provider identifiers and credentials are private.
- Provider tokens, secrets, and verification internals are never portable export data.
- External identity provider records are platform-controlled even when attached to a User.

### Account Status

Purpose:
- Account status describes whether a User can access, create, share, publish, or administer platform records.

Planned statuses:
- Active
- Pending
- Suspended
- Disabled
- Deleted

Security notes:
- Account status may restrict otherwise granted permissions.
- Suspended, disabled, or deleted accounts must not silently retain active publishing, marketplace, moderation, or admin capabilities.
- Account status changes should be auditable in a later implementation.

## Roles

| Role | Purpose | Boundary |
| --- | --- | --- |
| Owner | Accountable owner of an object, project, release, asset, or listing. | Full control unless restricted by platform policy. |
| Admin | Platform-level administrator. | Can administer platform-level records and operational settings. |
| Moderator | Community/public policy moderator. | Can moderate community, public, marketplace, rating, comment, and report surfaces. |
| Creator | User creating projects, assets, manifests, releases, or marketplace content. | Can create and manage owned creator content. |
| Contributor | Granted participant in a project or object scope. | Can edit only granted scopes. |
| Reviewer | Granted review/approval participant. | Can review or approve only granted scopes. |
| Player | User consuming playable or public game content. | Can view/play allowed content and may create allowed feedback. |
| Guest | Unauthenticated or minimally identified visitor. | Can view only public content. |

## Permissions

| Permission | Meaning | Typical Roles |
| --- | --- | --- |
| View | Read an object or surface. | Owner, Admin, Moderator, Creator, Contributor, Reviewer, Player, Guest when public. |
| Create | Create a new object in an allowed scope. | Owner, Admin, Creator, Contributor when granted. |
| Edit | Modify an existing editable object. | Owner, Admin, Creator, Contributor when granted. |
| Delete | Delete, archive, retire, or remove an object. | Owner, Admin, Moderator for moderated content when policy allows. |
| Share | Change sharing or invite access. | Owner, Admin, Creator when granted. |
| Publish | Produce a release or public/marketplace-facing output. | Owner, Admin, Creator, Contributor when explicitly granted. |
| Review | Inspect content for approval, quality, localization, safety, or publishing readiness. | Reviewer, Moderator, Admin, Owner when policy allows. |
| Approve | Mark reviewed content as approved for a workflow. | Reviewer, Moderator, Admin, Owner when policy allows. |
| Moderate | Hide, restrict, restore, lock, flag, or enforce policy on community/public content. | Moderator, Admin. |
| Administer | Manage platform-level records, settings, policies, and operational surfaces. | Admin. |

## Permission Rules

- Permissions are granted by role, ownership, object policy, project membership, platform policy, or explicit workflow assignment.
- Permissions must be scoped to an object, project, team, marketplace item, release, community surface, or platform area.
- Contributor permissions do not imply Publish, Review, Approve, Moderate, or Administer.
- Reviewer permissions do not imply Edit, Publish, Moderate, or Administer outside the granted review scope.
- Moderator permissions do not imply ownership of moderated content.
- Admin permissions do not make Admin the owner of user-owned or project-owned data.
- Player permissions do not imply creator permissions.
- Guest permissions are limited to View on public content.
- Delete should be distinguished from archive, retire, hide, or moderation removal in later implementation work.

## Visibility

| Visibility | Meaning | Security Boundary |
| --- | --- | --- |
| Private | Visible only to owner and explicitly authorized services or participants. | Default for user-owned and project-owned working data. |
| Shared | Visible to explicitly invited users or granted principals. | Direct share boundary. |
| Project | Visible to project participants according to project roles. | Project membership boundary. |
| Team | Visible to a defined team or organization group. | Team membership boundary. |
| Unlisted | Accessible by explicit link or association but not discoverable. | Link/access boundary. |
| Public | Visible and discoverable to public users. | Public web boundary. |
| Marketplace | Visible in marketplace discovery or listing surfaces. | Marketplace and moderation boundary. |
| Admin only | Visible only to Admin or authorized platform service roles. | Platform operation boundary. |

## Visibility Rules

- Every shareable object must have one explicit visibility value.
- Visibility cannot be null, missing, or inferred.
- Public visibility does not automatically grant Edit, Delete, Publish, Review, Approve, Moderate, or Administer.
- Marketplace visibility requires marketplace policy and moderation readiness.
- Admin only data must not leak through public, project, marketplace, export, or manifest payloads.
- Moderation visibility can override public or marketplace discoverability under platform policy.

## Security Boundaries

### User-Owned Data

Definition:
- Records owned directly by a User, such as Profile data, personal settings, user-created comments, ratings, and user-owned assets.

Rules:
- User-owned data requires a User owner.
- Export may include safe user-facing fields when policy allows.
- Private identity, credential, provider, and account-status internals must not be exposed through portable manifests.

### Project-Owned Data

Definition:
- Records owned through a Project, such as Tool States, Assets, Palettes, Game Manifest records, Releases, and project-linked Marketplace Items.

Rules:
- Project-owned data requires a Project owner and project permission policy.
- Project visibility controls project-level access.
- Child objects may need separate visibility when shared outside the project.

### Public Data

Definition:
- Records visible to unauthenticated users or all authenticated users, such as public profiles, public releases, public comments, public community content, or public project surfaces.

Rules:
- Public data still has an owner.
- Public data still has permissions.
- Public data may be moderated, hidden, or retired under platform policy.

### Marketplace Data

Definition:
- Records exposed through marketplace listing, discovery, asset, game, template, bundle, or creator surfaces.

Rules:
- Marketplace data requires owner, visibility, permissions, listing policy, and moderation readiness.
- Marketplace data may reference project-owned or user-owned source records without transferring ownership.
- Marketplace transaction or operational data is not portable manifest data.

### Admin-Only Data

Definition:
- Platform operational records, policy records, security records, system settings, audit records, and protected moderation/admin surfaces.

Rules:
- Admin-only data is platform-controlled.
- Admin-only data may be visible to Admin and authorized Service roles.
- Admin-only data must not appear in user exports, manifests, marketplace payloads, or public data.

### Moderation Data

Definition:
- Reports, enforcement decisions, hidden states, review notes, policy flags, moderation queues, and moderation audit history.

Rules:
- Moderation data is platform-controlled or moderator-scoped.
- Moderation state may affect public or marketplace visibility.
- Moderation internals are not portable export/import data.
- Moderation actions should be auditable in a future implementation.

## Next Sequence

Platform implementation should proceed in this order:

```text
Users/Identity
-> Roles/Permissions
-> Visibility
-> Projects
-> Storage
-> Tool State persistence
```

Sequence rules:
- Users/Identity must exist before durable ownership.
- Roles/Permissions must exist before editable shared objects.
- Visibility must exist before shareable objects.
- Projects must exist before project-owned tool state, assets, palettes, manifests, releases, or marketplace content.
- Storage must exist before Tool State persistence.
- Tool State persistence must not arrive before ownership, permissions, visibility, and project boundaries are defined.

## Non-Goals

This document does not:
- define database storage
- define SQL schema
- define API routes
- implement authentication
- implement authorization checks
- implement storage
- implement Tool State persistence
- implement Admin pages
- implement Account pages
- change runtime behavior
- change CSS, HTML, JavaScript, TypeScript, or JSON files
