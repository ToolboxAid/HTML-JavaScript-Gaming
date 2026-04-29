MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply PR 11.48.

Use script output:
scripts/PS/audit-sample-json-js-references.ps1

Select 1–3 JSON files marked NO.

For each:
- manually verify usage
- apply ONLY if obvious

Do NOT:
- touch palette files
- touch tile-map docs
- touch sample 1902
- run full sample suite

Validation:
- node --check changed files
- targeted checks only
