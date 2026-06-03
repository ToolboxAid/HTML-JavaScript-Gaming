# Unified Tool Contract Behavior Validation

PR: PR_26152_075-unify-tool-contract-behavior
Date: 2026-06-02

## Scope

- Limited changes to shared contracts, per-tool contract declarations, contract tests, and reports.
- No runtime code, UI, CSS, HTML, samples, games, or non-contract tool files changed.
- Corrected the shared behavior surface to `src/shared/contracts/toolContract.js`.
- Kept per-tool declarations split under `src/shared/contracts/tools/`.

## Structure

| Required Area | Implemented Surface | Status |
|---|---|---|
| `contracts/toolContract.*` shared tool behavior | `src/shared/contracts/toolContract.js` | PASS |
| `contracts/tools/<toolName>Contract.*` declarations | `src/shared/contracts/tools/*Contract.js` | PASS |
| Platform object contracts | `identityPermissionsContract.js`, `projectContract.js`, `toolStateContract.js`, `assetContract.js`, `paletteContract.js`, `vectorAssetContract.js` | PASS |
| Tool behavior tests | `tests/shared/tools/ToolContractCoverage.test.mjs` | PASS |
| Per-tool declaration tests | `tests/shared/tools/*ToolContract.test.mjs` through `toolContractTestHelpers.mjs` | PASS |

## Behavior Model

`src/shared/contracts/toolContract.js` owns the shared behavior model:

- owner and project defaults
- visibility, status, and version rules
- import/export format rules
- produced output rules
- supported asset type rules
- source tool state rules
- archive edit policy checks
- actor visibility and permission checks
- portable export validation

`src/shared/contracts/tools/*Contract.js` owns only tool-specific declarations:

- `toolId`
- `toolType`
- `requiredInputs`
- `producedOutputs`
- `supportedAssetTypes`
- `importFormats`
- `exportFormats`
- tool-specific metadata only

## Naming Cleanup

- Renamed shared behavior file from `toolContractPrimitives.js` to `toolContract.js`.
- Renamed per-tool declaration files from `*ToolContract.js` to `*Contract.js`.
- No `src/shared/contracts/tools/paletteContract.*` file exists.
- The platform Palette object contract remains `src/shared/contracts/paletteContract.js`.
- The Palette Manager tool declaration is `src/shared/contracts/tools/paletteManagerV2Contract.js`.
- No object contract was duplicated under `src/shared/contracts/tools/`.

## Test Model

- Shared behavior is validated once through `ToolContractCoverage.test.mjs`.
- Per-tool tests now validate declaration identity and declaration shape only.
- Ownership, project, visibility, permission, archive, and portable export behavior are not duplicated in every per-tool test.

## Validation Commands

```powershell
$rootContractTests = Get-ChildItem -Path tests/shared -Filter '*Contract.test.mjs' | Sort-Object Name | ForEach-Object { $_.FullName }
$toolContractTests = Get-ChildItem -Path tests/shared/tools -Filter '*.test.mjs' | Sort-Object Name | ForEach-Object { $_.FullName }
node ./scripts/run-node-test-files.mjs $rootContractTests $toolContractTests
```

Result: PASS, 41/41 targeted node test files passed.

## Additional Checks

```powershell
rg "toolContractPrimitives|ToolContract\.js|ToolContract.js|supportedAssetTypes: \[\]|TOOL_CONTRACT_STATUS\.DRAFT|Object\.values\(ASSET_TYPES\)" -n src/shared/contracts tests/shared docs_build/dev/reports
```

Result: PASS for source/test scope. Historical reports may mention older PR filenames, but current required reports reference the unified structure.

```powershell
git diff --name-only -- '*.css' '*.html'
```

Result: PASS, no CSS or HTML files changed.

## Coverage

- Active visible registered first-class tools covered: 23/23.
- Tool declarations covered: 34/34.
- Matching per-tool declaration tests retained: 34/34.
- Root Tools Index cards reviewed: 18.
- Non-tool Tools Index cards documented as skipped: 2 (`Marketplace`, `Arcade`).

## Lane Report

- Lanes executed: contract lane for shared tool behavior, platform object separation, and per-tool declarations.
- Lanes skipped: runtime, integration, engine, samples, recovery/UAT because no runtime, handoff, engine, sample, UI, CSS, or HTML behavior changed.
- Samples decision: SKIP because samples are out of scope and no sample JSON/runtime behavior changed.
- Playwright impacted: No. This PR changes contract module naming/structure and tests only.
- Blocker scope: targeted contract lane only.

## Expected Behavior

- PASS when the shared behavior model validates all tool contracts once, per-tool declaration tests remain present, and registered tool coverage remains complete.
- WARN only for historical PR reports that describe earlier filenames from PR_26152_073 or PR_26152_074.
