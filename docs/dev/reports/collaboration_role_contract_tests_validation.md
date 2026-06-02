# Collaboration Role Contract Tests Validation

PR: PR_26152_094-identity-collaboration-contract-tests

## Scope

- Added `src/shared/contracts/collaborationRoleContract.js`.
- Added `tests/shared/CollaborationRoleContract.test.mjs`.
- Added `tests/fixtures/collaboration-roles/collaboration-role-scenarios.json`.
- Added `docs/dev/specs/COLLABORATION_ROLE_CONTRACT.md`.

## Lanes Executed

- contract - Collaboration Role contract validation.

## Lanes Skipped

- runtime - no runtime behavior changed.
- UI/CSS/HTML - no UI, CSS, or HTML files changed.
- samples - samples are out of scope.
- repo-wide tests - explicitly out of scope.

## Commands

- PASS: `node tests/shared/CollaborationRoleContract.test.mjs`

## Expected PASS Behavior

- Valid Collaboration Role fixtures pass.
- Invalid fixtures reject missing ownership/project linkage, invalid subject/role/permission/visibility/timestamps, and forbidden state leakage.

## Expected WARN Behavior

- None.

