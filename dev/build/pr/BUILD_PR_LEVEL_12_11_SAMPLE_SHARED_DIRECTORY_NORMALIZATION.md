# BUILD_PR_LEVEL_12_11_SAMPLE_SHARED_DIRECTORY_NORMALIZATION

## Purpose
Normalize duplicate shared directories under samples/ by consolidating `shared/` and `_shared/` into a single canonical `shared/`.

## One PR Purpose Only
Directory normalization only (no feature changes).

## Problem
There are currently two shared directories:
- samples/shared/
- samples/_shared/

This creates ambiguity and inconsistent imports.

## Required Fix
1. Choose canonical directory:
   - `samples/shared/` (FINAL)

2. Migrate:
   - Move all required content from `samples/_shared/` into `samples/shared/`
   - Do NOT overwrite without merge validation

3. Update References:
   - Update ALL sample imports referencing `_shared` → `shared`

4. Remove:
   - Delete `samples/_shared/` after migration

## Rules
- No behavior changes
- No file logic changes
- Path updates only
- Must remain fully testable

## Validation

### Path Validation
- No remaining `_shared` references
- All imports resolve correctly

### Runtime Validation
- samples/index.html loads
- multiple samples launch successfully

### Regression
- phase-13 samples still function
- network sample 1319 still works

## Roadmap Rule
Marker updates only [ ] [.] [x]

## Acceptance Criteria
- only one shared directory exists
- all imports normalized
- no regressions
