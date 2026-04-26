MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply PR 8.12: decouple tool payload files from palette references.

STEPS:
1. Scan all sample tool payload files matching:
   - samples/**/sample.*.*.json
2. Remove top-level palette fields from those tool payload files.
3. Specifically ensure:
   - sample.0207.sprite-editor.json has no palette reference.
4. Keep sample.palette.json files unchanged.
5. Keep palette.schema.json unchanged unless it already violates swatches/symbol rules.
6. Keep tool schemas consistent with workspace manifest tools[] entries.
7. Do NOT add runtime code.
8. Do NOT add validators.
9. Do NOT modify start_of_day.

ACCEPTANCE:
- sample_tool_files_with_palette_field=0
- sample.palette.json files remain separate
- all tool payloads match workspace tools[] payload shape
