Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-GRAVITY-WELL-VALIDATION-PHASE2-WORLD-MECHANICS. Add focused tests for games/GravityWell/game/GravityWellWorld.js covering thrust-only directionality, gravity-only baseline, thrust-plus-gravity interaction, brake damping, max-speed clamp, pickup boundary edge cases, no-double-count collection, final-beacon win transition, planet/out-of-bounds loss, and loss-vs-collection ordering. Prefer tests over runtime changes. Apply only minimal fixes directly required by failing validation and keep them within games/GravityWell/. Do not change engine code, expand gameplay, or move into timing-stress validation yet.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that Gravity Well world-mechanics validation was added, any runtime fixes are minimal and local to games/GravityWell/, and no timing-stress/engine/promotion changes were introduced.
