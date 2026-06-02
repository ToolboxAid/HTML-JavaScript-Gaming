# Version Compatibility Contract

## Purpose

The Version Compatibility contract defines a metadata-only record that evaluates whether an installed or library-owned item is compatible with a target Release and Publish record.

Version Compatibility links an owner to a Project, Release, Publish record, Update Channel, Library Item, and Install Receipt. It does not store runtime state, toolState data, installer state, updater implementation details, migration implementation details, file bytes, or download state.

## Ownership

- Every Version Compatibility record requires `ownerId`.
- `ownerId` is the user whose Library Item and Install Receipt are being evaluated.
- Version Compatibility access is owner-private unless platform administration permission applies.
- Version Compatibility does not replace Project, Release, Publish, Update Channel, Library Item, or Install Receipt ownership.

## Required Linkage

Version Compatibility requires:

- `projectId`
- `sourceRelease`
- `sourcePublish`
- `updateChannel`
- `libraryItem`
- `installReceipt`

Required consistency:

- `updateChannel.ownerId` must match `ownerId`.
- `libraryItem.ownerId` must match `ownerId`.
- `installReceipt.ownerId` must match `ownerId`.
- `sourceRelease.projectId` must match `projectId`.
- `sourcePublish.projectId` must match `projectId`.
- `updateChannel.projectId` must match `projectId`.
- `libraryItem.projectId` must match `projectId`.
- `installReceipt.projectId` must match `projectId`.
- `sourcePublish.releaseId` must match `sourceRelease.releaseId`.
- `updateChannel.releaseId` must match `sourceRelease.releaseId`.
- `libraryItem.releaseId` must match `sourceRelease.releaseId`.
- `installReceipt.releaseId` must match `sourceRelease.releaseId`.
- `updateChannel.publishId` must match `sourcePublish.publishId`.
- `libraryItem.publishId` must match `sourcePublish.publishId`.
- `installReceipt.publishId` must match `sourcePublish.publishId`.
- `installReceipt.libraryItemId` must match `libraryItem.libraryItemId`.

## Version Range

Version Compatibility requires:

- `minimumVersion`
- `maximumVersion`
- `targetVersion`
- `supportedSchemaVersion`

Rules:

- Versions are positive integers.
- `minimumVersion` must be less than or equal to `maximumVersion`.
- `targetVersion` must be inside the supported range.
- `targetVersion` must match `sourceRelease.version`.
- `supportedSchemaVersion` records the schema version the compatibility decision was evaluated against.

## Compatibility State

Allowed compatibility states:

- `incompatible`
- `compatible`
- `deprecated`
- `blocked`

Compatibility state describes the evaluation result. It does not authorize migration, installation, update, or download behavior by itself.

## Fields

- `versionCompatibilityId`
- `ownerId`
- `projectId`
- `sourceRelease`
- `sourcePublish`
- `updateChannel`
- `libraryItem`
- `installReceipt`
- `minimumVersion`
- `maximumVersion`
- `targetVersion`
- `supportedSchemaVersion`
- `compatibilityState`
- `evaluatedAt`
- `compatibilityNotes`

## Forbidden State

Version Compatibility records must not contain:

- runtime state
- toolState data
- installer state
- updater implementation details
- migration implementation details
- file bytes
- download state

Compatibility checks may later feed update or migration workflows, but updater jobs, migration scripts, patch bytes, file content, install plans, download grants, and runtime context do not live inside the Version Compatibility contract.

## Non-Goals

- No database implementation.
- No authentication implementation.
- No installer implementation.
- No updater implementation.
- No migration implementation.
- No file delivery implementation.
- No download implementation.
- No UI or runtime behavior changes.
