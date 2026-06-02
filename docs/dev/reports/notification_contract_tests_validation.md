# Notification Contract Tests Validation

PR: PR_26152_096-audit-notification-contract-tests

## Scope

- Added `src/shared/contracts/notificationContract.js`.
- Added `tests/shared/NotificationContract.test.mjs`.
- Added `tests/fixtures/notifications/notification-scenarios.json`.
- Added `docs/dev/specs/NOTIFICATION_CONTRACT.md`.

## Lanes Executed

- contract - Notification contract validation.

## Lanes Skipped

- runtime - no runtime behavior changed.
- UI/CSS/HTML - no UI, CSS, or HTML files changed.
- samples - samples are out of scope.
- repo-wide tests - explicitly out of scope.

## Commands

- PASS: `node tests/shared/NotificationContract.test.mjs`

## Expected PASS Behavior

- Valid Notification fixtures pass.
- Invalid fixtures reject missing ownership/recipient/type/channel/status fields, read notifications without timestamps, invalid timestamps, and forbidden state leakage.

## Expected WARN Behavior

- None.
