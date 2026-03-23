Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-GRAVITY-WELL-VALIDATION-PHASE3-DETERMINISM-TIMING-STRESS. Add focused tests for games/GravityWell/game/GravityWellWorld.js covering replay repeatability from the same input script, coarse-dt vs stepped-dt comparison, win/loss consistency under timing variation, and bounded longer-run stability checks. Use explicit tolerance where floating-point comparison requires it. Prefer tests over runtime changes. Apply only minimal fixes directly required by failing validation and keep them within games/GravityWell/. Do not change engine code, expand gameplay, or do promotion work.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that Gravity Well determinism and timing-stress validation was added, tolerance use is explicit, any runtime fixes are minimal and local to games/GravityWell/, and no engine/promotion/gameplay-expansion changes were introduced.
