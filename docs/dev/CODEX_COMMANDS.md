MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Execute BUILD_PR_TARGETED_REPO_CLEANUP_PASS_3_ARCHIVED_NOTES_POLICY.

- Create archived notes policy inventory, policy decision, validation guard, BUILD report, and validation checklist exactly as specified in:
  docs/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_3_ARCHIVED_NOTES_POLICY.md
- Use existing cleanup evidence as the source of truth for archived notes:
  - docs/dev/reports/cleanup_live_reference_inventory.txt
  - docs/dev/reports/cleanup_keep_move_future_delete_matrix.md
- Do NOT modify docs/archive/, templates/, runtime code, or repo structure.
- Do NOT introduce new cleanup targets.
- If roadmap updates are needed, apply bracket-only changes only where exact wording already exists.
- Package output to:
  <project folder>/tmp/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_3_ARCHIVED_NOTES_POLICY.zip
