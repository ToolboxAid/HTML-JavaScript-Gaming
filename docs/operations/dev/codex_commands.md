MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply BUILD_PR_LEVEL_8_17_ROADMAP_AND_SKIN_EDITOR_SCHEMA.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_8_17_ROADMAP_AND_SKIN_EDITOR_SCHEMA.md.
2. Read docs/pr/BUILD_PR_LEVEL_8_17_ROADMAP_AND_SKIN_EDITOR_SCHEMA.md.
3. Add tools/schemas/tools/skin-editor.schema.json exactly as provided unless an equivalent schema already exists.
4. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md:
   - If the Level 8 schema-driven normalization section already exists, update status markers only.
   - If it does not exist, append the Level 8 section from docs/dev/roadmaps/MASTER_ROADMAP_ENGINE_LEVEL_8_APPEND.md.
   - Do not delete, rewrite, reflow, or paraphrase existing roadmap text.
5. Add docs/dev/reports/level_8_17_roadmap_and_skin_editor_schema_report.md with validation findings.
6. Verify first-class schema coverage is now 17/17.
7. Do not modify runtime files.
8. Do not add validators.
9. Do not modify start_of_day.

ACCEPTANCE:
- Roadmap status advanced using only [ ] -> [.] or [.] -> [x].
- skin-editor schema exists.
- 17/17 first-class tools have exactly one schema.
- Runtime/start_of_day unchanged.
