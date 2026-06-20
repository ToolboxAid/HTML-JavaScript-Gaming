# PR_26171_ALPHA_046-game-hub-table-standard-rebuild PLAN

## Source Of Truth
- `docs_build/dev/PROJECT_INSTRUCTIONS.md`
- `docs_build/dev/PROJECT_MULTI_PC.txt`
- User request: `PR_26171_ALPHA_046-game-hub-table-standard-rebuild`

## Purpose
Rebuild Game Hub as a creator-facing, table-first Projects workspace that follows the approved parent/child accordion table pattern.

## Ownership
- Team: Alpha
- Area: Game Hub / Creator Journey
- Merge gate: do not merge without explicit Team Alpha owner approval.

## Scope
- Replace conflicting Game Hub card/summary/context structure with a Projects table.
- Render expanded project child content directly under its owning row.
- Use reusable Theme V2 table child classes.
- Preserve existing in-page/repository handoff path for Idea Board-created projects.
- Keep creator-facing copy free of technical implementation wording.

## Non-Scope
- No real database persistence.
- No Postgres/API expansion.
- No unrelated tool changes.
- No merge without Team Alpha approval.
