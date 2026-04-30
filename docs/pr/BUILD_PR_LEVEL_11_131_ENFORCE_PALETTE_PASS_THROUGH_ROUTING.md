# BUILD_PR_LEVEL_11_131_ENFORCE_PALETTE_PASS_THROUGH_ROUTING

## Purpose
Enforce that palette dependencies are passed through routing layers WITHOUT mutation and NEVER embedded or transformed.

## STRICT SCOPE

ALLOWED FILES:
- workspace manager routing files
- tool launch handlers

ALLOWED CHANGES:
- remove palette injection
- remove palette embedding
- ensure palette passed as separate JSON reference

## RULE

payload JSON (tool) → unchanged  
palette JSON → unchanged  

NO:
- embedding palette into payload
- merging palette into payload
- transforming palette
- default palette injection

## REQUIRED CHECKS

1. Locate palette usage in routing
2. Ensure:
   - palette passed separately
   - payload untouched
3. Remove:
   - inline palette building
   - palette defaults
   - palette merging

## VALIDATION

- payload before == payload after
- palette before == palette after
- missing palette → error (not fallback)

## REPORT

docs/dev/reports/palette_pass_through_11_131.txt:
- files checked
- violations
- fixes applied

## FAILURE

FAIL if:
- palette is embedded
- palette is mutated
