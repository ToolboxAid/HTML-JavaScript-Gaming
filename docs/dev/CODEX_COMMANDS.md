MODEL: GPT-5.4
REASONING: high

PRIMARY COMMAND:
Create BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE exactly as specified in `docs/pr/BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE.md`.

Required actions:
1. Update `docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md` using bracket-only state changes where exact roadmap text matches planned deltas.
2. Create cleanup evidence reports:
   - `docs/dev/reports/cleanup_live_reference_inventory.txt`
   - `docs/dev/reports/cleanup_keep_move_future_delete_matrix.md`
   - `docs/dev/reports/BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE_report.md`
   - `docs/dev/reports/validation_checklist.txt`
3. Optionally refresh only if needed for accuracy:
   - `docs/dev/reports/repo_cleanup_targets.txt`
   - `docs/dev/reports/roadmap_status_delta.txt`
4. Do not delete, move, rename, or modify `templates/`.
5. Do not touch `docs/dev/start_of_day/chatGPT/` or `docs/dev/start_of_day/codex/`.
6. Package the resulting repo-structured ZIP to:
   - `<project folder>/tmp/BUILD_PR_REPO_CLEANUP_AND_ROADMAP_UPDATE.zip`

Validation requirements:
- prove roadmap edits were bracket-only
- prove no protected start_of_day files changed
- prove no delete/move/rename happened
- prove `templates/` remained untouched
- record unmatched roadmap deltas in the BUILD report instead of rewriting wording
