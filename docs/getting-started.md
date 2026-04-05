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
Active files are in `docs/dev/`:
- `README.md`
- `WORKFLOW_RULES.md`
- `codex_commands.md`
- `commit_comment.txt`
- `next_command.txt`
- active reports in `docs/dev/reports/`:
  - `change_summary.txt`
  - `file_tree.txt`
  - `validation_checklist.txt`

## 4) Know Where History Lives
- `docs/pr/`: historical PR and architecture evolution
- `docs/architecture/`: durable architecture and boundary docs
- `docs/archive/`: archived dev-ops and generated-report artifacts

## 5) Package Build/Apply Output
Put delta ZIP outputs under:
- `<project folder>/tmp/`
