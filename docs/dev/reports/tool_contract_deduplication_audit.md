# Tool Contract Deduplication Audit

PR: PR_26152_074-tool-contract-deduplication-audit
Date: 2026-06-02

## Scope

- Audited current contract structure after PR_26152_073 split tool contracts by tool.
- Limited changes to `src/shared/contracts/`, `src/shared/contracts/tools/`, contract tests validation, and reports.
- No runtime code, UI, CSS, HTML, or non-contract JavaScript changed.
- Per-tool contract files remain split and were not merged into one file.

## Structure Reviewed

| Area | Result |
|---|---|
| `identityPermissionsContract.js` | Identity roles, permissions, scopes, and visibility states remain shared primitives. |
| `projectContract.js` | Project roles, visibility, access rules, and state validation remain shared primitives. |
| `toolStateContract.js` | Tool State ownership, visibility, status, versioning, recovery, and exportability remain shared primitives. |
| `assetContract.js` | Generic asset ownership, status, visibility, metadata, type, and export behavior remain shared primitives. |
| `paletteContract.js` | Palette-specific swatch validation and portable export behavior remain shared primitives. |
| `vectorAssetContract.js` | Vector asset validation and portable export behavior remain shared primitives. |
| `toolContractPrimitives.js` | Owns tool contract defaults, validation, ownership, visibility, access, export/import format validation, and shared asset-type/status declaration helpers. |
| `contracts/tools/*.js` | Remain per-tool declarations only, with unique tool inputs/outputs/type/assets/import/export data. |

## Duplication Findings

| Category | Before | After | Action |
|---|---:|---:|---|
| Per-tool contract files | 34 | 34 | Preserved split per-tool modules. |
| Matching per-tool tests | 34 | 34 | Preserved tool-by-tool coverage. |
| `supportedAssetTypes: []` duplicated in tool files | 13 | 0 | Replaced with `TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE`. |
| `Object.values(ASSET_TYPES)` duplicated in tool files | 5 | 0 | Replaced with `TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.ALL`. |
| `status: TOOL_CONTRACT_STATUS.DRAFT` duplicated in tool files | 11 | 0 | Replaced with `createDraftToolContract(...)`. |
| Duplicated ownership rules in tool files | 0 | 0 | Ownership remains in `createToolContract`. |
| Duplicated visibility rules in tool files | 0 | 0 | Visibility/access remains in `toolContractPrimitives.js`. |
| Duplicated validation logic in tool files | 0 | 0 | Validation remains in `validateToolContract` and shared test helper. |
| Duplicated portable export/import validation | 0 | 0 | Portable export/import validation remains in `toolContractPrimitives.js`. |

## Per-Tool Audit

| Tool Contract Group | Unique Tool Data | Deduplicated Data | Validation/Ownership/Visibility |
|---|---|---|---|
| Active registered tools | `toolId`, `toolType`, inputs, outputs, asset types, import/export formats | Empty/all supported asset declarations where applicable | Shared through `toolContractPrimitives.js`. |
| Root Tools Index planning contracts | `toolId`, `toolType`, inputs, outputs, asset types, import/export formats | Draft status, empty/all supported asset declarations where applicable | Shared through `toolContractPrimitives.js`. |
| Tool contract index | Contract aggregation and root-card coverage mapping | No validation logic added | Lookup and coverage only; per-tool declarations stay split. |
| Per-tool tests | Expected tool id per module | Repeated assertions remain in `toolContractTestHelpers.mjs` | Matching one test per tool preserved. |

## Shared Primitive Ownership Summary

`src/shared/contracts/toolContractPrimitives.js` now owns:

- default tool contract owner/project identifiers
- default visibility/status/version behavior
- `createToolContract`
- `createDraftToolContract`
- `TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.ALL`
- `TOOL_CONTRACT_SUPPORTED_ASSET_TYPES.NONE`
- tool type/status/visibility/format validators
- source tool state validation
- actor visibility/access checks
- archived edit policy checks
- portable tool contract export creation and validation

Per-tool contract modules own only the data that distinguishes that tool:

- `toolId`
- `toolType`
- `requiredInputs`
- `producedOutputs`
- `supportedAssetTypes`
- `importFormats`
- `exportFormats`

## Behavior Invariance

- No tool contract was removed.
- No tool contract id changed.
- No per-tool coverage test was removed.
- No validation, ownership, visibility, access, status, import, or export rule changed.
- All changed contract outputs remain covered by the same targeted contract test suite.

## Validation

```powershell
$rootContractTests = Get-ChildItem -Path tests/shared -Filter '*Contract.test.mjs' | Sort-Object Name | ForEach-Object { $_.FullName }
$toolContractTests = Get-ChildItem -Path tests/shared/tools -Filter '*.test.mjs' | Sort-Object Name | ForEach-Object { $_.FullName }
node ./scripts/run-node-test-files.mjs $rootContractTests $toolContractTests
```

Result: PASS, 41/41 targeted node test files passed.

## Lane Report

- Lanes executed: contract lane for shared contracts and tool contract declarations.
- Lanes skipped: runtime, integration, engine, samples, recovery/UAT because this PR changes only contract declarations/primitives and reports.
- Samples decision: SKIP because samples are out of scope and no sample JSON or runtime behavior changed.
- Playwright impacted: No. This PR changes contract primitives/declarations only and does not change browser UI or runtime behavior.
- Blocker scope: targeted contract lane only.

## Manual Validation

- Confirm `src/shared/contracts/tools/` still contains one contract module per tool/control.
- Confirm `tests/shared/tools/` still contains one matching test per tool/control plus shared coverage/helper tests.
- Confirm no runtime, UI, CSS, HTML, samples, games, or non-contract tool files changed.
