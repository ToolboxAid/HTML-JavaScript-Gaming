# BUILD_PR_SHARED_EXTRACTION_30_DEBUG_CONFIG_HELPERS_BATCH

## Purpose
Centralize duplicated debug configuration helpers across game entry points into a shared utility.

## Single PR Purpose
Normalize ONLY these helpers:

- parseBooleanFlag(value, fallback)
- normalizeDebugMode(value, fallback = 'prod')
- readStoredBoolean(key)
- writeStoredBoolean(key, value)
- isLocalDebugEnvironment(documentRef)
- resolveDebugConfig(documentRef)

## Target Files
1. games/Asteroids/main.js
2. games/Breakout/main.js
3. games/network_sample_a/main.js
4. games/network_sample_b/main.js
5. games/network_sample_c/main.js
6. samples/Phase 12 - Demo Games/sample1205-multi-system/main.js

## Exact Files Allowed

### New shared file
1. src/shared/utils/debugConfigUtils.js

### Consumers
2. games/Asteroids/main.js
3. games/Breakout/main.js
4. games/network_sample_a/main.js
5. games/network_sample_b/main.js
6. games/network_sample_c/main.js
7. samples/Phase 12 - Demo Games/sample1205-multi-system/main.js

## Shared Helper Creation
Create:
src/shared/utils/debugConfigUtils.js

Export exactly:
- parseBooleanFlag
- normalizeDebugMode
- readStoredBoolean
- writeStoredBoolean
- isLocalDebugEnvironment
- resolveDebugConfig

Use ONE existing implementation as source-of-truth.
Do NOT merge logic.
Do NOT change behavior.

## Consumer Changes
For each consumer file:
- remove local implementations of the 6 helpers
- import from src/shared/utils/debugConfigUtils.js
- preserve all existing logic and usage

## Constraints
- no engine changes
- no UI changes
- no behavior changes
- exact batch only

## Validation
- helpers exist only in shared file
- consumers import correctly
- no local duplicates remain

## Non-Goals
- no debug UI changes
- no refactor beyond helper extraction
