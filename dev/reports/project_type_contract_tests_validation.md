# Project Type Contract Tests Validation

PR: `PR_26152_080-project-type-contract-tests`

## Scope

- Added Project Type contract rules to `src/shared/contracts/projectContract.js`.
- Updated Project contract fixtures and targeted contract tests.
- Updated Project Workspace contract test fixture so Projects include `projectType`.
- Added `docs_build/dev/specs/PROJECT_TYPE_CONTRACT.md`.

No database, authentication, UI, CSS, HTML, or runtime page changes were made.

## Contract Rules Validated

- Every Project requires `projectType`.
- Valid Project Types are accepted:
  - `game`
  - `asset-pack`
  - `music-pack`
  - `localization-pack`
  - `template`
  - `tutorial`
- Invalid Project Types are rejected.
- All Project Types still require owner.
- All Project Types still require visibility.
- Project Type determines expected outputs only.
- Project Type does not bypass permissions.
- Project Type does not create a different ownership model.
- All Project Types share Project lifecycle and Project Workspace runtime-only model.

## Validation Commands

- `node tests/shared/ProjectContract.test.mjs` - PASS
- `node tests/shared/ProjectWorkspaceRuntimeContract.test.mjs` - PASS
- `node tests/shared/ToolStateContract.test.mjs` - PASS
- `node tests/shared/IdentityPermissionsContract.test.mjs` - PASS
- `$files = Get-ChildItem tests/shared/tools -Filter *.test.mjs | Sort-Object Name; foreach ($file in $files) { node $file.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }` - PASS, 36 tool contract tests ran
- `git diff --check -- src/shared/contracts/projectContract.js tests/shared/ProjectContract.test.mjs tests/shared/ProjectWorkspaceRuntimeContract.test.mjs tests/fixtures/projects/project-scenarios.json docs_build/dev/specs/PROJECT_TYPE_CONTRACT.md` - PASS
- `git diff --name-only -- '*.css' '*.html' '*.js' ':!src/shared/contracts/projectContract.js' ':!src/shared/contracts/projectWorkspaceRuntimeContract.js' ':!src/shared/contracts/tools/*.js'` - PASS, no output

## Validation Lanes

- Lanes executed: contract validation for Project Type, Project Workspace compatibility, Project, Tool State, Identity/Permissions, and Tool contracts.
- Lanes skipped: runtime, integration, engine, samples, and recovery/UAT because this PR does not change runtime behavior, handoff contracts, engine surfaces, samples, or recovery behavior.
- Samples decision: SKIP because this PR is limited to contract/docs/test surfaces.
- Playwright impacted: No. This PR is contract/docs/test only and does not change UI or browser runtime behavior.

## Expected PASS Behavior

- Project contract rejects missing or invalid `projectType`.
- Project contract accepts all approved Project Types.
- Owner, visibility, permission, lifecycle, and Project Workspace behavior remain shared across all Project Types.
- Existing Project Workspace, Tool State, Identity/Permissions, and Tool contract tests continue to pass.

## Expected WARN Behavior

- Git may report line-ending normalization warnings for existing working-copy files. These warnings do not indicate whitespace failures and did not fail `git diff --check`.
