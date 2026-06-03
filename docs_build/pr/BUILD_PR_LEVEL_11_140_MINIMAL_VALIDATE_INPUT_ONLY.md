# BUILD_PR_LEVEL_11_140_MINIMAL_VALIDATE_INPUT_ONLY

## Purpose
Complete the simplification: runtime uses ONLY minimal validateInput (type checks) and defers all validation to schemas.

## STRICT SCOPE

ALLOWED FILES:
- toolHostRuntime.js

ALLOWED CHANGES:
- simplify validateInput
- remove any remaining non-type validation logic

## REQUIRED CHANGES

In toolHostRuntime.js:

1. validateInput must ONLY:
   - check payloadJson is object
   - check paletteJson (if present) is object

2. REMOVE:
   - wrapper detection
   - parent JSON detection
   - implicit/global key detection
   - fallback detection
   - mutation fingerprint checks

3. DO NOT add new logic

## RESULT

Runtime becomes:
- accept input
- pass to tool
- schema handles validity

## VALIDATION

- invalid JSON structure → schema FAIL
- wrapper JSON → schema FAIL
- parent JSON → schema FAIL

## REPORT

docs_build/dev/reports/minimal_validate_input_11_140.txt:
- lines removed
- final validateInput content

## FAILURE

FAIL if any non-type validation remains
