MODEL: GPT-5.3-codex
REASONING: high

TASK:
Apply BUILD_PR_LEVEL_8_32_DIRECT_GAME_LAUNCH_HOOK_REMOVAL_AND_ASTEROIDS_PARITY.

STEPS:
1. Read docs/pr/PLAN_PR_LEVEL_8_32_DIRECT_GAME_LAUNCH_HOOK_REMOVAL_AND_ASTEROIDS_PARITY.md.
2. Read docs/pr/BUILD_PR_LEVEL_8_32_DIRECT_GAME_LAUNCH_HOOK_REMOVAL_AND_ASTEROIDS_PARITY.md.
3. Search for the redirect hook using:
   - "Workspace Manager/index.html"
   - "mount=game"
   - "?game="
   - "gameId"
   - "open with workspace"
   - "launchGame"
   - "preview"
4. Find why direct preview launches redirect to Workspace Manager.
5. Remove/disable that redirect for normal game preview clicks.
6. Preserve explicit Workspace Manager action only.
7. If shared helper mixes concerns, split behavior:
   - direct game launch helper
   - workspace manager launch helper
8. Correct Workspace Manager query name to gameId wherever explicit Workspace Manager action remains.
9. Smoke check:
   - SpaceInvaders direct launch remains working
   - Bouncing Ball direct launch works
   - Asteroids direct launch works
   - Pong direct launch works if present
   - Breakout direct launch works if present
10. Continue Asteroids parity cleanup only if safe and already scoped by 8.31.
11. Update docs/dev/reports/level_8_32_direct_launch_hook_and_asteroids_parity_report.md.
12. Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md status only:
    - [ ] -> [.]
    - [.] -> [x]
    - no prose rewrite/delete
13. Do not add validators.
14. Do not modify start_of_day.
15. Create Codex delta ZIP:
    tmp/BUILD_PR_LEVEL_8_32_DIRECT_GAME_LAUNCH_HOOK_REMOVAL_AND_ASTEROIDS_PARITY_delta.zip

ACCEPTANCE:
- Game preview click launches game directly.
- No normal preview sends browser to Workspace Manager.
- Explicit Workspace Manager action still works with gameId.
- Delta ZIP exists.
