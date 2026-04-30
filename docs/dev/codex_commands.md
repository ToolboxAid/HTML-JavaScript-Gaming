# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- tools/schemas/**/*.json

TASK:

1. For each schema:
   - test valid payload → must pass
   - test wrapper JSON → must fail
   - test parent JSON → must fail

2. If violation:
   - fix schema ONLY

3. DO NOT:
   - expand schema
   - add compatibility

4. VERIFY:
   - all schemas strict

REPORT:
docs/dev/reports/schema_validation_sweep_11_144.txt

FAIL if any schema loose
