MODEL: GPT-5.3-codex
REASONING: medium

COMMAND:
Validate PASS_7 decision artifacts.

Steps:
1) Confirm existence of:
   - docs/dev/reports/classes_old_keep_final_decision_report.md
   - docs/dev/reports/classes_old_keep_cleanup_recommendation.md
2) Verify decision consistency with prior normalization:
   - references use "docs-only placeholder" wording
3) Confirm no structural changes:
   - no classes_old_keep directory exists on disk
   - no changes under templates/ or docs/archive/ or start_of_day/*
4) Generate:
   - docs/dev/reports/classes_old_keep_final_decision_validation.md
   - docs/dev/reports/validation_checklist.txt
5) If inconsistencies found, list them (DO NOT FIX)

Package to:
<project folder>/tmp/APPLY_PR_TARGETED_REPO_CLEANUP_PASS_7_DECISION_v2.zip
