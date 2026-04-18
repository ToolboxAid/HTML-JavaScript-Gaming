# Legacy Marker Reference Removal Change Log

Generated: 2026-04-12  
Lane: BUILD_PR_TARGETED_REPO_CLEANUP_PASS_8_REMOVE_CLASSES_OLD_KEEP_REFERENCES

## Scope Executed
- Searched `docs/**/*.md` and `docs/**/*.txt`
- Excluded:
  - `docs/archive/**`
  - `**/start_of_day/**`

## Rewrite Policy Applied
- Removed direct token references.
- Rewrote retained mentions to neutral wording:
  - `legacy class-retention policy marker`

## Files Updated By Rewrite Pass
- `docs/operations/dev/codex_commands.md`
- `docs/operations/dev/commit_comment.txt`
- `docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`
- `docs/reports/archived_notes_policy_decision.md`
- `docs/reports/archived_notes_validation_guard.md`
- `docs/pr/APPLY_PR_TARGETED_REPO_CLEANUP_PASS_7_DECISION_v2.md`
- `docs/reports/BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE_report.md`
- `docs/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1_report.md`
- `docs/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_6_CLASSES_OLD_KEEP_REFERENCE_NORMALIZATION_report.md`
- `docs/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_5_CLASSES_OLD_KEEP_POLICY_PS_FIRST_report.md`
- `docs/reports/change_summary.txt`
- legacy marker cleanup recommendation report (`docs/dev/reports/*_cleanup_recommendation.md`)
- legacy marker final decision report (`docs/dev/reports/*_final_decision_report.md`)
- legacy marker policy inventory report (`docs/dev/reports/*_policy_inventory.md`)
- legacy marker final decision validation report (`docs/dev/reports/*_final_decision_validation.md`)
- legacy marker policy decision report (`docs/dev/reports/*_policy_decision.md`)
- legacy marker normalization report (`docs/dev/reports/*_normalization_report.md`)
- legacy marker validation guard (`docs/dev/reports/*_validation_guard.md`)
- `docs/reports/cleanup_execution_guard.md`
- `docs/reference/features/docs-system/move-history-preserved.md`
- `docs/reports/cleanup_live_reference_inventory.txt`
- `docs/reports/cleanup_target_normalization_report.md`
- `docs/reports/cleanup_target_enforcement_map.md`
- `docs/reports/repo_cleanup_targets.txt`
- `docs/pr/BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE.md`
- `docs/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1.md`
- `docs/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_6_CLASSES_OLD_KEEP_REFERENCE_NORMALIZATION.md`
- `docs/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_3_ARCHIVED_NOTES_POLICY.md`
- `docs/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_5_CLASSES_OLD_KEEP_POLICY.md`
- `docs/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_8_REMOVE_CLASSES_OLD_KEEP_REFERENCES.md`
- `docs/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_5_CLASSES_OLD_KEEP_POLICY_PS_FIRST.md`
- `docs/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_7_FINAL_REVIEW_AND_DECISION.md`
- `docs/pr/BUILD_PR_TEMPLATES_POLICY_CLASSIFICATION.md`

## Validation Snapshot
- Remaining token matches in scoped docs content: `0`
- Runtime code touched: `no`
- Protected directories touched (`templates/`, `docs/archive/`, `start_of_day/*`): `no`
