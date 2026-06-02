# Project Contract Tests Validation

PR: PR_26152_067-project-contract-tests

Date: 2026-06-02

## Scope

Added a reusable Project contract that builds on the approved identity/permissions contract.

No database implementation, authentication implementation, UI/page changes, CSS changes, HTML changes, or dependency changes were made.

## Files Validated

- `src/shared/contracts/projectContract.js`
- `tests/fixtures/projects/project-scenarios.json`
- `tests/shared/ProjectContract.test.mjs`
- `src/shared/contracts/identityPermissionsContract.js`
- `tests/shared/IdentityPermissionsContract.test.mjs`

## Validation Lanes

- Lanes executed: contract - project lifecycle state, role, visibility, relationship, and access-rule validation.
- Compatibility executed: identity permissions contract - confirms the project contract continues to use the approved identity permission vocabulary.
- Lanes skipped: runtime, integration, engine, samples, recovery/UAT - this PR does not change runtime behavior, handoff contracts, engine code, samples, or UAT surfaces.
- Samples decision: SKIP because this PR does not touch samples or sample JSON.
- Playwright impacted: No. This PR adds shared contract data, fixtures, and targeted node tests only.

## Commands

```text
node ./scripts/run-node-test-files.mjs tests/shared/ProjectContract.test.mjs tests/shared/IdentityPermissionsContract.test.mjs
```

Result:

```text
PASS tests/shared/ProjectContract.test.mjs
PASS tests/shared/IdentityPermissionsContract.test.mjs

2/2 targeted node test file(s) passed.
```

```text
git diff --check -- src/shared/contracts/projectContract.js tests/shared/ProjectContract.test.mjs tests/fixtures/projects/project-scenarios.json
```

Result:

```text
PASS - no whitespace errors reported.
```

## Contract Coverage

- Project requires owner: PASS.
- Project requires visibility: PASS.
- Project state must be valid: PASS.
- Project role must be valid: PASS.
- Private project is visible only to owner/granted users: PASS.
- Collaborator can edit granted project scope: PASS.
- Viewer can view but not edit: PASS.
- Published/public project visibility is distinct from marketplace state: PASS.
- Archived/retired projects cannot be edited unless explicitly allowed by policy: PASS.

## Scope Guard

- No database files changed.
- No authentication files changed.
- No UI/page files changed.
- No CSS files changed.
- No HTML files changed.
- No dependencies were added.
- No samples tests were run.
- No repo-wide tests were run.
