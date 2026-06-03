# BUILD_PR_SHARED_EXTRACTION_37_STRING_UTILS_TRIM_NORMALIZE_BATCH

## Purpose
Centralize duplicated string normalization helpers across tools/debug domains.

## Single PR Purpose
Normalize ONLY:

- normalizeString(value)
- trimSafe(value)

## Exact Files Allowed

### Shared
1. src/shared/utils/stringUtils.js

### Consumers (from dupes report)
2. tools/dev/devConsoleIntegration.js
3. tools/dev/commandPacks/packUtils.js
4. tools/dev/presets/debugPresetRegistry.js
5. tools/shared/runtimeAssetLoader.js
6. tools/shared/vectorTemplateSampleGame.js

## Rules
- remove local implementations
- import from shared
- no behavior change
- no scope expansion

## Validation
- helper exists once
- imports correct
- no local duplicates remain
