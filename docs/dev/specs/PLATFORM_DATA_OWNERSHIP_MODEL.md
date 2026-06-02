# Platform Data Ownership Model

## Status

This is a planning document for GameFoundryStudio platform data ownership.

It defines intended ownership, visibility, permissions, versioning, and exportability rules before database, authentication, Admin, Account, publishing, community, or marketplace implementation begins.

This document does not authorize runtime changes, database implementation, authentication implementation, page changes, CSS changes, JavaScript changes, or schema migrations.

## Core Rules

- Database = working system.
- Manifest/JSON = portable export/import format.
- Every database object must have ownership.
- Every shareable object must have visibility.
- Every editable object must have permissions.
- Ownership must be explicit, queryable, and auditable.
- Visibility must never be inferred from missing data.
- Permissions must be checked against the editable object, not only against the current page or route.
- Portable export/import must not depend on hidden database state.
- Manifest/JSON export must preserve enough identity-free references to re-import into another project or account when allowed.

## Ownership Terms

User-owned:
- The object belongs directly to a user.
- The owner can manage the object unless a policy, moderation state, or platform rule restricts it.

Project-owned:
- The object belongs to a project.
- Project permissions determine who can read, edit, duplicate, export, or publish it.

Platform-owned:
- The object is controlled by the platform for security, integrity, moderation, or operational reasons.
- User export may expose safe user-facing data, but not protected operational internals.

Derived-owned:
- The object is generated from, attached to, or versioned from another owned object.
- It inherits ownership and permissions from its parent unless explicitly promoted to its own record.

## Visibility Terms

Private:
- Visible only to the owner and explicitly authorized collaborators or services.

Project:
- Visible to project members according to project permissions.

Unlisted:
- Accessible by direct link or explicit association, but not discoverable in public browsing.

Public:
- Discoverable and visible to all users.

Marketplace:
- Public or moderated discovery surface for assets, templates, games, tools, listings, or bundles.

Moderated:
- Visibility is constrained by moderation state, policy, or review status.

## Permission Terms

Owner:
- Full user-level control over owned content, subject to platform policy.

Collaborator:
- Project-scoped or object-scoped access granted by the owner or authorized role.

Role:
- A named capability set such as viewer, editor, publisher, moderator, or admin.

Service:
- Platform service access for validation, indexing, publishing, import/export, search, or moderation.

Admin:
- Operational access for platform administration.

Moderator:
- Limited review and enforcement access for community, marketplace, ratings, comments, and public content.

## Object Model

