# BUILD_PR_SHARED_EXTRACTION_09_CLEAN_UNUSED_HELPER_IMPORTS_ADVANCED_ONLY

## Purpose
Remove any UNUSED helper imports introduced during prior extraction steps.

## Single PR Purpose
Cleanup ONLY unused imports in:

- src/advanced/promotion/createPromotionGate.js
- src/advanced/state/createWorldGameStateSystem.js

## Exact Files Allowed
Edit ONLY:
1. src/advanced/promotion/createPromotionGate.js
2. src/advanced/state/createWorldGameStateSystem.js

## Exact Rules
- Identify imports for:
  - asFiniteNumber
  - asPositiveInteger
  - isPlainObject
  - createPromotionStateSnapshot

- If ANY of the above are imported but NOT used in the file:
  - remove that import

- If used:
  - keep import unchanged

## Hard Constraints
- DO NOT modify logic
- DO NOT reorder imports
- DO NOT touch other imports
- DO NOT scan repo
- DO NOT modify shared files

## Validation Checklist
1. Only 2 files changed
2. No unused imports remain for the listed helpers
3. No used imports were removed
4. No logic changed

## Non-Goals
- no formatting cleanup
- no linting changes
- no refactor
