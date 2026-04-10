MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create PLAN_PR_SAMPLES_FILTER_AND_SEARCH as docs-only planning.

OBJECTIVE:
Define a narrow, testable filter-and-search layer for the samples index using canonical sample paths and metadata-driven readable content.

CONSTRAINTS:
- docs only
- no implementation code changes
- no gameplay scope
- no engine-core scope
- no path normalization changes
- no start_of_day directory changes

PLANNING REQUIREMENTS:
1. Define minimal UX for:
   - phase filtering
   - tag filtering
   - search
2. Define combined state behavior
3. Define source-of-truth boundaries among:
   - canonical folder structure
   - metadata
   - index UI behavior
4. Define validation and fail-fast expectations
5. Keep the future BUILD testable and narrowly scoped

OUTPUT FILES:
- docs/pr/PLAN_PR_SAMPLES_FILTER_AND_SEARCH.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt
- docs/dev/reports/file_tree_delta.txt

ZIP OUTPUT REQUIREMENT:
- MUST produce ZIP:
  <project folder>/tmp/PLAN_PR_SAMPLES_FILTER_AND_SEARCH.zip
- Task is not complete until the ZIP exists at that exact path
