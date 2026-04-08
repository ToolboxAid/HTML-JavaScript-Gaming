# BUILD_PR_SHARED_EXTRACTION_40_CLONE_SNAPSHOT_NETWORK_SAMPLE_C_BATCH

## Purpose
Centralize duplicated `cloneSnapshot(snapshot)` implementations across the exact network_sample_c batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY this helper:

- `cloneSnapshot(snapshot)`

## Exact Files Allowed

### New shared file
1. `src/shared/utils/snapshotCloneUtils.js`

### Consumer files
2. `games/network_sample_c/game/ReconciliationLayerAdapter.js`
3. `games/network_sample_c/game/StateTimelineBuffer.js`

Do not edit any other file.

## Source of Truth
This exact scope comes from the provided duplicate report entry for:

`function cloneSnapshot(snapshot)`

Only the 2 listed consumer files are in scope.

## Exact Shared Helper Creation
Create:

`src/shared/utils/snapshotCloneUtils.js`

Export exactly:

```js
export function cloneSnapshot(snapshot) {
  // copy one existing implementation exactly
}
```

Implementation rules:
- use ONE existing local implementation as source-of-truth
- do NOT merge logic
- do NOT generalize behavior
- preserve the function signature exactly:
  - `cloneSnapshot(snapshot)`

## Exact Consumer Changes
For each of the 2 listed consumer files:

If the file contains a local function definition matching:
```js
function cloneSnapshot(snapshot)
```
then:
- remove the local `cloneSnapshot(snapshot)` function definition
- import `cloneSnapshot` from the correct relative path to:
  - `src/shared/utils/snapshotCloneUtils.js`
- if the file already imports from that module, add `cloneSnapshot` with the minimum safe edit
- do not duplicate imports
- do not touch unrelated helpers
- do not change logic

If a listed file already imports and uses shared `cloneSnapshot`, leave it unchanged.

## Relative Import Rule
Use the correct relative path from each consumer file to:

`src/shared/utils/snapshotCloneUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no engine changes
- no game files outside the 2 listed consumers
- no sample files
- no repo-wide snapshot/deep-clone cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 3 listed files changed
2. Confirm `src/shared/utils/snapshotCloneUtils.js` exists and exports `cloneSnapshot`
3. Confirm local `function cloneSnapshot(snapshot)` definitions no longer exist in changed listed consumer files
4. Confirm changed consumer files import `cloneSnapshot` from the correct relative path to `src/shared/utils/snapshotCloneUtils.js`
5. Confirm no unrelated engine, game, or sample files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup of `clone(value)`
- no cleanup of `cloneJson(value)`
- no cleanup outside the 2 listed consumer files
- no refactor beyond this exact duplicate-removal batch
