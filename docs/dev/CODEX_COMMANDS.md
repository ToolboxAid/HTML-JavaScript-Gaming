MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute this flagship demo package in order.

Step 1:
Treat docs/pr/PLAN_PR_ASTEROIDS_PLATFORM_DEMO.md as the governing architecture contract.

Step 2:
Create BUILD_PR_ASTEROIDS_PLATFORM_DEMO.

BUILD requirements:
- Implement a flagship Asteroids-style demo using accepted platform boundaries only
- Include player ship, bullets, asteroid spawning/splitting, score, lives, waves, and title/game-over loop
- Use registry-owned, validation-compatible content paths
- Validate/package/run through strict platform flows
- Expose debug/profiler visibility where already supported by the platform
- Keep the demo reusable as a future template candidate
- Do not modify engine core APIs

Step 3:
Validate BUILD against docs/pr/BUILD_PR_ASTEROIDS_PLATFORM_DEMO.md.

Step 4:
Treat docs/pr/APPLY_PR_ASTEROIDS_PLATFORM_DEMO.md as the acceptance boundary and package results.

Package:
HTML-JavaScript-Gaming/tmp/GAME_PR_ASTEROIDS_PLATFORM_DEMO_delta.zip
