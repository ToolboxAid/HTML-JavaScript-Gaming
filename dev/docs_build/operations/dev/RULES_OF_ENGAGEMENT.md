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
- Keep `docs_build/pr/` intact as history.
- Do not modify runtime code unless explicitly in scope.

## Responsibility Model
- Planning/docs bundle defines scope and acceptance.
- Implementation applies approved scope only.
- Active execution control files are in `docs_build/dev/`.
- Update docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md when needed [ ] Todo to [.] inprogress to [x] complete.

## Active Dev Controls
- `docs_build/operations/dev/codex_commands.md`
- `docs_build/operations/dev/commit_comment.txt` (header-free)
- `docs_build/operations/dev/next_command.txt`
- `docs_build/reports/change_summary.txt`
- `docs_build/reports/file_tree.txt`
- `docs_build/reports/validation_checklist.txt`

## Packaging
- Repo-structured delta ZIP outputs go to `<project folder>/tmp/`.
