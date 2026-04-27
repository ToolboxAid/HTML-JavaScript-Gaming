MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_10_2_WORKSPACE_MANAGER_OPEN_TEST_AND_SHARED_BOUNDARY_AUDIT.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_10_2_WORKSPACE_MANAGER_OPEN_TEST_AND_SHARED_BOUNDARY_AUDIT.md.
2. Read docs/pr/BUILD_PR_LEVEL_10_2_WORKSPACE_MANAGER_OPEN_TEST_AND_SHARED_BOUNDARY_AUDIT.md.
3. Add a focused runtime/browser test for `games/index.html`:
   - discover all games/cards/actions
   - validate "Open with Workspace Manager" uses `gameId=<id>&mount=game`
   - reject legacy `?game=`
   - ensure Workspace Manager diagnostic does not appear when clicked/opened
4. Ensure the new test does not run samples or tools.
5. Add a focused npm script only if useful, such as:
   - `test:workspace-manager:games`
6. Audit `tools/shared/asteroidsPlatformDemo.js`:
   - imports
   - consumers
   - domain ownership
   - move recommendation
7. Move `tools/shared/asteroidsPlatformDemo.js` only if safe and obvious; otherwise report follow-up.
8. Write reports:
   - docs/dev/reports/level_10_2_workspace_manager_open_test_report.md
   - docs/dev/reports/level_10_2_asteroids_platform_demo_boundary_audit.md
9. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
   - [ ] -> [.]
   - [.] -> [x]
   - no prose rewrite/delete
10. Do not modify start_of_day.
11. Do not add validators.
12. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_10_2_WORKSPACE_MANAGER_OPEN_TEST_AND_SHARED_BOUNDARY_AUDIT_delta.zip

ACCEPTANCE:
- games index Workspace Manager action test exists
- all game actions use gameId + mount=game
- boundary audit exists
- delta ZIP exists
