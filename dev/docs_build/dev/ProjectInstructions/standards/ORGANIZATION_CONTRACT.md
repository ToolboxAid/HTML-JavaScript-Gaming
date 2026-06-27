# Organization Contract

## Purpose

Organization records describe a user-owned group identity for collaboration and public marketplace/community presence.

## Rules

- Every Organization requires `ownerId`.
- Every Organization requires a display name and lowercase URL-safe handle.
- Visibility must be `private`, `shared`, `public`, or `marketplace`.
- Status must be `active`, `suspended`, or `archived`.
- Organization records do not contain auth session state, runtime state, toolState, payment state, or moderation decision state.

## Validation

- Contract: `src/shared/contracts/organizationContract.js`
- Test: `tests/shared/OrganizationContract.test.mjs`
- Fixture: `tests/fixtures/organizations/organization-scenarios.json`

