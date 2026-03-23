Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-GRAVITY-WELL-VALIDATION-PHASE1-BOOT-SCENE. Add focused validation tests for games/GravityWell/main.js and games/GravityWell/game/GravityWellScene.js covering safe no-document/no-canvas boot paths, successful engine creation/install/start, safe fullscreen click composition, and top-level scene transitions such as menu->playing and restart after won/lost. Prefer tests over runtime changes. Apply only minimal fixes directly required by failing validation and keep them within games/GravityWell/. Do not change engine code or expand gameplay.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that Gravity Well boot and scene validation was added, any runtime fixes are minimal and local to games/GravityWell/, and no engine or gameplay-expansion changes were introduced.
