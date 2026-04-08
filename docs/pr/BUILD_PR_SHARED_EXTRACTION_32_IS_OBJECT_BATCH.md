# BUILD_PR_SHARED_EXTRACTION_32_IS_OBJECT_BATCH

Centralize isObject(value).

Create or use:
src/shared/utils/objectUtils.js

Export:
isObject

Update tools/dev + tools/shared consumers.
Remove local duplicates.

Constraints:
- no behavior change
- exact batch only
