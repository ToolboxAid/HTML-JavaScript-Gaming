# Active Dev Surface

`docs/dev/` is the active execution surface only.

## Required Path Rules

### Roadmaps
All active roadmap files MUST live in:
- `docs/dev/roadmaps/`

The current master roadmap path is:
- `docs/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md`

Never use:
- `docs/roadmaps/`
- `docs/operations/dev/BIG_PICTURE_ROADMAP.md` for the active master roadmap
- any other duplicate roadmap location

### Active Dev Files
These may live directly under `docs/dev/` only when they are active operating files:
- `README.md`
- `paths.md`
- `PLANNING_SYSTEM_RULES.md`
- `ROADMAP_GUARDRAILS.md`
- `CODEX_COMMANDS.md`
- `COMMIT_COMMENT.txt`
- `next_command.txt`

### Reports
Generated reports must live in:
- `docs/dev/reports/`

### PR Docs
PR docs must live in:
- `docs/pr/`

### Archive
Archived/generated/historical material should live in:
- `docs/archive/dev-ops/`
- `docs/archive/generated-reports/`
- `docs/archive/pr/legacy-pr-history/`

## Rules
- Keep `docs/dev/` minimal and current.
- Keep active roadmap files only in `docs/dev/roadmaps/`.
- Do not create `docs/roadmaps/`.
- Do not leave transitional roadmap files duplicated in `docs/dev/`.
- Preserve `docs/pr/` as historical PR record.
