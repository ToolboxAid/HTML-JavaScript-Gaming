# Tool Contract Location Correction Validation

PR: PR_26152_076-tool-contract-location-correction
Date: 2026-06-02

## Scope

- Updated contract ownership/location structure only.
- Touched `src/shared/contracts/`, `tests/shared/`, and required reports.
- No runtime, UI, CSS, HTML, database, or authentication changes were made.

## Location Corrections

- Moved shared tool behavior out of the top-level contracts folder and into `src/shared/contracts/tools/toolContract.js`.
- Kept top-level `src/shared/contracts/` as platform/object contract ownership:
  - `assetContract.js`
  - `identityPermissionsContract.js`
  - `paletteContract.js`
  - `projectContract.js`
  - `replayContracts.js`
  - `sharedStateContracts.js`
  - `toolStateContract.js`
  - `vectorAssetContract.js`
- Kept shared tool behavior under `src/shared/contracts/tools/toolContract.js`.
- Kept per-tool declarations under `src/shared/contracts/tools/*Contract.js`.
- Renamed V2-flavored tool declaration file names to requested tool declaration names while preserving tool IDs:
  - `assetManagerContract.js`
  - `audioSfxPlaygroundContract.js`
  - `collisionInspectorContract.js`
  - `inputMappingContract.js`
  - `midiStudioContract.js`
  - `objectVectorStudioContract.js`
  - `paletteManagerContract.js`
  - `previewGeneratorContract.js`
  - `storageInspectorContract.js`
  - `textToSpeechContract.js`
  - `workspaceManagerContract.js`
  - `worldVectorStudioContract.js`
- Did not create `src/shared/contracts/tools/paletteContract.js`; the platform Palette object contract remains `src/shared/contracts/paletteContract.js`.
- Did not create a standalone `vectorStudioContract.js`; registered vector tools are covered by `objectVectorStudioContract.js` and `worldVectorStudioContract.js`.

## Behavior Ownership

- `src/shared/contracts/tools/toolContract.js` owns shared tool behavior:
  - owner/project/visibility/status/version rules
  - import/export format rules
  - produced output rules
  - supported asset type rules
  - source tool state rules
  - archive/permission behavior
  - portable export behavior
- Per-tool declaration modules own tool-specific data only:
  - `toolId`
  - `toolType`
  - `grouping`
  - `requiredInputs`
  - `producedOutputs`
  - `supportedAssetTypes`
  - `importFormats`
  - `exportFormats`
  - tool-specific metadata

## Validation

Targeted contract tests:

```powershell
$rootContractTests = Get-ChildItem -Path tests/shared -Filter '*Contract.test.mjs' | Sort-Object Name | ForEach-Object { $_.FullName }
$toolContractTests = Get-ChildItem -Path tests/shared/tools -Filter '*.test.mjs' | Sort-Object Name | ForEach-Object { $_.FullName }
node ./scripts/run-node-test-files.mjs $rootContractTests $toolContractTests
```

Result: PASS, `41/41 targeted node test file(s) passed`.

Static checks:

```powershell
git diff --check -- src/shared/contracts tests/shared docs_build/dev/reports/tool_contract_coverage.md docs_build/dev/commit_comment.txt
git diff --name-only -- '*.css' '*.html'
# Targeted rg check for stale top-level tool behavior path and renamed V2 module filename patterns, scoped to source, tests, and the current coverage report.
Get-ChildItem -Path src/shared/contracts -File | Select-Object -ExpandProperty Name | Sort-Object
```

Results:

- PASS: no whitespace errors from `git diff --check`.
- PASS: no CSS or HTML files changed.
- PASS: no stale old tool behavior path or renamed V2 module references remain in source, tests, or the current coverage report.
- PASS: top-level `src/shared/contracts/` contains platform/object contract files only.
- PASS: shared tool behavior lives under `src/shared/contracts/tools/toolContract.js`.
- PASS: every registered visible first-class tool still has matching coverage in `docs_build/dev/reports/tool_contract_coverage.md`.

## Skipped

- Repo-wide tests were not run.
- Samples tests were not run.
- Runtime, UI, CSS, and HTML validation were not run because they are outside this PR scope.
