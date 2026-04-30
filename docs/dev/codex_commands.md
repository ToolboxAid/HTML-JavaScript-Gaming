# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- routing files only

TASK:

1. Add validateInput(payloadJson, paletteJson)

2. Add checks:
   - missing payload → error
   - wrapper detected → error
   - parent JSON detected → error
   - mutation detected → error
   - fallback attempt → error

3. Inject before tool launch

4. TEST:
   invalid inputs → must fail
   valid input → pass

REPORT:
docs/dev/reports/runtime_contract_lock_11_137.txt

FAIL if invalid inputs succeed
