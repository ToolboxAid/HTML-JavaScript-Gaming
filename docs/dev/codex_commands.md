# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

STRICT SCOPE MODE

ALLOWED FILES:
- routing files only

TASK:

1. Add assertions before tool execution:
   - ensure only payloadJson + paletteJson used

2. Detect:
   - global reads
   - implicit inputs
   - parent JSON usage

3. If detected:
   - throw error

REPORT:
docs/dev/reports/runtime_assertions_11_133.txt
