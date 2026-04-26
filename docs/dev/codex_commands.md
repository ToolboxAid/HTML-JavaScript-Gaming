MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply PR 8.16: document remaining work and canonical first-class tool inventory.

STEPS:
1. Inspect the repo's tool folders and schemas.
2. Create/update a canonical 17-tool inventory document.
3. Fill all 17 rows with:
   - tool id
   - display name
   - folder path
   - schema path
   - palette/data usage
4. Verify each first-class tool has exactly one schema.
5. Do not invent tools. Use the repo's actual first-class tool set.
6. Keep this PR docs/inventory only.
7. Do NOT modify runtime logic.
8. Do NOT add validators.
9. Do NOT modify start_of_day.

ACCEPTANCE:
- 17 first-class tools are listed.
- Tool schema paths are explicit.
- Remaining work checklist is updated.
- No runtime/start_of_day changes.
