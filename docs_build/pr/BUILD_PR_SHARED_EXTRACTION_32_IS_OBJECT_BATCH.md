# BUILD_PR_SHARED_EXTRACTION_32_IS_OBJECT_BATCH

Centralize isObject(value).

Create or use:
src/shared/utils/objectUtils.js

Export:
isObject

Update toolbox/dev + toolbox/shared consumers.
Remove local duplicates.

Constraints:
- no behavior change
- exact batch only
