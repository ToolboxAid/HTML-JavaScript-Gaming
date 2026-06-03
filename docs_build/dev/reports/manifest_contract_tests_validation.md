# Manifest Contract Tests Validation

PR: `PR_26152_081-manifest-contract-tests`

## Scope

- Added `src/shared/contracts/gameManifestContract.js`.
- Added `tests/shared/GameManifestContract.test.mjs`.
- Added `tests/fixtures/manifests/manifest-scenarios.json`.
- Added `docs_build/dev/specs/GAME_MANIFEST_CONTRACT.md`.

No database, authentication, UI, CSS, HTML, runtime page, or samples changes were made.

## Contract Rules Validated

- Game Manifest requires owner.
- Game Manifest requires project.
- Game Manifest requires `projectType = game`.
- Game Manifest may reference valid tool state references.
- Game Manifest may reference valid asset references.
- Game Manifest is a portable export/import format.
- Database remains the working system.
- Manifest is not the database source of truth.
- Manifest cannot bypass ownership, visibility, or permissions.
- Archived manifest is immutable unless policy allows edits.

## Validation Commands

- `node --check src/shared/contracts/gameManifestContract.js` - PASS
- `node --check tests/shared/GameManifestContract.test.mjs` - PASS
- `node tests/shared/GameManifestContract.test.mjs` - PASS
- `node tests/shared/ProjectContract.test.mjs` - PASS
- `node tests/shared/ProjectWorkspaceRuntimeContract.test.mjs` - PASS
- `node tests/shared/ToolStateContract.test.mjs` - PASS
- `node tests/shared/IdentityPermissionsContract.test.mjs` - PASS
- `$files = Get-ChildItem tests/shared/tools -Filter *.test.mjs | Sort-Object Name; foreach ($file in $files) { node $file.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }` - PASS, 36 tool contract tests ran
- `git diff --name-only -- '*.css' '*.html'` - PASS, no output
- `rg -n "\s+$" src/shared/contracts/gameManifestContract.js tests/shared/GameManifestContract.test.mjs tests/fixtures/manifests/manifest-scenarios.json docs_build/dev/specs/GAME_MANIFEST_CONTRACT.md` - PASS, no trailing whitespace
- `git diff --cached --name-only` - PASS, no staged files

## Validation Lanes

- Lanes executed: contract validation for Manifest, Project Type, Project Workspace, Project, Tool State, Tool contracts, and Identity/Permissions.
- Lanes skipped: runtime, integration, engine, samples, and recovery/UAT because this PR does not change runtime behavior, handoff contracts, engine surfaces, samples, or recovery behavior.
- Samples decision: SKIP because this PR is limited to contract/docs/test surfaces.
- Playwright impacted: No. This PR is contract/docs/test only and does not change UI or browser runtime behavior.

## Expected PASS Behavior

- Valid Game Manifest contract records are accepted.
- Missing owner, missing project, missing project type, non-game project type, invalid tool state references, invalid asset references, and invalid export formats are rejected.
- Portable Game Manifest export strips database owner/project ids and validates as portable.
- Visibility and permission checks remain bound to Project and Identity/Permissions contracts.
- Archived manifests cannot be edited unless policy explicitly allows archived manifest edits.

## Expected WARN Behavior

- No WARN behavior was observed in the targeted validation lane.
## Lanes Executed

- contract - targeted shared contract validation for this report's contract surface.

## Lanes Skipped

- runtime - no runtime behavior changed.
- integration - no handoff behavior changed.
- engine - no engine code changed.
- samples - no sample JSON or sample runtime changed.
- recovery/UAT - no Workspace V2 runtime behavior changed.

## Samples Decision

SKIP because contract validation reports do not touch samples or sample fixtures.

## Playwright

Playwright impacted: No

No Playwright impact. This report covers contract validation evidence only.

## Blocker Scope

Targeted contract lane validation only.

## Manual Validation

- Confirm the report remains scoped to contract validation evidence.
- Confirm no runtime, UI, CSS, HTML, JavaScript, storage, auth, payment, installer, downloader, or sample behavior changed.

## Expected PASS Behavior

The targeted contract validation command for this report passes.

## Expected WARN Behavior

Warnings are limited to skipped non-contract lanes or unrelated pre-existing repository state.
