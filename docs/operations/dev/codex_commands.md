MODEL: GPT-5.3-codex

TASK:
Fix Asteroids preview to launch game directly.

STEPS:
1. Locate preview.svg click handler / link source
2. Replace Workspace Manager route with direct game launch route
3. Ensure no gameId/mount query required
4. Do not modify runtime logic beyond routing
5. Do not modify start_of_day

OUTPUT:
tmp/BUILD_PR_LEVEL_8_29B_ASTEROIDS_DIRECT_LAUNCH_FIX_delta.zip
