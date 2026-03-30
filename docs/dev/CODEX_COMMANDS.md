MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_11_1_AUTHORITATIVE_STATE_HANDOFF_CANDIDATE as an implementation delta.

ENFORCED REQUIREMENTS:
- Add feature gate (authoritativeObjectiveProgress = false by default)
- Modify ONE transition to become authoritative
- Ensure all writes go through that transition only
- Keep selectors read-only
- Keep ONE consumer only (read-only)
- Add contract tests
- DO NOT modify engine/

REQUIRED REPORT OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_LEVEL_11_1_AUTHORITATIVE_STATE_HANDOFF_CANDIDATE_delta.zip
- Include docs/dev/reports/ in ZIP
