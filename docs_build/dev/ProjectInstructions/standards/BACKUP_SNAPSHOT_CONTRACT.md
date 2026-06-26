# Backup Snapshot Contract

## Purpose

Backup Snapshot records describe a metadata-only backup point for an owned project/release installation path.

The record links the owner, project, release, publish, library item, install receipt, and migration plan records needed to identify what was backed up. It does not store backup payload data, file bytes, runtime state, installer state, updater implementation details, auth session state, or storage implementation details.

## Ownership

- Every Backup Snapshot requires `ownerId`.
- The Backup Snapshot owner must match `libraryItem.ownerId`.
- The Backup Snapshot owner must match `installReceipt.ownerId`.
- The Backup Snapshot owner must match `migrationPlan.ownerId`.

## Required Linkage

- `projectId` links the snapshot to the persisted Project container.
- `sourceRelease` identifies the published or retired Release being backed up.
- `sourcePublish` identifies the published or retired Publish record for the Release.
- `libraryItem` identifies the owner's Library Item.
- `installReceipt` identifies the install receipt that was backed up.
- `migrationPlan` identifies the migration plan governing the installed version/schema.

## Version Rules

- `snapshotVersion` is required and must be a positive integer.
- `schemaVersion` is required and must be a positive integer.
- `snapshotVersion` must match `sourceRelease.version`.
- `snapshotVersion` must match `migrationPlan.targetVersion`.
- `schemaVersion` must match `migrationPlan.schemaVersion`.

## Boundaries

Backup Snapshot records must not contain:

- runtime state
- toolState or tool payloads
- file bytes or encoded file data
- auth session state
- installer state or installer implementation details
- updater state or updater implementation details
- storage provider, bucket, object key, signed URL, CDN, or file path implementation details

## Validation

Targeted validation lives in:

- `src/shared/contracts/backupSnapshotContract.js`
- `tests/shared/BackupSnapshotContract.test.mjs`
- `tests/fixtures/backup-snapshots/backup-snapshot-scenarios.json`

