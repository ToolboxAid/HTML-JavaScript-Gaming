# BUILD_PR_SHARED_EXTRACTION_45_READ_HOST_STATUS_SNAPSHOT_BATCH

## Purpose
Centralize duplicated dashboard/inspector host reader helpers across the exact engine batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY these helpers:

- `readHostStatus(host)`
- `readHostSnapshot(host)`

## Exact Files Allowed

### New shared file
1. `src/engine/debug/network/shared/hostReadUtils.js`

### Consumer files
2. `src/engine/debug/inspectors/commands/registerInspectorCommands.js`
3. `src/engine/debug/network/dashboard/registerDashboardCommands.js`

Do not edit any other file.

## Source of Truth
This exact scope comes from the provided duplicate report entries for:
- `function readHostStatus(host)`
- `function readHostSnapshot(host)`

Only the 2 listed consumer files are in scope.

## Exact Shared Helper Creation
Create:

`src/engine/debug/network/shared/hostReadUtils.js`

Export exactly:
- `readHostStatus`
- `readHostSnapshot`

Implementation rules:
- use ONE existing local implementation as source-of-truth for each helper
- do NOT merge logic
- do NOT generalize behavior
- preserve signatures exactly:
  - `readHostStatus(host)`
  - `readHostSnapshot(host)`

## Exact Consumer Changes
For each of the 2 listed consumer files:

If the file contains local function definitions matching:
```js
function readHostStatus(host)
function readHostSnapshot(host)
```
then:
- remove the local function definition(s)
- import the helper(s) from the correct relative path to:
  - `src/engine/debug/network/shared/hostReadUtils.js`
- if the file already imports from that module, add the needed helper(s) with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared versions, leave it unchanged.

## Relative Import Rule
Use the correct relative path from each consumer file to:

`src/engine/debug/network/shared/hostReadUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no files outside the 2 listed consumers plus the one new shared file
- no repo-wide dashboard/inspector cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 3 listed files changed
2. Confirm `src/engine/debug/network/shared/hostReadUtils.js` exists and exports:
   - `readHostStatus`
   - `readHostSnapshot`
3. Confirm local function definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import the helpers from the correct relative path to `src/engine/debug/network/shared/hostReadUtils.js`
5. Confirm no unrelated files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup of other dashboard or inspector helpers
- no cleanup outside the 2 listed consumer files
- no refactor beyond this exact duplicate-removal batch
