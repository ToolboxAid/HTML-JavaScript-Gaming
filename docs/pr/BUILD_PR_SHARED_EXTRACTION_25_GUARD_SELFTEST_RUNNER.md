# BUILD_PR_SHARED_EXTRACTION_25_GUARD_SELFTEST_RUNNER

## Purpose
Add a narrow self-test runner for the shared-extraction guard so the guard logic can be verified without modifying repo source files.

## Single PR Purpose
Create one new self-test runner:

- `tools/dev/checkSharedExtractionGuard.selftest.mjs`

This BUILD does not change the guard script itself unless a tiny export is already present and needed. Default expectation: create the self-test runner only.

## Exact Files Allowed
Edit only these files:

1. `tools/dev/checkSharedExtractionGuard.selftest.mjs` **(new file)**
2. `tools/dev/checkSharedExtractionGuard.mjs` **only if a minimal export is strictly required to support the self-test runner**

Do not edit any other file.

## Fail-Fast Gate
Before editing:
1. confirm `tools/dev/checkSharedExtractionGuard.mjs` exists

If not:
- stop
- no changes
- no ZIP

## Exact New File
Create:

`tools/dev/checkSharedExtractionGuard.selftest.mjs`

## Exact Self-Test Requirements

### 1) Execution model
The self-test runner must:
- create a temporary workspace under OS temp
- create small synthetic `.js` files that intentionally violate guard rules
- invoke the existing guard script against that temp workspace
- verify the guard exits with failure on violation cases
- verify the guard exits clean on a compliant case
- clean up the temp workspace when done

### 2) Required test cases
Include at least these cases:

#### violation: local helper definition
Synthetic file containing one of:
- `function asFiniteNumber(`
Expected:
- guard fails

#### violation: disallowed shared relative import
Synthetic file containing:
- `../../../src/shared/utils/numberUtils.js`
Expected:
- guard fails

#### violation: alias usage
Synthetic file containing:
- `@shared/utils/numberUtils.js`
Expected:
- guard fails

#### clean case
Synthetic file with no banned helper definitions or banned import strings
Expected:
- guard passes

### 3) Output
Print a concise pass/fail line for each case.
Print a final summary:
- tests run
- tests passed
- tests failed

### 4) Exit behavior
- exit code `0` if all self-tests pass
- exit code `1` if any self-test fails

## Guard Integration Rules
Preferred:
- call the existing guard script as a child process

Allowed fallback only if strictly necessary:
- make the minimum export change in `tools/dev/checkSharedExtractionGuard.mjs` to support invocation from the self-test runner

If fallback is used:
- do not change detection rules
- do not change guard behavior
- do not add unrelated refactor

## Hard Constraints
- no package.json changes
- no CI changes
- no npm script changes
- no source/runtime app changes
- no guard rule changes in this PR unless a tiny export is strictly required
- keep one PR purpose only

## Validation Checklist
1. Confirm no more than the 2 listed files changed
2. Confirm the self-test runner creates and cleans temp test inputs
3. Confirm violation cases fail
4. Confirm clean case passes
5. Confirm self-test summary and exit code behavior are correct
6. Confirm guard detection logic itself was not altered unless a minimal export was strictly required

## Non-Goals
- no new guard rules
- no repo source scanning changes
- no CI wiring
- no package.json wiring
- no documentation changes
