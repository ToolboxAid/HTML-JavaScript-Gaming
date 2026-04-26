MODEL: GPT-5.3-codex
REASONING: medium

TASK:
- Update workspace.manifest.json:
  - Add palette field to each sample that has a palette
- Ensure:
  - All palette files are referenced
  - No duplicate references
  - No orphan palette files
- Do NOT add validation utilities
- Do NOT modify runtime
- Do NOT modify start_of_day
