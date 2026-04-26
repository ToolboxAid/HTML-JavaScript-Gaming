MODEL: GPT-5.3-codex
REASONING: low

TASK:
Document-only PR.

- Do NOT rename files
- Do NOT modify payloads
- Do NOT modify runtime

Verify:
- sample.<id>.<tool>.json are tool payloads
- sample.<id>.palette.json are palette data files

Ensure:
- no new invalid naming patterns introduced

ACCEPTANCE:
- Naming rules clearly documented
- No file changes required
