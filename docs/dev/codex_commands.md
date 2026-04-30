# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- routing files only

TASK:

1. Find tool launch calls
2. Enforce signature:
   launch(toolId, payloadJson, paletteJson?)

3. Remove:
   - implicit/global input
   - hidden dependencies

VERIFY:
- inputs are explicit only

REPORT:
docs/dev/reports/final_tool_input_contract_11_132.txt

FAIL if ambiguity remains
