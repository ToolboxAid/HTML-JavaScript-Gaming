# BUILD_PR_LEVEL_11_144_SCHEMA_LOCK_VALIDATION_SWEEP

## Purpose
Run a full schema validation sweep to ensure all tool schemas correctly enforce strict contracts after lock.

## Scope
- STRICT SCOPE
- schemas only
- validation only
- no runtime changes
- no routing changes

## ALLOWED FILES
- toolbox/schemas/**/*.json

## ALLOWED CHANGES
- fix ONLY schema violations found during validation
- no expansion of schema
- no compatibility additions

## REQUIRED VALIDATION

For ALL schemas:

1. Validate:
   - valid payload JSON → PASS
   - wrapper JSON → FAIL
   - parent JSON → FAIL

2. Ensure:
   - additionalProperties: false everywhere
   - no fallback logic
   - no wrapper support

## REQUIRED FIXES

If schema fails:
- tighten validation
- remove extra fields
- correct required fields

## REPORT

docs_build/dev/reports/schema_validation_sweep_11_144.txt:
- schemas tested
- failures found
- fixes applied
- final pass status

## FAILURE

FAIL if any schema:
- passes invalid JSON
- allows extra properties
