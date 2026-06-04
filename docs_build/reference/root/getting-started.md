Toolbox Aid
David Quesenberry
04/05/2026
getting-started.md

# Getting Started

## 1) Use the Required Workflow
Run work in this sequence:
- `PLAN_PR`
- `BUILD_PR`
- `APPLY_PR`

## 2) Keep Scope Surgical
- One PR per purpose
- Docs-first planning before implementation
- No unrelated file edits

## 3) Use Active Dev Controls
Active files are in `docs_build/dev/`:
- `README.md`
- `RULES_OF_ENGAGEMENT.md`
- `codex_commands.md`
- `commit_comment.txt`
- `next_command.txt`
- active reports in `docs_build/dev/reports/`:
  - `change_summary.txt`
  - `file_tree.txt`
  - `validation_checklist.txt`

## 4) Know Where History Lives
- `docs_build/pr/`: historical PR and architecture evolution
- `docs_build/reference/architecture-standards/architecture/`: durable architecture and boundary docs
- `docs_build/reference/architecture-standards/standards/`: standards and review docs
- `archive/v1-v2/docs_build/archive/`: archived dev-ops and generated-report artifacts

## 5) Package Build/Apply Output
Put delta ZIP outputs under:
- `<project folder>/tmp/`
