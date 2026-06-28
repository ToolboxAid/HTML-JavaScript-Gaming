# Post-Migration Platform Roadmap

## Status

The public/root migration lane is considered complete for current planning purposes.

This roadmap is a planning document only. It does not authorize runtime changes, page changes, CSS changes, database implementation, authentication implementation, Admin implementation, Account implementation, or sample migration.

## Direction

GameFoundryStudio now needs to move from static public/root migration recovery into platform capability planning. The next work should prioritize durable platform foundations before deeper creator, publishing, marketplace, and config-driven game features.

## Phase 1 - Users, Authentication, Profiles

Purpose:
- Establish the user identity foundation for the platform.

Planned scope:
- Users
- Authentication
- Profiles

Notes:
- This phase should define user records, sign-in/out behavior, profile ownership, and public/private profile boundaries before role or project work begins.

## Phase 2 - Roles, Permissions, Visibility

Purpose:
- Define who can see, edit, publish, moderate, and administer platform resources.

Planned scope:
- Roles
- Permissions
- Visibility

Notes:
- Visibility rules should be documented before they are attached to projects, assets, manifests, publishing, community, or marketplace surfaces.

## Phase 3 - Projects

Purpose:
- Introduce project-level ownership and organization.

Planned scope:
- Project records
- Project metadata
- Project ownership
- Project visibility
- Project-to-tool relationships

Notes:
- Projects should become the organizing layer between users and creator tool outputs.

## Phase 4 - Tool State Persistence

Purpose:
- Persist creator tool work in the platform database while keeping export/import portable.

Planned scope:
- Vector Studio
- Palette Manager
- Asset tools

Notes:
- Tool state persistence should preserve the existing toolState terminology.
- Persistence should not imply hidden fallback state.
- Saved state should be owned by a project and user once those foundations exist.

## Phase 5 - Asset Database

Purpose:
- Store reusable assets as first-class platform records.

Planned scope:
- Asset records
- Asset metadata
- Asset ownership
- Asset visibility
- Asset usage relationships

Notes:
- Asset database work should build on users, roles, projects, and tool state persistence rather than bypassing them.

## Phase 6 - Manifest Database

Purpose:
- Store working game manifests as database-backed platform records.

Planned scope:
- Manifest records
- Manifest versions
- Manifest ownership
- Manifest validation status
- Manifest export/import readiness

Notes:
- Manifest database work should support the existing manifest contract instead of replacing portable manifests.

## Phase 7 - Publishing

Purpose:
- Turn validated projects and manifests into release-ready game outputs.

Planned scope:
- Publishing workflow
- Release records
- Release visibility
- Publish validation
- Creator-facing release status

Notes:
- Publishing should depend on manifest validation, asset readiness, ownership, and visibility.

## Phase 8 - Community

Purpose:
- Add community surfaces after identity, visibility, projects, assets, manifests, and publishing are established.

Planned scope:
- Creator discovery
- Community profiles
- Sharing surfaces
- Feedback and moderation planning

Notes:
- Community work should respect roles, permissions, and visibility rules from earlier phases.

## Phase 9 - Marketplace

Purpose:
- Enable discoverable asset, template, game, and creator resources.

Planned scope:
- Marketplace listings
- Listing ownership
- Listing visibility
- Listing metadata
- Marketplace moderation planning

Notes:
- Marketplace should build on assets, manifests, publishing, community, and permissions rather than becoming a separate data model.

## Phase 10 - Config-Driven Games

Purpose:
- Advance the zero-code direction where game behavior is driven by configuration, manifests, and reusable systems.

Planned scope:
- Config-driven game records
- Runtime-ready manifest relationships
- Game configuration validation
- Project-to-game publishing paths

Notes:
- Config-driven game work should keep manifest validation, portable exports, and database-backed working state aligned.

## Database Direction

Approved planning direction:
- Node.js
- TypeScript
- PostgreSQL

Notes:
- Node.js and TypeScript should own application/server implementation direction.
- PostgreSQL should own relational platform data persistence direction.
- Database implementation is deferred until an explicit implementation PR.

## Manifest Direction

Planning rule:
- Database = working system
- Manifest = portable export/import format

Meaning:
- The platform database should store working records, ownership, visibility, versioning, status, and relationships.
- Manifests should remain portable artifacts for export, import, validation, sharing, and runtime handoff.
- The database should not make manifests obsolete.
- Manifest export/import should remain a deliberate capability, not an accidental copy of hidden database state.

## Deferred

Deferred lanes:
- Samples migration
- Admin implementation
- Account implementation

Notes:
- Samples migration remains deferred until a dedicated sample-alignment scope is named.
- Admin implementation remains deferred until database, authentication, roles, permissions, and visibility foundations are planned or implemented.
- Account implementation remains deferred until users, authentication, and profiles are in scope.

## Non-Goals For This Document

This document does not:
- implement database code
- implement login or authentication
- implement Admin pages
- implement Account pages
- migrate Samples
- change runtime behavior
- change page behavior
- change CSS or Theme V2 CSS
- change existing manifests or toolState payloads
