Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-ENGINE-BOUNDARY-CLEANUP-STEP2A-ENGINE-TIME-COMPOSITION. Refactor engine/core/Engine.js to compose with engine/core/FrameClock.js and engine/core/FixedTicker.js instead of owning raw timing bookkeeping directly. Add focused engine timing tests for delta clamping and fixed-step catch-up. Do not merge FrameClock and FixedTicker. Do not change gameplay, rendering, fullscreen, canvas ownership, or unrelated files.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that Engine now composes with FrameClock and FixedTicker, that focused engine timing tests were added, and that no unrelated engine subsystems were changed.
