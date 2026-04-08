# BUILD_PR_SHARED_EXTRACTION_21_OPTIONAL_NPM_PREHOOK_GUARD

## Purpose
Optionally enforce the shared-extraction guard automatically before existing npm workflows (test or start), without introducing CI or new tooling.

## Single PR Purpose
Add guard execution as a pre-hook ONLY IF matching scripts already exist.

## Exact Files Allowed
1. package.json (only if it exists AND already has scripts)

## Fail-Fast Gate
Before editing:
1. package.json exists
2. has scripts section
3. already contains at least one of:
   - "test"
   - "start"

If not:
- stop
- no changes
- no ZIP

## Exact Change

If "test" exists and "pretest" does NOT exist:
add:
"pretest": "node tools/dev/checkSharedExtractionGuard.mjs"

If "start" exists and "prestart" does NOT exist:
add:
"prestart": "node tools/dev/checkSharedExtractionGuard.mjs"

Rules:
- do not override existing pretest/prestart
- do not modify existing scripts
- minimal insertion only

## Hard Constraints
- only package.json
- no new files
- no logic changes
- no CI
- no lint

## Validation Checklist
1. Only package.json changed
2. pretest/prestart added only if valid
3. guard script path correct
4. existing scripts unchanged

## Non-Goals
- no CI integration
- no repo-wide changes
