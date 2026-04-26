MODEL: GPT-5.3-codex
REASONING: medium

TASK:
- Replace sampleId → id in workspace.manifest.json
- Add type field:
  - existing entries → type: "sample"
- Ensure uniqueness of id
- Do NOT modify runtime
- Do NOT add validators
- Do NOT modify start_of_day
