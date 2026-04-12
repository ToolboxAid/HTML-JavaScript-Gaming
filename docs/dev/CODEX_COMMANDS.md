MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Execute BUILD_PR_TARGETED_REPO_CLEANUP_PASS_8_REMOVE_CLASSES_OLD_KEEP_REFERENCES.

Inputs:
- Decision = REMOVE (from PASS_7)
- References exist only in docs/planning files

Steps:
1) Find all occurrences of "legacy class-retention policy marker" in docs (*.md, *.txt)
2) For each occurrence:
   - Remove the reference OR
   - Rewrite to a neutral phrase (no placeholder mention)
3) Ensure no semantic break in docs
4) Generate:
   - docs/dev/reports/legacy class-retention policy marker_removal_change_log.md
   - docs/dev/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_8_REMOVE_CLASSES_OLD_KEEP_REFERENCES_report.md
   - docs/dev/reports/validation_checklist.txt

Constraints:
- Do NOT create/delete/move any directories
- Do NOT modify templates/ or docs/archive/ or start_of_day/*
- Do NOT touch runtime code

Package to:
<project folder>/tmp/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_8_REMOVE_CLASSES_OLD_KEEP_REFERENCES.zip

