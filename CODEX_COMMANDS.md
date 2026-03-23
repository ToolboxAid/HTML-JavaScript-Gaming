Toolbox Aid
David Quesenberry
03/23/2026
CODEX_COMMANDS.md

# CODEX COMMANDS

## Primary execution
MODEL: GPT-5.4
REASONING: high
COMMAND: Audit engine/core/canvasUtils.js, engine/core/fullscreen.js, engine/core/performanceMonitor.js, engine/core/timer.js, and engine/events/eventBus.js plus their direct callers. Classify each target as KEEP_STATIC_UTILITY, INJECTABLE_SERVICE_CANDIDATE, MIXED_SPLIT_REQUIRED, or LEGACY_GLOBAL_DEBT. Write findings and the smallest safe implementation order into docs/prs/PR-ENGINE-BOUNDARY-CLEANUP-STEP2-STATIC-GLOBALS/PLAN.md and TASKS.md. Do not modify runtime source files.

## Optional verification
MODEL: GPT-5.4-mini
REASONING: low
COMMAND: Verify that only docs/prs/PR-ENGINE-BOUNDARY-CLEANUP-STEP2-STATIC-GLOBALS/PLAN.md and TASKS.md were edited and that no runtime source files changed.
