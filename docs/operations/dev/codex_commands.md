MODEL: GPT-5.3-codex
REASONING: medium

TASK:
Apply BUILD_PR_LEVEL_9_9_LAUNCH_SMOKE_GAMES_ONLY_FAST_PATH.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_9_9_LAUNCH_SMOKE_GAMES_ONLY_FAST_PATH.md.
2. Read docs/pr/BUILD_PR_LEVEL_9_9_LAUNCH_SMOKE_GAMES_ONLY_FAST_PATH.md.
3. Inspect:
   - package.json
   - tests/runtime/LaunchSmokeAllEntries.test.mjs
   - scripts that invoke launch smoke tests
4. Add or update a dedicated games-only command:
   - preferred: npm run test:launch-smoke:games
   - must pass: --games
5. Ensure games-only command invokes LaunchSmokeAllEntries exactly once.
6. Do not remove full all-entry launch smoke behavior.
7. Ensure games-only excludes samples and tools.
8. Write docs/dev/reports/level_9_9_launch_smoke_games_only_fast_path_report.md with final command and validation.
9. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only if needed:
   - [ ] -> [.]
   - [.] -> [x]
   - no prose rewrite/delete
10. Do not modify start_of_day.
11. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_9_9_LAUNCH_SMOKE_GAMES_ONLY_FAST_PATH_delta.zip

ACCEPTANCE:
- games-only launch smoke command exists
- samples/tools excluded
- duplicate game execution false
- delta ZIP exists
