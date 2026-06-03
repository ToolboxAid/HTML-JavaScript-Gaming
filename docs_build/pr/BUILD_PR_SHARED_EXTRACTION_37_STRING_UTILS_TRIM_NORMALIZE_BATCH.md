# BUILD_PR_SHARED_EXTRACTION_37_STRING_UTILS_TRIM_NORMALIZE_BATCH

## Purpose
Centralize duplicated string normalization helpers across toolbox/debug domains.

## Single PR Purpose
Normalize ONLY:

- normalizeString(value)
- trimSafe(value)

## Exact Files Allowed

### Shared
1. src/shared/utils/stringUtils.js

### Consumers (from dupes report)
2. toolbox/dev/devConsoleIntegration.js
3. toolbox/dev/commandPacks/packUtils.js
4. toolbox/dev/presets/debugPresetRegistry.js
5. toolbox/shared/runtimeAssetLoader.js
6. toolbox/shared/vectorTemplateSampleGame.js

## Rules
- remove local implementations
- import from shared
- no behavior change
- no scope expansion

## Validation
- helper exists once
- imports correct
- no local duplicates remain
