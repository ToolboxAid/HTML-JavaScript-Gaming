# Codex command for PLAN_PR_SAMPLES_BUNDLED_FINALIZATION

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create PLAN_PR_SAMPLES_BUNDLED_FINALIZATION as docs-only planning.

OBJECTIVE:
Bundle the remaining samples PRs into the fewest rule-safe BUILD/APPLY waves.

CONSTRAINTS:
- docs only
- no implementation code
- preserve one PR purpose only
- preserve testability gate
- preserve canonical sample paths
- no gameplay scope
- no engine-core scope
- no start_of_day directory changes

PLANNING REQUIREMENTS:
1. Cover all 7 remaining sample objectives
2. Minimize the number of future BUILD/APPLY waves
3. Do not combine incompatible purposes into one BUILD
4. Keep each future BUILD testable
5. Keep Windows-safe zero-dependency execution assumptions intact

OUTPUT FILES:
- docs/pr/PLAN_PR_SAMPLES_BUNDLED_FINALIZATION.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt
- docs/dev/reports/file_tree_delta.txt

ZIP OUTPUT REQUIREMENT:
- MUST produce ZIP:
  <project folder>/tmp/PLAN_PR_SAMPLES_BUNDLED_FINALIZATION.zip
- Task is not complete until the ZIP exists at that exact path
