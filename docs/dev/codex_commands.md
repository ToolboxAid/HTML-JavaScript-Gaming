# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- routing files only

TASK:

1. Find palette usage
2. Remove:
   - palette injection
   - palette merging
   - defaults
3. Ensure separate pass-through

VERIFY:
payload unchanged
palette unchanged

REPORT:
docs/dev/reports/palette_pass_through_11_131.txt

FAIL if mutation exists
