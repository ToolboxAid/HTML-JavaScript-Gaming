MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_19_16_TOOLCHAIN_ENGINE_INTEGRATION_VALIDATION as a narrow, execution-backed PR bundle.

Constraints:
- You, Codex, must perform all code, test, and script work required for this PR.
- Do not rely on ChatGPT-authored implementation, tests, or scripts.
- Keep this PR focused only on Phase 19 Track E toolchain validation.
- No broad repo scans unless required by the scoped validation lane.
- Preserve engine/shared/game/tool boundaries.
- Update roadmap status only if backed by successful execution and validation.
- Package the final repo-structured ZIP to:
  <project folder>/tmp/BUILD_PR_LEVEL_19_16_TOOLCHAIN_ENGINE_INTEGRATION_VALIDATION.zip

Required outputs inside your final ZIP:
- docs/pr/BUILD_PR_LEVEL_19_16_TOOLCHAIN_ENGINE_INTEGRATION_VALIDATION.md
- docs/dev/codex_commands.md
- docs/dev/commit_comment.txt
- docs/dev/reports/change_summary.txt
- docs/dev/reports/validation_checklist.txt
- docs/dev/reports/file_tree.txt
- any implementation/tests/scripts you create
- roadmap status update only if execution-backed
