# Identity Permissions Contract

## Purpose

`src/shared/contracts/identityPermissionsContract.js` defines the reusable ownership, role, permission, visibility, and scope rules used by the contract-first platform lane.

## Ownership

- Every persisted database object must have an owner.
- Owners have full object control unless a platform policy narrows that control.
- Admin, moderator, contributor, reviewer, player, guest, and creator behavior remains role and scope bounded.

## Visibility And Permissions

- Shareable objects require explicit visibility.
- Editable objects require explicit permissions.
- Guest access is public-view only.
- Moderator, reviewer, and admin scopes are intentionally distinct.

## Portable Format

Identity and permission rules validate database object ownership and access decisions. They do not define auth sessions, storage records, runtime state, or payment state.

## Validation

- Contract test: `tests/shared/IdentityPermissionsContract.test.mjs`
- Fixture file: `tests/fixtures/identity-permissions/permission-scenarios.json`
- Validation report: `dev/docs_build/dev/reports/identity_permissions_contract_tests_validation.md`
