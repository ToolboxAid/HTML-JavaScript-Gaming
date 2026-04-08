# BUILD_PR_SHARED_EXTRACTION_23_GUARD_DOC_MINIMAL_USAGE

## Purpose
Add minimal documentation describing how to run and interpret the shared-extraction guard.

## Single PR Purpose
Create one doc file:

docs/dev/SHARED_EXTRACTION_GUARD_USAGE.md

## Exact Files Allowed
1. docs/dev/SHARED_EXTRACTION_GUARD_USAGE.md (new file)

## Exact Content

Include:
- how to run:
  - node tools/dev/checkSharedExtractionGuard.mjs
  - npm run check:shared-extraction-guard (if present)
  - ./tools/dev/runSharedExtractionGuard.sh
- what it checks:
  - duplicate helpers
  - bad shared imports
  - alias usage
- what failure means
- how to fix violations (short bullet list)

## Rules
- no other files
- no config changes
- no logic changes

## Validation
1. file exists
2. content matches scope
3. no other files changed
