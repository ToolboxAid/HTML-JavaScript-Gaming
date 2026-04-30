# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- toolHostRuntime.js

TASK:

1. Locate validateInput
2. Reduce to:

   if (!isPlainObject(payloadJson)) throw
   if (paletteJson && !isPlainObject(paletteJson)) throw

3. Remove ALL other validation logic

4. Save file

5. VERIFY:
   - no helper detection functions remain
   - validateInput is minimal

REPORT:
docs/dev/reports/minimal_validate_input_11_140.txt

FAIL if extra logic exists
