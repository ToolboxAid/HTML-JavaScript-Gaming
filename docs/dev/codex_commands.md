# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- routing files only

TASK:

1. Find global/implicit input usage
2. Remove it
3. Ensure only payloadJson + paletteJson used

VERIFY:
- runtime assertions pass

REPORT:
docs/dev/reports/global_input_removal_11_134.txt

FAIL if any global remains
