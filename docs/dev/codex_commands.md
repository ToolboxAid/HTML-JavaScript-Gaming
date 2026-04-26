MODEL: GPT-5.3-codex
REASONING: medium

TASK:
- Update workspace.schema.json:
  - Add phase and level fields
  - Add conditional rules:
    - sample → phase required, level forbidden
    - game → level required, phase forbidden
- Validate manifest against schema
- Do NOT modify runtime
- Do NOT add validators
- Do NOT modify start_of_day
