Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Implement PR-ENGINE-BOUNDARY-CLEANUP-STEP2D-EVENTBUS-NAMING. Normalize EventBus import/file casing to engine/events/EventBus.js across direct usages, preserve EventBus as an engine-owned injected instance service, and add focused portability/casing validation where practical. Do not change timing, fullscreen, canvas, metrics, gameplay, or unrelated files.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that EventBus casing is normalized, ownership remains instance-based and engine-owned, and no unrelated subsystems were changed.
