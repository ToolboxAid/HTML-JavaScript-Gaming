# CODEX COMMANDS

Model: GPT-5.3-codex
Reasoning: medium

1. Scan all tool references after PR 11.105 cleanup

2. For each tool:
   - verify input JSON exists
   - verify schema matches
   - verify tool loads actual data (not defaults)

3. Remove tool reference if:
   - input missing
   - loads defaults
   - invalid structure
   - no visible usable output

4. Do NOT:
   - create placeholder data
   - use fallback/default values
   - loosen schema

5. Validate updated manifests

6. Output:
docs/dev/reports/runtime_contract_enforcement_11_108.txt
