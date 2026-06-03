# BUILD_PR_SHARED_EXTRACTION_31_CLONE_JSON_BATCH

Centralize cloneJson(value) across tools/dev and tools/shared.

Create:
src/shared/utils/jsonUtils.js

Export:
cloneJson

Update all occurrences from tools/dev + tools/shared listed in dupes report.
Remove local implementations, import shared.

Constraints:
- no behavior change
- no engine edits
- exact batch only
