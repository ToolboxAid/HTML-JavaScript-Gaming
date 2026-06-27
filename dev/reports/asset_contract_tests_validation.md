# Asset Contract Tests Validation

PR: PR_26152_071-asset-contract-tests
Date: 2026-06-02

## Scope

- Added reusable generic Asset contract data under `src/shared/contracts/assetContract.js`.
- Added Asset fixtures under `tests/fixtures/assets/asset-scenarios.json`.
- Added targeted contract tests under `tests/shared/AssetContract.test.mjs`.
- No database implementation was added.
- No authentication implementation was added.
- No UI/page/runtime behavior was changed.
- No CSS or HTML files were changed.
- No dependencies were added.

## Contract Coverage

Targeted tests prove:

- asset records require owner
- asset records require project
- asset type must be valid
- asset records may link to source tool state
- visibility rules are enforced
- exported assets remain portable
- archived assets are immutable unless policy allows edits
- version must be valid
- asset metadata must be valid for the asset type

The generic Asset contract defines:

- `assetId`
- `assetType`
- `ownerId`
- `projectId`
- `sourceToolState`
- `visibility`
- `version`
- `status`
- `metadata`
- `exportFormats`

Supported first-pass asset types:

- `vector`
- `palette`
- `image`
- `audio`
- `tilemap`
- `localization`

## Validation Lanes

- lanes executed: contract - Asset contract tests plus existing Palette, Vector Asset, Tool State, Project, and Identity/Permissions contract tests were required by the PR.
- lanes skipped: runtime, integration, engine, recovery/UAT - no runtime, handoff, engine, or recovery behavior changed.
- samples decision: SKIP because samples were explicitly out of scope and no sample contracts or runtime paths changed.
- Playwright impacted: No. This PR changes contract data and targeted Node tests only.
- blocker scope: targeted contract lane only.

## Commands

```powershell
node ./scripts/run-node-test-files.mjs tests/shared/AssetContract.test.mjs tests/shared/PaletteContract.test.mjs tests/shared/VectorAssetContract.test.mjs tests/shared/ToolStateContract.test.mjs tests/shared/ProjectContract.test.mjs tests/shared/IdentityPermissionsContract.test.mjs
```

Result: PASS

```text
PASS tests/shared/AssetContract.test.mjs
PASS tests/shared/PaletteContract.test.mjs
PASS tests/shared/VectorAssetContract.test.mjs
PASS tests/shared/ToolStateContract.test.mjs
PASS tests/shared/ProjectContract.test.mjs
PASS tests/shared/IdentityPermissionsContract.test.mjs

6/6 targeted node test file(s) passed.
```

```powershell
git diff --check -- src/shared/contracts/assetContract.js tests/shared/AssetContract.test.mjs tests/fixtures/assets/asset-scenarios.json
```

Result: PASS with no output.

## Expected PASS Behavior

- Valid asset fixtures pass without errors across vector, palette, image, audio, tilemap, and localization types.
- Invalid asset fixtures return the exact expected contract error codes.
- Owner/project/type/visibility/version/export format requirements are enforced.
- Source tool state links are allowed when they identify tool state, tool type, and matching project.
- Type-specific metadata is enforced for vector, palette, image, audio, tilemap, and localization assets.
- File-like metadata uses `filePath`; no database, runtime, or data URL persistence was introduced.
- Private assets deny ungranted viewers and allow granted project viewers.
- Collaborators can edit granted active project assets.
- Viewers cannot edit assets.
- Marketplace assets are visible.
- Archived assets reject edits unless policy explicitly allows archived edits.
- Portable asset exports preserve portable fields and remove owner/project/database identifiers.

## Expected WARN Behavior

- No WARN findings for the targeted contract lane.
- Repo-wide, samples, UI, CSS, HTML, database, and authentication validation were intentionally not run because they are outside this PR scope.
