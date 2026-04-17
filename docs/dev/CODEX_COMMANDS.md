# Codex Command

MODEL: GPT-5.4-codex  
REASONING: high

Use the repository root as the working directory.

Implement `BUILD_PR_LEVEL_18_1_ENGINE_USAGE_ENFORCEMENT_AUDIT_SLICE` exactly as specified in `docs/pr/BUILD_PR_LEVEL_18_1_ENGINE_USAGE_ENFORCEMENT_AUDIT_SLICE.md`.

Requirements:
- keep scope bounded to the overlay runtime hardening slice
- do not scan or edit unrelated repo areas
- migrate only clearly duplicated local logic to already-existing stable `src/engine` or `src/shared` surfaces
- update or add only the smallest necessary tests
- update roadmap status markers only for directly completed work
- package the finished repo-structured ZIP to:
  `<project folder>/tmp/BUILD_PR_LEVEL_18_1_ENGINE_USAGE_ENFORCEMENT_AUDIT_SLICE.zip`

Output required in the ZIP:
- implementation changes
- updated roadmap status markers
- any validation-backed test changes
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/validation_checklist.txt`
- `docs/dev/reports/file_tree.txt`
