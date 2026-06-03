# BUILD_PR_SHARED_EXTRACTION_24_GUARD_STRICT_MODE

## Purpose
Tighten the shared-extraction guard to catch edge cases and prevent bypass patterns.

## Single PR Purpose
Enhance the existing guard script ONLY:

tools/dev/checkSharedExtractionGuard.mjs

## Exact Files Allowed
1. tools/dev/checkSharedExtractionGuard.mjs

Do not edit any other file.

## Fail-Fast Gate
Before editing:
- confirm file exists

If not:
- stop
- no changes
- no ZIP

## Exact Enhancements

### 1. Add detection for inline arrow/function variants
Detect:
- `(value) => Number.isFinite`
- `Number.isFinite(` (outside shared import context)
- `typeof value === 'object' && value !== null`

### 2. Add detection for renamed helper clones
Detect patterns:
- `finiteNumber`
- `positiveInt`
- `plainObj`
(only when used in function declarations)

### 3. Add detection for deep relative traversal attempts
Detect:
- '../../../../src/shared'
- '../../../src/../shared'

### 4. Improve output grouping
Group results by:
- violation type
- file

### 5. Output summary
At end print:
- total files scanned
- total violations
- types of violations found

### 6. Maintain strict exit behavior
- 0 = clean
- 1 = violations

## Hard Constraints
- do not change existing checks
- only extend detection
- no new files
- no config changes
- no performance-heavy scanning
- keep script readable

## Validation Checklist
1. Script still runs
2. New patterns detected
3. Existing patterns still detected
4. Output clearer
5. Exit codes correct

## Non-Goals
- no CI
- no lint
- no repo-wide changes
