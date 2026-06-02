# Publish Contract

## Status

This is a contract planning document for GameFoundryStudio Publish behavior.

It defines required Publish contract rules before database, authentication, UI, runtime, publishing implementation, marketplace moderation, or storage implementation begins.

This document does not authorize runtime changes, database implementation, authentication implementation, page changes, CSS changes, HTML changes, JavaScript changes, or schema migrations.

## Publish Fields

Publish records define:

- `publishId`
- `ownerId`
- `projectId`
- `sourceRelease`
- `visibility`
- `status`
- `publishedAt`
- `publishNotes`

## Required Rules

- Publish requires owner.
- Publish requires project.
- Publish requires source release.
- Publish cannot bypass ownership, visibility, or permissions.
- Publish visibility must be a valid Project visibility state.
- Publish lifecycle status must be valid.
- Published Publish records are immutable unless policy allows edits.
- Retired Publish records remain historically referenceable.

## Source Release Reference

Publish source release references must identify:

- `releaseId`
- positive `version`
- optional `status`

When `status` is provided, the referenced Release must be `published` or `retired`.

Source release references point to the Release contract. They do not copy the full Release database record into the Publish contract.

## Lifecycle Status

Approved first-pass Publish statuses:

- `draft`
- `ready`
- `published`
- `retired`
- `cancelled`

Draft and ready Publish records may be edited according to Project permissions.

Published Publish records are immutable unless policy explicitly allows edits.

Retired Publish records remain historically referenceable and should not silently lose their source release, visibility, published timestamp, or publish notes.

Cancelled Publish records are immutable unless policy explicitly allows edits.

## No-Leakage Boundary

Publish records must not carry:

- runtime state
- authentication state
- marketplace moderation state
- tool state data
- Workspace or Project Workspace runtime fields
- tool payload data
- database-only ids beyond the contract-owned ids

Forbidden examples include:

- `workspaceState`
- `authState`
- `marketplaceModerationState`
- `toolStateId`
- `toolStates`
- `payloadJson`

## Visibility And Permissions Boundary

Publish visibility uses the approved Project visibility states:

- `private`
- `project`
- `unlisted`
- `public`

Publish visibility does not grant edit permission.

Publish access remains bound by Project ownership, Project visibility, Project permissions, Identity/Permissions rules, and explicit policy gates for editing published, retired, or cancelled records.

## Non-Goals

This document does not:

- define SQL schema
- define API routes
- implement publish persistence
- implement authentication
- implement authorization checks
- implement marketplace moderation
- implement Project Workspace storage
- implement runtime publish loading
- change runtime behavior
- change CSS, HTML, JavaScript, TypeScript, or JSON files outside the contract/test scope
