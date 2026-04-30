# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- routing files only

TASK:

1. Search for prohibited patterns:
   normalize*, transform*, convert*, infer*,
   tryLoadPreset*, buildPreset*, default*, fallback*

2. Remove any remaining occurrences affecting input paths

3. Verify launch signature:
   launch(toolId, payloadJson, paletteJson?)

4. Verify:
   - payloadJson unchanged
   - paletteJson unchanged
   - no global reads

5. Ensure missing input => error (no fallback)

REPORT:
docs/dev/reports/final_verification_11_136.txt

FAIL if any violation remains
