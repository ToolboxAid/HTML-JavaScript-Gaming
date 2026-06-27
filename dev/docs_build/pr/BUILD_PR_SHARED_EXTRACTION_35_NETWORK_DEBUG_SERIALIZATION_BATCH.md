# BUILD_PR_SHARED_EXTRACTION_35_NETWORK_DEBUG_SERIALIZATION_BATCH

## Purpose
Centralize duplicated network debug serialization helpers across the exact network debug batch identified in the duplicate report.

## Single PR Purpose
Normalize ONLY these helpers:

- `asNumber(value, fallback = 0)`
- `toNetworkSnapshot(snapshot)`
- `getCommandSnapshot(context)`
- `commandLinesForTrace(context, args = [])`

## Exact Files Allowed

### New shared source
1. `src/shared/utils/networkDebugUtils.js`

### Consumer files
2. `games/network_sample_a/debug/networkSampleADebug.js`
3. `games/network_sample_b/debug/networkSampleBDebug.js`
4. `games/network_sample_c/debug/networkSampleCDebug.js`

Do not edit any other file.

## Source of Truth
This exact scope comes from the provided duplicate report entries for:
- `function asNumber(value, fallback = 0)`
- `function toNetworkSnapshot(snapshot)`
- `function getCommandSnapshot(context)`
- `function commandLinesForTrace(context, args = [])`

Only the listed network debug files are in scope.

## Exact Shared Helper Creation
Create:

`src/shared/utils/networkDebugUtils.js`

Export exactly these helpers:
- `asNumber`
- `toNetworkSnapshot`
- `getCommandSnapshot`
- `commandLinesForTrace`

Implementation rules:
- Use ONE existing implementation as source-of-truth for each helper
- Do NOT merge logic
- Do NOT generalize behavior
- Preserve function signatures exactly as listed above

Notes:
- `getCommandSnapshot` is present only in `network_sample_a` and `network_sample_c`
- `commandLinesForTrace` is present only in `network_sample_a` and `network_sample_c`
That is expected. Export them from the shared file anyway; only import them in files that currently use them.

## Exact Consumer Changes

### `games/network_sample_a/debug/networkSampleADebug.js`
- remove local definitions for any of the 4 listed helpers that exist in this file
- import the helpers it uses from the correct relative path to:
  - `src/shared/utils/networkDebugUtils.js`
- do not touch unrelated helpers
- do not change logic

### `games/network_sample_b/debug/networkSampleBDebug.js`
- remove local definitions for:
  - `asNumber`
  - `toNetworkSnapshot`
- import the helpers it uses from the correct relative path to:
  - `src/shared/utils/networkDebugUtils.js`
- do not import helpers this file does not use
- do not touch unrelated helpers
- do not change logic

### `games/network_sample_c/debug/networkSampleCDebug.js`
- remove local definitions for any of the 4 listed helpers that exist in this file
- import the helpers it uses from the correct relative path to:
  - `src/shared/utils/networkDebugUtils.js`
- do not touch unrelated helpers
- do not change logic

Import rules:
- if a file already imports from that module, add needed specifiers with the minimum safe edit
- if multiple listed helpers are needed from the same module, a single combined import is allowed
- do not duplicate imports

## Relative Import Rule
Use the correct relative path from each consumer file to:

`src/shared/utils/networkDebugUtils.js`

Do not use aliases.
Do not change `.js` extension usage.

## Hard Constraints
- no engine changes
- no game runtime changes outside the 3 listed debug consumers
- no sample files
- no repo-wide network helper cleanup
- no behavior changes
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 4 listed files changed
2. Confirm `src/shared/utils/networkDebugUtils.js` exists and exports the 4 listed helpers
3. Confirm changed consumer files no longer contain local definitions for the listed helpers they used to own
4. Confirm changed consumer files import only the needed helpers from the correct relative path to `src/shared/utils/networkDebugUtils.js`
5. Confirm no unrelated engine, game runtime, or sample files changed
6. Confirm no behavior changes were made

## Non-Goals
- no cleanup of other network debug helpers beyond the 4 listed above
- no cleanup outside the 3 listed network debug consumer files
- no refactor beyond this exact duplicate-removal batch
