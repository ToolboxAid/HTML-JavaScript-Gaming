# Migration Plan Contract

## Purpose

The Migration Plan contract defines a metadata-only record that decides whether a user-owned library/install record needs migration from a source version to a target Release version.

Migration Plan links an owner to a Project, target Release, Version Compatibility record, Update Channel, Library Item, and Install Receipt. It does not store runtime state, toolState data, installer state, updater implementation details, migration implementation code, file bytes, or download state.

## Ownership

- Every Migration Plan requires `ownerId`.
- `ownerId` is the user whose Library Item and Install Receipt are being evaluated.
- Migration Plan access is owner-private unless platform administration permission applies.
- Migration Plan does not replace Project, Release, Version Compatibility, Update Channel, Library Item, or Install Receipt ownership.

## Required Linkage

Migration Plan requires:

- `projectId`
- `targetRelease`
- `versionCompatibility`
- `updateChannel`
- `libraryItem`
- `installReceipt`

Required consistency:

- `versionCompatibility.ownerId` must match `ownerId`.
- `updateChannel.ownerId` must match `ownerId`.
- `libraryItem.ownerId` must match `ownerId`.
- `installReceipt.ownerId` must match `ownerId`.
- `targetRelease.projectId` must match `projectId`.
- `versionCompatibility.projectId` must match `projectId`.
- `updateChannel.projectId` must match `projectId`.
- `libraryItem.projectId` must match `projectId`.
- `installReceipt.projectId` must match `projectId`.
- `versionCompatibility.releaseId` must match `targetRelease.releaseId`.
- `updateChannel.releaseId` must match `targetRelease.releaseId`.
- `libraryItem.releaseId` must match `targetRelease.releaseId`.
- `installReceipt.releaseId` must match `targetRelease.releaseId`.
- `updateChannel.publishId` must match `versionCompatibility.publishId`.
- `libraryItem.publishId` must match `versionCompatibility.publishId`.
- `installReceipt.publishId` must match `versionCompatibility.publishId`.
- `installReceipt.libraryItemId` must match `libraryItem.libraryItemId`.

## Version Rules

Migration Plan requires:

- `sourceVersion`
- `targetVersion`
- `schemaVersion`

Rules:

- Versions are positive integers.
- `targetVersion` must match `targetRelease.version`.
- `targetVersion` must match `versionCompatibility.targetVersion`.
- `schemaVersion` must match `versionCompatibility.supportedSchemaVersion`.

## Migration States

Allowed migration states:

- `notRequired`
- `required`
- `blocked`
- `completed`

Rules:

- `notRequired` requires `sourceVersion` and `targetVersion` to match.
- `required` requires `targetVersion` to be newer than `sourceVersion`.
- `completed` requires `targetVersion` to be newer than `sourceVersion`.
- `completed` requires `completedAt`.
- If Version Compatibility is `blocked` or `incompatible`, Migration Plan must be `blocked`.

## Fields

- `migrationPlanId`
- `ownerId`
- `projectId`
- `targetRelease`
- `versionCompatibility`
- `updateChannel`
- `libraryItem`
- `installReceipt`
- `sourceVersion`
- `targetVersion`
- `schemaVersion`
- `migrationState`
- `plannedAt`
- `completedAt`
- `migrationNotes`

## Forbidden State

Migration Plan records must not contain:

- runtime state
- toolState data
- installer state
- updater implementation details
- migration implementation code
- file bytes
- download state

Migration Plan records may say that migration is not required, required, blocked, or completed. Migration scripts, executable migration code, updater jobs, installer plans, patch bytes, file content, download grants, and runtime context do not live inside the Migration Plan contract.

## Non-Goals

- No database implementation.
- No authentication implementation.
- No installer implementation.
- No updater implementation.
- No migration implementation.
- No file delivery implementation.
- No download implementation.
- No UI or runtime behavior changes.
