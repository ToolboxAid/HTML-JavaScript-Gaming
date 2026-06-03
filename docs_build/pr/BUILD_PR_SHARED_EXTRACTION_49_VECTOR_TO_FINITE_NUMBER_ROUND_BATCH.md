# BUILD_PR_SHARED_EXTRACTION_49_VECTOR_TO_FINITE_NUMBER_ROUND_BATCH

## Purpose
Centralize the exact duplicated numeric helpers in the vector lane so the consumer stops carrying local copies and uses the shared implementation instead.

## Single PR Purpose
Normalize ONLY these helpers:
- `toFiniteNumber(value, fallback = NaN)`
- `roundNumber(value)`

## Exact Files Allowed
1. `tools/shared/vector/vectorGeometryMath.js`
2. `tools/shared/vector/vectorAssetContract.js`

Do not edit any other file.

## Required Starting Check
Open both listed files first.

Fail fast and stop with no code edits if any of the following is true:
- either listed file does not exist
- `tools/shared/vector/vectorAssetContract.js` does not contain local definitions and also does not need these imports
- the shared file already exports the exact helpers and the consumer already imports and uses them correctly
- completing the batch would require touching any file outside the exact 2-file list

## Shared Source Rule
`tools/shared/vector/vectorGeometryMath.js` is the only allowed shared source for this batch.

Allowed shared-file edits are limited to exactly one of these cases:
1. **Export-only fix**: the helper implementation already exists in the file, but the helper is not exported correctly.
2. **Missing-helper add**: copy only the missing helper implementation(s) from `tools/shared/vector/vectorAssetContract.js` into `tools/shared/vector/vectorGeometryMath.js` with no behavior change.

Do not rewrite existing math helpers.
Do not reorder unrelated exports.
Do not perform cleanup outside these two helpers.

## Consumer Replacement Rule
For `tools/shared/vector/vectorAssetContract.js`:
- remove only the local definitions of:
  - `toFiniteNumber(value, fallback = NaN)`
  - `roundNumber(value)`
- import the shared helper(s) from:
  - `./vectorGeometryMath.js`
- if an import from `./vectorGeometryMath.js` already exists, extend that import with the minimum safe edit
- do not create duplicate import lines
- do not touch unrelated local helpers
- do not change call sites except as required to use the imported helpers

## Dead-Code Prevention Rule
This BUILD is valid only if at least one concrete consumer replacement occurs in:
- `tools/shared/vector/vectorAssetContract.js`

Do not add or export a shared helper unless the consumer file in this same PR is switched away from its local duplicate.

## Relative Import Rule
Use exactly:
- `./vectorGeometryMath.js`

Do not change path style.
Do not change extension style.
Do not introduce aliases.

## Hard Constraints
- no files outside the exact 2-file list
- no wildcard scope
- no repo-wide vector cleanup
- no behavior changes
- no renames
- no formatting-only pass
- keep one PR purpose only

## Validation Checklist
1. Confirm only these 2 files changed:
   - `tools/shared/vector/vectorGeometryMath.js`
   - `tools/shared/vector/vectorAssetContract.js`
2. Confirm `tools/shared/vector/vectorGeometryMath.js` exports:
   - `toFiniteNumber`
   - `roundNumber`
3. Confirm `tools/shared/vector/vectorAssetContract.js` no longer contains local definitions for those helpers
4. Confirm `tools/shared/vector/vectorAssetContract.js` imports the helpers from `./vectorGeometryMath.js`
5. Confirm at least one real consumer replacement occurred in `tools/shared/vector/vectorAssetContract.js`
6. Confirm no unrelated helpers or files changed
7. Confirm no behavior changes were introduced

## Non-Goals
- no cleanup outside this exact duplicate-removal batch
- no additional vector helper extraction
- no import normalization beyond this exact consumer replacement
- no follow-on dedupe work
