MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_10_2A_WORKSPACE_MANAGER_ASSET_PRESENCE_VALIDATION.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_10_2A_WORKSPACE_MANAGER_ASSET_PRESENCE_VALIDATION.md.
2. Read docs/pr/BUILD_PR_LEVEL_10_2A_WORKSPACE_MANAGER_ASSET_PRESENCE_VALIDATION.md.
3. Open the Level 10.2 Workspace Manager open test.
4. Extend it so it validates game data presence after opening each game through Workspace Manager.
5. Keep existing checks:
   - gameId query
   - mount=game
   - no ?game=
   - no diagnostic
6. Add asset presence checks:
   - shared palette present
   - expected shared assets/tool sections present
   - skin data present when expected
7. Specifically fail Bouncing-ball if the UI shows:
   - `Shared Palette: No shared palette selected`
8. Ensure this test does not run samples/tools.
9. Write docs/dev/reports/level_10_2a_workspace_manager_asset_presence_validation_report.md.
10. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
    - [ ] -> [.]
    - [.] -> [x]
    - no prose rewrite/delete
11. Do not add validators.
12. Do not modify start_of_day.
13. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_10_2A_WORKSPACE_MANAGER_ASSET_PRESENCE_VALIDATION_delta.zip

ACCEPTANCE:
- page-load-only false positives are prevented
- missing palette is caught
- Bouncing-ball missing palette issue is detected/fixed or reported
- delta ZIP exists
