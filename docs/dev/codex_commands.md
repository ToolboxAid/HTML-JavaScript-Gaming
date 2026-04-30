# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- tools/schemas/**/*.json

TASK:

1. For each schema:
   - ensure additionalProperties: false
   - remove any wrapper acceptance
   - ensure strict payload validation

2. Validate:
   - valid JSON passes
   - wrapper fails
   - parent fails

3. DO NOT:
   - modify runtime
   - modify routing
   - modify samples

REPORT:
docs/dev/reports/schema_lock_enforcement_11_143.txt

FAIL if any schema remains loose
