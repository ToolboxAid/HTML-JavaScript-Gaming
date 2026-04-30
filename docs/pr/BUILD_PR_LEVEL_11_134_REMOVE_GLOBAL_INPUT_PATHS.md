# BUILD_PR_LEVEL_11_134_REMOVE_GLOBAL_INPUT_PATHS

## Purpose
Remove remaining global/implicit input paths detected by runtime assertions.

## STRICT SCOPE

ALLOWED FILES:
- routing files
- tool launch handlers

ALLOWED CHANGES:
- remove global reads
- replace with explicit payloadJson / paletteJson only

## REQUIRED

1. Remove:
   - global workspace references
   - shared state access
   - implicit context reads

2. Replace with:
   - explicit parameters only

## VALIDATION

- runtime assertions must pass clean
- no hidden input access

## REPORT

docs/dev/reports/global_input_removal_11_134.txt:
- files changed
- globals removed
- before/after

## FAILURE

FAIL if any global read remains
