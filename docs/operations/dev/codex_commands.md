MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply BUILD_PR_LEVEL_8_23_WORKSPACE_MANIFEST_GAMES_FIELD_ALIGNMENT.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_8_23_WORKSPACE_MANIFEST_GAMES_FIELD_ALIGNMENT.md.
2. Read docs/pr/BUILD_PR_LEVEL_8_23_WORKSPACE_MANIFEST_GAMES_FIELD_ALIGNMENT.md.
3. Audit workspace manifest files:
   - workspace.manifest.json
   - tmp/new-work-space-workspace.project.json if present/tracked and governed by workspace.schema.json
4. For each workspace manifest governed by workspace.schema.json:
   - ensure root "games" exists
   - use [] if no games are currently defined
   - preserve existing root fields
   - do not add samples/phase/sampleId
5. Re-check tools/schemas/workspace.schema.json:
   - no samples
   - no sampleId
   - no sample-only phase requirement
6. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only:
   - use only [ ] -> [.] or [.] -> [x]
   - do not rewrite/delete/reflow roadmap text
7. Write findings to docs/dev/reports/level_8_23_workspace_manifest_games_field_alignment_report.md.
8. Do not modify runtime files.
9. Do not add validators.
10. Do not modify start_of_day.

ACCEPTANCE:
- missing_games_after=0
- workspace_schema_sample_concepts=0
- roadmap updates are status-only
- runtime/start_of_day unchanged
