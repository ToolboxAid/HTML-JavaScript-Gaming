MODEL: GPT-5.3-codex
REASONING: medium

TASK:
- Update palette.schema.json:
  - entries → swatches
  - enforce single-character symbol
  - enforce hex format
- Migrate existing/generated palettes:
  - entries → swatches
  - s001 → single char symbols
- Ensure uniqueness of symbol per palette
- Preserve ordering
- Do NOT add validators
- Do NOT modify runtime
