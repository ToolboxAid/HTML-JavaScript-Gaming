# BUILD_PR_LEVEL_11_132_FINAL_TOOL_INPUT_ENFORCEMENT

## Purpose
Lock the final rule: every tool receives ONLY its JSON payload (+ optional palette as separate JSON), with zero ambiguity.

## STRICT SCOPE

ALLOWED FILES:
- routing files
- tool launch handlers

ALLOWED CHANGES:
- remove ANY remaining multi-input ambiguity
- enforce explicit parameter passing

## FINAL CONTRACT

Tool launch MUST be:

launch(toolId, payloadJson, paletteJson?)

NOT:
- launch(toolId, anythingElse)
- launch(toolId, wrapper)
- launch(toolId, parentJson)

## REQUIRED CHANGES

1. Ensure function signatures reflect:
   payload + optional palette

2. Remove:
   - implicit context passing
   - global/shared state reads
   - indirect lookup

3. Ensure:
   - payloadJson is exact file content
   - paletteJson is exact file content

## VALIDATION

- trace launch call
- confirm ONLY payload + palette passed

## REPORT

docs/dev/reports/final_tool_input_contract_11_132.txt:
- tools checked
- call signatures
- violations fixed

## FAILURE

FAIL if:
- any tool still reads from external/global state
- any implicit input exists
