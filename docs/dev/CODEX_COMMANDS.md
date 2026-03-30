MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_11_4_AUTHORITATIVE_STATE_SCORE_IMPLEMENTATION as an implementation delta.

ENFORCED REQUIREMENTS:
- Add feature gate (authoritativeScore = false)
- Implement ONE authoritative score transition
- All writes via transition only
- Selectors read-only
- ONE consumer only
- Add contract tests
- DO NOT modify engine/

REQUIRED REPORT OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_LEVEL_11_4_AUTHORITATIVE_STATE_SCORE_IMPLEMENTATION_delta.zip
- Include docs/dev/reports/
