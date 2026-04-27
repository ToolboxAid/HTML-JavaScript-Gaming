MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_10_5_NO_HIDDEN_TOOL_COUPLING_VALIDATION.

NON-NEGOTIABLE RULES:
- Do not allow silent fallback data.
- Do not allow hardcoded asset paths.
- Tools must use explicit manifest/input data.
- No input means safe empty state, not demo/sample data.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_10_5_NO_HIDDEN_TOOL_COUPLING_VALIDATION.md.
2. Read docs/pr/BUILD_PR_LEVEL_10_5_NO_HIDDEN_TOOL_COUPLING_VALIDATION.md.
3. Scan all active first-class tools for:
   - silent fallback sample/demo data
   - hardcoded JSON asset paths
   - implicit sample loading
   - fetches to old sample/tool demo JSON
4. Remove/fix any discovered fallback behavior.
5. Ensure tools with no input show safe empty state.
6. Ensure tools with manifest slice input render the provided data.
7. Add/update regression tests for:
   - no hidden data without input
   - no hardcoded JSON asset fetches
   - manifest input rendering
8. Write reports:
   - docs/dev/reports/level_10_5_no_hidden_tool_coupling_report.md
   - docs/dev/reports/level_10_5_hardcoded_asset_path_audit.md
9. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
   - [ ] -> [.]
   - [.] -> [x]
   - no prose rewrite/delete
10. Do not add validators.
11. Do not modify start_of_day.
12. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_10_5_NO_HIDDEN_TOOL_COUPLING_VALIDATION_delta.zip

ACCEPTANCE:
- no silent fallback data remains
- no hardcoded JSON asset paths remain
- delta ZIP exists
