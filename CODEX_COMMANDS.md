Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-ASTEROIDS-PROMOTION-PHASE1-VECTOR-TRANSFORMS. Replace Asteroids-local vector/point transform helpers with existing engine/vector support where already proven reusable. Keep the promotion narrow: do not promote HUD, session, persistence, menu, score, or one-off gameplay geometry policy. Add only minimal compatibility glue if strictly required and preserve runtime behavior.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that Asteroids now uses engine/vector for the promoted transform behavior, that gameplay behavior is unchanged, and that no unrelated logic was promoted.
