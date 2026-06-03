# BUILD_PR_SHARED_EXTRACTION_22_ADD_GUARD_RUN_SCRIPT

## Purpose
Provide a simple cross-platform way to execute the shared-extraction guard without relying on npm scripts.

## Single PR Purpose
Create a single script:

tools/dev/runSharedExtractionGuard.sh

## Exact Files Allowed
1. tools/dev/runSharedExtractionGuard.sh (new file)

## Exact File Content

```bash
#!/usr/bin/env bash
node tools/dev/checkSharedExtractionGuard.mjs
```

## Rules
- no other files
- no logic changes
- no npm dependency
- no config changes

## Validation
1. file exists
2. script runs guard
3. no other files changed
