MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_10_3_MIGRATE_TOOL_LOCAL_SAMPLES_TO_SAMPLES.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_10_3_MIGRATE_TOOL_LOCAL_SAMPLES_TO_SAMPLES.md.
2. Read docs/pr/BUILD_PR_LEVEL_10_3_MIGRATE_TOOL_LOCAL_SAMPLES_TO_SAMPLES.md.
3. Inspect these tool folders for local samples/demo entries:
   - tools/Vector Map Editor
   - tools/Vector Asset Studio
   - tools/Parallax Scene Studio
   - tools/Tilemap Studio
4. Identify each tool-local sample/demo payload.
5. Move/copy each sample into the correct `samples/phase-*` folder using next available sample IDs.
6. Preserve sample behavior and required data.
7. Update `samples/index.html`.
8. Remove tool-local sample dropdown/select entries from the processed tools after migrated samples exist.
9. Ensure tools still accept explicit manifest/input data.
10. Add/update tests for:
    - migrated sample presence in samples/index.html
    - migrated sample launch
    - removal of tool-local sample dropdown/select entries
11. Write docs/dev/reports/level_10_3_tool_local_sample_migration_report.md.
12. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
    - [ ] -> [.]
    - [.] -> [x]
    - no prose rewrite/delete
13. Do not modify start_of_day.
14. Do not add validators.
15. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_10_3_MIGRATE_TOOL_LOCAL_SAMPLES_TO_SAMPLES_delta.zip

ACCEPTANCE:
- all discovered tool-local samples from listed tools are migrated
- samples/index.html updated
- local sample dropdown/selects removed
- delta ZIP exists
