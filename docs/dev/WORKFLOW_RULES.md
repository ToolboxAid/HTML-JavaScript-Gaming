# WORKFLOW_RULES

## Required Flow
`PLAN_PR -> BUILD_PR -> APPLY_PR`

## Required Guardrails
- Docs-first workflow
- One PR per purpose
- Keep changes small and surgical
- Do not expand beyond approved scope
- Keep `docs/pr/` intact as history

## Active Dev Files
- `docs/dev/codex_commands.md`
- `docs/dev/commit_comment.txt` (header-free)
- `docs/dev/next_command.txt`
- `docs/dev/reports/change_summary.txt`
- `docs/dev/reports/file_tree.txt`
- `docs/dev/reports/validation_checklist.txt`

## Packaging Rule
- Delta ZIP outputs must be placed in `<project folder>/tmp/`