| Object | Ownership | Visibility | Permissions | Versioning | Exportability |
| --- | --- | --- | --- | --- | --- |
| User | User-owned root account record. | Private by default; limited public presence only through Profile. | User can manage allowed account fields; Admin/Service access only for operations and policy. | Audit history for security-sensitive changes; not a content version stream. | Exportable only through user data export; never as a portable project manifest. |
| Identity | User-owned but platform-controlled authentication identity. | Private. | User can manage allowed identity links; Service owns authentication verification; Admin access is restricted and audited. | Security audit trail required; old credentials or provider tokens are not portable versions. | Not portable as Manifest/JSON; safe identity metadata may appear in account data export. |
| Profile | User-owned public or semi-public profile surface. | Private, unlisted, or public. | User can edit profile fields; Moderator/Admin may restrict public visibility. | Profile revisions should be tracked for moderation and restore. | Exportable as profile JSON without protected identity or credential data. |
| Project | User-owned or organization-owned project workspace. | Private, project, unlisted, or public. | Owner controls project membership; collaborators act through project roles. | Project versions should track major state snapshots and publish history. | Exportable as a project package containing portable manifests, JSON, and allowed assets. |
| Tool State | Project-owned working state for a specific tool. | Inherits project visibility unless explicitly shared. | Editable by project owner or collaborators with tool edit permission. | Versioned as saved tool state revisions; active state must be explicit. | Exportable as toolState JSON when allowed by project permissions. |
| Vector Asset | Project-owned or user-owned asset record. | Private, project, unlisted, public, or marketplace. | Editable by owner/project editors; publish/list permissions require asset publish role. | Versioned for edits, generated variants, and publish snapshots. | Exportable as vector JSON/SVG or project package asset reference. |
| Palette | Project-owned, user-owned, or asset-linked color data. | Private, project, unlisted, public, or marketplace. | Editable by owner/project editors; reusable public palettes require visibility permission. | Versioned for palette edits and reuse history. | Exportable as palette JSON and includable in project/manifest exports. |
| Asset | Project-owned, user-owned, or marketplace-owned content asset. | Private, project, unlisted, public, marketplace, or moderated. | Editable by owner/project editors; listing and reuse depend on visibility and rights. | Versioned for source edits, derived assets, and published snapshots. | Exportable as allowed file/path assets, metadata JSON, or project package entries. |
| Game Manifest | Project-owned game definition record. | Private, project, unlisted, public, or published release-linked. | Editable by project editors; publish requires release/publish permission. | Versioned as manifest revisions with validation status. | Manifest is the canonical portable export/import format for game configuration. |
| Release | Project-owned published output derived from a project and manifest. | Unlisted, public, marketplace, or moderated. | Created by users with publish permission; Admin/Moderator may restrict release visibility. | Immutable release versions preferred; superseding releases create new versions. | Exportable as release metadata plus portable manifest/package when rights allow. |
| Rating | User-owned feedback attached to a release, asset, marketplace item, or community object. | Public or moderated when attached to public content; private only during review workflows. | User can create/edit within policy limits; Moderator/Admin can hide or remove. | Edit history should be tracked for abuse review; aggregate scores are derived-owned. | Exportable in user data export and public aggregate exports where policy allows. |
| Comment | User-owned community text attached to a release, asset, project, marketplace item, or community object. | Public, unlisted, project, or moderated according to parent object. | Author can edit/delete within policy limits; Moderator/Admin can hide, lock, or remove. | Edit and moderation history should be retained. | Exportable by author and parent content export when policy allows; moderation data is not portable. |
| Community Content | User-owned or project-owned shared content such as posts, tutorials, guides, showcases, or discussions. | Private draft, unlisted, public, or moderated. | Author/project editors can edit; Moderator/Admin manage policy enforcement. | Versioned for drafts, edits, published state, and moderation history. | Exportable as content JSON/Markdown plus allowed asset references. |
| Marketplace Item | Owner-owned listing for an asset, template, release, game, bundle, or service. | Marketplace, unlisted, public, or moderated. | Owner/project publisher can manage listing; Moderator/Admin can review or restrict. | Versioned for listing revisions, price/licensing changes, and publish state. | Exportable as listing metadata JSON plus allowed item references; transaction internals are not portable. |
| Translation | Project-owned, community-owned, or release-linked localization content. | Private, project, public, marketplace, or moderated according to parent object. | Translators/editors can propose or edit; owner/reviewer approves; Moderator/Admin can restrict public content. | Versioned by locale, string set, review status, and approved revision. | Exportable as localization JSON, language pack data, or manifest-linked translation bundle. |

## Required Object Fields

Every database object should define:
- stable object id
- object type
- ownership owner type
- ownership owner id
- creation timestamp
- update timestamp
- visibility when shareable
- permission policy or role source when editable
- version or revision marker when versioned
- export policy when portable or exportable

Shareable objects should also define:
- visibility state
- discoverability state
- moderation state when public or marketplace-facing
- parent object id when visibility is inherited

Editable objects should also define:
- edit roles
- publish roles when publication is possible
- transfer rules when ownership can change
- delete/archive rules
- service access rules

Exportable objects should also define:
- export format
- import target
- dependency list
- rights or license requirements
- redaction rules for non-portable fields

## Inheritance Rules

Project-owned child objects:
- Tool State, Vector Asset, Palette, Asset, Game Manifest, Release, and Translation records may inherit ownership from Project.
- Inherited permissions must still be explicit through a project role or object policy.

Parent-linked public objects:
- Rating, Comment, Community Content, Marketplace Item, and Translation visibility may depend on parent content state.
- Parent visibility must not silently expose a child object unless the child object is shareable and policy allows it.

Derived records:
- Release records are derived from Project, Game Manifest, and Asset records.
- Marketplace Item records may derive from Asset, Game Manifest, Release, or Community Content records.
- Aggregate rating summaries are derived from Rating records and should not replace source rating ownership.

## Manifest And JSON Portability

Manifest/JSON export should:
- include portable content fields
- include stable local references where possible
- include dependency metadata needed for import
- exclude protected identities, credentials, internal permissions, moderation internals, and database-only audit fields
- make missing dependencies visible during import validation

Manifest/JSON import should:
- create new database ownership under the importing user or project
- validate object type and version
- reject invalid payloads before partial render or partial persistence
- preserve portable relationships without assuming original database ids

## Non-Goals

This document does not:
- define SQL schema
- define API routes
- implement database persistence
- implement authentication
- implement authorization checks
- implement Admin pages
- implement Account pages
- change runtime behavior
- change CSS, HTML, JavaScript, TypeScript, or JSON files
