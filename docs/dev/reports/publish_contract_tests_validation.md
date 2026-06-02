# Publish Contract Tests Validation

PR: `PR_26152_083-publish-contract-tests`

## Scope

- Added `src/shared/contracts/publishContract.js`.
- Added `tests/shared/PublishContract.test.mjs`.
- Added `tests/fixtures/publish/publish-scenarios.json`.
- Added `docs/dev/specs/PUBLISH_CONTRACT.md`.

No database, authentication, UI, CSS, HTML, runtime page, marketplace moderation, tool state storage, or samples changes were made.

## Contract Rules Validated

- Publish requires owner.
- Publish requires project.
- Publish requires source release.
- Publish visibility must be valid.
- Publish lifecycle status must be valid.
- Publish cannot bypass ownership, visibility, or permissions.
- Published Publish records are immutable unless policy allows edits.
- Retired Publish records remain historically referenceable.
- Publish records reject runtime state leakage.
- Publish records reject auth state leakage.
- Publish records reject marketplace moderation state leakage.
- Publish records reject tool state leakage.

## Validation Commands

- `node --check src/shared/contracts/publishContract.js` - PASS
- `node --check tests/shared/PublishContract.test.mjs` - PASS
- `node tests/shared/PublishContract.test.mjs` - PASS
- `node tests/shared/ReleaseContract.test.mjs` - PASS
- `node tests/shared/GameManifestContract.test.mjs` - PASS
- `node tests/shared/ProjectContract.test.mjs` - PASS
- `node tests/shared/ProjectWorkspaceRuntimeContract.test.mjs` - PASS
- `node tests/shared/ToolStateContract.test.mjs` - PASS
- `node tests/shared/IdentityPermissionsContract.test.mjs` - PASS
- `git diff --name-only -- '*.css' '*.html'` - PASS, no output
- `rg -n "\s+$" src/shared/contracts/publishContract.js tests/shared/PublishContract.test.mjs tests/fixtures/publish/publish-scenarios.json docs/dev/specs/PUBLISH_CONTRACT.md` - PASS, no trailing whitespace
- `git diff --cached --name-only` - PASS, no staged files

## Validation Lanes

- Lanes executed: contract validation for Publish, Release, Manifest, Project Type, Project Workspace, Project, Tool State, and Identity/Permissions.
- Lanes skipped: runtime, integration, engine, samples, marketplace moderation, and recovery/UAT because this PR does not change runtime behavior, handoff contracts, engine surfaces, samples, moderation behavior, or recovery behavior.
- Samples decision: SKIP because this PR is limited to contract/docs/test surfaces.
- Playwright impacted: No. This PR is contract/docs/test only and does not change UI or browser runtime behavior.

## Expected PASS Behavior

- Valid Publish contract records are accepted.
- Missing owner, missing project, missing source release, invalid source release, invalid visibility, invalid status, and missing published timestamp are rejected.
- Publish records reject runtime, auth, marketplace moderation, and tool state leakage.
- Publish access remains bound to Project and Identity/Permissions contracts.
- Published Publish records cannot be edited unless policy allows edits.
- Retired Publish records remain historically referenceable.

## Expected WARN Behavior

- No WARN behavior was observed in the targeted validation lane.
