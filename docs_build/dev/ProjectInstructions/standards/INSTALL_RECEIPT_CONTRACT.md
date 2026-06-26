# Install Receipt Contract

## Purpose

The Install Receipt contract defines a metadata-only record of an install outcome for a user's library item.

Install Receipt links an owner to a Library Item, Entitlement, Marketplace Listing, Project, Release, and Publish record. It does not store payment state, auth session state, runtime state, toolState data, file bytes, CDN details, or installer implementation details.

## Ownership

- Every Install Receipt requires `ownerId`.
- `ownerId` is the user whose library item produced the receipt.
- Install Receipt access is owner-private unless platform administration permission applies.
- Install Receipt does not replace Library Item, Entitlement, Marketplace Listing, Project, Release, or Publish ownership.

## Required Linkage

Install Receipt requires:

- `projectId`
- `libraryItem`
- `entitlement`
- `marketplaceListing`
- `sourceRelease`
- `sourcePublish`

Required consistency:

- `libraryItem.ownerId` must match `ownerId`.
- `entitlement.ownerId` must match `ownerId`.
- `libraryItem.projectId` must match `projectId`.
- `entitlement.projectId` must match `projectId`.
- `libraryItem.entitlementId` must match `entitlement.entitlementId`.
- `libraryItem.listingId` must match `marketplaceListing.listingId`.
- `libraryItem.releaseId` must match `sourceRelease.releaseId`.
- `libraryItem.publishId` must match `sourcePublish.publishId`.
- `entitlement.listingId` must match `marketplaceListing.listingId`.
- `entitlement.releaseId` must match `sourceRelease.releaseId`.
- `entitlement.publishId` must match `sourcePublish.publishId`.
- `marketplaceListing.projectId` must match `projectId`.
- `marketplaceListing.releaseId` must match `sourceRelease.releaseId`.
- `marketplaceListing.publishId` must match `sourcePublish.publishId`.
- `sourcePublish.releaseId` must match `sourceRelease.releaseId`.

## Receipt Status

Allowed install receipt statuses:

- `installed`
- `removed`
- `failed`
- `superseded`

Installed receipts require `installedAt`.

## Fields

- `installReceiptId`
- `ownerId`
- `projectId`
- `libraryItem`
- `entitlement`
- `marketplaceListing`
- `sourceRelease`
- `sourcePublish`
- `receiptStatus`
- `installedAt`
- `removedAt`
- `failedAt`
- `supersededAt`
- `receiptNotes`

## Forbidden State

Install Receipt records must not contain:

- payment state
- auth session state
- runtime state
- toolState data
- file bytes
- CDN details
- installer implementation details

Install workflows may use an Install Receipt later, but install paths, installed file manifests, installer logs, package manager details, CDN URLs, file bytes, and runtime state do not live inside the Install Receipt contract.

## Non-Goals

- No database implementation.
- No authentication implementation.
- No payment implementation.
- No CDN implementation.
- No installer implementation.
- No file delivery implementation.
- No UI or runtime behavior changes.
