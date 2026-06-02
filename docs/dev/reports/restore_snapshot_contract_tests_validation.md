# Restore Snapshot Contract Tests Validation

PR: PR_26152_092-backup-restore-contract-tests

## Scope

- Added `src/shared/contracts/restoreSnapshotContract.js`.
- Added `tests/shared/RestoreSnapshotContract.test.mjs`.
- Added `tests/fixtures/restore-snapshots/restore-snapshot-scenarios.json`.
- Added `docs/dev/specs/RESTORE_SNAPSHOT_CONTRACT.md`.
- Restore Snapshot contract remains metadata-only and does not contain runtime state, toolState, file bytes, auth session state, installer state, updater implementation details, or storage implementation details.

## Lanes Executed

- contract - restore snapshot contract syntax and targeted fixture validation.
- contract dependencies - migration plan, version compatibility, update channel, install receipt, library item, project, and identity/permissions contract compatibility.

## Lanes Skipped

- runtime - no runtime behavior changed.
- UI/CSS/HTML - no UI, CSS, or HTML files changed.
- samples - samples are out of scope for contract-only validation.
- repo-wide tests - explicitly out of scope.

## Commands

- PASS: `node --check src/shared/contracts/restoreSnapshotContract.js`
- PASS: `node --check tests/shared/RestoreSnapshotContract.test.mjs`
- PASS: `node tests/shared/RestoreSnapshotContract.test.mjs`
- PASS: `node tests/shared/MigrationPlanContract.test.mjs`
- PASS: `node tests/shared/VersionCompatibilityContract.test.mjs`
- PASS: `node tests/shared/UpdateChannelContract.test.mjs`
- PASS: `node tests/shared/InstallReceiptContract.test.mjs`
- PASS: `node tests/shared/LibraryItemContract.test.mjs`
- PASS: `node tests/shared/ProjectContract.test.mjs`
- PASS: `node tests/shared/IdentityPermissionsContract.test.mjs`

## Expected PASS Behavior

- Valid restore snapshot fixtures pass.
- Invalid restore snapshot fixtures reject missing owner/project/link records, mismatched backup/release/compatibility linkage, blocked or incompatible compatibility gates, invalid timestamps, and forbidden runtime/tool/file/auth/installer/updater/storage fields.
- Existing dependent contract tests remain compatible.

## Expected WARN Behavior

- None.

