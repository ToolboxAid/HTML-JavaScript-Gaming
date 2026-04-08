# BUILD_PR_SHARED_EXTRACTION_03_IMPORT_NORMALIZATION

## Purpose
Normalize all imports to use src/shared for extracted helpers.

## Scope
- Update imports ONLY for helpers already moved:
  - asFiniteNumber
  - asPositiveInteger
  - isPlainObject
  - getState (shared variants only)

## Rules
- DO NOT scan repo beyond listed files
- DO NOT modify logic
- DO NOT move files
- DO NOT rename helpers

## Explicit Targets

### numberUtils
Update imports in files that used:
- asFiniteNumber
- asPositiveInteger

TO:
import { asFiniteNumber, asPositiveInteger } from "src/shared/utils/numberUtils.js";

### objectUtils
Update imports in files that used:
- isPlainObject

TO:
import { isPlainObject } from "src/shared/utils/objectUtils.js";

### state/getState
Update imports in files that used shared getState:

TO:
import { getState } from "src/shared/state/getState.js";

## Required Actions
1. Remove old relative imports
2. Add src/shared imports
3. Ensure no duplicate imports remain

## Acceptance
- All imports reference src/shared
- No relative helper imports remain
- Build passes

## Non-Goals
- No refactoring
- No helper changes
