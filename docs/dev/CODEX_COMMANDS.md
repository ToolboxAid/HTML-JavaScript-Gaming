# Codex command for PLAN_PR_SAMPLES_METADATA_LAYER

MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Create PLAN_PR_SAMPLES_METADATA_LAYER as docs-only planning.

OBJECTIVE:
Define a minimal metadata layer for canonical sample paths so the generated samples index can render stable human-readable titles, descriptions, and tags.

CONSTRAINTS:
- docs only
- no implementation code changes
- no gameplay scope
- no engine-core scope
- no start_of_day directory changes

PLANNING REQUIREMENTS:
1. Define the minimal metadata schema
2. Define where the metadata should live
3. Define source-of-truth boundaries between:
   - canonical folder structure
   - metadata content
   - generated index rendering
4. Define fail-fast rules for:
   - duplicate IDs
   - duplicate entries
   - phase/sample mismatches
   - missing required fields
5. Keep the future BUILD testable and narrowly scoped

OUTPUT FILES:
- docs/pr/PLAN_PR_SAMPLES_METADATA_LAYER.md
- docs/dev/commit_comment.txt
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt
- docs/dev/reports/file_tree_delta.txt

ZIP OUTPUT REQUIREMENT:
- MUST produce ZIP:
  <project folder>/tmp/PLAN_PR_SAMPLES_METADATA_LAYER.zip
- Task is not complete until the ZIP exists at that exact path
