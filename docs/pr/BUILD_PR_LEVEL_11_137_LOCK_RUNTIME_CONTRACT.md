# BUILD_PR_LEVEL_11_137_LOCK_RUNTIME_CONTRACT

## Purpose
Lock the runtime so ANY violation of the JSON-only contract immediately fails execution.

## STRICT SCOPE

ALLOWED FILES:
- routing files
- tool launch handlers

ALLOWED CHANGES:
- add hard fail conditions only
- no behavior expansion

## LOCK RULES

System MUST fail if:

1. payloadJson is missing
2. paletteJson required but missing
3. payload mutated
4. palette mutated
5. wrapper detected
6. parent JSON detected
7. global read detected
8. fallback attempted

## REQUIRED IMPLEMENTATION

Add guard layer BEFORE tool execution:

validateInput(payloadJson, paletteJson)

Checks:
- typeof payload === object
- schema matches expected tool schema
- no extra wrapper keys
- no reference to parent structures

## VALIDATION

- simulate invalid cases → MUST throw error
- simulate valid case → MUST pass

## REPORT

docs/dev/reports/runtime_contract_lock_11_137.txt:
- guards added
- violations caught
- test cases

## FAILURE

FAIL if:
- any invalid input still runs
