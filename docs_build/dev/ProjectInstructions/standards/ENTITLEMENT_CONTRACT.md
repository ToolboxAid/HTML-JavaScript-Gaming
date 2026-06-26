# Entitlement Contract

## Purpose

The Entitlement contract defines a user-owned access record for marketplace content.

Entitlement links a user owner to a Marketplace Listing, Project, Release, and Publish record. It does not store payment, auth session, runtime, toolState, or download state.

## Ownership

- Every Entitlement requires `ownerId`.
- `ownerId` is the user who owns the entitlement record.
- Entitlement access is owner-private unless platform policy grants administration.
- Entitlement does not replace Project ownership or Marketplace Listing ownership.

## Required Linkage

Entitlement requires:

- `projectId`
- `marketplaceListing`
- `sourceRelease`
- `sourcePublish`

Required consistency:

- `marketplaceListing.projectId` must match `projectId`.
- `marketplaceListing.releaseId` must match `sourceRelease.releaseId`.
- `marketplaceListing.publishId` must match `sourcePublish.publishId`.
- `sourcePublish.releaseId` must match `sourceRelease.releaseId`.

## Entitlement Types

Allowed entitlement types:

- `owned`
- `licensed`
- `granted`
- `revoked`

Active entitlement types require `grantedAt`. Revoked entitlements require `revokedAt`.

## Fields

- `entitlementId`
- `ownerId`
- `projectId`
- `marketplaceListing`
- `sourceRelease`
- `sourcePublish`
- `entitlementType`
- `grantedAt`
- `revokedAt`
- `entitlementNotes`

## Forbidden State

Entitlement records must not contain:

- payment state
- auth session state
- runtime state
- toolState data
- download state

Payment, authentication, runtime sessions, toolState payloads, and download workflows may link to Entitlement later, but their state does not live inside the Entitlement contract.

## Non-Goals

- No database implementation.
- No authentication implementation.
- No payment implementation.
- No download implementation.
- No UI or runtime behavior changes.
