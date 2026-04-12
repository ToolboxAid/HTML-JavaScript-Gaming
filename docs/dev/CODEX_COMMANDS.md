MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Execute BUILD_PR_TARGETED_REPO_CLEANUP_PASS_7_FINAL_REVIEW_AND_DECISION

Input:
- normalization complete
- classes_old_keep = docs-only placeholder

Steps:
1. Review all normalized references
2. Decide:
   a) remove references OR
   b) keep placeholder
3. Justify decision
4. Create:
   docs/dev/reports/classes_old_keep_final_decision_report.md
   docs/dev/reports/classes_old_keep_cleanup_recommendation.md
   docs/dev/reports/validation_checklist.txt

Constraints:
- no file deletion in this PR
- no folder creation
- no runtime changes

Output:
<project folder>/tmp/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_7_FINAL_REVIEW_AND_DECISION.zip