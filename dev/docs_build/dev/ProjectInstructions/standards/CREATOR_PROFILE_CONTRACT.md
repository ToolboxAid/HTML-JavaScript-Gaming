# Creator Profile Contract

## Purpose

Creator Profile records describe the public or private creator identity attached to a user-owned platform account.

## Rules

- Every Creator Profile requires `ownerId`.
- Every Creator Profile requires a display name and lowercase URL-safe handle.
- Visibility must be `private`, `shared`, `public`, or `marketplace`.
- Status must be `active`, `suspended`, or `archived`.
- Creator Profile records do not contain auth session state, runtime state, toolState, payment state, or moderation decision state.

## Validation

- Contract: `src/shared/contracts/creatorProfileContract.js`
- Test: `dev/tests/shared/CreatorProfileContract.test.mjs`
- Fixture: `dev/tests/fixtures/creator-profiles/creator-profile-scenarios.json`

