# Release Contract

## Status

This is a contract planning document for GameFoundryStudio Release behavior.

It defines required Release contract rules before database, authentication, UI, runtime, publishing, marketplace, or storage implementation begins.

This document does not authorize runtime changes, database implementation, authentication implementation, page changes, CSS changes, HTML changes, JavaScript changes, or schema migrations.

## Release Fields

Release records define:

- `releaseId`
- `ownerId`
- `projectId`
- `sourceManifest`
- `version`
- `status`
- `visibility`
- `publishedAt`
- `releaseNotes`

## Required Rules

- Release requires owner.
- Release requires project.
- Release requires source manifest.
- Release cannot bypass ownership, visibility, or permissions.
- Published releases are immutable unless policy allows patching.
- Retired releases remain historically referenceable.
- Release version must be valid.
- Release visibility must be valid.

## Source Manifest Reference

Release source manifest references must identify:

- `manifestId`
- optional positive `version`
- optional `exportFormat = game-manifest-json`

Source manifest references point to the Game Manifest contract. They do not copy the full manifest database record into the Release contract.

## Status

Approved first-pass Release statuses:

- `draft`
- `published`
- `retired`

Draft releases may be edited according to Project permissions.

Published releases are immutable unless policy explicitly allows patching.

Retired releases remain historically referenceable and should not silently lose their source manifest, version, visibility, published timestamp, or release notes.

## Visibility And Permissions Boundary

Release visibility uses the approved Project visibility states:

- `private`
- `project`
- `unlisted`
- `public`

Release visibility does not grant edit permission.

Release access remains bound by Project ownership, Project visibility, Project permissions, Identity/Permissions rules, and explicit policy gates for patching.

## Database Boundary

The database remains the working system for persisted Project, Game Manifest, and Release records.

Release export metadata can be portable, but it must not carry database owner ids, project ids, credentials, permissions internals, moderation internals, or database-only audit state.

## Non-Goals

This document does not:

- define SQL schema
- define API routes
- implement release persistence
- implement authentication
- implement authorization checks
- implement ProjectWorkspace storage
- implement runtime release loading
- implement publishing
- implement marketplace behavior
- change runtime behavior
- change CSS, HTML, JavaScript, TypeScript, or JSON files outside the contract/test scope
