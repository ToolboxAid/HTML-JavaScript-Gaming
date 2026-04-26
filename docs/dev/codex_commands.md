MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Refactor samples to multi-file tool payload model.

STEPS:
1. Remove any "tools" arrays inside sample JSON files.
2. For each tool used in a sample:
   - Create file: sample.<id>.<tool>.json
3. Ensure each file:
   - references tool schema via $schema
   - matches EXACT structure of workspace manifest tool payload
4. Remove wrapper fields:
   - documentKind
   - id
   - type
5. Keep palette as separate file if exists.
6. Do NOT modify runtime.
7. Do NOT add validators.
8. Do NOT modify start_of_day.

ACCEPTANCE:
- Each sample tool is its own file
- File format matches workspace tool payload
- No arrays or wrappers remain
