# Tool Contract Bundle Tests Validation

PR: PR_26152_072-tool-contract-bundle-tests
Date: 2026-06-02

## Scope

- Added reusable Tool Contract Bundle data under `src/shared/contracts/toolContractBundle.js`.
- Added Tool Contract Bundle fixtures under `tests/fixtures/tools/tool-contract-bundle-scenarios.json`.
- Added targeted contract tests under `tests/shared/ToolContractBundle.test.mjs`.
- Added coverage report under `docs_build/dev/reports/tool_contract_coverage.md`.
- No database implementation was added.
- No authentication implementation was added.
- No UI/page/tool runtime behavior was changed.
- No CSS or HTML files were changed.
- No dependencies were added.

## Contract Coverage

Targeted tests prove:

- every tool contract requires owner
- every saved tool contract requires project
- every tool contract has valid tool type
- every tool contract has valid import/export formats
- every tool contract declares produced outputs
- every tool contract declares supported asset types when applicable
- saved tool state links back to the tool contract
- visibility rules are enforced
- archived tool outputs are immutable unless policy allows edits
- tool exports remain portable
- every registered Tools Index first-class tool has a matching contract or documented skip

The shared Tool contract defines:

- `toolId`
- `toolType`
- `ownerId`
- `projectId`
- `visibility`
- `requiredInputs`
- `producedOutputs`
- `sourceToolState`
- `supportedAssetTypes`
- `importFormats`
- `exportFormats`
- `status`
- `version`

## Validation Lanes

- lanes executed: contract - Tool Contract Bundle tests plus existing Asset, Palette, Vector Asset, Tool State, Project, and Identity/Permissions contract tests were required by the PR.
- lanes skipped: runtime, integration, engine, recovery/UAT - no runtime, handoff, engine, or recovery behavior changed.
- samples decision: SKIP because samples were explicitly out of scope and no sample contracts or runtime paths changed.
- Playwright impacted: No. This PR changes contract data and targeted Node tests only.
- blocker scope: targeted contract lane only.

## Commands

```powershell
node ./scripts/run-node-test-files.mjs tests/shared/ToolContractBundle.test.mjs tests/shared/AssetContract.test.mjs tests/shared/PaletteContract.test.mjs tests/shared/VectorAssetContract.test.mjs tests/shared/ToolStateContract.test.mjs tests/shared/ProjectContract.test.mjs tests/shared/IdentityPermissionsContract.test.mjs
```

Result: PASS

```text
PASS tests/shared/ToolContractBundle.test.mjs
PASS tests/shared/AssetContract.test.mjs
PASS tests/shared/PaletteContract.test.mjs
PASS tests/shared/VectorAssetContract.test.mjs
PASS tests/shared/ToolStateContract.test.mjs
PASS tests/shared/ProjectContract.test.mjs
PASS tests/shared/IdentityPermissionsContract.test.mjs

7/7 targeted node test file(s) passed.
```

```powershell
git diff --check -- src/shared/contracts/toolContractBundle.js tests/shared/ToolContractBundle.test.mjs tests/fixtures/tools/tool-contract-bundle-scenarios.json
```

Result: PASS with no output.

```powershell
node --input-type=module - <tool-contract-coverage-readback>
```

Result: PASS

- Active visible registered first-class tools discovered: 23
- Tool contracts defined: 34
- Registered first-class tools without contract: 0
- Root Tools Index cards reviewed: 18
- Root Tools Index cards skipped as non-tool surfaces: 2

## Expected PASS Behavior

- All active visible registered first-class tools have matching contracts.
- Root Tools Index card entries are contracted, mapped, or documented as skipped.
- Valid tool contracts pass without errors.
- Invalid tool contract fixtures return the exact expected contract error codes.
- Saved tool contracts require owner and project.
- Produced outputs are required.
- Import/export formats and supported asset types use approved values.
- Tool state payloads link back to their owning tool contract by `toolType`.
- Private tool contracts deny ungranted viewers and allow granted project viewers.
- Collaborators can edit granted active project tool contracts.
- Viewers cannot edit tool contracts.
- Marketplace tool contracts are visible.
- Archived tool outputs reject edits unless policy explicitly allows archived output edits.
- Portable tool contract exports preserve portable fields and remove owner/project/database identifiers.

## Expected WARN Behavior

- Root Marketplace and Arcade cards are documented as skipped because they target non-tool surfaces.
- Repo-wide, samples, UI, CSS, HTML, database, authentication, and tool runtime validation were intentionally not run because they are outside this PR scope.
