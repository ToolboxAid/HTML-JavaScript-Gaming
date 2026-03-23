Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-ASTEROIDS-VALIDATION-PHASE2-COLLISION-TIMING-STRESS. Stress-test games/Asteroids/ for collision correctness, wave progression stability, respawn safety, and timing consistency under load. Add focused stress and validation tests. Apply only minimal runtime fixes directly tied to failures. Do not perform promotion/extraction or broad refactors.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that collision, timing, and stress validation is present, fixes are minimal, and no unrelated changes were introduced.
