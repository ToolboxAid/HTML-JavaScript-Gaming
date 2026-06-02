# Release Contract Tests Validation

PR: `PR_26152_082-release-contract-tests`

## Scope

- Added `src/shared/contracts/releaseContract.js`.
- Added `tests/shared/ReleaseContract.test.mjs`.
- Added `tests/fixtures/releases/release-scenarios.json`.
- Added `docs/dev/specs/RELEASE_CONTRACT.md`.

No database, authentication, UI, CSS, HTML, runtime page, or samples changes were made.

## Contract Rules Validated

- Release requires owner.
- Release requires project.
- Release requires source manifest.
- Release cannot bypass ownership, visibility, or permissions.
- Published releases are immutable unless policy allows patching.
- Retired releases remain historically referenceable.
- Release version must be valid.
- Release visibility must be valid.

## Validation Commands

- `node --check src/shared/contracts/releaseContract.js` - PASS
- `node --check tests/shared/ReleaseContract.test.mjs` - PASS
- `node tests/shared/ReleaseContract.test.mjs` - PASS
- `node tests/shared/GameManifestContract.test.mjs` - PASS
- `node tests/shared/ProjectContract.test.mjs` - PASS
- `node tests/shared/ProjectWorkspaceRuntimeContract.test.mjs` - PASS
- `node tests/shared/ToolStateContract.test.mjs` - PASS
- `node tests/shared/IdentityPermissionsContract.test.mjs` - PASS
- `$files = Get-ChildItem tests/shared/tools -Filter *.test.mjs | Sort-Object Name; foreach ($file in $files) { node $file.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }` - PASS, 36 tool contract tests ran
- `git diff --name-only -- '*.css' '*.html'` - PASS, no output
- `rg -n "\s+$" src/shared/contracts/releaseContract.js tests/shared/ReleaseContract.test.mjs tests/fixtures/releases/release-scenarios.json docs/dev/specs/RELEASE_CONTRACT.md` - PASS, no trailing whitespace
- `git diff --cached --name-only` - PASS, no staged files

## Validation Lanes

- Lanes executed: contract validation for Release, Manifest, Project Type, Project Workspace, Project, Tool State, Tool contracts, and Identity/Permissions.
- Lanes skipped: runtime, integration, engine, samples, and recovery/UAT because this PR does not change runtime behavior, handoff contracts, engine surfaces, samples, or recovery behavior.
- Samples decision: SKIP because this PR is limited to contract/docs/test surfaces.
- Playwright impacted: No. This PR is contract/docs/test only and does not change UI or browser runtime behavior.

## Expected PASS Behavior

- Valid Release contract records are accepted.
- Missing owner, missing project, missing source manifest, invalid source manifest, invalid version, invalid visibility, and missing published timestamp are rejected.
- Release source manifest references are validated against the Game Manifest reference shape.
- Release access remains bound to Project and Identity/Permissions contracts.
- Published releases cannot be edited unless policy allows patching.
- Retired releases remain historically referenceable.

## Expected WARN Behavior

- No WARN behavior was observed in the targeted validation lane.
