# BUILD_PR_LEVEL_11_129_VERIFY_ALL_TOOLS_DIRECT_JSON_INPUT

## Purpose
Verify ALL tools follow the rule: tool input = direct JSON only (no wrapper, no transform, no preset).

## STRICT SCOPE

ALLOWED FILES:
- toolbox/** (read + minimal fix if violation)
- routing files (only if needed to remove transform)

NO OTHER FILES

## RULE

Tool must:
- receive JSON file
- validate against its schema
- render

Tool must NOT:
- accept wrapper {tool,payload}
- accept game/workspace JSON
- build input
- transform input
- fallback to defaults

## REQUIRED VALIDATION

For EACH tool:

1. Load schema
2. Identify expected JSON shape
3. Test:
   - valid tool JSON → PASS
   - wrapper JSON → FAIL
   - parent JSON → FAIL

## FIX RULE

If violation:
- fix schema OR routing (minimal)
- do NOT expand schema
- do NOT add compatibility

## REPORT

docs_build/dev/reports/tool_input_contract_11_129.txt:
- tool name
- schema path
- pass/fail results
- fixes applied

## FAILURE

FAIL if ANY tool:
- accepts wrapper
- accepts parent JSON
- mutates input
