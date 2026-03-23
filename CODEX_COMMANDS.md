Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

MODEL: GPT-5.4
REASONING: high
COMMAND: Implement Step 1 adapter seams. Remove ctx usage outside renderer, add scheduler/time injection in Engine, guard browser globals in Theme and StorageService, create tests/engine and register it. Do not change gameplay or unrelated files.

# Verify
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Confirm no ctx usage outside renderer and tests/engine exists and runs.
