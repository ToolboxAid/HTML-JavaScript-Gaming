MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply BUILD_PR_LEVEL_8_20_WORKSPACE_SCHEMA_AUDIT_AND_CLEANUP.

STEPS:
1. Audit tools/schemas/workspace.schema.json.
2. Confirm it has no sample-only concepts:
   - samples
   - sampleId
   - sample-only phase requirement
   - sample launch semantics
3. If violations exist, remove only the sample-only schema fields/concepts.
4. Do not modify runtime files.
5. Do not add validators.
6. Do not modify start_of_day.
7. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only:
   - [.] -> [x] for 17/17 schema coverage if confirmed.
   - [.] -> [x] for sample payload shape if PR 8.19 audit remains valid.
   - [ ] -> [.] for workspace schema no sample-only concepts.
8. Write validation findings to docs/dev/reports/level_8_20_workspace_schema_audit_report.md.

ACCEPTANCE:
- workspace_schema_sample_concepts=0
- roadmap status movement only
- runtime/start_of_day unchanged
