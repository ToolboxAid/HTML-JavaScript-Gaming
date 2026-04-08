# BUILD_PR_SHARED_EXTRACTION_48_RUNTIME_ASSET_VALIDATION_BATCH

## Purpose
Centralize duplicated runtime asset validation/registry helpers across the exact tools/shared batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY these helpers:

- `validatePackageManifest(manifest)`
- `createRegistryDefinition(asset, source)`

## Exact Files Allowed

### New shared file
1. `tools/shared/runtimeAssetValidationUtils.js`

### Consumer files
2. `tools/shared/runtimeAssetLoader.js`
3. `tools/shared/runtimeStreaming.js`

Do not edit any other file.

## Source of Truth
This exact scope comes from the provided duplicate report entries for:
- `function validatePackageManifest(manifest)`
- `function createRegistryDefinition(asset, source)`

Only the 2 listed consumer files are in scope.

## Exact Shared Helper Creation
Create:

`tools/shared/runtimeAssetValidationUtils.js`

Export exactly:
- `validatePackageManifest`
- `createRegistryDefinition`

Implementation rules:
- use ONE existing local implementation as source-of-truth for each helper
- do NOT merge logic
- do NOT generalize behavior
- preserve signatures exactly:
  - `validatePackageManifest(manifest)`
  - `createRegistryDefinition(asset, source)`

## Exact Consumer Changes
For each of the 2 listed consumer files:

If the file contains local function definitions matching:
```js
function validatePackageManifest(manifest)
function createRegistryDefinition(asset, source)
```
then:
- remove the local function definition(s)
- import the helper(s) from the correct relative path to:
  - `./runtimeAssetValidationUtils.js`
- if the file already imports from that module, add the needed helper(s) with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared versions, leave it unchanged.

## Relative Import Rule
Use exactly:

`./runtimeAssetValidationUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no files outside the 2 listed consumers plus the one new shared file
- no repo-wide runtime-asset cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 3 listed files changed
2. Confirm `tools/shared/runtimeAssetValidationUtils.js` exists and exports:
   - `validatePackageManifest`
   - `createRegistryDefinition`
3. Confirm local function definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import the helpers from `./runtimeAssetValidationUtils.js`
5. Confirm no unrelated files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup outside the 2 listed consumer files
- no refactor beyond this exact duplicate-removal batch
