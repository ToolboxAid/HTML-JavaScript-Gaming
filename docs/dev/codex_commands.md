MODEL: GPT-5.3-codex
REASONING: medium

TASK:
- Add $schema to all sample JSON files
- Align sample config.json to tool.schema.json
- Align palette.json to shared schema
- Remove any non-schema-compliant fields
- Do NOT add validation utilities
- Do NOT modify runtime logic

OUTPUT:
- All samples schema-compliant
