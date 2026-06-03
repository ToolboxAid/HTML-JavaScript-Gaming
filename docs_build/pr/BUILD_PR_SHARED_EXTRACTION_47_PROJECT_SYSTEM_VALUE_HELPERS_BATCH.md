# BUILD_PR_SHARED_EXTRACTION_47_PROJECT_SYSTEM_VALUE_HELPERS_BATCH

## Purpose
Centralize duplicated project-system value helpers across the exact tools/shared batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY these helpers:

- `cloneValue(value)`
- `safeString(value, fallback = "")`

## Exact Files Allowed

### New shared file
1. `tools/shared/projectSystemValueUtils.js`

### Consumer files
2. `tools/shared/projectManifestContract.js`
3. `tools/shared/projectSystem.js`
4. `tools/shared/projectSystemAdapters.js`

Do not edit any other file.

## Source of Truth
This exact scope comes from the provided duplicate report entries for:
- `function cloneValue(value)`
- `function safeString(value, fallback = "")`

Only the 3 listed consumer files are in scope.

## Exact Shared Helper Creation
Create:

`tools/shared/projectSystemValueUtils.js`

Export exactly:
- `cloneValue`
- `safeString`

Implementation rules:
- use ONE existing local implementation as source-of-truth for each helper
- do NOT merge logic
- do NOT generalize behavior
- preserve signatures exactly:
  - `cloneValue(value)`
  - `safeString(value, fallback = "")`

## Exact Consumer Changes
For each of the 3 listed consumer files:

If the file contains local function definitions matching:
```js
function cloneValue(value)
function safeString(value, fallback = "")
```
then:
- remove the local function definition(s)
- import the helper(s) from the correct relative path to:
  - `./projectSystemValueUtils.js`
- if the file already imports from that module, add the needed helper(s) with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared versions, leave it unchanged.

## Relative Import Rule
Use exactly:

`./projectSystemValueUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no files outside the 3 listed consumers plus the one new shared file
- no repo-wide project-system cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 4 listed files changed
2. Confirm `tools/shared/projectSystemValueUtils.js` exists and exports:
   - `cloneValue`
   - `safeString`
3. Confirm local function definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import the helpers from `./projectSystemValueUtils.js`
5. Confirm no unrelated files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup outside the 3 listed consumer files
- no refactor beyond this exact duplicate-removal batch
