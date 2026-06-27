# Update Channel Contract

## Purpose

The Update Channel contract defines a metadata-only record that assigns a published or retired Release and Publish record to a named update lane.

Update Channel links an owner to a Project, Release, Publish record, Library Item, and Install Receipt. It does not store payment state, auth session state, runtime state, toolState data, installer state, updater implementation details, or download state.

## Ownership

- Every Update Channel requires `ownerId`.
- `ownerId` is the user whose library/install context is receiving update assignment metadata.
- Update Channel access is owner-private unless platform administration permission applies.
- Update Channel does not replace Project, Release, Publish, Library Item, or Install Receipt ownership.

## Required Linkage

Update Channel requires:

- `projectId`
- `assignedRelease`
- `assignedPublish`
- `libraryItem`
- `installReceipt`

Required consistency:

- `libraryItem.ownerId` must match `ownerId`.
- `installReceipt.ownerId` must match `ownerId`.
- `assignedRelease.projectId` must match `projectId`.
- `assignedPublish.projectId` must match `projectId`.
- `libraryItem.projectId` must match `projectId`.
- `installReceipt.projectId` must match `projectId`.
- `assignedPublish.releaseId` must match `assignedRelease.releaseId`.
- `libraryItem.releaseId` must match `assignedRelease.releaseId`.
- `installReceipt.releaseId` must match `assignedRelease.releaseId`.
- `libraryItem.publishId` must match `assignedPublish.publishId`.
- `installReceipt.publishId` must match `assignedPublish.publishId`.
- `installReceipt.libraryItemId` must match `libraryItem.libraryItemId`.

## Channel Types

Allowed update channel types:

- `stable`
- `beta`
- `alpha`
- `preview`

## Release Assignment

Update Channel assignment requires:

- `assignedRelease`
- `assignedPublish`
- `assignedAt`

Assigned Release references must identify a published or retired Release. Assigned Publish references must identify a published or retired Publish record and must point back to the assigned Release.

## Promotion Rules

Promotion order moves toward the stable channel:

`preview` -> `alpha` -> `beta` -> `stable`

Rules:

- `promotesFrom` is optional for direct channel assignment.
- `promotesFrom` must be a valid channel type when provided.
- A promotion must move from a less stable channel toward a more stable channel.
- A promotion cannot move backward.
- A promotion cannot target the same channel type.
- `promotedAt` is required when `promotesFrom` is provided.
- `promotedAt` cannot be provided without `promotesFrom`.

## Fields

- `updateChannelId`
- `ownerId`
- `projectId`
- `channelType`
- `assignedRelease`
- `assignedPublish`
- `libraryItem`
- `installReceipt`
- `assignedAt`
- `promotesFrom`
- `promotedAt`
- `channelNotes`

## Forbidden State

Update Channel records must not contain:

- payment state
- auth session state
- runtime state
- toolState data
- installer state
- updater implementation details
- download state

Update workflows may use an Update Channel later, but update URLs, updater jobs, patch bytes, install plans, installer state, download grants, and runtime context do not live inside the Update Channel contract.

## Non-Goals

- No database implementation.
- No authentication implementation.
- No payment implementation.
- No installer implementation.
- No updater implementation.
- No download implementation.
- No UI or runtime behavior changes.
