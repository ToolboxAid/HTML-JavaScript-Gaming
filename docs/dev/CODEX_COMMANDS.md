MODEL: GPT-5.3-codex
REASONING: medium

COMMAND:
Execute BUILD_PR_TARGETED_REPO_CLEANUP_PASS_5_CLASSES_OLD_KEEP_POLICY_PS_FIRST.

Use the user-supplied PowerShell scan evidence as the primary source of truth:
- `classes_old_keep` appears only in docs/planning/generated-doc files
- no `classes_old_keep` directory exists on disk
- no active runtime/code references were found in the supplied scan output

Create exactly:
- docs/dev/reports/classes_old_keep_policy_inventory.md
- docs/dev/reports/classes_old_keep_policy_decision.md
- docs/dev/reports/classes_old_keep_validation_guard.md
- docs/dev/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_5_CLASSES_OLD_KEEP_POLICY_PS_FIRST_report.md
- docs/dev/reports/validation_checklist.txt

Constraints:
- Do NOT rerun broad repo discovery scans already completed by the user unless needed only to validate a specific contradiction.
- Do NOT create, move, rename, or delete any `classes_old_keep/` directory.
- Do NOT modify templates/, docs/archive/, or SpriteEditor archive surfaces.
- Do NOT modify runtime code or repo structure.
- If roadmap updates are needed, apply bracket-only changes only where exact wording already exists.

Package output to:
<project folder>/tmp/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_5_CLASSES_OLD_KEEP_POLICY_PS_FIRST.zip
