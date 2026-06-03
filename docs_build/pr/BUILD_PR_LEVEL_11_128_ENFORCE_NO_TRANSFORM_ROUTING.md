# BUILD_PR_LEVEL_11_128_ENFORCE_NO_TRANSFORM_ROUTING

## Purpose
Ensure Workspace Manager and launch paths pass JSON payloads WITHOUT transformation.

## STRICT SCOPE

ALLOWED FILES:
- workspace manager routing files (only those that pass payloads)
- tools launch handler files (only if needed)

ALLOWED CHANGES:
- remove transform/normalize/convert logic
- pass payload as-is

## RULE

input JSON → schema validate → tool

NO:
- transform
- normalize
- wrap
- unwrap
- convert
- enrich
- infer

## REQUIRED CHECKS

Codex must verify:

1. Payload passed EXACTLY as found in source JSON
2. No intermediate object creation
3. No field renaming
4. No default injection

## VALIDATION

- trace payload from:
  sample → workspace → tool
- confirm byte-level equality (no shape change)

## REPORT

docs_build/dev/reports/no_transform_routing_11_128.txt:
- files checked
- violations found
- fixes applied
- before/after snippets

## FAILURE

FAIL if:
- any transform remains
- payload mutated
