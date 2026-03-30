MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_11_2_AUTHORITATIVE_STATE_EXPANSION_REVIEW as a docs + validation delta.

REQUIREMENTS:
- Analyze Level 11.1 results
- Validate against expansion criteria
- Produce EXPAND or HOLD decision
- DO NOT add new implementation
- DO NOT modify engine/

REQUIRED OUTPUT:
docs/dev/reports/file_tree.txt
docs/dev/reports/change_summary.txt
docs/dev/reports/validation_checklist.txt
docs/dev/reports/expansion_decision.txt

FINAL STEP:
- Output ZIP to:
  <project folder>/tmp/BUILD_PR_LEVEL_11_2_AUTHORITATIVE_STATE_EXPANSION_REVIEW_delta.zip
- Include docs/dev/reports/
