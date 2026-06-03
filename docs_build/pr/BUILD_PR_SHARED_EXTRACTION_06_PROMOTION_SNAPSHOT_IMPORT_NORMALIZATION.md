# BUILD_PR_SHARED_EXTRACTION_06_PROMOTION_SNAPSHOT_IMPORT_NORMALIZATION

## Purpose
Normalize imports for the newly introduced shared helper:
createPromotionStateSnapshot

## Single PR Purpose
Fix import paths ONLY for:
- src/advanced/promotion/createPromotionGate.js
- src/advanced/state/createWorldGameStateSystem.js

Ensure both use correct, stable relative paths.

## Exact Files Allowed
Edit ONLY:

1. src/advanced/promotion/createPromotionGate.js
2. src/advanced/state/createWorldGameStateSystem.js

## Exact Import Targets

### 1) createPromotionGate.js

Ensure EXACT import:

```js
import { createPromotionStateSnapshot } from '../shared/state/createPromotionStateSnapshot.js';
```

If incorrect:
- replace existing import
- do not duplicate import

---

### 2) createWorldGameStateSystem.js

Ensure EXACT import:

```js
import { createPromotionStateSnapshot } from '../../shared/state/createPromotionStateSnapshot.js';
```

If incorrect:
- replace existing import
- do not duplicate import

---

## Required Actions
- remove any incorrect relative path
- ensure only ONE import exists per file
- do not modify any other imports

---

## Hard Constraints
- DO NOT scan repo
- DO NOT modify logic
- DO NOT change function bodies
- DO NOT modify other helpers
- DO NOT normalize other imports
- DO NOT touch getState behavior
- DO NOT modify shared helper file

---

## Validation Checklist

1. Only 2 files changed
2. Each file has exactly ONE import for:
   createPromotionStateSnapshot
3. Import paths match EXACTLY:
   - '../shared/state/...'
   - '../../shared/state/...'
4. No duplicate imports exist
5. No logic changes made

---

## Non-Goals
- no global import normalization
- no absolute path migration
- no helper changes
