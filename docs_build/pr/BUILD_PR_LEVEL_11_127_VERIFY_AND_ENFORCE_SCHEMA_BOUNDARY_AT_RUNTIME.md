# BUILD_PR_LEVEL_11_127_VERIFY_AND_ENFORCE_SCHEMA_BOUNDARY_AT_RUNTIME

## Purpose
After strict schema file changes, verify runtime actually respects schema boundaries (no hidden wrapper/payload usage).

## Scope
- testable
- STRICT SCOPE
- runtime verification only
- no schema edits unless explicitly required by failure

## ALLOWED FILES

- src/shared/schemas/workspace.manifest.schema.json
- src/shared/schemas/tools/palette-browser.schema.json
- workspace manager routing file(s) (read-only unless violation found)

## ALLOWED CHANGES

- ONLY if violation found:
  - remove runtime wrapper handling for palette
  - ensure direct payload passed

## VALIDATION TARGETS

1. Palette Browser receives ONLY palette JSON
2. Passing wrapper JSON must FAIL schema
3. Passing game/workspace JSON must FAIL schema
4. Workspace manager must pass referenced payload only (no transform)

## REQUIRED TESTS

Codex must simulate:

- valid palette JSON → PASS
- wrapper {tool,payload} → FAIL
- workspace/game JSON → FAIL

## OUTPUT

docs_build/dev/reports/runtime_schema_boundary_11_127.txt:
- test cases
- results
- violations
- fixes applied (if any)

## FAILURE

FAIL if:
- wrapper still works
- parent JSON still accepted
