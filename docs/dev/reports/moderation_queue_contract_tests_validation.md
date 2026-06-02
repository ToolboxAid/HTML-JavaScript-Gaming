# Moderation Queue Contract Tests Validation

PR: PR_26152_095-marketplace-trust-contract-tests

## Scope

- Added `src/shared/contracts/moderationQueueContract.js`.
- Added `tests/shared/ModerationQueueContract.test.mjs`.
- Added `tests/fixtures/moderation-queues/moderation-queue-scenarios.json`.
- Added `docs/dev/specs/MODERATION_QUEUE_CONTRACT.md`.

## Lanes Executed

- contract - Moderation Queue contract validation.

## Lanes Skipped

- runtime - no runtime behavior changed.
- UI/CSS/HTML - no UI, CSS, or HTML files changed.
- samples - samples are out of scope.
- repo-wide tests - explicitly out of scope.

## Commands

- PASS: `node tests/shared/ModerationQueueContract.test.mjs`

## Expected PASS Behavior

- Valid Moderation Queue fixtures pass.
- Invalid fixtures reject missing owner/project/subject/reason, invalid queue status/visibility, and forbidden state leakage.

## Expected WARN Behavior

- None.

