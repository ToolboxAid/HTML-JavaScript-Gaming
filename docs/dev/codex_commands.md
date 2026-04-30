# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

## HARD MODE: WRITE OR FAIL

FILES:

1. tools/schemas/workspace.manifest.schema.json
2. tools/schemas/tools/palette-browser.schema.json

## STEPS

FOR EACH FILE:

1. READ file
2. STORE BEFORE content
3. APPLY REQUIRED MODIFICATIONS
4. WRITE file
5. READ AGAIN
6. STORE AFTER content
7. COMPARE

IF BEFORE == AFTER:
  FAIL

## OUTPUT REPORT

docs/dev/reports/enforced_write_11_125.txt:

- file name
- BEFORE snippet
- AFTER snippet
- diff summary
- status: SUCCESS / FAIL

## END CONDITION

If ANY file not changed:
  FAIL ENTIRE PR
