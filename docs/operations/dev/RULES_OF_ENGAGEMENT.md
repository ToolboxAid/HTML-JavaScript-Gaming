Toolbox Aid
David Quesenberry
04/05/2026
RULES_OF_ENGAGEMENT.md

# Rules Of Engagement

## Single Source Of Truth
This file is the canonical workflow and rules document for active repo operations.

## Required Workflow
`PLAN_PR + BUILD_PR + APPLY_PR`

## Core Rules
- Docs-first before implementation.
- One PR per purpose.
- No skipped workflow steps.
- Keep PR scope small and surgical.
- Keep `docs/pr/` intact as history.
- Do not modify runtime code unless explicitly in scope.

## Responsibility Model
- Planning/docs bundle defines scope and acceptance.
- Implementation applies approved scope only.
- Active execution control files are in `docs/dev/`.
- Update docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md when needed [ ] Todo to [.] inprogress to [x] complete.

## Active Dev Controls
- `docs/operations/dev/codex_commands.md`
- `docs/operations/dev/commit_comment.txt` (header-free)
- `docs/operations/dev/next_command.txt`
- `docs/reports/change_summary.txt`
- `docs/reports/file_tree.txt`
- `docs/reports/validation_checklist.txt`

## Packaging
- Repo-structured delta ZIP outputs go to `<project folder>/tmp/`.
