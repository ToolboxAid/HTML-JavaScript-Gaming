# BUILD_PR_SHARED_EXTRACTION_36_ARRAY_UTILS_ENSURE_ARRAY_BATCH

## Purpose
Centralize duplicated `ensureArray(value)` helper across debug/tools domains.

## Single PR Purpose
Normalize ONLY:

- ensureArray(value)

## Exact Files Allowed

### Shared
1. src/shared/utils/arrayUtils.js

### Consumers (from dupes report)
2. toolbox/dev/devConsoleIntegration.js
3. toolbox/dev/inspectors/inspectorStore.js
4. toolbox/shared/runtimeAssetLoader.js
5. toolbox/shared/vectorGeometryRuntime.js

## Rules
- remove local ensureArray implementations
- import from shared
- no behavior change
- no scope expansion

## Validation
- helper exists once
- imports correct
- no local duplicates remain
