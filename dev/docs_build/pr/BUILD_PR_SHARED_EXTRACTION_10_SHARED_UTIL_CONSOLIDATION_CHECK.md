# BUILD_PR_SHARED_EXTRACTION_10_SHARED_UTIL_CONSOLIDATION_CHECK

## Purpose
Validate and enforce consistency inside the existing shared utility files only.

## Single PR Purpose
Consolidate duplicate helper definitions and export consistency ONLY inside:

- `src/shared/utils/numberUtils.js`
- `src/shared/utils/objectUtils.js`

Do not touch any consumer file.

## Exact Files Allowed
Edit only these 2 files:

1. `src/shared/utils/numberUtils.js`
2. `src/shared/utils/objectUtils.js`

Do not edit any other file.

## Exact Allowed Actions

### In `src/shared/utils/numberUtils.js`
Allowed:
- confirm `asFiniteNumber` is exported exactly once
- confirm `asPositiveInteger` is exported exactly once
- if duplicate definitions of either helper exist within this same file, remove duplicates and keep one canonical implementation
- if both named exports and bottom export lists are present, make the minimum change needed so each helper is exported exactly once

Not allowed:
- no renaming
- no behavior changes
- no new helper additions
- no consumer/import updates

### In `src/shared/utils/objectUtils.js`
Allowed:
- confirm `isPlainObject` is exported exactly once
- if duplicate definitions of `isPlainObject` exist within this same file, remove duplicates and keep one canonical implementation
- if both named exports and bottom export lists are present, make the minimum change needed so the helper is exported exactly once

Not allowed:
- no renaming
- no behavior changes
- no new helper additions
- no consumer/import updates

## Fail-Fast Rule
If either shared utility file does not exist:
- stop
- report blocker
- make no changes
- do not produce a delta ZIP

## Hard Constraints
- do not edit any file other than the 2 listed above
- do not change helper behavior
- do not change import paths
- do not touch advanced files
- do not touch engine files
- do not perform repo-wide cleanup
- keep one PR purpose only

## Validation Checklist
1. Confirm only the 2 listed files changed
2. Confirm `src/shared/utils/numberUtils.js` exists
3. Confirm `src/shared/utils/objectUtils.js` exists
4. Confirm `asFiniteNumber` is exported exactly once from `src/shared/utils/numberUtils.js`
5. Confirm `asPositiveInteger` is exported exactly once from `src/shared/utils/numberUtils.js`
6. Confirm `isPlainObject` is exported exactly once from `src/shared/utils/objectUtils.js`
7. Confirm no helper behavior was changed
8. Confirm no consumer files were touched

## Non-Goals
- no consumer cleanup
- no import normalization
- no new shared file creation
- no refactor beyond duplicate-removal/export-consistency inside the 2 exact files
