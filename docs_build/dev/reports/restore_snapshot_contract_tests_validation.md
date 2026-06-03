# Restore Snapshot Contract Tests Validation

PR: PR_26152_092-backup-restore-contract-tests

## Scope

- Added `src/shared/contracts/restoreSnapshotContract.js`.
- Added `tests/shared/RestoreSnapshotContract.test.mjs`.
- Added `tests/fixtures/restore-snapshots/restore-snapshot-scenarios.json`.
- Added `docs_build/dev/specs/RESTORE_SNAPSHOT_CONTRACT.md`.
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

## Lanes Executed

- contract - targeted shared contract validation for this report's contract surface.

## Lanes Skipped

- runtime - no runtime behavior changed.
- integration - no handoff behavior changed.
- engine - no engine code changed.
- samples - no sample JSON or sample runtime changed.
- recovery/UAT - no Workspace V2 runtime behavior changed.

## Samples Decision

SKIP because contract validation reports do not touch samples or sample fixtures.

## Playwright

Playwright impacted: No

No Playwright impact. This report covers contract validation evidence only.

## Blocker Scope

Targeted contract lane validation only.

## Manual Validation

- Confirm the report remains scoped to contract validation evidence.
- Confirm no runtime, UI, CSS, HTML, JavaScript, storage, auth, payment, installer, downloader, or sample behavior changed.

## Expected PASS Behavior

The targeted contract validation command for this report passes.

## Expected WARN Behavior

Warnings are limited to skipped non-contract lanes or unrelated pre-existing repository state.
