Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-ASTEROIDS-VALIDATION-PHASE1-BOOT-LIFECYCLE-PERSISTENCE. Validate games/Asteroids/ for browser boot readiness, scene lifecycle through real game flow, fullscreen/browser-entry behavior, and persistence/snapshot/player-swap safety. Add focused validation tests under tests/games/ and/or tests/engine/ where practical. Make only minimal runtime fixes directly required by validation findings. Do not do promotion/extraction, broad refactors, sample consolidation, or unrelated gameplay expansion.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that Asteroids boot/lifecycle/persistence/fullscreen validation was added, any runtime fixes are minimal and directly tied to validation findings, and no promotion/extraction work was included.
