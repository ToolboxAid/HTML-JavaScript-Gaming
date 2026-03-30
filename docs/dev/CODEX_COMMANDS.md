MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_11_3_AUTHORITATIVE_STATE_NEXT_SLICE as a docs-only validation delta.

REQUIREMENTS:
- Validate readiness criteria
- Confirm NO implementation changes
- Produce report

REQUIRED OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/validation_checklist.txt
docs/dev/reports/readiness_decision.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_LEVEL_11_3_AUTHORITATIVE_STATE_NEXT_SLICE_delta.zip
- Include docs/dev/reports/
