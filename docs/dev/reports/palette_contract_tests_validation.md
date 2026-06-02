# Palette Contract Tests Validation

PR: PR_26152_070-palette-contract-tests
Date: 2026-06-02

## Scope

- Added reusable Palette contract data under `src/shared/contracts/paletteContract.js`.
- Added Palette fixtures under `tests/fixtures/palettes/palette-scenarios.json`.
- Added targeted contract tests under `tests/shared/PaletteContract.test.mjs`.
- No database implementation was added.
- No authentication implementation was added.
- No UI/page/runtime behavior was changed.
- No CSS or HTML files were changed.
- No dependencies were added.

## Contract Coverage

Targeted tests prove:

- palette records require owner
- palette records require project
- palette records require valid swatches
- palette records may link to source tool state
- visibility rules are enforced
- exported palettes remain portable
- archived palettes are immutable unless policy allows edits
- version must be valid

The Palette contract defines:

- `paletteId`
- `ownerId`
- `projectId`
- `sourceToolState`
- `visibility`
- `version`
- `status`
- `swatches`
- `exportFormats`

## Validation Lanes

- lanes executed: contract - Palette contract tests plus existing Vector Asset, Tool State, Project, and Identity/Permissions contract tests were required by the PR.
- lanes skipped: runtime, integration, engine, recovery/UAT - no runtime, handoff, engine, or recovery behavior changed.
- samples decision: SKIP because samples were explicitly out of scope and no sample contracts or runtime paths changed.
- Playwright impacted: No. This PR changes contract data and targeted Node tests only.
- blocker scope: targeted contract lane only.

## Commands

```powershell
node ./scripts/run-node-test-files.mjs tests/shared/PaletteContract.test.mjs tests/shared/VectorAssetContract.test.mjs tests/shared/ToolStateContract.test.mjs tests/shared/ProjectContract.test.mjs tests/shared/IdentityPermissionsContract.test.mjs
```

Result: PASS

```text
PASS tests/shared/PaletteContract.test.mjs
PASS tests/shared/VectorAssetContract.test.mjs
PASS tests/shared/ToolStateContract.test.mjs
PASS tests/shared/ProjectContract.test.mjs
PASS tests/shared/IdentityPermissionsContract.test.mjs

5/5 targeted node test file(s) passed.
```

```powershell
git diff --check -- src/shared/contracts/paletteContract.js tests/shared/PaletteContract.test.mjs tests/fixtures/palettes/palette-scenarios.json
```

Result: PASS with no output.

## Expected PASS Behavior

- Valid palette fixtures pass without errors.
- Invalid palette fixtures return the exact expected contract error codes.
- Owner/project/visibility/version/export format requirements are enforced.
- Swatches are required as an array, and provided swatches require valid `hex` and `name` fields.
- Empty swatch arrays remain valid for current Workspace palette baseline compatibility.
- Source tool state links are allowed when they identify tool state, tool type, and matching project.
- Private palettes deny ungranted viewers and allow granted project viewers.
- Collaborators can edit granted active project palettes.
- Viewers cannot edit palettes.
- Marketplace palettes are visible.
- Archived palettes reject edits unless policy explicitly allows archived edits.
- Portable palette exports preserve portable fields and remove owner/project/database identifiers.

## Expected WARN Behavior

- No WARN findings for the targeted contract lane.
- Repo-wide, samples, UI, CSS, HTML, database, and authentication validation were intentionally not run because they are outside this PR scope.
