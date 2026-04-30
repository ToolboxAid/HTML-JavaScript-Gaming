# BUILD_PR_LEVEL_11_133_RUNTIME_ASSERTION_NO_HIDDEN_INPUT

## Purpose
Add runtime assertions to guarantee no hidden/global/implicit input is used by any tool.

## STRICT SCOPE

ALLOWED FILES:
- routing files
- tool launch handlers

ALLOWED CHANGES:
- add assertion checks only
- no behavior change beyond failing invalid paths

## RULE

Tool must ONLY use:
- payloadJson
- optional paletteJson

## REQUIRED ASSERTIONS

Before tool execution:

ASSERT:
- no global state read
- no workspace/game JSON passed
- no inferred data used

## VALIDATION

If violation detected:
- throw visible error
- stop execution

## REPORT

docs/dev/reports/runtime_assertions_11_133.txt:
- assertions added
- violations detected (if any)

## FAILURE

FAIL if:
- tool runs without assertions
