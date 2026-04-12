MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Execute BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1.

- Create `docs/dev/reports/cleanup_target_enforcement_map.md`, `docs/dev/reports/cleanup_execution_guard.md`, `docs/dev/reports/cleanup_target_normalization_report.md`, `docs/dev/reports/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1_report.md`, and `docs/dev/reports/validation_checklist.txt` exactly as specified in `docs/pr/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1.md`.
- Use only the existing cleanup inventory, cleanup matrix, prior cleanup BUILD report, templates inventory, templates policy, templates validation guard, templates BUILD report, repo cleanup targets list, and master roadmap as source evidence.
- Do not modify `templates/`, runtime code, test logic, repo structure, or protected start_of_day directories.
- Do not introduce new cleanup targets.
- If roadmap alignment is attempted, it must be bracket-only and only if the exact existing text already supports it.
- Package output to:
  <project folder>/tmp/BUILD_PR_TARGETED_REPO_CLEANUP_PASS_1.zip
