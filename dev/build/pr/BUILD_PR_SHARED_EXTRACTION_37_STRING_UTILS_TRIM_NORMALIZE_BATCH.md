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
2. docs_build/dev/toolbox/devConsoleIntegration.js
3. docs_build/dev/toolbox/commandPacks/packUtils.js
4. docs_build/dev/toolbox/presets/debugPresetRegistry.js
5. src/shared/toolbox/runtimeAssetLoader.js
6. src/shared/toolbox/vectorTemplateSampleGame.js

## Rules
- remove local implementations
- import from shared
- no behavior change
- no scope expansion

## Validation
- helper exists once
- imports correct
- no local duplicates remain
