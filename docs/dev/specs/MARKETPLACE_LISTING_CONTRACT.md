# Marketplace Listing Contract

## Purpose

The Marketplace Listing contract defines the portable listing metadata that connects a published or retired Release and Publish record to marketplace discovery.

Marketplace Listing is not runtime state, authentication state, payment state, or moderation decision state.

## Ownership

- Every Marketplace Listing requires `ownerId`.
- Every Marketplace Listing requires `projectId`.
- Marketplace Listing cannot bypass the ownership, visibility, and permission contracts already defined for platform objects.
- Project remains the persisted ownership container.

## Required Linkage

Marketplace Listing requires:

- `sourceRelease` with `releaseId`, `version`, and optional published/retired status.
- `sourcePublish` with `publishId`, `releaseId`, and optional published/retired status.
- `sourcePublish.releaseId` must match `sourceRelease.releaseId`.

## Fields

- `listingId`
- `ownerId`
- `projectId`
- `sourceRelease`
- `sourcePublish`
- `visibility`
- `status`
- `listedAt`
- `listingTitle`
- `listingSummary`

## Visibility

Allowed Marketplace Listing visibility states:

- `private`
- `unlisted`
- `public`
- `marketplace`

Marketplace and public listings are visible to public viewers. Private listings require owner or granted project access.

## Lifecycle Status

Allowed Marketplace Listing lifecycle states:

- `draft`
- `listed`
- `unlisted`
- `retired`

Listed and retired listings require `listedAt`. Listed and retired listings are immutable unless an explicit policy allows edits.

## Forbidden State

Marketplace Listing records must not contain:

- runtime state
- auth state
- payment state
- moderation decision state
- tool state payloads

Moderation and payment systems may link to Marketplace Listing later, but their decisions and transaction state do not live in the Marketplace Listing contract.

## Non-Goals

- No database implementation.
- No authentication implementation.
- No payment implementation.
- No moderation implementation.
- No UI or runtime behavior changes.
