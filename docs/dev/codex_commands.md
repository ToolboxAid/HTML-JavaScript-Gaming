# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- tools/schemas/tools/*.json
- routing files ONLY if needed

EXECUTION:

FOR EACH TOOL:

1. Load schema
2. Test 3 inputs:
   A valid tool JSON → must pass
   B wrapper JSON → must fail
   C parent JSON → must fail

3. If B or C passes:
   - fix schema (tighten)
   - OR fix routing

4. DO NOT:
   - add compatibility
   - expand schema

5. REPORT:
docs/dev/reports/tool_input_contract_11_129.txt

FAIL if any tool violates rule
