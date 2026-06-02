# Restore Request Contract

## Purpose

Restore Request records describe a metadata-only request to restore from a Backup Snapshot into a target Release context.

The record links the restore owner, project, backup snapshot, target release, and version compatibility records. It does not store restore payload data, runtime state, toolState, file bytes, auth session state, installer state, updater implementation details, or storage implementation details.

## Ownership

- Every Restore Request requires `ownerId`.
- The Restore Request owner must match `backupSnapshot.ownerId`.
- The Restore Request owner must match `versionCompatibility.ownerId`.

## Required Linkage

- `projectId` links the request to the persisted Project container.
- `backupSnapshot` identifies the Backup Snapshot selected for restore.
- `targetRelease` identifies the published or retired Release target.
- `versionCompatibility` identifies the compatibility gate for the target restore path.

## Compatibility Rules

- `backupSnapshot.releaseId` must match `targetRelease.releaseId`.
- `versionCompatibility.releaseId` must match `targetRelease.releaseId`.
- `versionCompatibility.publishId` must match `backupSnapshot.publishId`.
- `backupSnapshot.snapshotVersion` must match `targetRelease.version`.
- `backupSnapshot.schemaVersion` must match `versionCompatibility.supportedSchemaVersion`.
- Restore is allowed only when compatibility is `compatible` or `deprecated`.
- `blocked` or `incompatible` compatibility states block restore.

## Boundaries

Restore Request records must not contain:

- runtime state
- toolState or tool payloads
- file bytes or encoded file data
- auth session state
- installer state or installer implementation details
- updater state or updater implementation details
- storage provider, bucket, object key, signed URL, CDN, or file path implementation details

## Validation

Targeted validation lives in:

- `src/shared/contracts/restoreRequestContract.js`
- `tests/shared/RestoreRequestContract.test.mjs`
- `tests/fixtures/restore-requests/restore-request-scenarios.json`

