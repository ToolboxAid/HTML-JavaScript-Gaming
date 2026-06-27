# PLAN_PR_SHARED_EXTRACTION_03_IMPORT_NORMALIZATION

## Purpose
Normalize all imports to use src/shared as the single source of truth for extracted helpers.

## Scope
- Replace relative helper imports with src/shared imports
- Remove inline helper references
- No logic changes
- No file moves
- No new helpers

## Rules
- DO NOT scan entire repo blindly
- ONLY update files that import moved helpers
- DO NOT modify engine APIs
- DO NOT rename helpers

## Normalization Targets

### Replace patterns like:
../../utils/...
../utils/...
local helper definitions

### With:
src/shared/utils/numberUtils.js
src/shared/utils/objectUtils.js
src/shared/state/getState.js

## Import Standard

Always use:
import { helper } from "src/shared/...";

## Acceptance Criteria
- All helper imports resolve to src/shared
- No duplicate helper definitions remain
- No relative helper imports remain
- Build passes

## Non-Goals
- No refactoring
- No helper renaming
- No additional extraction
