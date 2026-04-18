# Token Optimization Notes

## Why this change
The old command file embeds a long task-specific command directly in docs/operations/dev/codex_commands.md.
Move stable rules to AGENTS.md and keep codex_commands.md task-light.

## New usage
1. Keep AGENTS.md at repo root
2. Use docs/operations/dev/codex_commands.md as the active lightweight command shell
3. Use docs/pr/templates/PLAN_PR_COMPACT_TEMPLATE.md for new PLAN docs
4. Only add short session notes when truly needed

## Avoid repeating
- architecture overview
- workflow philosophy
- packaging rules
- repo-wide caution language
- large current-state summaries
