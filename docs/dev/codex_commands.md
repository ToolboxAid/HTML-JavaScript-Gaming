# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- routing files only

TASK:

1. Find:
   - tryLoadPreset*
   - buildPreset*
   - default*
   - fallback*

2. Remove all occurrences

3. Ensure:
   - missing input → error
   - no fallback used

VERIFY:
- runtime assertions pass

REPORT:
docs/dev/reports/preset_default_removal_11_135.txt

FAIL if any remain
