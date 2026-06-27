# Library Item Contract

## Purpose

The Library Item contract defines a user's persisted catalog entry for marketplace content.

Library Item links an owner to an Entitlement, Marketplace Listing, Project, Release, and Publish record. It does not store payment state, auth session state, runtime state, toolState data, file bytes, CDN details, or install state.

## Ownership

- Every Library Item requires `ownerId`.
- `ownerId` is the user whose library contains the item.
- Library Item access is owner-private unless platform administration permission applies.
- Library Item does not replace Entitlement, Marketplace Listing, Project, Release, or Publish ownership.

## Required Linkage

Library Item requires:

- `projectId`
- `entitlement`
- `marketplaceListing`
- `sourceRelease`
- `sourcePublish`

Required consistency:

- `entitlement.ownerId` must match `ownerId`.
- `entitlement.projectId` must match `projectId`.
- `entitlement.listingId` must match `marketplaceListing.listingId`.
- `entitlement.releaseId` must match `sourceRelease.releaseId`.
- `entitlement.publishId` must match `sourcePublish.publishId`.
- `marketplaceListing.projectId` must match `projectId`.
- `marketplaceListing.releaseId` must match `sourceRelease.releaseId`.
- `marketplaceListing.publishId` must match `sourcePublish.publishId`.
- `sourcePublish.releaseId` must match `sourceRelease.releaseId`.

## Library Status

Allowed library item statuses:

- `available`
- `hidden`
- `revoked`
- `archived`

All Library Items require `addedAt`.

Hidden Library Items require `hiddenAt`.

Revoked Library Items require `revokedAt`.

Archived Library Items require `archivedAt`.

## Fields

- `libraryItemId`
- `ownerId`
- `projectId`
- `entitlement`
- `marketplaceListing`
- `sourceRelease`
- `sourcePublish`
- `libraryStatus`
- `addedAt`
- `hiddenAt`
- `revokedAt`
- `archivedAt`
- `libraryNotes`

## Forbidden State

Library Item records must not contain:

- payment state
- auth session state
- runtime state
- toolState data
- file bytes
- CDN details
- install state

Installation systems may use a Library Item later, but install paths, installed files, launcher state, CDN URLs, file bytes, and runtime state do not live inside the Library Item contract.

## Non-Goals

- No database implementation.
- No authentication implementation.
- No payment implementation.
- No CDN implementation.
- No install implementation.
- No file delivery implementation.
- No UI or runtime behavior changes.
