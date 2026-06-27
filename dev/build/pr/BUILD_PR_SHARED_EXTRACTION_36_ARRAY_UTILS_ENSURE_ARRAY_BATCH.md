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
2. docs_build/dev/toolbox/devConsoleIntegration.js
3. docs_build/dev/toolbox/inspectors/inspectorStore.js
4. src/shared/toolbox/runtimeAssetLoader.js
5. src/shared/toolbox/vectorGeometryRuntime.js

## Rules
- remove local ensureArray implementations
- import from shared
- no behavior change
- no scope expansion

## Validation
- helper exists once
- imports correct
- no local duplicates remain
