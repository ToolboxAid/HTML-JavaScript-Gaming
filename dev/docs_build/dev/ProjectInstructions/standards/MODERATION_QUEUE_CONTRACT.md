# Moderation Queue Contract

## Purpose

Moderation Queue records describe admin-only moderation intake metadata for marketplace, review, creator, organization, or comment records.

## Rules

- Every Moderation Queue item requires `ownerId` and `projectId`.
- Subject type must be a supported moderated record type.
- Queue status must be `open`, `inReview`, `resolved`, or `dismissed`.
- Visibility must be `admin-only`.
- Moderation Queue records do not contain payment state, auth session state, runtime state, toolState, or final moderation decision state.

## Validation

- Contract: `src/shared/contracts/moderationQueueContract.js`
- Test: `tests/shared/ModerationQueueContract.test.mjs`
- Fixture: `tests/fixtures/moderation-queues/moderation-queue-scenarios.json`
