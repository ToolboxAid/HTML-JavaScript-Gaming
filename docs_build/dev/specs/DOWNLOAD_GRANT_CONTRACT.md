# Download Grant Contract

## Purpose

The Download Grant contract defines a metadata-only authorization record for downloading marketplace content.

Download Grant links an owner to an Entitlement, Marketplace Listing, Project, Release, and Publish record. It does not store payment, auth session, runtime, toolState, file bytes, CDN implementation details, or storage implementation details.

## Ownership

- Every Download Grant requires `ownerId`.
- `ownerId` is the user allowed to use the grant.
- Download Grant access is owner-private unless platform administration permission applies.
- Download Grant does not replace Entitlement, Marketplace Listing, Project, Release, or Publish ownership.

## Required Linkage

Download Grant requires:

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

## Grant Status

Allowed grant statuses:

- `active`
- `expired`
- `revoked`
- `consumed`

Active and expired grants require `expiresAt`. Active grants must not be expired at validation time. Expired grants must have an expired `expiresAt` timestamp at validation time.

Revoked grants require `revokedAt`.

Consumed grants require `consumedAt`.

## Fields

- `downloadGrantId`
- `ownerId`
- `projectId`
- `entitlement`
- `marketplaceListing`
- `sourceRelease`
- `sourcePublish`
- `grantStatus`
- `grantedAt`
- `expiresAt`
- `revokedAt`
- `consumedAt`
- `grantNotes`

## Forbidden State

Download Grant records must not contain:

- payment state
- auth session state
- runtime state
- toolState data
- file bytes
- CDN implementation details
- storage implementation details

Delivery systems may use a Download Grant later, but CDN URLs, storage keys, file bytes, and download implementation details do not live inside the Download Grant contract.

## Non-Goals

- No database implementation.
- No authentication implementation.
- No payment implementation.
- No CDN implementation.
- No storage implementation.
- No file delivery implementation.
- No UI or runtime behavior changes.
