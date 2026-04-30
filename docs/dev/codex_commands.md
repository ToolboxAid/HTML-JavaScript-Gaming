# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: high

STRICT SCOPE MODE

ALLOWED FILES:
- routing files only

TASK:

1. Find payload passing code
2. Remove:
   - normalize*
   - transform*
   - convert*
   - map*
   - enrich*
3. Ensure payload passed directly

VERIFY:
- payload before == payload after

REPORT:
docs/dev/reports/no_transform_routing_11_128.txt

FAIL if any mutation remains
