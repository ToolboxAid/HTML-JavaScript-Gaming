Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-ENGINE-BOUNDARY-CLEANUP-STEP2B-FULLSCREEN-INJECTION. Refactor engine/core/Engine.js and engine/runtime/FullscreenService.js so Engine fullscreen composition is explicit and production paths do not rely on implicit globalThis.document defaults. Add focused engine-level fullscreen composition tests covering attach/detach with injected fullscreen doubles or service instances. Preserve browser fullscreen behavior. Do not change timing, canvas ownership, event bus, metrics, gameplay, or unrelated files.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that fullscreen composition is explicit at the engine boundary, engine-level fullscreen tests were added, and no unrelated subsystems were changed.
