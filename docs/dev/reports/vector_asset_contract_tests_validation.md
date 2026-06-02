# Vector Asset Contract Tests Validation

PR: PR_26152_069-vector-asset-contract-tests
Date: 2026-06-02

## Scope

- Added reusable Vector Asset contract data under `src/shared/contracts/vectorAssetContract.js`.
- Added Vector Asset fixtures under `tests/fixtures/vector-assets/vector-asset-scenarios.json`.
- Added targeted contract tests under `tests/shared/VectorAssetContract.test.mjs`.
- No database implementation was added.
- No authentication implementation was added.
- No UI/page/runtime behavior was changed.
- No CSS or HTML files were changed.
- No dependencies were added.

## Contract Coverage

Targeted tests prove:

- vector asset records require owner
- vector asset records require project
- vector asset records may link to source tool state
- visibility rules are enforced
- exported vector assets remain portable
- archived vector assets are immutable unless policy allows edits
- version must be valid

The Vector Asset contract defines:

- `assetId`
- `assetType = vector`
- `ownerId`
- `projectId`
- `sourceToolState`
- `visibility`
- `version`
- `status`
- `exportFormats`

## Validation Lanes

- lanes executed: contract - Vector Asset contract tests plus existing Tool State, Project, and Identity/Permissions contract tests were required by the PR.
- lanes skipped: runtime, integration, engine, recovery/UAT - no runtime, handoff, engine, or recovery behavior changed.
- samples decision: SKIP because samples were explicitly out of scope and no sample contracts or runtime paths changed.
- Playwright impacted: No. This PR changes contract data and targeted Node tests only.
- blocker scope: targeted contract lane only.

## Commands

```powershell
node ./scripts/run-node-test-files.mjs tests/shared/VectorAssetContract.test.mjs tests/shared/ToolStateContract.test.mjs tests/shared/ProjectContract.test.mjs tests/shared/IdentityPermissionsContract.test.mjs
```

Result: PASS

```text
PASS tests/shared/VectorAssetContract.test.mjs
PASS tests/shared/ToolStateContract.test.mjs
PASS tests/shared/ProjectContract.test.mjs
PASS tests/shared/IdentityPermissionsContract.test.mjs

4/4 targeted node test file(s) passed.
```

```powershell
git diff --check -- src/shared/contracts/vectorAssetContract.js tests/shared/VectorAssetContract.test.mjs tests/fixtures/vector-assets/vector-asset-scenarios.json
```

Result: PASS with no output.

## Expected PASS Behavior

- Valid vector asset fixtures pass without errors.
- Invalid vector asset fixtures return the exact expected contract error codes.
- Owner/project/visibility/version/export format requirements are enforced.
- Source tool state links are allowed when they identify tool state, tool type, and matching project.
- Private vector assets deny ungranted viewers and allow granted project viewers.
- Collaborators can edit granted active project vector assets.
- Viewers cannot edit vector assets.
- Marketplace vector assets are visible.
- Archived vector assets reject edits unless policy explicitly allows archived edits.
- Portable vector asset exports preserve portable fields and remove owner/project/database identifiers.

## Expected WARN Behavior

- No WARN findings for the targeted contract lane.
- Repo-wide, samples, UI, CSS, HTML, database, and authentication validation were intentionally not run because they are outside this PR scope.
