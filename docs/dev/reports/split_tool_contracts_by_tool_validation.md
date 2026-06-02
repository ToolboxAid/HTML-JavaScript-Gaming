# Split Tool Contracts By Tool Validation

PR: PR_26152_073-split-tool-contracts-by-tool
Date: 2026-06-02

## Scope

- Corrected PR_26152_072 by replacing the single large tool contract bundle with shared primitives plus one contract module per tool/control.
- Added one matching targeted test per tool contract where appropriate.
- Kept shared validation, access, visibility, exportability, and coverage primitives in shared contract files only.
- No database implementation, authentication implementation, UI/page changes, CSS changes, or HTML changes.

## Files Validated

- `src/shared/contracts/toolContractPrimitives.js`
- `src/shared/contracts/tools/*.js`
- `tests/shared/tools/*.mjs`
- `tests/fixtures/tools/tool-contract-scenarios.json`
- Existing compatibility contract tests:
  - `tests/shared/IdentityPermissionsContract.test.mjs`
  - `tests/shared/ProjectContract.test.mjs`
  - `tests/shared/ToolStateContract.test.mjs`
  - `tests/shared/VectorAssetContract.test.mjs`
  - `tests/shared/PaletteContract.test.mjs`
  - `tests/shared/AssetContract.test.mjs`

## Validation Commands

```powershell
node ./scripts/run-node-test-files.mjs tests/shared/tools/ToolContractCoverage.test.mjs tests/shared/tools/WorldVectorStudioV2ToolContract.test.mjs
```

Result: PASS, 2/2 targeted node test files passed.

```powershell
$toolContractTests = Get-ChildItem -Path tests/shared/tools -Filter '*ToolContract.test.mjs' | Sort-Object Name | ForEach-Object { $_.FullName }
node ./scripts/run-node-test-files.mjs $toolContractTests tests/shared/tools/ToolContractCoverage.test.mjs tests/shared/AssetContract.test.mjs tests/shared/PaletteContract.test.mjs tests/shared/VectorAssetContract.test.mjs tests/shared/ToolStateContract.test.mjs tests/shared/ProjectContract.test.mjs tests/shared/IdentityPermissionsContract.test.mjs
```

Result: PASS, 41/41 targeted node test files passed.

```powershell
git diff --check -- src/shared/contracts tests/shared tests/fixtures/tools docs/dev/reports docs/dev/commit_comment.txt
```

Result: PASS, no whitespace or patch errors.

```powershell
rg "toolContractBundle|TOOL_CONTRACT_BUNDLE|ToolContractBundle|tool-contract-bundle" -n src tests
```

Result: PASS, no remaining source/test references.

```powershell
git diff --name-only -- '*.css' '*.html'
```

Result: PASS, no CSS or HTML files changed.

## Contract Coverage Result

- Per-tool contract modules added: 34.
- Per-tool matching tests added: 34.
- Active visible registered first-class tools covered: 23/23.
- Root Tools Index cards reviewed: 18.
- Root Tools Index cards skipped with reason as non-tool surfaces: 2 (`Marketplace`, `Arcade`).
- Shared primitive/access/export/visibility behavior covered by `ToolContractCoverage.test.mjs`.

## Lane Report

- Lanes executed: contract lane for tool contracts and compatibility contract models.
- Lanes skipped: runtime, integration, engine, samples, recovery/UAT because this PR changes only contract modules/tests and does not change runtime, handoff, engine, sample, or UI behavior.
- Samples decision: SKIP because samples are not in scope and no sample JSON/runtime behavior changed.
- Playwright impacted: No. This PR is contract/test structure only and does not change browser UI or runtime behavior.
- Blocker scope: targeted contract lane only.

## Expected PASS/WARN Behavior

- PASS when every per-tool module validates independently, every registered first-class tool has a contract, skipped Tools Index cards are documented, and existing identity/project/tool-state/asset/vector/palette contracts remain compatible.
- WARN only for unrelated historical reports that still describe prior PR_26152_072 artifacts.
