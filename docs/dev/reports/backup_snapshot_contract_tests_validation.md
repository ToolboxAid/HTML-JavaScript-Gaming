# Backup Snapshot Contract Tests Validation

PR: PR_26152_092-backup-restore-contract-tests

## Scope

- Added `src/shared/contracts/backupSnapshotContract.js`.
- Added `tests/shared/BackupSnapshotContract.test.mjs`.
- Added `tests/fixtures/backup-snapshots/backup-snapshot-scenarios.json`.
- Added `docs/dev/specs/BACKUP_SNAPSHOT_CONTRACT.md`.
- Backup Snapshot contract remains metadata-only and does not contain runtime state, toolState, file bytes, auth session state, installer state, updater implementation details, or storage implementation details.

## Lanes Executed

- contract - backup snapshot contract syntax and targeted fixture validation.
- contract dependencies - migration plan, version compatibility, update channel, install receipt, library item, project, and identity/permissions contract compatibility.

## Lanes Skipped

- runtime - no runtime behavior changed.
- UI/CSS/HTML - no UI, CSS, or HTML files changed.
- samples - samples are out of scope for contract-only validation.
- repo-wide tests - explicitly out of scope.

## Commands

- PASS: `node --check src/shared/contracts/backupSnapshotContract.js`
- PASS: `node --check tests/shared/BackupSnapshotContract.test.mjs`
- PASS: `node tests/shared/BackupSnapshotContract.test.mjs`
- PASS: `node tests/shared/MigrationPlanContract.test.mjs`
- PASS: `node tests/shared/VersionCompatibilityContract.test.mjs`
- PASS: `node tests/shared/UpdateChannelContract.test.mjs`
- PASS: `node tests/shared/InstallReceiptContract.test.mjs`
- PASS: `node tests/shared/LibraryItemContract.test.mjs`
- PASS: `node tests/shared/ProjectContract.test.mjs`
- PASS: `node tests/shared/IdentityPermissionsContract.test.mjs`

## Expected PASS Behavior

- Valid backup snapshot fixtures pass.
- Invalid backup snapshot fixtures reject missing owner/project/link records, mismatched release/publish/library/install/migration linkage, invalid snapshot/schema versions, and forbidden runtime/tool/file/auth/installer/updater/storage fields.
- Existing dependent contract tests remain compatible.

## Expected WARN Behavior

- None.

