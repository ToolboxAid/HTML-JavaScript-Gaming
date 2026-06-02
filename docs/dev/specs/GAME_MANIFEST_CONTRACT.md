# Game Manifest Contract

## Status

This is a contract planning document for GameFoundryStudio Game Manifest behavior.

It defines required Game Manifest contract rules before database, authentication, UI, runtime, publishing, marketplace, or storage implementation begins.

This document does not authorize runtime changes, database implementation, authentication implementation, page changes, CSS changes, HTML changes, JavaScript changes, or schema migrations.

## Manifest Fields

Game Manifest records define:

- `manifestId`
- `ownerId`
- `projectId`
- `projectType`
- `sourceToolStates`
- `sourceAssets`
- `visibility`
- `version`
- `status`
- `exportFormat`

## Required Rules

- Game Manifest requires owner.
- Game Manifest requires project.
- Game Manifest requires `projectType = game`.
- Game Manifest may reference tool states.
- Game Manifest may reference assets.
- Game Manifest is a portable export/import format.
- Database remains the working system.
- Manifest is not the database source of truth.
- Manifest cannot bypass ownership, visibility, or permissions.
- Archived manifest is immutable unless policy allows edits.

## Source References

Source tool state references must identify:

- `toolStateId`
- `toolType`
- optional positive `version`

Source asset references must identify:

- `assetId`
- approved `assetType`
- optional positive `version`

Approved source asset types:

- `vector`
- `palette`
- `image`
- `audio`
- `tilemap`
- `localization`

## Portability

Portable Game Manifest export preserves:

- manifest id
- project type
- source tool state references
- source asset references
- visibility
- version
- status
- export format

Portable Game Manifest export must not carry:

- database owner id
- database project id
- database id
- credentials
- permissions internals
- moderation internals

## Ownership And Permissions Boundary

Game Manifest ownership is project-owned through a Game Project.

The manifest does not create a separate ownership model. It remains bound by Project ownership, Project visibility, Project permissions, Identity/Permissions rules, and explicit policy gates for archived editing.

Public or unlisted visibility does not grant edit permission.

## Database Boundary

The database remains the working system for persisted Project and Game Manifest records.

Game Manifest JSON remains the portable export/import format for game configuration. It must preserve enough source references to import or validate dependencies, but it does not replace the database as the source of persisted ownership, permissions, or audit state.

## Non-Goals

This document does not:

- define SQL schema
- define API routes
- implement manifest persistence
- implement authentication
- implement authorization checks
- implement Project Workspace storage
- implement runtime manifest loading
- implement publishing
- implement marketplace behavior
- change runtime behavior
- change CSS, HTML, JavaScript, TypeScript, or JSON files outside the contract/test scope
