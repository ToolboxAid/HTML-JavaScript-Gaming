MODEL: GPT-5.3-codex

TASK:
Audit all tool payloads:
- samples/**/sample.*.*.json
- workspace manifests if present

VERIFY:
- $schema path valid
- tool matches schema
- required fields present

Do NOT modify runtime
Do NOT modify start_of_day
