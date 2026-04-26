MODEL: GPT-5.3-codex
REASONING: medium

TASK:
- Update workspace.schema.json:
  - Replace sampleId usage with id
  - Add type field requirement
  - Ensure entity array structure matches manifest
- Ensure no additionalProperties allowed
- Do NOT modify runtime
- Do NOT add validators
- Do NOT modify start_of_day
