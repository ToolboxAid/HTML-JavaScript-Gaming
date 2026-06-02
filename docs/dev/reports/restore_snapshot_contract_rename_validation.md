# Restore Snapshot Contract Rename Validation

PR: PR_26152_093-restore-snapshot-contract-rename

## Scope

- Renamed the restore contract module to `src/shared/contracts/restoreSnapshotContract.js`.
- Renamed the restore contract test to `tests/shared/RestoreSnapshotContract.test.mjs`.
- Renamed restore fixtures to `tests/fixtures/restore-snapshots/restore-snapshot-scenarios.json`.
- Renamed restore spec/report references to Restore Snapshot terminology.
- Kept Backup Snapshot and Restore Snapshot as separate contract, fixture, spec, test, and report surfaces.

## Lanes Executed

- contract - restore snapshot syntax and targeted contract validation.
- dependent contract - backup snapshot and migration plan validation to verify rename compatibility.

## Lanes Skipped

- runtime - no runtime behavior changed.
- UI/CSS/HTML - no UI, CSS, or HTML files changed.
- samples - samples are out of scope for contract rename validation.
- repo-wide tests - explicitly out of scope.

## Commands

- PASS: `node --check src/shared/contracts/restoreSnapshotContract.js`
- PASS: `node --check tests/shared/RestoreSnapshotContract.test.mjs`
- PASS: `node tests/shared/RestoreSnapshotContract.test.mjs`
- PASS: `node tests/shared/BackupSnapshotContract.test.mjs`
- PASS: `node tests/shared/MigrationPlanContract.test.mjs`

## Reference Check

- PASS: Active restore source/test/fixture/spec/report references use Restore Snapshot terminology.
- PASS: Backup Snapshot remains separate and was not consolidated with Restore Snapshot.

## Expected PASS Behavior

- Restore Snapshot contract exports, validation names, fixture keys, test names, and documentation references resolve under Restore Snapshot terminology.
- Backup Snapshot contract tests and Migration Plan contract tests continue to pass.

## Expected WARN Behavior

- None.
