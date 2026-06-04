# Active Dev Surface

`docs_build/dev/` is the active execution surface only.

## Required Path Rules

### Roadmaps
The active master roadmap path is:
- `docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`

Do not use superseded roadmap surfaces:
- `archive/v1-v2/docs_build/archive/dev-ops/BIG_PICTURE_ROADMAP.md` for the active master roadmap
- any other duplicate roadmap location

### Active Dev Files
These may live directly under `docs_build/dev/` only when they are active operating files:
- `README.md`
- `paths.md`
- `PLANNING_SYSTEM_RULES.md`
- `ROADMAP_GUARDRAILS.md`
- `codex_commands.md`
- `commit_comment.txt`
- `next_command.txt`

### Reports
Generated reports must live in:
- `docs_build/dev/reports/`

### PR Docs
PR docs must live in:
- `docs_build/pr/`

### Archive
Archived/generated/historical material should live in:
- `archive/v1-v2/docs_build/archive/dev-ops/`
- `archive/v1-v2/docs_build/archive/generated-reports/`
- `archive/v1-v2/docs_build/archive/pr/legacy-pr-history/`

## Rules
- Keep `docs_build/dev/` minimal and current.
- Keep active roadmap updates in `docs_build/dev/roadmaps/MASTER_ROADMAP_ENGINE.md`.
- Do not leave transitional roadmap files duplicated in `docs_build/dev/`.
- Preserve `docs_build/pr/` as historical PR record.
