# BUILD_PR_SHARED_EXTRACTION_42_CREATE_RESULT_COMMANDPACK_BATCH

## Purpose
Centralize duplicated `createResult(status, title, lines, code, details = {})` implementations across the exact command-pack batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY this helper:

- `createResult(status, title, lines, code, details = {})`

## Exact Files Allowed

### New shared file
1. `tools/dev/commandPacks/commandPackResultUtils.js`

### Consumer files
2. `tools/dev/commandPacks/groupCommandPack.js`
3. `tools/dev/commandPacks/macroCommandPack.js`
4. `tools/dev/commandPacks/toggleCommandPack.js`

Do not edit any other file.

## Source of Truth
This exact scope comes from the provided duplicate report entry for:

`function createResult(status, title, lines, code, details = {})`

Only the 3 listed consumer files are in scope.

## Exact Shared Helper Creation
Create:

`tools/dev/commandPacks/commandPackResultUtils.js`

Export exactly:

```js
export function createResult(status, title, lines, code, details = {}) {
  // copy one existing implementation exactly
}
```

Implementation rules:
- use ONE existing local implementation as source-of-truth
- do NOT merge logic
- do NOT generalize behavior
- preserve the function signature exactly:
  - `createResult(status, title, lines, code, details = {})`

## Exact Consumer Changes
For each of the 3 listed consumer files:

If the file contains a local function definition matching:
```js
function createResult(status, title, lines, code, details = {})
```
then:
- remove the local `createResult(...)` function definition
- import `createResult` from the correct relative path to:
  - `./commandPackResultUtils.js`
- if the file already imports from that module, add `createResult` with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared `createResult`, leave it unchanged.

## Relative Import Rule
Use exactly:

`./commandPackResultUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no engine changes
- no files outside the 3 listed consumers plus the one new shared file
- no repo-wide command-pack helper cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 4 listed files changed
2. Confirm `tools/dev/commandPacks/commandPackResultUtils.js` exists and exports `createResult`
3. Confirm local `function createResult(...)` definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import `createResult` from `./commandPackResultUtils.js`
5. Confirm no unrelated files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup of `toResult`
- no cleanup outside the 3 listed consumer files
- no refactor beyond this exact duplicate-removal batch
