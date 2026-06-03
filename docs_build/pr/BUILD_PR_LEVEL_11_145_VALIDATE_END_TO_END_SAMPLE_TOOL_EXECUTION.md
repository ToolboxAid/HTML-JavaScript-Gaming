# BUILD_PR_LEVEL_11_145_VALIDATE_END_TO_END_SAMPLE_TOOL_EXECUTION

## Purpose
Now that schemas are locked and runtime is clean, validate real end-to-end execution:
sample → routing → tool → render.

## Scope
- testable
- no schema changes
- no runtime refactor
- minimal fixes only if execution fails

## ALLOWED FILES
- samples/**
- routing files (only if failure requires fix)

## ALLOWED CHANGES
- fix broken sample JSON
- fix incorrect payload references
- remove invalid sample→tool relationships

## REQUIRED VALIDATION

For each sample/tool link:

1. Launch tool from sample
2. Confirm:
   - payload JSON exists
   - schema passes
   - tool renders (not blank/error)

3. If failure:
   - FIX JSON if deterministic
   - otherwise REMOVE relationship

## RULES

- NO fake data
- NO fallback
- NO schema changes
- NO runtime changes unless required

## REPORT

docs_build/dev/reports/e2e_sample_tool_validation_11_145.txt:
- sample id
- tool id
- result (PASS/FAIL)
- fix or removal

## ACCEPTANCE

- all remaining sample/tool links execute successfully
- broken links removed or fixed
