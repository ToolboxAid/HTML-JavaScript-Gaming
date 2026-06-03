# BUILD_PR_LEVEL_11_143_SCHEMA_LOCK_ENFORCEMENT

## Purpose
Lock schemas as the single source of truth now that runtime and routing are clean.

## Scope
- testable PR
- STRICT SCOPE
- schema-only changes
- no runtime changes
- no routing changes

## ALLOWED FILES

- toolbox/schemas/**/*.json

## ALLOWED CHANGES

- enforce strict schema contracts
- ensure all schemas:
  - use additionalProperties: false
  - reject wrapper JSON
  - reject parent JSON
  - validate only correct payload shape

## REQUIRED CHANGES

For EACH tool schema:

1. MUST:
   - validate ONLY tool payload
   - have additionalProperties: false
   - reject extra keys

2. MUST NOT:
   - accept wrapper {tool,payload}
   - accept game/workspace/sample JSON
   - contain fallback/compatibility logic

## VALIDATION

Codex must verify:

- valid tool JSON → PASS
- wrapper JSON → FAIL
- parent JSON → FAIL

## REPORT

docs_build/dev/reports/schema_lock_enforcement_11_143.txt:
- schemas checked
- schemas modified
- validation results

## FAILURE

FAIL if any schema:
- allows extra properties
- accepts invalid structure
